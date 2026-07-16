export type TaskCategory = 'work' | 'personal' | 'health' | 'other';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  completed: boolean;
  reminderEnabled: boolean;
  category: TaskCategory;
  priority: TaskPriority;
  notificationId?: string;
  createdAt: number;
}
