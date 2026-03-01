import { CheckSquare } from 'lucide-react';

interface HeaderProps {
  activeCount: number;
  completedCount: number;
}

export function Header({ activeCount, completedCount }: HeaderProps) {
  const total = activeCount + completedCount;
  return (
    <header className="mb-8 text-center">
      <div className="flex items-center justify-center gap-3 mb-2">
        <CheckSquare className="w-8 h-8 text-indigo-500" />
        <h1 className="text-4xl font-bold text-gray-800">Todo</h1>
      </div>
      <p className="text-gray-500 text-sm">
        {activeCount} 件残り · {completedCount} 件完了 · 合計 {total} 件
      </p>
    </header>
  );
}
