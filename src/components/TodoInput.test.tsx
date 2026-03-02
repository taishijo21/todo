import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodoInput } from './TodoInput';

function getDateInput(container: HTMLElement) {
  return container.querySelector('input[type="date"]') as HTMLInputElement;
}

describe('TodoInput 表示', () => {
  it('テキスト入力欄が表示される', () => {
    render(<TodoInput onAdd={vi.fn()} />);
    expect(screen.getByPlaceholderText('タスクを入力...')).toBeInTheDocument();
  });

  it('優先度ボタンが3つ表示される', () => {
    render(<TodoInput onAdd={vi.fn()} />);
    expect(screen.getByText('高')).toBeInTheDocument();
    expect(screen.getByText('中')).toBeInTheDocument();
    expect(screen.getByText('低')).toBeInTheDocument();
  });

  it('日付入力欄が表示される', () => {
    const { container } = render(<TodoInput onAdd={vi.fn()} />);
    expect(getDateInput(container)).toBeInTheDocument();
  });
});

describe('TodoInput 追加操作', () => {
  it('テキスト入力後「追加」クリックで onAdd が呼ばれる', async () => {
    const onAdd = vi.fn();
    render(<TodoInput onAdd={onAdd} />);
    await userEvent.type(screen.getByPlaceholderText('タスクを入力...'), '買い物');
    await userEvent.click(screen.getByText('追加'));
    expect(onAdd).toHaveBeenCalledWith('買い物', 'medium', undefined);
  });

  it('デフォルトの優先度は "medium"', async () => {
    const onAdd = vi.fn();
    render(<TodoInput onAdd={onAdd} />);
    await userEvent.type(screen.getByPlaceholderText('タスクを入力...'), 'タスク');
    await userEvent.click(screen.getByText('追加'));
    expect(onAdd).toHaveBeenCalledWith('タスク', 'medium', undefined);
  });

  it('Enterキーで onAdd が呼ばれる', async () => {
    const onAdd = vi.fn();
    render(<TodoInput onAdd={onAdd} />);
    await userEvent.type(screen.getByPlaceholderText('タスクを入力...'), 'タスク{Enter}');
    expect(onAdd).toHaveBeenCalledOnce();
  });

  it('空白のみのテキストでは onAdd が呼ばれない', async () => {
    const onAdd = vi.fn();
    render(<TodoInput onAdd={onAdd} />);
    await userEvent.type(screen.getByPlaceholderText('タスクを入力...'), '   {Enter}');
    expect(onAdd).not.toHaveBeenCalled();
  });

  it('追加後にテキスト入力欄がクリアされる', async () => {
    render(<TodoInput onAdd={vi.fn()} />);
    const input = screen.getByPlaceholderText('タスクを入力...');
    await userEvent.type(input, 'タスク');
    await userEvent.click(screen.getByText('追加'));
    expect(input).toHaveValue('');
  });
});

describe('TodoInput 優先度選択', () => {
  it('"高" を選択して追加すると priority="high" で呼ばれる', async () => {
    const onAdd = vi.fn();
    render(<TodoInput onAdd={onAdd} />);
    await userEvent.click(screen.getByText('高'));
    await userEvent.type(screen.getByPlaceholderText('タスクを入力...'), 'タスク');
    await userEvent.click(screen.getByText('追加'));
    expect(onAdd).toHaveBeenCalledWith('タスク', 'high', undefined);
  });

  it('"低" を選択して追加すると priority="low" で呼ばれる', async () => {
    const onAdd = vi.fn();
    render(<TodoInput onAdd={onAdd} />);
    await userEvent.click(screen.getByText('低'));
    await userEvent.type(screen.getByPlaceholderText('タスクを入力...'), 'タスク');
    await userEvent.click(screen.getByText('追加'));
    expect(onAdd).toHaveBeenCalledWith('タスク', 'low', undefined);
  });
});

describe('TodoInput 期限', () => {
  it('日付を設定して追加すると dueDate が渡される', async () => {
    const onAdd = vi.fn();
    const { container } = render(<TodoInput onAdd={onAdd} />);
    await userEvent.type(screen.getByPlaceholderText('タスクを入力...'), 'タスク');
    await userEvent.type(getDateInput(container), '2026-12-31');
    await userEvent.click(screen.getByText('追加'));
    expect(onAdd).toHaveBeenCalledWith('タスク', 'medium', '2026-12-31');
  });
});

describe('TodoInput テキストのトリム', () => {
  it('前後の空白をトリムして onAdd を呼ぶ', async () => {
    const onAdd = vi.fn();
    render(<TodoInput onAdd={onAdd} />);
    await userEvent.type(screen.getByPlaceholderText('タスクを入力...'), '  タスク  ');
    await userEvent.click(screen.getByText('追加'));
    expect(onAdd).toHaveBeenCalledWith('タスク', 'medium', undefined);
  });
});

describe('TodoInput 空入力', () => {
  it('空欄のまま Enter キーを押しても onAdd が呼ばれない', async () => {
    const onAdd = vi.fn();
    render(<TodoInput onAdd={onAdd} />);
    await userEvent.type(screen.getByPlaceholderText('タスクを入力...'), '{Enter}');
    expect(onAdd).not.toHaveBeenCalled();
  });

  it('空欄のまま「追加」クリックしても onAdd が呼ばれない', async () => {
    const onAdd = vi.fn();
    render(<TodoInput onAdd={onAdd} />);
    await userEvent.click(screen.getByText('追加'));
    expect(onAdd).not.toHaveBeenCalled();
  });
});

describe('TodoInput フォームリセット', () => {
  it('追加後に優先度が "medium" にリセットされる', async () => {
    const onAdd = vi.fn();
    render(<TodoInput onAdd={onAdd} />);
    await userEvent.click(screen.getByText('高'));
    await userEvent.type(screen.getByPlaceholderText('タスクを入力...'), 'タスク');
    await userEvent.click(screen.getByText('追加'));
    await userEvent.type(screen.getByPlaceholderText('タスクを入力...'), '次のタスク');
    await userEvent.click(screen.getByText('追加'));
    expect(onAdd).toHaveBeenLastCalledWith('次のタスク', 'medium', undefined);
  });
});
