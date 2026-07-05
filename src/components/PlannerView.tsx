import React, { useState } from 'react';
import { PlanItem, PlanScope, Tag } from '../types';
import { Plus, ChevronLeft, ChevronRight, Calendar, CheckSquare, Square, Clock, Trash2, Tag as TagIcon, ListTodo, AlertTriangle } from 'lucide-react';

interface PlannerViewProps {
  plans: PlanItem[];
  tags: Tag[];
  onAddPlan: (plan: Omit<PlanItem, 'id' | 'createdAt'>) => void;
  onUpdatePlan: (id: string, updates: Partial<PlanItem>) => void;
  onDeletePlan: (id: string) => void;
}

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const PlannerView: React.FC<PlannerViewProps> = ({
  plans,
  tags,
  onAddPlan,
  onUpdatePlan,
  onDeletePlan,
}) => {
  const [activeTab, setActiveTab] = useState<PlanScope>('daily');

  // Daily State
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Weekly State (current week offset)
  const [weekOffset, setWeekOffset] = useState<number>(0);

  // Form states for creating a new task
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [reminderTime, setReminderTime] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState<number>(0); // For weekly scope (0=Mon, 6=Sun)
  const [targetDateString, setTargetDateString] = useState(''); // For long-term scope

  // Helper: Get Mon-Sun dates for current weekOffset
  const getWeekDates = () => {
    const current = new Date();
    // Adjust to Monday of current week
    const day = current.getDay();
    const diff = current.getDate() - day + (day === 0 ? -6 : 1); 
    const monday = new Date(current.setDate(diff + (weekOffset * 7)));
    
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  };

  const weekDates = getWeekDates();
  const startOfWeekStr = weekDates[0].toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const endOfWeekStr = weekDates[6].toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

  // Filter plans based on active tabs
  const dailyPlans = plans.filter(
    (p) => p.scope === 'daily' && p.date === selectedDate
  );

  // Filter weekly plans. We match by looking at if they are weekly scope, and fall within the current offset's week.
  // To keep it simple, we can store week dates as YYYY-MM-DD or match with week offset, or match by dayOfWeek index for the active week.
  // Let's store week dates and match exactly on the ISO week/offset, or just let users plan for the CURRENT week Mon-Sun.
  // To make it super robust, let's filter weekly plans where we match their week dates.
  const weeklyPlansByDay = (dayIndex: number) => {
    return plans.filter((p) => {
      if (p.scope !== 'weekly') return false;
      // Match if the plan has the same dayOfWeek index and falls in the active week
      // (or let weekly plans be recurring/tied to the current active offset)
      // To keep UX streamlined and high-fidelity, let's tie them to the exact date of that Mon-Sun.
      const targetDate = weekDates[dayIndex].toISOString().split('T')[0];
      return p.date === targetDate;
    });
  };

  // Long-term plans
  const longTermPlans = plans.filter((p) => p.scope === 'long-term');

  // Submit new plan
  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let planDate: string | undefined = undefined;
    let computedDayOfWeek: number | undefined = undefined;
    let computedTargetDateString: string | undefined = undefined;

    if (activeTab === 'daily') {
      planDate = selectedDate;
    } else if (activeTab === 'weekly') {
      planDate = weekDates[dayOfWeek].toISOString().split('T')[0];
      computedDayOfWeek = dayOfWeek;
      computedTargetDateString = WEEKDAYS[dayOfWeek];
    } else if (activeTab === 'long-term') {
      computedTargetDateString = targetDateString || 'Next Milestone';
    }

    onAddPlan({
      title: title.trim(),
      description: description.trim(),
      scope: activeTab,
      date: planDate,
      dayOfWeek: computedDayOfWeek,
      targetDateString: computedTargetDateString,
      completed: false,
      tags: selectedTags,
      reminderTime: reminderTime ? new Date(reminderTime).toISOString() : null,
      reminderTriggered: false,
    });

    // Reset Form
    setTitle('');
    setDescription('');
    setSelectedTags([]);
    setReminderTime('');
    setIsAdding(false);
  };

  const toggleTagSelection = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter((id) => id !== tagId));
    } else {
      setSelectedTags([...selectedTags, tagId]);
    }
  };

  // Quick navigation helpers for days
  const handleShiftDay = (days: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  return (
    <div className="space-y-8 relative z-10">
      {/* Scope Selector Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-zinc-950 dark:border-zinc-800 pb-3 gap-3">
        <div className="flex flex-wrap gap-2">
          {(['daily', 'weekly', 'long-term'] as PlanScope[]).map((scope) => (
            <button
              key={scope}
              onClick={() => {
                setActiveTab(scope);
                setIsAdding(false);
              }}
              className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl border-2 transition-all cursor-pointer ${
                activeTab === scope
                  ? 'bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 border-zinc-950 dark:border-zinc-100 shadow-[2px_2px_0px_0px_rgba(9,9,11,1)] dark:shadow-[2px_2px_0px_0px_rgba(250,250,250,1)]'
                  : 'border-transparent text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
              }`}
            >
              {scope === 'long-term' ? 'Long-Term' : `${scope} Plan`}
            </button>
          ))}
        </div>

        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            id="btn-add-plan"
            className="neo-btn-primary self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" /> Add Task
          </button>
        )}
      </div>

      {/* Adding Form Panel */}
      {isAdding && (
        <form
          onSubmit={handleCreatePlan}
          className="bg-white dark:bg-[#0c0c0e] rounded-2xl p-6 border-2 border-zinc-950 dark:border-zinc-100 shadow-[4px_4px_0px_0px_rgba(9,9,11,1)] dark:shadow-[4px_4px_0px_0px_rgba(250,250,250,1)] animate-fadeIn"
        >
          <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-zinc-950 dark:border-zinc-800">
            <h4 className="font-black text-zinc-950 dark:text-zinc-100 text-sm uppercase tracking-tight">
              Add {activeTab} item
            </h4>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-[10px] font-black uppercase tracking-wider text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-200"
            >
              Cancel
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="task-title" className="block text-[10px] font-black uppercase tracking-wider text-zinc-500 mb-1.5">
                Task Title *
              </label>
              <input
                id="task-title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What needs to be done?"
                className="w-full text-sm font-semibold px-4 py-2.5 rounded-xl border-2 border-zinc-950 dark:border-zinc-100 bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>

            <div>
              <label htmlFor="task-description" className="block text-[10px] font-black uppercase tracking-wider text-zinc-500 mb-1.5">
                Description / Subtasks
              </label>
              <textarea
                id="task-description"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional notes or details"
                className="w-full text-sm font-semibold px-4 py-2.5 rounded-xl border-2 border-zinc-950 dark:border-zinc-100 bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 resize-none"
              />
            </div>

            {/* Context-Specific inputs */}
            <div className="grid sm:grid-cols-2 gap-4">
              {activeTab === 'weekly' && (
                <div>
                  <label htmlFor="task-dayofweek" className="block text-[10px] font-black uppercase tracking-wider text-zinc-500 mb-1.5">
                    Select Week Day
                  </label>
                  <select
                    id="task-dayofweek"
                    value={dayOfWeek}
                    onChange={(e) => setDayOfWeek(parseInt(e.target.value))}
                    className="w-full text-xs font-bold uppercase tracking-wider px-3 py-2.5 rounded-xl border-2 border-zinc-950 dark:border-zinc-100 bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  >
                    {WEEKDAYS.map((day, idx) => (
                      <option key={day} value={idx}>
                        {day} ({weekDates[idx].toLocaleDateString(undefined, { month: 'short', day: 'numeric' })})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {activeTab === 'long-term' && (
                <div>
                  <label htmlFor="task-target-date" className="block text-[10px] font-black uppercase tracking-wider text-zinc-500 mb-1.5">
                    Target Period / Month
                  </label>
                  <input
                    id="task-target-date"
                    type="text"
                    value={targetDateString}
                    onChange={(e) => setTargetDateString(e.target.value)}
                    placeholder="e.g. Q3 Goals, July 2026..."
                    className="w-full text-sm font-semibold px-4 py-2.5 rounded-xl border-2 border-zinc-950 dark:border-zinc-100 bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
              )}

              <div>
                <label htmlFor="task-reminder" className="block text-[10px] font-black uppercase tracking-wider text-zinc-500 mb-1.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-zinc-500" /> Set Reminder Alert
                </label>
                <input
                  id="task-reminder"
                  type="datetime-local"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="w-full text-xs font-bold px-4 py-2.5 rounded-xl border-2 border-zinc-950 dark:border-zinc-100 bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            </div>

            {/* Tag Selection */}
            {tags.length > 0 && (
              <div>
                <span className="block text-[10px] font-black uppercase tracking-wider text-zinc-500 mb-2">
                  Assign Category Tags
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => {
                    const isSelected = selectedTags.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTagSelection(tag.id)}
                        className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border-2 border-zinc-950 dark:border-zinc-100 transition-all cursor-pointer ${
                          isSelected
                            ? `${tag.color} scale-105 shadow-[2px_2px_0px_0px_rgba(9,9,11,1)] dark:shadow-[2px_2px_0px_0px_rgba(250,250,250,1)]`
                            : 'bg-white dark:bg-zinc-950 text-zinc-500 hover:text-zinc-950 border-zinc-200 dark:border-zinc-800'
                        }`}
                      >
                        {tag.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="pt-4 flex items-center justify-end gap-2.5 border-t-2 border-zinc-950 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 text-xs font-black uppercase tracking-wider text-zinc-500 hover:text-zinc-950"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="neo-btn-primary"
              >
                Add {activeTab === 'long-term' ? 'Goal' : 'Task'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Scope 1: DAILY VIEW */}
      {activeTab === 'daily' && (
        <div className="space-y-6">
          {/* Day Selector Navigation */}
          <div className="flex items-center justify-between p-4 bg-white dark:bg-[#0c0c0e] border-2 border-zinc-950 dark:border-zinc-100 rounded-2xl shadow-[3px_3px_0px_0px_rgba(9,9,11,1)] dark:shadow-[3px_3px_0px_0px_rgba(250,250,250,1)]">
            <button
              onClick={() => handleShiftDay(-1)}
              className="p-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 border-2 border-zinc-950 dark:border-zinc-100 bg-white dark:bg-zinc-900 shadow-[1px_1px_0px_0px_rgba(9,9,11,1)] dark:shadow-[1px_1px_0px_0px_rgba(250,250,250,1)] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 text-zinc-950 dark:text-zinc-100" />
            </button>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-zinc-500" />
              <span className="font-black text-zinc-950 dark:text-zinc-100 text-xs sm:text-sm uppercase tracking-wider">
                {new Date(selectedDate + 'T00:00:00').toLocaleDateString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
              {selectedDate === new Date().toISOString().split('T')[0] && (
                <span className="text-[9px] font-black bg-amber-500 text-zinc-950 px-2 py-0.5 rounded-md uppercase tracking-widest border border-zinc-950">
                  Today
                </span>
              )}
            </div>

            <button
              onClick={() => handleShiftDay(1)}
              className="p-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 border-2 border-zinc-950 dark:border-zinc-100 bg-white dark:bg-zinc-900 shadow-[1px_1px_0px_0px_rgba(9,9,11,1)] dark:shadow-[1px_1px_0px_0px_rgba(250,250,250,1)] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4 text-zinc-950 dark:text-zinc-100" />
            </button>
          </div>

          {/* Daily list */}
          {dailyPlans.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-[#0c0c0e] border-2 border-zinc-950 dark:border-zinc-100 rounded-2xl shadow-[3px_3px_0px_0px_rgba(9,9,11,1)] dark:shadow-[3px_3px_0px_0px_rgba(250,250,250,1)]">
              <p className="text-zinc-400 dark:text-zinc-500 text-xs font-bold uppercase tracking-wider italic">No items scheduled for this day.</p>
              <button
                onClick={() => setIsAdding(true)}
                className="mt-4 neo-btn"
              >
                <Plus className="w-3.5 h-3.5" /> Plan Day
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {dailyPlans.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-start justify-between p-5 bg-white dark:bg-zinc-900 border-2 border-zinc-950 dark:border-zinc-100 rounded-2xl shadow-[3px_3px_0px_0px_rgba(9,9,11,1)] dark:shadow-[3px_3px_0px_0px_rgba(250,250,250,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_0px_rgba(9,9,11,1)] dark:hover:shadow-[4px_4px_0px_0px_rgba(250,250,250,1)] transition-all ${
                    item.completed ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <button
                      onClick={() => onUpdatePlan(item.id, { completed: !item.completed })}
                      className="p-0.5 mt-0.5 text-zinc-400 hover:text-zinc-850 dark:hover:text-zinc-100 transition-colors cursor-pointer"
                    >
                      {item.completed ? (
                        <CheckSquare className="w-5 h-5 text-emerald-500 dark:text-emerald-400 fill-emerald-500/10" />
                      ) : (
                        <Square className="w-5 h-5 text-zinc-950 dark:text-zinc-100" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <h5
                        className={`font-black text-sm uppercase tracking-tight leading-snug ${
                          item.completed
                            ? 'line-through text-zinc-400 dark:text-zinc-500'
                            : 'text-zinc-950 dark:text-zinc-100'
                        }`}
                      >
                        {item.title}
                      </h5>
                      {item.description && (
                        <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-1.5 whitespace-pre-wrap font-semibold leading-relaxed">
                          {item.description}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {item.reminderTime && (
                          <span className="inline-flex items-center gap-1 text-[9px] bg-amber-100 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 px-2.5 py-0.5 rounded-full border border-amber-300 font-bold uppercase tracking-wider">
                            <Clock className="w-3 h-3" />
                            {new Date(item.reminderTime).toLocaleTimeString(undefined, {
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </span>
                        )}
                        {item.tags.map((tagId) => {
                          const tag = tags.find((t) => t.id === tagId);
                          if (!tag) return null;
                          return (
                            <span
                              key={tagId}
                              className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${tag.color}`}
                            >
                              {tag.name}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm('Delete this planner item?')) onDeletePlan(item.id);
                    }}
                    className="p-1 text-zinc-400 hover:text-rose-600 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors ml-2 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Scope 2: WEEKLY VIEW */}
      {activeTab === 'weekly' && (
        <div className="space-y-6">
          {/* Week Selector */}
          <div className="flex items-center justify-between p-4 bg-white dark:bg-[#0c0c0e] border-2 border-zinc-950 dark:border-zinc-100 rounded-2xl shadow-[3px_3px_0px_0px_rgba(9,9,11,1)] dark:shadow-[3px_3px_0px_0px_rgba(250,250,250,1)]">
            <button
              onClick={() => setWeekOffset(weekOffset - 1)}
              className="p-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 border-2 border-zinc-950 dark:border-zinc-100 bg-white dark:bg-zinc-900 shadow-[1px_1px_0px_0px_rgba(9,9,11,1)] dark:shadow-[1px_1px_0px_0px_rgba(250,250,250,1)] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 text-zinc-950 dark:text-zinc-100" />
            </button>

            <div className="flex items-center gap-2 text-xs sm:text-sm font-black text-zinc-950 dark:text-zinc-100 uppercase tracking-wider">
              <ListTodo className="w-4 h-4 text-zinc-500" />
              <span>
                {startOfWeekStr} - {endOfWeekStr}
              </span>
              {weekOffset === 0 && (
                <span className="text-[9px] font-black bg-amber-500 text-zinc-950 px-2 py-0.5 rounded-md uppercase tracking-widest border border-zinc-950">
                  This Week
                </span>
              )}
            </div>

            <button
              onClick={() => setWeekOffset(weekOffset + 1)}
              className="p-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 border-2 border-zinc-950 dark:border-zinc-100 bg-white dark:bg-zinc-900 shadow-[1px_1px_0px_0px_rgba(9,9,11,1)] dark:shadow-[1px_1px_0px_0px_rgba(250,250,250,1)] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4 text-zinc-950 dark:text-zinc-100" />
            </button>
          </div>

          {/* Week Columns Grid */}
          <div className="grid md:grid-cols-7 gap-4">
            {WEEKDAYS.map((dayName, idx) => {
              const dayDate = weekDates[idx];
              const dateStr = dayDate.toISOString().split('T')[0];
              const dayPlans = weeklyPlansByDay(idx);

              return (
                <div
                  key={dayName}
                  className="bg-white dark:bg-[#0c0c0e] border-2 border-zinc-950 dark:border-zinc-100 rounded-2xl p-4 flex flex-col justify-between min-h-[260px] shadow-[3px_3px_0px_0px_rgba(9,9,11,1)] dark:shadow-[3px_3px_0px_0px_rgba(250,250,250,1)]"
                >
                  <div>
                    {/* Header for Day Column */}
                    <div className="flex items-center justify-between border-b-2 border-zinc-950 dark:border-zinc-800 pb-2 mb-3">
                      <div>
                        <div className="font-black text-xs uppercase tracking-wider text-zinc-950 dark:text-zinc-100 font-display">
                          {dayName.slice(0, 3)}
                        </div>
                        <div className="text-[9px] text-zinc-500 font-mono font-bold">
                          {dayDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setDayOfWeek(idx);
                          setIsAdding(true);
                          // Jump form focus
                          setTimeout(() => {
                            document.getElementById('task-title')?.focus();
                          }, 100);
                        }}
                        className="p-1 rounded-lg border border-transparent hover:border-zinc-950 dark:hover:border-zinc-100 hover:bg-zinc-100 text-zinc-500 hover:text-zinc-950 cursor-pointer"
                        title={`Add task for ${dayName}`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Day Plans List */}
                    <div className="space-y-2">
                      {dayPlans.length === 0 ? (
                        <div className="text-center py-8 text-zinc-300 dark:text-zinc-600 text-[10px] font-bold uppercase tracking-wider italic">
                          No tasks
                        </div>
                      ) : (
                        dayPlans.map((item) => (
                          <div
                            key={item.id}
                            className={`p-2.5 bg-zinc-50 dark:bg-zinc-950 border-2 border-zinc-950 dark:border-zinc-800/60 rounded-xl group relative ${
                              item.completed ? 'opacity-50 line-through' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between gap-1">
                              <button
                                onClick={() => onUpdatePlan(item.id, { completed: !item.completed })}
                                className="text-left flex-1 min-w-0 cursor-pointer"
                              >
                                <span className="font-black text-xs uppercase tracking-tight text-zinc-950 dark:text-zinc-100 leading-tight block truncate">
                                  {item.title}
                                </span>
                              </button>
                              <button
                                onClick={() => onDeletePlan(item.id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-zinc-400 hover:text-rose-500 rounded-md cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>

                            {/* Tags list (mini) */}
                            {item.tags.length > 0 && (
                              <div className="flex flex-wrap gap-0.5 mt-1.5">
                                {item.tags.map((tagId) => {
                                  const tag = tags.find((t) => t.id === tagId);
                                  if (!tag) return null;
                                  return (
                                    <span
                                      key={tagId}
                                      className="text-[8px] font-bold uppercase px-1 py-0.2 border rounded-full scale-95 origin-left inline-block truncate max-w-[50px] bg-white dark:bg-zinc-800"
                                      title={tag.name}
                                    >
                                      {tag.name}
                                    </span>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Scope 3: LONG-TERM VIEW */}
      {activeTab === 'long-term' && (
        <div className="space-y-6">
          <div className="p-5 bg-white dark:bg-[#0c0c0e] border-2 border-zinc-950 dark:border-zinc-100 rounded-2xl shadow-[3px_3px_0px_0px_rgba(9,9,11,1)] dark:shadow-[3px_3px_0px_0px_rgba(250,250,250,1)]">
            <h4 className="font-black text-zinc-950 dark:text-zinc-100 text-sm uppercase tracking-tight flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-500" />
              Long-Term Milestones & Objectives
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 font-medium leading-relaxed">
              Plan out larger goals, month-wide objectives, quarterly themes, or high-level progress roadmaps without restricting yourself to exact dates.
            </p>
          </div>

          {longTermPlans.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-[#0c0c0e] border-2 border-zinc-950 dark:border-zinc-100 rounded-2xl shadow-[3px_3px_0px_0px_rgba(9,9,11,1)] dark:shadow-[3px_3px_0px_0px_rgba(250,250,250,1)]">
              <p className="text-zinc-400 dark:text-zinc-500 text-xs font-bold uppercase tracking-wider italic">No long-term roadmap goals defined yet.</p>
              <button
                onClick={() => {
                  setTargetDateString('Q3 Goals');
                  setIsAdding(true);
                }}
                className="mt-4 neo-btn-primary"
              >
                <Plus className="w-3.5 h-3.5" /> Define Objectives
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {longTermPlans.map((item) => (
                <div
                  key={item.id}
                  className={`bg-white dark:bg-zinc-900 border-2 border-zinc-950 dark:border-zinc-100 rounded-2xl p-6 shadow-[3px_3px_0px_0px_rgba(9,9,11,1)] dark:shadow-[3px_3px_0px_0px_rgba(250,250,250,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_0px_rgba(9,9,11,1)] dark:hover:shadow-[4px_4px_0px_0px_rgba(250,250,250,1)] flex flex-col justify-between min-h-[180px] transition-all duration-200 ${
                    item.completed ? 'opacity-60' : ''
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <span className="text-[9px] font-black uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-3 py-1 rounded-lg border-2 border-zinc-950 dark:border-zinc-100 shadow-[1px_1px_0px_0px_rgba(9,9,11,1)]">
                        {item.targetDateString || 'Milestone'}
                      </span>
                      <button
                        onClick={() => onDeletePlan(item.id)}
                        className="p-1 text-zinc-450 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <h5
                      className={`font-black text-sm uppercase tracking-tight leading-snug ${
                        item.completed
                          ? 'line-through text-zinc-400 dark:text-zinc-500'
                          : 'text-zinc-950 dark:text-zinc-100'
                      }`}
                    >
                      {item.title}
                    </h5>

                    {item.description && (
                      <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-2 whitespace-pre-wrap leading-relaxed font-semibold">
                        {item.description}
                      </p>
                    )}
                  </div>

                  <div className="border-t-2 border-zinc-950 dark:border-zinc-800/80 pt-4 mt-5 flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {item.tags.map((tagId) => {
                        const tag = tags.find((t) => t.id === tagId);
                        if (!tag) return null;
                        return (
                          <span
                            key={tagId}
                            className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${tag.color}`}
                          >
                            {tag.name}
                          </span>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => onUpdatePlan(item.id, { completed: !item.completed })}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border-2 border-zinc-950 dark:border-zinc-100 bg-white dark:bg-zinc-900 shadow-[1px_1px_0px_0px_rgba(9,9,11,1)] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
                    >
                      {item.completed ? (
                        <>
                          <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-500">Done</span>
                        </>
                      ) : (
                        <>
                          <Square className="w-3.5 h-3.5 text-zinc-500" />
                          <span>Complete</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
