import React from 'react';
import { Note, PlanItem } from '../types';
import { Clock, Calendar, Check, BellRing, CornerDownRight, Trash2, ShieldAlert } from 'lucide-react';

interface RemindersViewProps {
  notes: Note[];
  plans: PlanItem[];
  onRemoveNoteReminder: (id: string) => void;
  onRemovePlanReminder: (id: string) => void;
  onSnoozeNoteReminder: (id: string) => void;
  onSnoozePlanReminder: (id: string) => void;
}

export const RemindersView: React.FC<RemindersViewProps> = ({
  notes,
  plans,
  onRemoveNoteReminder,
  onRemovePlanReminder,
  onSnoozeNoteReminder,
  onSnoozePlanReminder,
}) => {
  // Aggregate active/triggered reminders
  const remindersFromNotes = notes
    .filter((n) => n.reminderTime)
    .map((n) => ({
      id: n.id,
      type: 'note' as const,
      title: n.title || 'Untitled Note',
      description: n.content,
      reminderTime: n.reminderTime!,
      triggered: n.reminderTriggered || false,
    }));

  const remindersFromPlans = plans
    .filter((p) => p.reminderTime)
    .map((p) => ({
      id: p.id,
      type: 'plan' as const,
      title: p.title,
      description: p.description,
      reminderTime: p.reminderTime!,
      triggered: p.reminderTriggered || false,
    }));

  const allReminders = [...remindersFromNotes, ...remindersFromPlans].sort(
    (a, b) => new Date(a.reminderTime).getTime() - new Date(b.reminderTime).getTime()
  );

  const activeReminders = allReminders.filter((r) => !r.triggered);
  const pastReminders = allReminders.filter((r) => r.triggered);

  return (
    <div className="space-y-8 max-w-4xl mx-auto relative z-10">
      {/* Active Reminders */}
      <div className="bg-white dark:bg-[#0c0c0e] rounded-3xl p-6 border-2 border-zinc-950 dark:border-zinc-100 shadow-[4px_4px_0px_0px_rgba(9,9,11,1)] dark:shadow-[4px_4px_0px_0px_rgba(250,250,250,1)]">
        <h3 className="text-lg font-black text-zinc-950 dark:text-zinc-100 mb-5 flex items-center gap-2 uppercase tracking-tight font-display">
          <BellRing className="w-5 h-5 text-amber-500" /> Active Alerts
        </h3>

        {activeReminders.length === 0 ? (
          <div className="text-center py-12 bg-zinc-50 dark:bg-zinc-950/40 rounded-2xl border-2 border-dashed border-zinc-950">
            <p className="text-zinc-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider italic">No active reminders configured.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeReminders.map((r) => (
              <div
                key={`${r.type}-${r.id}`}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white dark:bg-zinc-900 border-2 border-zinc-950 dark:border-zinc-800 rounded-2xl gap-4 hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_rgba(9,9,11,1)] transition-all"
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <Clock className="w-5 h-5 text-zinc-950 dark:text-zinc-100 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-[9px] uppercase font-black tracking-widest px-2 py-0.5 rounded-md bg-amber-400 text-zinc-950 border border-zinc-950">
                        {r.type}
                      </span>
                      <h4 className="font-black text-zinc-950 dark:text-zinc-100 text-sm uppercase tracking-tight">
                        {r.title}
                      </h4>
                    </div>
                    {r.description && (
                      <p className="text-xs text-zinc-600 dark:text-zinc-300 font-semibold truncate max-w-md">
                        {r.description}
                      </p>
                    )}
                    <p className="text-xs font-black text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1 uppercase tracking-wider">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>
                        {new Date(r.reminderTime).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}{' '}
                        at{' '}
                        {new Date(r.reminderTime).toLocaleTimeString(undefined, {
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:self-center self-end">
                  <button
                    onClick={() => {
                      if (r.type === 'note') onSnoozeNoteReminder(r.id);
                      else onSnoozePlanReminder(r.id);
                    }}
                    className="px-3 py-2 text-[10px] font-black uppercase tracking-wider bg-white dark:bg-zinc-900 border-2 border-zinc-950 dark:border-zinc-100 hover:bg-zinc-50 rounded-xl text-zinc-900 dark:text-zinc-100 transition-all cursor-pointer shadow-[2px_2px_0px_0px_rgba(9,9,11,1)] active:translate-y-[1px] active:shadow-none"
                  >
                    Snooze 10m
                  </button>
                  <button
                    onClick={() => {
                      if (r.type === 'note') onRemoveNoteReminder(r.id);
                      else onRemovePlanReminder(r.id);
                    }}
                    className="p-2 text-zinc-500 hover:text-rose-600 bg-white dark:bg-zinc-900 border-2 border-zinc-950 dark:border-zinc-100 hover:bg-zinc-50 rounded-xl cursor-pointer transition-all shadow-[2px_2px_0px_0px_rgba(9,9,11,1)] active:translate-y-[1px] active:shadow-none"
                    title="Remove reminder"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Triggered / Past Reminders */}
      <div className="bg-white dark:bg-[#0c0c0e] rounded-3xl p-6 border-2 border-zinc-950 dark:border-zinc-100 shadow-[4px_4px_0px_0px_rgba(9,9,11,1)] dark:shadow-[4px_4px_0px_0px_rgba(250,250,250,1)]">
        <h3 className="text-lg font-black text-zinc-500 dark:text-zinc-400 mb-5 flex items-center gap-2 uppercase tracking-tight font-display">
          <ShieldAlert className="w-5 h-5 text-zinc-400" /> Triggered History
        </h3>

        {pastReminders.length === 0 ? (
          <div className="text-center py-12 bg-zinc-50/50 dark:bg-zinc-950/20 rounded-2xl border-2 border-dashed border-zinc-300">
            <p className="text-zinc-400 dark:text-zinc-500 text-xs font-bold uppercase tracking-wider italic">No past triggered reminders found.</p>
          </div>
        ) : (
          <div className="space-y-3 opacity-70">
            {pastReminders.map((r) => (
              <div
                key={`${r.type}-${r.id}`}
                className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-950 border-2 border-zinc-950 dark:border-zinc-800 rounded-2xl gap-3"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] uppercase font-black tracking-widest px-1.5 py-0.2 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                        {r.type}
                      </span>
                      <h4 className="font-bold text-zinc-800 dark:text-zinc-200 text-xs uppercase tracking-tight truncate">
                        {r.title}
                      </h4>
                    </div>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 font-mono">
                      Triggered {new Date(r.reminderTime).toLocaleDateString()} at{' '}
                      {new Date(r.reminderTime).toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (r.type === 'note') onRemoveNoteReminder(r.id);
                    else onRemovePlanReminder(r.id);
                  }}
                  className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-lg border-2 border-transparent hover:border-zinc-950 hover:bg-white dark:hover:bg-zinc-800 transition-all cursor-pointer"
                  title="Clear history record"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
