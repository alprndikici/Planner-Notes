import React, { useState } from 'react';
import { Note, Tag } from '../types';
import { Search, Pin, Plus, Calendar, Edit3, Trash2, Tag as TagIcon, Check, Star, CornerDownRight } from 'lucide-react';

interface NotesViewProps {
  notes: Note[];
  tags: Tag[];
  onAddNote: (title: string, content: string, noteTags: string[], color?: string, isPinned?: boolean) => void;
  onUpdateNote: (id: string, updates: Partial<Note>) => void;
  onDeleteNote: (id: string) => void;
}

const NOTE_COLORS = [
  { name: 'Default', class: 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800' },
  { name: 'Lavender', class: 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/40 text-indigo-950 dark:text-indigo-200' },
  { name: 'Sage', class: 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/40 text-emerald-950 dark:text-emerald-200' },
  { name: 'Peach', class: 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/40 text-amber-950 dark:text-amber-200' },
  { name: 'Rose', class: 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/40 text-rose-950 dark:text-rose-200' },
  { name: 'Sky', class: 'bg-cyan-50/50 dark:bg-cyan-950/20 border-cyan-100 dark:border-cyan-900/40 text-cyan-950 dark:text-cyan-200' },
];

export const NotesView: React.FC<NotesViewProps> = ({
  notes,
  tags,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
}) => {
  const [search, setSearch] = useState('');
  const [selectedTagFilters, setSelectedTagFilters] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [noteTags, setNoteTags] = useState<string[]>([]);
  const [noteColor, setNoteColor] = useState(NOTE_COLORS[0].class);
  const [isPinned, setIsPinned] = useState(false);

  // Open create note
  const handleOpenCreate = () => {
    setEditingNoteId(null);
    setTitle('');
    setContent('');
    setNoteTags([]);
    setNoteColor(NOTE_COLORS[0].class);
    setIsPinned(false);
    setIsEditing(true);
  };

  // Open edit note
  const handleOpenEdit = (note: Note) => {
    setEditingNoteId(note.id);
    setTitle(note.title);
    setContent(note.content);
    setNoteTags(note.tags);
    setNoteColor(note.color || NOTE_COLORS[0].class);
    setIsPinned(note.isPinned);
    setIsEditing(true);
  };

  // Save note
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !content.trim()) return;

    if (editingNoteId) {
      onUpdateNote(editingNoteId, {
        title: title.trim(),
        content: content.trim(),
        tags: noteTags,
        color: noteColor,
        isPinned,
        updatedAt: new Date().toISOString(),
      });
    } else {
      onAddNote(title.trim(), content.trim(), noteTags, noteColor, isPinned);
    }
    setIsEditing(false);
  };

  // Toggle tag in form
  const handleToggleFormTag = (tagId: string) => {
    if (noteTags.includes(tagId)) {
      setNoteTags(noteTags.filter((id) => id !== tagId));
    } else {
      setNoteTags([...noteTags, tagId]);
    }
  };

  // Toggle tag in filter
  const handleToggleFilterTag = (tagId: string) => {
    if (selectedTagFilters.includes(tagId)) {
      setSelectedTagFilters(selectedTagFilters.filter((id) => id !== tagId));
    } else {
      setSelectedTagFilters([...selectedTagFilters, tagId]);
    }
  };

  // Filter notes
  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(search.toLowerCase()) ||
      note.content.toLowerCase().includes(search.toLowerCase());
    
    const matchesTags =
      selectedTagFilters.length === 0 ||
      selectedTagFilters.every((tId) => note.tags.includes(tId));

    return matchesSearch && matchesTags;
  });

  // Sort notes: pinned first, then newest first
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  return (
    <div className="space-y-6">
      {/* Upper Search and Action Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between relative z-10">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-950 dark:text-zinc-100 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes by keyword..."
            className="w-full text-xs font-bold uppercase tracking-wider pl-10 pr-4 py-3 rounded-xl border-2 border-zinc-950 dark:border-zinc-100 bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 neo-shadow-sm"
          />
        </div>

        <button
          onClick={handleOpenCreate}
          id="btn-new-note"
          className="neo-btn-primary"
        >
          <Plus className="w-4 h-4" /> New Note
        </button>
      </div>

      {/* Tags Filter Row */}
      {tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 py-2 border-b-2 border-zinc-950 dark:border-zinc-800/60">
          <span className="text-[10px] font-black text-zinc-950 dark:text-zinc-100 uppercase tracking-[0.15em] flex items-center gap-1 pr-1">
            <TagIcon className="w-3.5 h-3.5" /> Filter:
          </span>
          {tags.map((tag) => {
            const isSelected = selectedTagFilters.includes(tag.id);
            return (
              <button
                key={tag.id}
                onClick={() => handleToggleFilterTag(tag.id)}
                className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border-2 border-zinc-950 dark:border-zinc-100 transition-all cursor-pointer ${
                  isSelected
                    ? `${tag.color} ring-2 ring-zinc-500/10 scale-105 shadow-[2px_2px_0px_0px_rgba(9,9,11,1)] dark:shadow-[2px_2px_0px_0px_rgba(250,250,250,1)]`
                    : 'bg-white dark:bg-zinc-950 text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-100 hover:scale-105'
                }`}
              >
                {tag.name}
              </button>
            );
          })}
          {selectedTagFilters.length > 0 && (
            <button
              onClick={() => setSelectedTagFilters([])}
              className="text-[10px] font-bold uppercase tracking-wider text-amber-600 hover:text-amber-700 dark:text-amber-400 hover:underline underline-offset-2 ml-1"
            >
              [Clear filters]
            </button>
          )}
        </div>
      )}

      {/* Notes Grid Display */}
      {sortedNotes.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#0c0c0e] rounded-2xl border-2 border-zinc-950 dark:border-zinc-100 neo-shadow">
          <p className="text-zinc-500 dark:text-zinc-400 text-sm font-bold uppercase tracking-wider">
            {notes.length === 0 ? 'No notes yet. Create your first note!' : 'No notes match your search or filter.'}
          </p>
          {notes.length === 0 && (
            <button
              onClick={handleOpenCreate}
              className="mt-4 neo-btn-primary"
            >
              <Plus className="w-4 h-4" /> Write Note
            </button>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedNotes.map((note) => (
            <div
              key={note.id}
              className={`rounded-2xl p-6 border-2 border-zinc-950 dark:border-zinc-100 shadow-[4px_4px_0px_0px_rgba(9,9,11,1)] dark:shadow-[4px_4px_0px_0px_rgba(250,250,250,0.95)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(9,9,11,1)] dark:hover:shadow-[6px_6px_0px_0px_rgba(250,250,250,0.95)] transition-all group flex flex-col justify-between relative overflow-hidden ${
                note.color || NOTE_COLORS[0].class
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h4 className="font-black text-zinc-950 dark:text-zinc-100 text-base leading-tight uppercase font-display tracking-tight">
                    {note.title || 'Untitled Note'}
                  </h4>
                  <div className="flex items-center gap-1.5 opacity-80 sm:opacity-40 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onUpdateNote(note.id, { isPinned: !note.isPinned })}
                      className={`p-1 rounded-lg border-2 border-transparent hover:border-zinc-950 dark:hover:border-zinc-100 hover:bg-white dark:hover:bg-zinc-800 transition-all cursor-pointer ${
                        note.isPinned ? 'text-amber-500' : 'text-zinc-400'
                      }`}
                      title={note.isPinned ? 'Unpin note' : 'Pin note'}
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(note)}
                      className="p-1 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white rounded-lg border-2 border-transparent hover:border-zinc-950 dark:hover:border-zinc-100 hover:bg-white dark:hover:bg-zinc-800 cursor-pointer"
                      title="Edit note"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Delete this note?')) onDeleteNote(note.id);
                      }}
                      className="p-1 text-zinc-400 hover:text-rose-600 rounded-lg border-2 border-transparent hover:border-zinc-950 hover:bg-white dark:hover:bg-zinc-800 cursor-pointer"
                      title="Delete note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-zinc-800 dark:text-zinc-300 whitespace-pre-wrap line-clamp-5 mb-5 leading-relaxed font-semibold">
                  {note.content}
                </p>
              </div>

              <div>
                {/* Note Tags */}
                {note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {note.tags.map((tagId) => {
                      const tag = tags.find((t) => t.id === tagId);
                      if (!tag) return null;
                      return (
                        <span
                          key={tagId}
                          className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border-2 border-zinc-950 dark:border-zinc-100 ${tag.color}`}
                        >
                          {tag.name}
                        </span>
                      );
                    })}
                  </div>
                )}

                <div className="flex items-center justify-between text-[10px] text-zinc-500 dark:text-zinc-400 font-mono font-bold uppercase">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {new Date(note.updatedAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  {note.isPinned && (
                    <span className="flex items-center gap-0.5 text-amber-500 font-black tracking-wider uppercase bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 border border-amber-300 rounded-md">
                      <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" /> Pinned
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editor Panel Modal Overlay */}
      {isEditing && (
        <div className="fixed inset-0 bg-zinc-950/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-[#0c0c0e] rounded-3xl border-4 border-zinc-950 dark:border-zinc-100 w-full max-w-2xl shadow-[8px_8px_0px_0px_rgba(9,9,11,1)] dark:shadow-[8px_8px_0px_0px_rgba(250,250,250,1)] overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-6 py-4 border-b-2 border-zinc-950 dark:border-zinc-800/80 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/50">
              <h3 className="font-black text-zinc-950 dark:text-zinc-100 text-lg uppercase tracking-tight">
                {editingNoteId ? 'Edit Note' : 'Create New Note'}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPinned(!isPinned)}
                  className={`p-1.5 rounded-xl border-2 transition-all cursor-pointer ${
                    isPinned
                      ? 'bg-amber-100 border-zinc-950 text-amber-700 shadow-sm'
                      : 'text-zinc-400 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50'
                  }`}
                  title={isPinned ? 'Pinned note' : 'Unpinned note'}
                >
                  <Pin className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 rounded-xl border-2 border-zinc-950 dark:border-zinc-100 text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-900 hover:bg-zinc-100 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5">Note Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Brainstorming New Dashboard"
                  className="w-full text-base font-black bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none p-3 border-2 border-zinc-950 dark:border-zinc-100 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5">Content Description</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Start writing thoughts, tasks, reminders..."
                  rows={8}
                  className="w-full text-sm font-semibold bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 focus:outline-none p-3 border-2 border-zinc-950 dark:border-zinc-100 rounded-xl resize-none leading-relaxed"
                  required
                />
              </div>

              {/* Tag Selection */}
              {tags.length > 0 && (
                <div className="border-t-2 border-zinc-950 dark:border-zinc-800/80 pt-4">
                  <div className="text-xs font-black text-zinc-950 dark:text-zinc-100 mb-3 uppercase tracking-wider">
                    Categorize with Tags
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((tag) => {
                      const isSelected = noteTags.includes(tag.id);
                      return (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => handleToggleFormTag(tag.id)}
                          className={`text-xs px-3 py-1.5 rounded-full border-2 border-zinc-950 dark:border-zinc-100 font-bold uppercase tracking-wider transition-all cursor-pointer ${
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

              {/* Color Selection */}
              <div className="border-t-2 border-zinc-950 dark:border-zinc-800/80 pt-4">
                <div className="text-xs font-black text-zinc-950 dark:text-zinc-100 mb-3 uppercase tracking-wider">
                  Select Theme Accent
                </div>
                <div className="flex flex-wrap gap-2">
                  {NOTE_COLORS.map((color, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setNoteColor(color.class)}
                      className={`px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider border-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                        noteColor === color.class
                          ? 'border-zinc-950 dark:border-zinc-100 bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 scale-105 shadow-[2px_2px_0px_0px_rgba(9,9,11,1)] dark:shadow-[2px_2px_0px_0px_rgba(250,250,250,1)]'
                          : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-900 hover:bg-zinc-50'
                      }`}
                    >
                      <span>{color.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="border-t-2 border-zinc-950 dark:border-zinc-800/80 pt-4 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-xs font-black uppercase tracking-wider text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="neo-btn-primary"
                >
                  <span>Save Note</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
