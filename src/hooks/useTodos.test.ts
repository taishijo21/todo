import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTodos } from './useTodos';

// uuid を決定論的にモック
vi.mock('uuid', () => ({ v4: vi.fn() }));
import { v4 as uuidv4 } from 'uuid';
const mockUuid = vi.mocked(uuidv4);

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-01-15'));
  let counter = 0;
  mockUuid.mockImplementation(() => `id-${++counter}`);
});

afterEach(() => {
  vi.useRealTimers();
});

describe('初期状態', () => {
  it('todosが空配列', () => {
    const { result } = renderHook(() => useTodos());
    expect(result.current.todos).toEqual([]);
  });

  it('filterが"all"', () => {
    const { result } = renderHook(() => useTodos());
    expect(result.current.filter).toBe('all');
  });

  it('activeCount と completedCount が 0', () => {
    const { result } = renderHook(() => useTodos());
    expect(result.current.activeCount).toBe(0);
    expect(result.current.completedCount).toBe(0);
  });

  it('localStorageにデータがあれば復元する', () => {
    const saved = [{ id: 'x', text: '復元', completed: false, priority: 'low', createdAt: '', order: 0 }];
    localStorage.setItem('todos', JSON.stringify(saved));
    const { result } = renderHook(() => useTodos());
    expect(result.current.todos).toHaveLength(1);
    expect(result.current.todos[0].text).toBe('復元');
  });
});

describe('addTodo', () => {
  it('テキスト・優先度・completed=false でtodoを追加する', () => {
    const { result } = renderHook(() => useTodos());
    act(() => { result.current.addTodo('買い物', 'high'); });
    const todo = result.current.todos[0];
    expect(todo.text).toBe('買い物');
    expect(todo.priority).toBe('high');
    expect(todo.completed).toBe(false);
  });

  it('uuidをidとして使う', () => {
    const { result } = renderHook(() => useTodos());
    act(() => { result.current.addTodo('タスク', 'medium'); });
    expect(result.current.todos[0].id).toBe('id-1');
  });

  it('orderが追加順に設定される（0, 1, 2...）', () => {
    const { result } = renderHook(() => useTodos());
    act(() => { result.current.addTodo('A', 'low'); });
    act(() => { result.current.addTodo('B', 'low'); });
    expect(result.current.todos[0].order).toBe(0);
    expect(result.current.todos[1].order).toBe(1);
  });

  it('dueDateなしのとき undefined', () => {
    const { result } = renderHook(() => useTodos());
    act(() => { result.current.addTodo('タスク', 'medium'); });
    expect(result.current.todos[0].dueDate).toBeUndefined();
  });

  it('dueDateありのとき値が保存される', () => {
    const { result } = renderHook(() => useTodos());
    act(() => { result.current.addTodo('タスク', 'medium', '2026-12-31'); });
    expect(result.current.todos[0].dueDate).toBe('2026-12-31');
  });

  it('追加後にlocalStorageに保存される', () => {
    const { result } = renderHook(() => useTodos());
    act(() => { result.current.addTodo('保存テスト', 'low'); });
    const saved = JSON.parse(localStorage.getItem('todos') ?? '[]');
    expect(saved).toHaveLength(1);
  });

  it('activeCount が増える', () => {
    const { result } = renderHook(() => useTodos());
    act(() => { result.current.addTodo('A', 'medium'); });
    expect(result.current.activeCount).toBe(1);
  });
});

describe('toggleTodo', () => {
  it('false → true に切り替わる', () => {
    const { result } = renderHook(() => useTodos());
    act(() => { result.current.addTodo('タスク', 'medium'); });
    const id = result.current.todos[0].id;
    act(() => { result.current.toggleTodo(id); });
    expect(result.current.todos[0].completed).toBe(true);
  });

  it('true → false に切り替わる', () => {
    const { result } = renderHook(() => useTodos());
    act(() => { result.current.addTodo('タスク', 'medium'); });
    const id = result.current.todos[0].id;
    act(() => { result.current.toggleTodo(id); });
    act(() => { result.current.toggleTodo(id); });
    expect(result.current.todos[0].completed).toBe(false);
  });

  it('他のtodoに影響しない', () => {
    const { result } = renderHook(() => useTodos());
    act(() => { result.current.addTodo('A', 'medium'); });
    act(() => { result.current.addTodo('B', 'medium'); });
    const id = result.current.todos[0].id;
    act(() => { result.current.toggleTodo(id); });
    expect(result.current.todos[1].completed).toBe(false);
  });

  it('activeCount と completedCount が正しく更新される', () => {
    const { result } = renderHook(() => useTodos());
    act(() => { result.current.addTodo('タスク', 'medium'); });
    const id = result.current.todos[0].id;
    act(() => { result.current.toggleTodo(id); });
    expect(result.current.activeCount).toBe(0);
    expect(result.current.completedCount).toBe(1);
  });
});

describe('updateTodo', () => {
  it('テキストを更新する', () => {
    const { result } = renderHook(() => useTodos());
    act(() => { result.current.addTodo('旧テキスト', 'medium'); });
    const id = result.current.todos[0].id;
    act(() => { result.current.updateTodo(id, '新テキスト'); });
    expect(result.current.todos[0].text).toBe('新テキスト');
  });

  it('他のフィールドは変化しない', () => {
    const { result } = renderHook(() => useTodos());
    act(() => { result.current.addTodo('タスク', 'high'); });
    const id = result.current.todos[0].id;
    act(() => { result.current.updateTodo(id, '更新後'); });
    expect(result.current.todos[0].priority).toBe('high');
    expect(result.current.todos[0].completed).toBe(false);
  });
});

describe('deleteTodo', () => {
  it('該当のtodoを削除する', () => {
    const { result } = renderHook(() => useTodos());
    act(() => { result.current.addTodo('消す', 'medium'); });
    const id = result.current.todos[0].id;
    act(() => { result.current.deleteTodo(id); });
    expect(result.current.todos).toHaveLength(0);
  });

  it('他のtodoは残る', () => {
    const { result } = renderHook(() => useTodos());
    act(() => { result.current.addTodo('A', 'medium'); });
    act(() => { result.current.addTodo('B', 'medium'); });
    const idA = result.current.todos[0].id;
    act(() => { result.current.deleteTodo(idA); });
    expect(result.current.todos[0].text).toBe('B');
  });
});

describe('clearCompleted', () => {
  it('完了済みをすべて削除する', () => {
    const { result } = renderHook(() => useTodos());
    act(() => { result.current.addTodo('A', 'medium'); });
    act(() => { result.current.addTodo('B', 'medium'); });
    act(() => { result.current.toggleTodo(result.current.todos[0].id); });
    act(() => { result.current.clearCompleted(); });
    expect(result.current.todos).toHaveLength(1);
    expect(result.current.todos[0].text).toBe('B');
  });

  it('完了済みがないとき何もしない', () => {
    const { result } = renderHook(() => useTodos());
    act(() => { result.current.addTodo('A', 'medium'); });
    act(() => { result.current.clearCompleted(); });
    expect(result.current.todos).toHaveLength(1);
  });
});

describe('filter', () => {
  it('"active" フィルターで未完了のみ表示', () => {
    const { result } = renderHook(() => useTodos());
    act(() => { result.current.addTodo('未完了', 'medium'); });
    act(() => { result.current.addTodo('完了', 'medium'); });
    act(() => { result.current.toggleTodo(result.current.todos[1].id); });
    act(() => { result.current.setFilter('active'); });
    expect(result.current.todos).toHaveLength(1);
    expect(result.current.todos[0].text).toBe('未完了');
  });

  it('"completed" フィルターで完了済みのみ表示', () => {
    const { result } = renderHook(() => useTodos());
    act(() => { result.current.addTodo('未完了', 'medium'); });
    act(() => { result.current.addTodo('完了', 'medium'); });
    act(() => { result.current.toggleTodo(result.current.todos[1].id); });
    act(() => { result.current.setFilter('completed'); });
    expect(result.current.todos).toHaveLength(1);
    expect(result.current.todos[0].text).toBe('完了');
  });

  it('"all" フィルターですべて表示', () => {
    const { result } = renderHook(() => useTodos());
    act(() => { result.current.addTodo('A', 'medium'); });
    act(() => { result.current.addTodo('B', 'medium'); });
    act(() => { result.current.toggleTodo(result.current.todos[0].id); });
    act(() => { result.current.setFilter('all'); });
    expect(result.current.todos).toHaveLength(2);
  });
});

describe('reorder', () => {
  it('指定したtodoを移動する', () => {
    const { result } = renderHook(() => useTodos());
    act(() => { result.current.addTodo('A', 'medium'); });
    act(() => { result.current.addTodo('B', 'medium'); });
    act(() => { result.current.addTodo('C', 'medium'); });
    const [idA, , idC] = result.current.todos.map(t => t.id);
    act(() => { result.current.reorder(idA, idC); });
    expect(result.current.todos[0].text).toBe('B');
    expect(result.current.todos[2].text).toBe('A');
  });

  it('orderフィールドがインデックスに更新される', () => {
    const { result } = renderHook(() => useTodos());
    act(() => { result.current.addTodo('A', 'medium'); });
    act(() => { result.current.addTodo('B', 'medium'); });
    const [idA, idB] = result.current.todos.map(t => t.id);
    act(() => { result.current.reorder(idA, idB); });
    expect(result.current.todos[0].order).toBe(0);
    expect(result.current.todos[1].order).toBe(1);
  });

  it('存在しないIDの場合は変化しない', () => {
    const { result } = renderHook(() => useTodos());
    act(() => { result.current.addTodo('A', 'medium'); });
    act(() => { result.current.reorder('no-id', result.current.todos[0].id); });
    expect(result.current.todos).toHaveLength(1);
  });
});
