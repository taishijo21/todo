export type Priority = 'high' | 'medium' | 'low';
export type Filter = 'all' | 'active' | 'completed';

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  priority: Priority;
  dueDate?: string;
  createdAt: string;
  order: number;
}
