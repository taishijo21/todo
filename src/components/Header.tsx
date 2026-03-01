import { ListTodo } from 'lucide-react';

interface HeaderProps {
  activeCount: number;
  completedCount: number;
}

export function Header({ activeCount, completedCount }: HeaderProps) {
  const total = activeCount + completedCount;
  return (
    <header className="mb-8 text-center">
      <div className="flex items-center justify-center gap-3 mb-3">
        <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-200">
          <ListTodo className="w-6 h-6 text-white" strokeWidth={2} />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Todo
        </h1>
      </div>
      <p className="text-gray-400 text-sm tracking-wide">
        {activeCount} 件残り · {completedCount} 件完了 · 合計 {total} 件
      </p>
    </header>
  );
}
