import { useState, useEffect } from 'react';
import { Note, PlanItem, Tag, PlanScope } from './types';
import { TagManager } from './components/TagManager';
import { NotesView } from './components/NotesView';
import { PlannerView } from './components/PlannerView';
import { RemindersView } from './components/RemindersView';
import { SyncView } from './components/SyncView';
import { 
  CalendarRange, 
  BookOpen, 
  Bell, 
  Settings, 
  Moon, 
  Sun, 
  CheckSquare, 
  FileText, 
  Tag as TagIcon, 
  AlarmClock, 
  Clock, 
  Activity, 
  BellRing,
  ExternalLink
} from 'lucide-react';

const STORAGE_KEYS = {
  NOTES: 'planner_notes_v1',
  PLANS: 'planner_plans_v1',
  TAGS: 'planner_tags_v1',
  THEME: 'planner_theme_v1',
};

const DEFAULT_TAGS: Tag[] = [
  { id: 't1', name: 'Work', color: 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/50' },
  { id: 't2', name: 'Personal', color: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50' },
  { id: 't3', name: 'Urgent', color: 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/50' },
  { id: 't4', name: 'Ideas', color: 'bg-fuchsia-50 dark:bg-fuchsia-950/30 text-fuchsia-600 dark:text-fuchsia-400 border-fuchsia-100 dark:border-fuchsia-900/50' },
];

const DEFAULT_NOTES = (tags: Tag[]): Note[] => [
  {
    id: 'n1',
    title: 'Welcome to Planner & Notes 🚀',
    content: `This application provides a highly integrated, minimalist ecosystem to organize your daily schedule, notes, and milestones.

Here are a few quick tips to get you started:
1. Category Tags: Create unified tags using the Tag Manager. Categorize both notes and planner items using these tags to filter views easily.
2. Planner Scopes: Use Daily, Weekly, and Long-Term scopes to organize plans of different horizons.
3. Pinning: Keep important notes anchored at the top of your card deck.
4. Themes & Backups: Open the "Settings" tab to explicitly select between Light and Dark visual modes, reset your database, or export/import secure local file backups.`,
    tags: ['t1', 't4'],
    color: 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/40 text-indigo-950 dark:text-indigo-200',
    isPinned: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'n2',
    title: 'Vacation Checklist ✈️',
    content: `- Confirm hotel bookings
- Double-check passports and flight details
- Organize multi-currency wallets
- Setup out-of-office email auto-responders
- Put plant-watering tasks on a timer`,
    tags: ['t2'],
    color: 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/40 text-amber-950 dark:text-amber-200',
    isPinned: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  }
];

const DEFAULT_PLANS = (): PlanItem[] => {
  const today = new Date().toISOString().split('T')[0];
  return [
    {
      id: 'p1',
      title: 'Review weekly roadmap milestones',
      description: 'Go over the long-term milestones of Q3 Goals with the team',
      scope: 'daily',
      date: today,
      completed: false,
      tags: ['t1'],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'p2',
      title: 'Plan weekend grocery run',
      description: 'Vegetables, milk, eggs, organic honey, and quick snack items',
      scope: 'daily',
      date: today,
      completed: true,
      tags: ['t2'],
      createdAt: new Date().toISOString(),
    }
  ];
};

interface TriggeredReminder {
  id: string;
  type: 'note' | 'plan';
  title: string;
  item: Note | PlanItem;
}

export default function App() {
  const [activeView, setActiveView] = useState<'planner' | 'notes' | 'reminders' | 'sync'>('planner');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) as 'light' | 'dark' | null;
    return savedTheme || 'dark';
  });

  // Core App State
  const [notes, setNotes] = useState<Note[]>([]);
  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  // Activated alarm details
  const [activeAlert, setActiveAlert] = useState<TriggeredReminder | null>(null);

  // 1. Initial Load of State
  useEffect(() => {
    // Theme setup
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Load Tags
    const savedTags = localStorage.getItem(STORAGE_KEYS.TAGS);
    let loadedTags: Tag[] = [];
    if (savedTags) {
      try {
        loadedTags = JSON.parse(savedTags);
      } catch (e) {
        loadedTags = DEFAULT_TAGS;
      }
    } else {
      loadedTags = DEFAULT_TAGS;
    }
    setTags(loadedTags);

    // Load Notes
    const savedNotes = localStorage.getItem(STORAGE_KEYS.NOTES);
    if (savedNotes) {
      try {
        setNotes(JSON.parse(savedNotes));
      } catch (e) {
        setNotes(DEFAULT_NOTES(loadedTags));
      }
    } else {
      setNotes(DEFAULT_NOTES(loadedTags));
    }

    // Load Plans
    const savedPlans = localStorage.getItem(STORAGE_KEYS.PLANS);
    if (savedPlans) {
      try {
        setPlans(JSON.parse(savedPlans));
      } catch (e) {
        setPlans(DEFAULT_PLANS());
      }
    } else {
      setPlans(DEFAULT_PLANS());
    }
  }, []);

  // 2. Local Storage Persistence Effects
  useEffect(() => {
    if (tags.length > 0) {
      localStorage.setItem(STORAGE_KEYS.TAGS, JSON.stringify(tags));
    }
  }, [tags]);

  useEffect(() => {
    if (notes.length > 0) {
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
    }
  }, [notes]);

  useEffect(() => {
    if (plans.length > 0) {
      localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(plans));
    }
  }, [plans]);

  // 3. Theme Toggle & Setting Actions
  const handleToggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    handleSetTheme(nextTheme);
  };

  const handleSetTheme = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // 4. Polling effect checking for active timers / reminders
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();

      // Check Plan reminders
      const duePlan = plans.find(
        (p) => p.reminderTime && !p.reminderTriggered && new Date(p.reminderTime) <= now
      );

      if (duePlan) {
        // Trigger alert popup
        setActiveAlert({
          id: duePlan.id,
          type: 'plan',
          title: duePlan.title,
          item: duePlan,
        });

        // Mark as triggered
        setPlans((prev) =>
          prev.map((p) => (p.id === duePlan.id ? { ...p, reminderTriggered: true } : p))
        );
        return;
      }

      // Check Note reminders
      const dueNote = notes.find(
        (n) => n.reminderTime && !n.reminderTriggered && new Date(n.reminderTime) <= now
      );

      if (dueNote) {
        setActiveAlert({
          id: dueNote.id,
          type: 'note',
          title: dueNote.title || 'Untitled Note',
          item: dueNote,
        });

        setNotes((prev) =>
          prev.map((n) => (n.id === dueNote.id ? { ...n, reminderTriggered: true } : n))
        );
        return;
      }
    }, 5000); // Check every 5 seconds for pinpoint accuracy

    return () => clearInterval(interval);
  }, [plans, notes]);

  // Alert Actions
  const handleDismissAlert = () => {
    setActiveAlert(null);
  };

  const handleSnoozeAlert = () => {
    if (!activeAlert) return;
    const snoozeTime = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes from now

    if (activeAlert.type === 'plan') {
      setPlans((prev) =>
        prev.map((p) =>
          p.id === activeAlert.id
            ? { ...p, reminderTime: snoozeTime, reminderTriggered: false }
            : p
        )
      );
    } else {
      setNotes((prev) =>
        prev.map((n) =>
          n.id === activeAlert.id
            ? { ...n, reminderTime: snoozeTime, reminderTriggered: false }
            : n
        )
      );
    }
    setActiveAlert(null);
  };

  // State Import Sync
  const handleImportData = (newNotes: Note[], newPlans: PlanItem[], newTags: Tag[]) => {
    setNotes(newNotes);
    setPlans(newPlans);
    setTags(newTags);
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(newNotes));
    localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(newPlans));
    localStorage.setItem(STORAGE_KEYS.TAGS, JSON.stringify(newTags));
  };

  const handleClearAll = () => {
    setNotes([]);
    setPlans([]);
    setTags([]);
    localStorage.removeItem(STORAGE_KEYS.NOTES);
    localStorage.removeItem(STORAGE_KEYS.PLANS);
    localStorage.removeItem(STORAGE_KEYS.TAGS);
  };

  // Event Handlers: Notes
  const handleAddNote = (
    title: string,
    content: string,
    noteTags: string[],
    color?: string,
    pinned?: boolean
  ) => {
    const newNote: Note = {
      id: `n-${Date.now()}`,
      title,
      content,
      tags: noteTags,
      color,
      isPinned: pinned || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setNotes((prev) => [newNote, ...prev]);
  };

  const handleUpdateNote = (id: string, updates: Partial<Note>) => {
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, ...updates } : n)));
  };

  const handleDeleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  // Event Handlers: Plans
  const handleAddPlan = (newPlanData: Omit<PlanItem, 'id' | 'createdAt'>) => {
    const newPlan: PlanItem = {
      ...newPlanData,
      id: `p-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setPlans((prev) => [newPlan, ...prev]);
  };

  const handleUpdatePlan = (id: string, updates: Partial<PlanItem>) => {
    setPlans((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const handleDeletePlan = (id: string) => {
    setPlans((prev) => prev.filter((p) => p.id !== id));
  };

  // Event Handlers: Tags
  const handleAddTag = (name: string, color: string) => {
    const newTag: Tag = {
      id: `t-${Date.now()}`,
      name,
      color,
    };
    setTags((prev) => [...prev, newTag]);
  };

  const handleDeleteTag = (id: string) => {
    setTags((prev) => prev.filter((t) => t.id !== id));
    // Remove deleted tag associations from notes and plans
    setNotes((prev) => prev.map((n) => ({ ...n, tags: n.tags.filter((tId) => tId !== id) })));
    setPlans((prev) => prev.map((p) => ({ ...p, tags: p.tags.filter((tId) => tId !== id) })));
  };

  // Event Handlers: Reminders
  const handleRemoveNoteReminder = (id: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, reminderTime: null, reminderTriggered: false } : n))
    );
  };

  const handleRemovePlanReminder = (id: string) => {
    setPlans((prev) =>
      prev.map((p) => (p.id === id ? { ...p, reminderTime: null, reminderTriggered: false } : p))
    );
  };

  const handleSnoozeNoteReminder = (id: string) => {
    const snoozeTime = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, reminderTime: snoozeTime, reminderTriggered: false } : n))
    );
  };

  const handleSnoozePlanReminder = (id: string) => {
    const snoozeTime = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    setPlans((prev) =>
      prev.map((p) => (p.id === id ? { ...p, reminderTime: snoozeTime, reminderTriggered: false } : p))
    );
  };

  const countActiveReminders = () => {
    const notesCount = notes.filter((n) => n.reminderTime && !n.reminderTriggered).length;
    const plansCount = plans.filter((p) => p.reminderTime && !p.reminderTriggered).length;
    return notesCount + plansCount;
  };

  const activeRemindersCount = countActiveReminders();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#060608] flex flex-col md:flex-row antialiased text-zinc-900 dark:text-zinc-100 font-sans relative overflow-x-hidden">
      
      {/* Sidebar navigation */}
      <aside className="w-full md:w-64 border-b-2 md:border-b-0 md:border-r-2 border-zinc-950 dark:border-zinc-100 bg-white dark:bg-[#0c0c0e] flex flex-col justify-between shrink-0 z-10 relative">
        <div className="p-6">
          {/* Brand header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-xl bg-zinc-950 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-950 font-black text-lg border-2 border-zinc-950 dark:border-zinc-100 neo-shadow-sm">
              P
            </div>
            <div>
              <h1 className="font-black text-sm tracking-tight text-zinc-950 dark:text-zinc-100 uppercase font-display leading-none">
                Planner & Notes
              </h1>
              <span className="text-[9px] text-zinc-500 dark:text-zinc-400 font-mono tracking-[0.2em] uppercase font-bold">
                Offline First
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-2">
            <button
              onClick={() => setActiveView('planner')}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider border-2 transition-all cursor-pointer ${
                activeView === 'planner'
                  ? 'bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 border-zinc-950 dark:border-zinc-100 neo-shadow-sm'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 hover:bg-zinc-100/60 dark:hover:bg-zinc-900/40'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CalendarRange className="w-4 h-4 shrink-0" />
                <span>My Planner</span>
              </div>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                activeView === 'planner' ? 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900' : 'bg-zinc-200/50 dark:bg-zinc-800/60 text-zinc-500 dark:text-zinc-400'
              }`}>
                {plans.length}
              </span>
            </button>

            <button
              onClick={() => setActiveView('notes')}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider border-2 transition-all cursor-pointer ${
                activeView === 'notes'
                  ? 'bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 border-zinc-950 dark:border-zinc-100 neo-shadow-sm'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 hover:bg-zinc-100/60 dark:hover:bg-zinc-900/40'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-4 h-4 shrink-0" />
                <span>My Notes</span>
              </div>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                activeView === 'notes' ? 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900' : 'bg-zinc-200/50 dark:bg-zinc-800/60 text-zinc-500 dark:text-zinc-400'
              }`}>
                {notes.length}
              </span>
            </button>

            <button
              onClick={() => setActiveView('reminders')}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider border-2 transition-all cursor-pointer ${
                activeView === 'reminders'
                  ? 'bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 border-zinc-950 dark:border-zinc-100 neo-shadow-sm'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 hover:bg-zinc-100/60 dark:hover:bg-zinc-900/40'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Bell className="w-4 h-4 shrink-0" />
                <span>Alerts & Reminders</span>
              </div>
              {activeRemindersCount > 0 && (
                <span className="text-[9px] font-black bg-amber-500 text-zinc-950 px-2 py-0.5 rounded-full shrink-0 border border-zinc-950">
                  {activeRemindersCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveView('sync')}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider border-2 transition-all cursor-pointer ${
                activeView === 'sync'
                  ? 'bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 border-zinc-950 dark:border-zinc-100 neo-shadow-sm'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 hover:bg-zinc-100/60 dark:hover:bg-zinc-900/40'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Settings className="w-4 h-4 shrink-0" />
                <span>Settings</span>
              </div>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono font-bold uppercase tracking-wider">
                Local
              </span>
            </button>
          </nav>

          {/* Quick inline Tag Manager in sidebar */}
          <div className="mt-8 border-t-2 border-zinc-950 dark:border-zinc-800 pt-6">
            <TagManager tags={tags} onAddTag={handleAddTag} onDeleteTag={handleDeleteTag} />
          </div>
        </div>

        {/* Footer info & theme toggle quick bar */}
        <div className="p-6 border-t-2 border-zinc-950 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/40">
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 font-mono font-bold uppercase tracking-wider">
            <Activity className="w-3.5 h-3.5 text-amber-500" />
            <span>Local DB: OK</span>
          </div>

          <button
            onClick={handleToggleTheme}
            id="btn-sidebar-theme-toggle"
            className="p-1.5 rounded-xl border-2 border-zinc-950 dark:border-zinc-100 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 transition-colors cursor-pointer neo-shadow-sm"
            title="Toggle theme preference"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-500" />}
          </button>
        </div>
      </aside>

      {/* Main Content Workspace Panel */}
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full overflow-y-auto relative z-0">
        
        {/* Giant Editorial Backdrop Lettering */}
        <div className="absolute right-6 top-10 select-none pointer-events-none overflow-hidden h-[120px] w-full flex justify-end items-center opacity-[0.03] dark:opacity-[0.05] z-0">
          <span className="text-[80px] sm:text-[140px] md:text-[180px] font-black leading-none tracking-tighter uppercase font-display">
            {activeView === 'planner' && 'PLAN'}
            {activeView === 'notes' && 'NOTE'}
            {activeView === 'reminders' && 'BELL'}
            {activeView === 'sync' && 'GEAR'}
          </span>
        </div>

        <header className="mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-zinc-950 dark:text-zinc-50 uppercase font-display leading-none">
              {activeView === 'planner' && 'Schedule & Planner'}
              {activeView === 'notes' && 'Workspace Notes'}
              {activeView === 'reminders' && 'Event Notifications'}
              {activeView === 'sync' && 'App Settings'}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 font-medium">
              {activeView === 'planner' && 'Organize your days, week columns, and target roadmaps.'}
              {activeView === 'notes' && 'Scribble down reminders, ideas, checklists, and pin important cards.'}
              {activeView === 'reminders' && 'Track scheduled reminder alerts and dismiss past event notifications.'}
              {activeView === 'sync' && 'Configure workspace theme modes, clear local database, or export backups.'}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono bg-amber-100 dark:bg-zinc-900 text-zinc-950 dark:text-zinc-100 px-4 py-2 rounded-xl border-2 border-zinc-950 dark:border-zinc-100 neo-shadow-sm font-bold">
            <Clock className="w-4 h-4 shrink-0 text-zinc-950 dark:text-zinc-100" />
            <span className="uppercase tracking-wider">
              {new Date().toLocaleDateString(undefined, {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
        </header>

        {/* View Switchboard Router */}
        <div className="animate-fadeIn relative z-10">
          {activeView === 'planner' && (
            <PlannerView
              plans={plans}
              tags={tags}
              onAddPlan={handleAddPlan}
              onUpdatePlan={handleUpdatePlan}
              onDeletePlan={handleDeletePlan}
            />
          )}

          {activeView === 'notes' && (
            <NotesView
              notes={notes}
              tags={tags}
              onAddNote={handleAddNote}
              onUpdateNote={handleUpdateNote}
              onDeleteNote={handleDeleteNote}
            />
          )}

          {activeView === 'reminders' && (
            <RemindersView
              notes={notes}
              plans={plans}
              onRemoveNoteReminder={handleRemoveNoteReminder}
              onRemovePlanReminder={handleRemovePlanReminder}
              onSnoozeNoteReminder={handleSnoozeNoteReminder}
              onSnoozePlanReminder={handleSnoozePlanReminder}
            />
          )}

          {activeView === 'sync' && (
            <SyncView
              notes={notes}
              plans={plans}
              tags={tags}
              onImportData={handleImportData}
              onClearAll={handleClearAll}
              theme={theme}
              onSetTheme={handleSetTheme}
            />
          )}
        </div>
      </main>

      {/* STUNNING ACTIVE ALARM / REMINDER POPUP POPUP */}
      {activeAlert && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border-2 border-amber-500/80 dark:border-amber-500/50 w-full max-w-md shadow-2xl p-6 text-center space-y-4 animate-bounce-subtle">
            <div className="w-14 h-14 bg-amber-500/10 dark:bg-amber-500/20 text-amber-500 rounded-2xl flex items-center justify-center mx-auto animate-pulse">
              <BellRing className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 px-2.5 py-0.5 rounded-full border border-amber-200/40 dark:border-amber-900/30">
                Reminder Alert Triggered
              </span>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-2.5 leading-snug">
                {activeAlert.title}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto line-clamp-2">
                This item has a scheduled reminder trigger at this time.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleSnoozeAlert}
                id="btn-alert-snooze"
                className="w-full py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-sm font-semibold transition-all cursor-pointer"
              >
                Snooze 10m
              </button>
              <button
                onClick={handleDismissAlert}
                id="btn-alert-dismiss"
                className="w-full py-2.5 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-sm font-semibold transition-all cursor-pointer shadow-sm"
              >
                Dismiss Alert
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
