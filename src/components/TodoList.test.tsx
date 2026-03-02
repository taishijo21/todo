import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Todo } from '../types/todo';
import { TodoList } from './TodoList';

vi.mock('@dnd-kit/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@dnd-kit/core')>();
  return {
    ...actual,
    DndContext: ({ children, onDragEnd }: { children: React.ReactNode; onDragEnd: (e: unknown) => void }) => (
      <div data-testid="dnd-context" data-ondragend={String(onDragEnd)}>{children}</div>
    ),
  };
});

vi.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  verticalListSortingStrategy: {},
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
}));

vi.mock('@dnd-kit/utilities', () => ({
  CSS: { Transform: { toString: () => '' } },
}));

const makeTodo = (id: string, text: string, overrides: Partial<Todo> = {}): Todo => ({
  id,
  text,
  completed: false,
  priority: 'medium',
  createdAt: '2026-01-01T00:00:00.000Z',
  order: 0,
  ...overrides,
});

const defaultProps = {
  onToggle: vi.fn(),
  onUpdate: vi.fn(),
  onDelete: vi.fn(),
  onReorder: vi.fn(),
};

describe('TodoList 空状態', () => {
  it('todosが空のとき "タスクがありません" を表示する', () => {
    render(<TodoList todos={[]} {...defaultProps} />);
    expect(screen.getByText('タスクがありません')).toBeInTheDocument();
  });

  it('todosが空のとき補助テキストを表示する', () => {
    render(<TodoList todos={[]} {...defaultProps} />);
    expect(screen.getByText('上のフォームから追加してください')).toBeInTheDocument();
  });
});

describe('TodoList アイテム表示', () => {
  it('todos の数だけアイテムが表示される', () => {
    const todos = [makeTodo('1', 'タスクA'), makeTodo('2', 'タスクB')];
    render(<TodoList todos={todos} {...defaultProps} />);
    expect(screen.getByText('タスクA')).toBeInTheDocument();
    expect(screen.getByText('タスクB')).toBeInTheDocument();
  });

  it('チェックボックスをクリックで onToggle が呼ばれる', async () => {
    const onToggle = vi.fn();
    const todos = [makeTodo('id-1', 'タスク')];
    render(<TodoList todos={todos} {...defaultProps} onToggle={onToggle} />);
    await userEvent.click(screen.getByRole('checkbox'));
    expect(onToggle).toHaveBeenCalledWith('id-1');
  });
});
