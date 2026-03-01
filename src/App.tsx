import { useTodos } from './hooks/useTodos';
import { Header } from './components/Header';
import { TodoInput } from './components/TodoInput';
import { FilterBar } from './components/FilterBar';
import { TodoList } from './components/TodoList';

export default function App() {
  const {
    todos,
    filter,
    setFilter,
    activeCount,
    completedCount,
    addTodo,
    toggleTodo,
    updateTodo,
    deleteTodo,
    clearCompleted,
    reorder,
  } = useTodos();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-xl mx-auto">
        <Header activeCount={activeCount} completedCount={completedCount} />
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <TodoInput onAdd={addTodo} />
          <FilterBar
            filter={filter}
            setFilter={setFilter}
            completedCount={completedCount}
            onClearCompleted={clearCompleted}
          />
          <TodoList
            todos={todos}
            onToggle={toggleTodo}
            onUpdate={updateTodo}
            onDelete={deleteTodo}
            onReorder={reorder}
          />
        </div>
      </div>
    </div>
  );
}
