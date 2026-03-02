import { describe, it, expect, beforeEach } from 'vitest';
import type { Todo } from '../types/todo';
import { loadTodos, saveTodos } from './storage';

const makeTodo = (overrides: Partial<Todo> = {}): Todo => ({
  id: 'test-id',
  text: 'テストタスク',
  completed: false,
  priority: 'medium',
  createdAt: '2026-01-01T00:00:00.000Z',
  order: 0,
  ...overrides,
});

beforeEach(() => {
  localStorage.clear();
});

describe('loadTodos', () => {
  it('localStorageが空のとき空配列を返す', () => {
    expect(loadTodos()).toEqual([]);
  });

  it('有効なJSONが保存されているとき配列を返す', () => {
    const todos = [makeTodo({ id: '1' }), makeTodo({ id: '2', order: 1 })];
    localStorage.setItem('todos', JSON.stringify(todos));
    expect(loadTodos()).toEqual(todos);
  });

  it('不正なJSONのとき例外を投げず空配列を返す', () => {
    localStorage.setItem('todos', 'INVALID JSON');
    expect(loadTodos()).toEqual([]);
  });

  it('dueDateを持つtodoを正しく復元する', () => {
    const todo = makeTodo({ dueDate: '2026-12-31' });
    localStorage.setItem('todos', JSON.stringify([todo]));
    expect(loadTodos()[0].dueDate).toBe('2026-12-31');
  });
});

describe('saveTodos', () => {
  it('todosをlocalStorageに保存する', () => {
    const todos = [makeTodo()];
    saveTodos(todos);
    expect(localStorage.getItem('todos')).toBe(JSON.stringify(todos));
  });

  it('saveTodos → loadTodos でデータが往復する', () => {
    const todos = [makeTodo({ id: 'abc', text: '往復テスト' })];
    saveTodos(todos);
    expect(loadTodos()).toEqual(todos);
  });

  it('空配列を保存できる', () => {
    saveTodos([]);
    expect(loadTodos()).toEqual([]);
  });
});
