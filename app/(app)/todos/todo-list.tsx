"use client";

import { useState } from "react";
import { useTodos, useCreateTodo, useToggleTodo, useDeleteTodo } from "./use-todos";

export function TodoList() {
  const [title, setTitle] = useState("");
  const { data: todos, isLoading } = useTodos();
  const create = useCreateTodo();
  const toggle = useToggleTodo();
  const remove = useDeleteTodo();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    create.mutate(title.trim(), { onSuccess: () => setTitle("") });
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={create.isPending || !title.trim()}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Add
        </button>
      </form>

      {isLoading ? (
        <p className="text-gray-500 text-sm">Loading...</p>
      ) : !todos?.length ? (
        <p className="text-gray-500 text-sm">No todos yet. Add one above!</p>
      ) : (
        <ul className="space-y-2">
          {todos.map((todo) => (
            <li
              key={todo.id}
              className="flex items-center gap-3 rounded-md border border-gray-200 px-3 py-2"
            >
              <button
                onClick={() => toggle.mutate(todo.id)}
                className={`h-5 w-5 rounded border flex items-center justify-center text-xs ${
                  todo.completed
                    ? "bg-green-100 border-green-400 text-green-600"
                    : "border-gray-300 hover:border-blue-400"
                }`}
              >
                {todo.completed && "✓"}
              </button>
              <span
                className={`flex-1 text-sm ${
                  todo.completed ? "line-through text-gray-400" : "text-gray-800"
                }`}
              >
                {todo.title}
              </span>
              <button
                onClick={() => remove.mutate(todo.id)}
                className="text-xs text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
