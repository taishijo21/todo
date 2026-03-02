import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterBar } from './FilterBar';

const defaultProps = {
  filter: 'all' as const,
  setFilter: vi.fn(),
  completedCount: 0,
  onClearCompleted: vi.fn(),
};

describe('FilterBar タブ', () => {
  it('3つのタブが表示される', () => {
    render(<FilterBar {...defaultProps} />);
    expect(screen.getByText('すべて')).toBeInTheDocument();
    expect(screen.getByText('未完了')).toBeInTheDocument();
    expect(screen.getByText('完了済み')).toBeInTheDocument();
  });

  it('"すべて" クリックで setFilter("all") が呼ばれる', async () => {
    const setFilter = vi.fn();
    render(<FilterBar {...defaultProps} setFilter={setFilter} filter="active" />);
    await userEvent.click(screen.getByText('すべて'));
    expect(setFilter).toHaveBeenCalledWith('all');
  });

  it('"未完了" クリックで setFilter("active") が呼ばれる', async () => {
    const setFilter = vi.fn();
    render(<FilterBar {...defaultProps} setFilter={setFilter} />);
    await userEvent.click(screen.getByText('未完了'));
    expect(setFilter).toHaveBeenCalledWith('active');
  });

  it('"完了済み" クリックで setFilter("completed") が呼ばれる', async () => {
    const setFilter = vi.fn();
    render(<FilterBar {...defaultProps} setFilter={setFilter} />);
    await userEvent.click(screen.getByText('完了済み'));
    expect(setFilter).toHaveBeenCalledWith('completed');
  });
});

describe('完了済みを削除ボタン', () => {
  it('completedCount が 0 のとき非表示', () => {
    render(<FilterBar {...defaultProps} completedCount={0} />);
    expect(screen.queryByText(/完了済みを削除/)).not.toBeInTheDocument();
  });

  it('completedCount > 0 のとき表示される', () => {
    render(<FilterBar {...defaultProps} completedCount={2} />);
    expect(screen.getByText('完了済みを削除 (2)')).toBeInTheDocument();
  });

  it('クリックで onClearCompleted が呼ばれる', async () => {
    const onClearCompleted = vi.fn();
    render(<FilterBar {...defaultProps} completedCount={1} onClearCompleted={onClearCompleted} />);
    await userEvent.click(screen.getByText('完了済みを削除 (1)'));
    expect(onClearCompleted).toHaveBeenCalledOnce();
  });
});
