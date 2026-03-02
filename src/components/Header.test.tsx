import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Header } from './Header';

describe('Header', () => {
  it('"Todo" の見出しを表示する', () => {
    render(<Header activeCount={0} completedCount={0} />);
    expect(screen.getByRole('heading', { name: 'Todo' })).toBeInTheDocument();
  });

  it('activeCount を表示する', () => {
    render(<Header activeCount={3} completedCount={0} />);
    expect(screen.getByText(/3 件残り/)).toBeInTheDocument();
  });

  it('completedCount を表示する', () => {
    render(<Header activeCount={0} completedCount={2} />);
    expect(screen.getByText(/2 件完了/)).toBeInTheDocument();
  });

  it('合計件数を計算して表示する', () => {
    render(<Header activeCount={3} completedCount={2} />);
    expect(screen.getByText(/合計 5 件/)).toBeInTheDocument();
  });

  it('すべて0のとき "0 件残り · 0 件完了 · 合計 0 件" を表示する', () => {
    render(<Header activeCount={0} completedCount={0} />);
    expect(screen.getByText('0 件残り · 0 件完了 · 合計 0 件')).toBeInTheDocument();
  });
});
