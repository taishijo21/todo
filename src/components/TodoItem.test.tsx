import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Todo } from '../types/todo';
import { TodoItem } from './TodoItem';

vi.mock('@dnd-kit/sortable', () => ({
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

const makeTodo = (overrides: Partial<Todo> = {}): Todo => ({
  id: 'todo-1',
  text: 'テストタスク',
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
};

describe('TodoItem 表示', () => {
  it('タスクのテキストが表示される', () => {
    render(<TodoItem todo={makeTodo()} {...defaultProps} />);
    expect(screen.getByText('テストタスク')).toBeInTheDocument();
  });

  it('未完了のときチェックボックスが未チェック', () => {
    render(<TodoItem todo={makeTodo({ completed: false })} {...defaultProps} />);
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it('完了のときチェックボックスがチェック済み', () => {
    render(<TodoItem todo={makeTodo({ completed: true })} {...defaultProps} />);
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('完了のとき取り消し線スタイルが適用される', () => {
    render(<TodoItem todo={makeTodo({ completed: true })} {...defaultProps} />);
    expect(screen.getByText('テストタスク')).toHaveClass('line-through');
  });

  it('未完了のとき取り消し線スタイルがない', () => {
    render(<TodoItem todo={makeTodo({ completed: false })} {...defaultProps} />);
    expect(screen.getByText('テストタスク')).not.toHaveClass('line-through');
  });

  it('優先度バッジ"高"を表示する', () => {
    render(<TodoItem todo={makeTodo({ priority: 'high' })} {...defaultProps} />);
    expect(screen.getByText('高')).toBeInTheDocument();
  });

  it('優先度バッジ"中"を表示する', () => {
    render(<TodoItem todo={makeTodo({ priority: 'medium' })} {...defaultProps} />);
    expect(screen.getByText('中')).toBeInTheDocument();
  });

  it('優先度バッジ"低"を表示する', () => {
    render(<TodoItem todo={makeTodo({ priority: 'low' })} {...defaultProps} />);
    expect(screen.getByText('低')).toBeInTheDocument();
  });
});

describe('TodoItem 期限表示', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-15'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('期限が未来の場合 "期限:" を表示する', () => {
    render(<TodoItem todo={makeTodo({ dueDate: '2026-06-01' })} {...defaultProps} />);
    expect(screen.getByText(/期限: 2026-06-01/)).toBeInTheDocument();
  });

  it('期限切れ（過去）の場合 "⚠ 期限切れ" を表示する', () => {
    render(<TodoItem todo={makeTodo({ dueDate: '2026-01-01' })} {...defaultProps} />);
    expect(screen.getByText(/⚠ 期限切れ/)).toBeInTheDocument();
  });

  it('完了済みなら期限切れでも警告を表示しない', () => {
    render(<TodoItem todo={makeTodo({ dueDate: '2026-01-01', completed: true })} {...defaultProps} />);
    expect(screen.queryByText(/⚠ 期限切れ/)).not.toBeInTheDocument();
  });

  it('dueDateなしのとき期限表示がない', () => {
    render(<TodoItem todo={makeTodo()} {...defaultProps} />);
    expect(screen.queryByText(/期限/)).not.toBeInTheDocument();
  });
});

describe('TodoItem 操作', () => {
  it('チェックボックスをクリックで onToggle が呼ばれる', async () => {
    const onToggle = vi.fn();
    render(<TodoItem todo={makeTodo({ id: 'todo-1' })} {...defaultProps} onToggle={onToggle} />);
    await userEvent.click(screen.getByRole('checkbox'));
    expect(onToggle).toHaveBeenCalledWith('todo-1');
  });

  it('削除ボタンをクリックで onDelete が呼ばれる', async () => {
    const onDelete = vi.fn();
    render(<TodoItem todo={makeTodo({ id: 'todo-1' })} {...defaultProps} onDelete={onDelete} />);
    const buttons = screen.getAllByRole('button');
    await userEvent.click(buttons[buttons.length - 1]); // 最後がゴミ箱ボタン
    expect(onDelete).toHaveBeenCalledWith('todo-1');
  });
});

describe('TodoItem インライン編集', () => {
  it('テキストをダブルクリックで編集モードになる', async () => {
    render(<TodoItem todo={makeTodo()} {...defaultProps} />);
    await userEvent.dblClick(screen.getByText('テストタスク'));
    expect(screen.getByDisplayValue('テストタスク')).toBeInTheDocument();
  });

  it('完了済みタスクはダブルクリックしても編集モードにならない', async () => {
    render(<TodoItem todo={makeTodo({ completed: true })} {...defaultProps} />);
    await userEvent.dblClick(screen.getByText('テストタスク'));
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('編集中に Enter で onUpdate が呼ばれる', async () => {
    const onUpdate = vi.fn();
    render(<TodoItem todo={makeTodo()} {...defaultProps} onUpdate={onUpdate} />);
    await userEvent.dblClick(screen.getByText('テストタスク'));
    const input = screen.getByDisplayValue('テストタスク');
    await userEvent.clear(input);
    await userEvent.type(input, '更新後{Enter}');
    expect(onUpdate).toHaveBeenCalledWith('todo-1', '更新後');
  });

  it('編集中に Escape で onUpdate が呼ばれずテキストが戻る', async () => {
    const onUpdate = vi.fn();
    render(<TodoItem todo={makeTodo()} {...defaultProps} onUpdate={onUpdate} />);
    await userEvent.dblClick(screen.getByText('テストタスク'));
    const input = screen.getByDisplayValue('テストタスク');
    await userEvent.clear(input);
    await userEvent.type(input, '変更中{Escape}');
    expect(onUpdate).not.toHaveBeenCalled();
    expect(screen.getByText('テストタスク')).toBeInTheDocument();
  });

  it('テキストが変わっていない場合 onUpdate が呼ばれない', async () => {
    const onUpdate = vi.fn();
    render(<TodoItem todo={makeTodo()} {...defaultProps} onUpdate={onUpdate} />);
    await userEvent.dblClick(screen.getByText('テストタスク'));
    await userEvent.keyboard('{Enter}');
    expect(onUpdate).not.toHaveBeenCalled();
  });
});
