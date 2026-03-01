import { useState } from 'react';
import type { KeyboardEvent } from 'react';
import { Plus } from 'lucide-react';
import type { Priority } from '../types/todo';

interface TodoInputProps {
  onAdd: (text: string, priority: Priority, dueDate?: string) => void;
}

const PRIORITY_COLORS: Record<Priority, string> = {
  high: 'text-red-600 bg-red-50 border-red-200',
  medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  low: 'text-green-600 bg-green-50 border-green-200',
};

export function TodoInput({ onAdd }: TodoInputProps) {
  const [text, setText] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');

  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onAdd(trimmed, priority, dueDate || undefined);
    setText('');
    setDueDate('');
    setPriority('medium');
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') submit();
  };

  return (
    <div className="mb-6 space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="タスクを入力..."
          className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-700 placeholder-gray-400"
        />
        <button
          onClick={submit}
          className="px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          追加
        </button>
      </div>
      <div className="flex gap-2 items-center">
        <span className="text-xs text-gray-400 font-medium">優先度:</span>
        {(['high', 'medium', 'low'] as Priority[]).map(p => (
          <button
            key={p}
            onClick={() => setPriority(p)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
              priority === p
                ? PRIORITY_COLORS[p] + ' ring-2 ring-offset-1 ring-current'
                : 'text-gray-400 bg-gray-50 border-gray-200 hover:bg-gray-100'
            }`}
          >
            {{ high: '高', medium: '中', low: '低' }[p]}
          </button>
        ))}
        <span className="text-xs text-gray-400 font-medium ml-2">期限:</span>
        <input
          type="date"
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
          className="text-xs px-2 py-1 rounded border border-gray-200 text-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-400"
        />
      </div>
    </div>
  );
}
