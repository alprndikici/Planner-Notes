export interface Tag {
  id: string;
  name: string;
  color: string; // Tailwind color class or hex, e.g., 'bg-red-500/10 text-red-500 border-red-500/20'
}

export type PlanScope = 'daily' | 'weekly' | 'long-term';

export interface PlanItem {
  id: string;
  title: string;
  description: string;
  scope: PlanScope;
  date?: string; // YYYY-MM-DD for daily
  dayOfWeek?: number; // 0-6 for weekly MON-SUN or MON-SUN string
  targetDateString?: string; // For weekly or long-term display
  completed: boolean;
  tags: string[]; // tag IDs
  reminderTime?: string | null; // ISO String
  reminderTriggered?: boolean;
  createdAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[]; // tag IDs
  color?: string; // background color card accent
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  reminderTime?: string | null; // ISO String
  reminderTriggered?: boolean;
}

export interface AppData {
  notes: Note[];
  plans: PlanItem[];
  tags: Tag[];
  theme: 'light' | 'dark';
}
