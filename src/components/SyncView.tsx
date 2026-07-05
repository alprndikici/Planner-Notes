import React, { useState } from 'react';
import { Note, PlanItem, Tag } from '../types';
import { FileDown, FileUp, Check, AlertCircle, Trash2, Moon, Sun } from 'lucide-react';

interface SyncViewProps {
  notes: Note[];
  plans: PlanItem[];
  tags: Tag[];
  onImportData: (notes: Note[], plans: PlanItem[], tags: Tag[]) => void;
  onClearAll: () => void;
  theme: 'light' | 'dark';
  onSetTheme: (theme: 'light' | 'dark') => void;
}

export const SyncView: React.FC<SyncViewProps> = ({
  notes,
  plans,
  tags,
  onImportData,
  onClearAll,
  theme,
  onSetTheme,
}) => {
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Export data as local JSON file
  const handleExportJSON = () => {
    try {
      const dataStr = JSON.stringify({ notes, plans, tags, version: 1 }, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `planner-backup-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      setMessage({ type: 'success', text: 'Backup file downloaded successfully.' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to export backup file.' });
    }
  };

  // Import data from local JSON file
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.notes || parsed.plans || parsed.tags) {
            onImportData(parsed.notes || [], parsed.plans || [], parsed.tags || []);
            setMessage({ type: 'success', text: 'Local backup file successfully imported!' });
          } else {
            setMessage({ type: 'error', text: 'Invalid backup file structure.' });
          }
        } catch (error) {
          setMessage({ type: 'error', text: 'Failed to parse JSON file.' });
        }
      };
    }
  };

  const handleClearAllConfirm = () => {
    if (window.confirm('Are you absolutely sure you want to clear ALL items, notes, tags, and settings? This action cannot be undone.')) {
      onClearAll();
      setMessage({ type: 'success', text: 'All local data has been cleared.' });
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto relative z-10">
      
      {/* 1. Theme Selection Area */}
      <div className="bg-white dark:bg-[#0c0c0e] rounded-3xl p-6 border-2 border-zinc-950 dark:border-zinc-100 shadow-[4px_4px_0px_0px_rgba(9,9,11,1)] dark:shadow-[4px_4px_0px_0px_rgba(250,250,250,1)]">
        <h3 className="text-xl font-black text-zinc-950 dark:text-zinc-100 mb-2 uppercase tracking-tight font-display">
          Appearance & Themes
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold mb-6">
          Select your preferred workspace visual layout. Switch between high-contrast Light mode or deeply immersive Dark mode.
        </p>

        <div className="grid sm:grid-cols-2 gap-6">
          {/* Light Mode Selector Card */}
          <button
            onClick={() => onSetTheme('light')}
            id="btn-select-theme-light"
            className={`text-left p-5 rounded-2xl border-2 border-zinc-950 flex flex-col justify-between transition-all duration-200 cursor-pointer group ${
              theme === 'light'
                ? 'bg-amber-100 text-zinc-950 shadow-[4px_4px_0px_0px_rgba(9,9,11,1)] translate-x-[-2px] translate-y-[-2px]'
                : 'bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900/40 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-950 dark:hover:border-zinc-100'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2.5 rounded-xl border-2 border-zinc-950 ${theme === 'light' ? 'bg-white' : 'bg-zinc-100 dark:bg-zinc-800'}`}>
                  <Sun className={`w-5 h-5 ${theme === 'light' ? 'text-amber-500' : 'text-zinc-400'}`} />
                </div>
                {theme === 'light' ? (
                  <span className="text-[9px] font-black uppercase tracking-wider bg-zinc-950 text-white px-2.5 py-1 rounded-md border border-zinc-950">
                    Active Mode
                  </span>
                ) : (
                  <span className="text-[9px] font-black uppercase tracking-wider bg-transparent text-zinc-400 dark:text-zinc-500 px-2.5 py-1">
                    Light Theme
                  </span>
                )}
              </div>
              <h4 className="text-base font-black uppercase tracking-tight text-zinc-950 dark:text-zinc-100">
                Light Dimension
              </h4>
              <p className="text-[11px] font-semibold mt-1 leading-relaxed opacity-80">
                Crisp dark charcoal typography nested on an off-white paper canvas. Ideal for focused daytime scheduling.
              </p>
            </div>

            <div className="mt-6 w-full h-20 rounded-xl bg-white border border-zinc-300 dark:border-zinc-700/50 p-3 flex flex-col justify-between select-none">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span className="text-[9px] font-mono font-bold text-zinc-500">CLIENT_SYSTEM_OK</span>
              </div>
              <div className="space-y-1.5">
                <div className="h-1.5 w-2/3 bg-zinc-200 rounded"></div>
                <div className="h-1.5 w-1/2 bg-zinc-100 rounded"></div>
              </div>
            </div>
          </button>

          {/* Dark Mode Selector Card */}
          <button
            onClick={() => onSetTheme('dark')}
            id="btn-select-theme-dark"
            className={`text-left p-5 rounded-2xl border-2 flex flex-col justify-between transition-all duration-200 cursor-pointer group ${
              theme === 'dark'
                ? 'bg-zinc-950 border-zinc-100 text-white shadow-[4px_4px_0px_0px_rgba(250,250,250,1)] translate-x-[-2px] translate-y-[-2px]'
                : 'bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900/40 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-950 dark:hover:border-zinc-100'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2.5 rounded-xl border-2 ${theme === 'dark' ? 'bg-zinc-900 border-zinc-100' : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-250 dark:border-zinc-700'}`}>
                  <Moon className={`w-5 h-5 ${theme === 'dark' ? 'text-amber-400' : 'text-zinc-400'}`} />
                </div>
                {theme === 'dark' ? (
                  <span className="text-[9px] font-black uppercase tracking-wider bg-white text-zinc-950 px-2.5 py-1 rounded-md border border-white">
                    Active Mode
                  </span>
                ) : (
                  <span className="text-[9px] font-black uppercase tracking-wider bg-transparent text-zinc-400 dark:text-zinc-500 px-2.5 py-1">
                    Dark Theme
                  </span>
                )}
              </div>
              <h4 className="text-base font-black uppercase tracking-tight text-zinc-950 dark:text-zinc-100">
                Midnight Void
              </h4>
              <p className="text-[11px] font-semibold mt-1 leading-relaxed opacity-80">
                Smooth electric amber highlights layered on a deep obsidian backdrop. Safe for night owls and low light conditions.
              </p>
            </div>

            <div className="mt-6 w-full h-20 rounded-xl bg-[#060608] border border-zinc-800 p-3 flex flex-col justify-between select-none">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                <span className="text-[9px] font-mono font-bold text-zinc-500">CLIENT_SYSTEM_OK</span>
              </div>
              <div className="space-y-1.5">
                <div className="h-1.5 w-2/3 bg-zinc-800 rounded"></div>
                <div className="h-1.5 w-1/2 bg-zinc-900 rounded"></div>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Message feedback area */}
      {message && (
        <div
          className={`p-4 rounded-xl border-2 text-xs font-bold uppercase tracking-wider flex gap-3 items-start animate-fadeIn ${
            message.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 border-emerald-500/30'
              : 'bg-rose-50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-400 border-rose-500/30'
          }`}
        >
          {message.type === 'success' ? (
            <Check className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <div>{message.text}</div>
        </div>
      )}

      {/* 2. Manual File Backup */}
      <div className="bg-white dark:bg-[#0c0c0e] rounded-3xl p-6 border-2 border-zinc-950 dark:border-zinc-100 shadow-[4px_4px_0px_0px_rgba(9,9,11,1)] dark:shadow-[4px_4px_0px_0px_rgba(250,250,250,1)]">
        <h3 className="text-lg font-black text-zinc-950 dark:text-zinc-100 mb-2 uppercase tracking-tight font-display">
          Local Storage & File Backups
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold mb-6">
          Manually export your planner data as a JSON file, or drag-and-drop a previously saved file to import offline.
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          <button
            onClick={handleExportJSON}
            id="btn-export-json"
            className="flex items-center justify-center gap-3 p-4 border-2 border-zinc-950 dark:border-zinc-100 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-850 rounded-2xl text-zinc-950 dark:text-zinc-100 transition-all text-xs font-black uppercase tracking-wider cursor-pointer shadow-[3px_3px_0px_0px_rgba(9,9,11,1)] dark:shadow-[3px_3px_0px_0px_rgba(250,250,250,1)] active:translate-y-[1px] active:shadow-none text-left"
          >
            <FileDown className="w-6 h-6 text-zinc-950 dark:text-zinc-100 shrink-0" />
            <div>
              <div>Export Backup JSON</div>
              <div className="text-[10px] font-normal text-zinc-500 capitalize mt-0.5">Download config locally</div>
            </div>
          </button>

          <label
            id="label-import-json"
            className="flex items-center justify-center gap-3 p-4 border-2 border-dashed border-zinc-950 dark:border-zinc-100 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-850 rounded-2xl text-zinc-950 dark:text-zinc-100 transition-all text-xs font-black uppercase tracking-wider cursor-pointer shadow-[3px_3px_0px_0px_rgba(9,9,11,1)] dark:shadow-[3px_3px_0px_0px_rgba(250,250,250,1)] active:translate-y-[1px] active:shadow-none text-left"
          >
            <FileUp className="w-6 h-6 text-zinc-950 dark:text-zinc-100 shrink-0" />
            <div>
              <div>Import Backup JSON</div>
              <div className="text-[10px] font-normal text-zinc-500 capitalize mt-0.5">Upload config file</div>
            </div>
            <input
              type="file"
              accept=".json"
              onChange={handleImportJSON}
              className="hidden"
            />
          </label>
        </div>

        <div className="border-t-2 border-zinc-950 dark:border-zinc-800 mt-6 pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-black text-rose-600 dark:text-rose-400 text-sm uppercase tracking-tight">Reset Local Database</h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold mt-0.5">Delete all local notes, tasks, plans, and tags instantly.</p>
          </div>
          <button
            onClick={handleClearAllConfirm}
            id="btn-clear-all"
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-rose-600 hover:text-white border-2 border-rose-500 hover:bg-rose-500 dark:hover:bg-rose-600 rounded-xl transition-all cursor-pointer shadow-[2px_2px_0px_0px_rgba(244,63,94,1)] active:translate-y-[1px] active:shadow-none"
          >
            <Trash2 className="w-4 h-4" />
            Clear Local Data
          </button>
        </div>
      </div>
    </div>
  );
};
