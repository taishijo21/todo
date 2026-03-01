import { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash2, GripVertical } from 'lucide-react';
import type { Todo } from '../types/todo';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onUpdate: (id: string, text: string) => void;
  onDelete: (id: string) => void;
}

const PRIORITY_DOT: Record<string, string> = {
  high: 'bg-red-500',
  medium: 'bg-yellow-400',
  low: 'bg-green-500',
};

const PRIORITY_BADGE: Record<string, string> = {
  high: 'text-red-600 bg-red-50',
  medium: 'text-yellow-600 bg-yellow-50',
  low: 'text-green-600 bg-green-50',
};

const PRIORITY_LABEL: Record<string, string> = {
  high: '高',
  medium: '中',
  low: '低',
};

export function TodoItem({ todo, onToggle, onUpdate, onDelete }: TodoItemProps) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const inputRef = useRef<HTMLInputElement>(null);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: todo.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const commitEdit = () => {
    const trimmed = editText.trim();
    if (trimmed && trimmed !== todo.text) onUpdate(todo.id, trimmed);
    else setEditText(todo.text);
    setEditing(false);
  };

  const isOverdue = todo.dueDate && !todo.completed && new Date(todo.dueDate) < new Date();

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 px-4 py-3 bg-white rounded-xl border transition-shadow ${
        isDragging ? 'shadow-lg border-indigo-300' : 'border-gray-100 hover:border-gray-200 hover:shadow-sm'
      }`}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing touch-none"
        tabIndex={-1}
      >
        <GripVertical className="w-4 h-4" />
      </button>

      {/* Checkbox */}
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        className="w-4 h-4 rounded accent-indigo-500 cursor-pointer flex-shrink-0"
      />

      {/* Priority dot */}
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${PRIORITY_DOT[todo.priority]}`} />

      {/* Text / edit field */}
      <div className="flex-1 min-w-0">
        {editing ? (
          <input
            ref={inputRef}
            value={editText}
            onChange={e => setEditText(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={e => {
              if (e.key === 'Enter') commitEdit();
              if (e.key === 'Escape') { setEditText(todo.text); setEditing(false); }
            }}
            className="w-full text-sm text-gray-700 border-b border-indigo-400 focus:outline-none bg-transparent"
          />
        ) : (
          <span
            onDoubleClick={() => !todo.completed && setEditing(true)}
            className={`text-sm block truncate cursor-text select-none ${
              todo.completed ? 'line-through text-gray-400' : 'text-gray-700'
            }`}
            title={todo.completed ? undefined : 'ダブルクリックで編集'}
          >
            {todo.text}
          </span>
        )}
        {todo.dueDate && (
          <span className={`text-xs ${isOverdue ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
            {isOverdue ? '⚠ 期限切れ ' : '期限: '}{todo.dueDate}
          </span>
        )}
      </div>

      {/* Priority badge */}
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${PRIORITY_BADGE[todo.priority]}`}>
        {PRIORITY_LABEL[todo.priority]}
      </span>

      {/* Delete */}
      <button
        onClick={() => onDelete(todo.id)}
        className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
