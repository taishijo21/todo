import type { Filter } from '../types/todo';

interface FilterBarProps {
  filter: Filter;
  setFilter: (f: Filter) => void;
  completedCount: number;
  onClearCompleted: () => void;
}

const TABS: { label: string; value: Filter }[] = [
  { label: 'すべて', value: 'all' },
  { label: '未完了', value: 'active' },
  { label: '完了済み', value: 'completed' },
];

export function FilterBar({ filter, setFilter, completedCount, onClearCompleted }: FilterBarProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
        {TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              filter === tab.value
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {completedCount > 0 && (
        <button
          onClick={onClearCompleted}
          className="text-sm text-gray-400 hover:text-red-500 transition-colors"
        >
          完了済みを削除 ({completedCount})
        </button>
      )}
    </div>
  );
}
