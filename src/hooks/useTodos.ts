import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { arrayMove } from '@dnd-kit/sortable';
import type { Todo, Priority, Filter } from '../types/todo';
import { loadTodos, saveTodos } from '../utils/storage';

function persist(todos: Todo[]): Todo[] {
  saveTodos(todos);
  return todos;
}

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>(() => loadTodos());
  const [filter, setFilter] = useState<Filter>('all');

  const addTodo = useCallback((text: string, priority: Priority, dueDate?: string) => {
    setTodos(prev => {
      const next: Todo = {
        id: uuidv4(),
        text,
        completed: false,
        priority,
        dueDate,
        createdAt: new Date().toISOString(),
        order: prev.length,
      };
      return persist([...prev, next]);
    });
  }, []);

  const toggleTodo = useCallback((id: string) => {
    setTodos(prev => persist(prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t)));
  }, []);

  const updateTodo = useCallback((id: string, text: string) => {
    setTodos(prev => persist(prev.map(t => t.id === id ? { ...t, text } : t)));
  }, []);

  const deleteTodo = useCallback((id: string) => {
    setTodos(prev => persist(prev.filter(t => t.id !== id)));
  }, []);

  const clearCompleted = useCallback(() => {
    setTodos(prev => persist(prev.filter(t => !t.completed)));
  }, []);

  const reorder = useCallback((activeId: string, overId: string) => {
    setTodos(prev => {
      const oldIndex = prev.findIndex(t => t.id === activeId);
      const newIndex = prev.findIndex(t => t.id === overId);
      if (oldIndex === -1 || newIndex === -1) return prev;
      const moved = arrayMove(prev, oldIndex, newIndex).map((t, i) => ({ ...t, order: i }));
      return persist(moved);
    });
  }, []);

  const filtered = todos
    .filter(t => {
      if (filter === 'active') return !t.completed;
      if (filter === 'completed') return t.completed;
      return true;
    })
    .sort((a, b) => a.order - b.order);

  const activeCount = todos.filter(t => !t.completed).length;
  const completedCount = todos.filter(t => t.completed).length;

  return {
    todos: filtered,
    filter,
    setFilter,
    activeCount,
    completedCount,
    addTodo,
    toggleTodo,
    updateTodo,
    deleteTodo,
    clearCompleted,
    reorder,
  };
}
