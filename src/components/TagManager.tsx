import React, { useState } from 'react';
import { Tag } from '../types';
import { Plus, X, Tag as TagIcon, Check } from 'lucide-react';

interface TagManagerProps {
  tags: Tag[];
  onAddTag: (name: string, color: string) => void;
  onDeleteTag: (id: string) => void;
}

const PRESET_COLORS = [
  'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700',
  'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/50',
  'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/50',
  'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50',
  'bg-cyan-50 dark:bg-cyan-950/30 text-cyan-600 dark:text-cyan-400 border-cyan-100 dark:border-cyan-900/50',
  'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/50',
  'bg-fuchsia-50 dark:bg-fuchsia-950/30 text-fuchsia-600 dark:text-fuchsia-400 border-fuchsia-100 dark:border-fuchsia-900/50',
];

export const TagManager: React.FC<TagManagerProps> = ({ tags, onAddTag, onDeleteTag }) => {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddTag(name.trim(), selectedColor);
    setName('');
    setIsAdding(false);
  };

  return (
    <div className="bg-white dark:bg-[#0c0c0e] rounded-2xl p-5 border-2 border-zinc-950 dark:border-zinc-100 shadow-[3px_3px_0px_0px_rgba(9,9,11,1)] dark:shadow-[3px_3px_0px_0px_rgba(250,250,250,0.95)]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TagIcon className="w-4 h-4 text-zinc-900 dark:text-zinc-100" />
          <h3 className="font-black text-xs uppercase tracking-wider text-zinc-900 dark:text-zinc-100">Category Tags</h3>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            id="btn-add-tag-toggle"
            className="text-[10px] font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-zinc-100 flex items-center gap-1 px-2.5 py-1 rounded-lg border-2 border-zinc-950 dark:border-zinc-100 bg-white dark:bg-zinc-900 shadow-[1px_1px_0px_0px_rgba(9,9,11,1)] dark:shadow-[1px_1px_0px_0px_rgba(250,250,250,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
          >
            <Plus className="w-3 h-3" /> Add
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-4 p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border-2 border-zinc-950 dark:border-zinc-800 animate-fadeIn">
          <div className="space-y-3">
            <div>
              <label htmlFor="tag-name-input" className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
                Tag Name
              </label>
              <input
                id="tag-name-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Work, Ideas..."
                maxLength={20}
                className="w-full text-xs px-3 py-2 rounded-lg border-2 border-zinc-950 dark:border-zinc-100 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                Pick Accent Color
              </label>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_COLORS.map((color, idx) => {
                  // Extract visual representation of colors from class
                  let bgDot = 'bg-zinc-500';
                  if (color.includes('rose')) bgDot = 'bg-rose-500';
                  else if (color.includes('amber')) bgDot = 'bg-amber-500';
                  else if (color.includes('emerald')) bgDot = 'bg-emerald-500';
                  else if (color.includes('cyan')) bgDot = 'bg-cyan-500';
                  else if (color.includes('indigo')) bgDot = 'bg-indigo-500';
                  else if (color.includes('fuchsia')) bgDot = 'bg-fuchsia-500';
                  else if (color.includes('slate')) bgDot = 'bg-slate-500';

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`w-6.5 h-6.5 rounded-full flex items-center justify-center border-2 transition-all cursor-pointer ${
                        selectedColor === color
                          ? 'border-zinc-950 dark:border-zinc-100 scale-110 ring-2 ring-zinc-500/20'
                          : 'border-zinc-300 dark:border-zinc-800'
                      }`}
                    >
                      <span className={`w-3 h-3 rounded-full ${bgDot} block`} />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 rounded-lg border-2 border-zinc-950 dark:border-zinc-100 shadow-[1px_1px_0px_0px_rgba(9,9,11,1)] dark:shadow-[1px_1px_0px_0px_rgba(250,250,250,1)] hover:translate-y-[-1px] transition-all cursor-pointer"
              >
                Create
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="flex flex-wrap gap-1.5">
        {tags.length === 0 ? (
          <p className="text-xs text-zinc-400 dark:text-zinc-500 italic py-1">No tags created yet.</p>
        ) : (
          tags.map((tag) => (
            <div
              key={tag.id}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border-2 border-zinc-950 dark:border-zinc-100 shadow-[1.5px_1.5px_0px_0px_rgba(9,9,11,1)] dark:shadow-[1.5px_1.5px_0px_0px_rgba(250,250,250,0.9)] ${tag.color} transition-all duration-200`}
            >
              <span>{tag.name}</span>
              <button
                onClick={() => onDeleteTag(tag.id)}
                className="hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-0.5 transition-colors focus:outline-none cursor-pointer"
                title={`Delete tag "${tag.name}"`}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
