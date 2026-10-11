"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchTodos } from "./queries";
import { createTodo, toggleTodo, deleteTodo } from "./actions";
import { unwrapResponse } from "@/app/lib/api-response";
import type { Todo } from "@/app/server/features/todo/todo.schema";

const TODOS_KEY = ["todos"] as const;

// Client-side view of a todo: `pending` marks an optimistic entry that
// hasn't been confirmed by the server yet.
export type TodoItem = Todo & { pending?: boolean };

export function useTodos() {
  return useQuery<TodoItem[]>({
    queryKey: TODOS_KEY,
    queryFn: () => fetchTodos(),
  });
}

export function useCreateTodo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (title: string) => createTodo({ title }).then(unwrapResponse),
    onMutate: async (title) => {
      await qc.cancelQueries({ queryKey: TODOS_KEY });
      const previous = qc.getQueryData<TodoItem[]>(TODOS_KEY);

      const optimisticId = `optimistic-${crypto.randomUUID()}`;
      const optimisticTodo: TodoItem = {
        id: optimisticId,
        title,
        completed: false,
        userId: "",
        createdAt: new Date(),
        pending: true,
      };
      qc.setQueryData<TodoItem[]>(TODOS_KEY, (old = []) => [
        ...old,
        optimisticTodo,
      ]);

      return { previous, optimisticId };
    },
    onSuccess: (created, _title, context) => {
      // Swap the optimistic placeholder for the real server todo.
      qc.setQueryData<TodoItem[]>(TODOS_KEY, (old = []) =>
        old.map((todo) => (todo.id === context.optimisticId ? created : todo))
      );
    },
    onError: (_err, _title, context) => {
      qc.setQueryData(TODOS_KEY, context?.previous);
    },
  });
}

export function useToggleTodo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => toggleTodo({ id }).then(unwrapResponse),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: TODOS_KEY });
      const previous = qc.getQueryData<TodoItem[]>(TODOS_KEY);

      qc.setQueryData<TodoItem[]>(TODOS_KEY, (old = []) =>
        old.map((todo) =>
          todo.id === id
            ? { ...todo, completed: !todo.completed, pending: true }
            : todo
        )
      );

      return { previous };
    },
    onSuccess: (updated) => {
      // Replace the optimistic entry with the server's version.
      qc.setQueryData<TodoItem[]>(TODOS_KEY, (old = []) =>
        old.map((todo) => (todo.id === updated.id ? updated : todo))
      );
    },
    onError: (_err, _id, context) => {
      qc.setQueryData(TODOS_KEY, context?.previous);
    },
  });
}

export function useDeleteTodo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTodo({ id }).then(unwrapResponse),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: TODOS_KEY });
      const previous = qc.getQueryData<TodoItem[]>(TODOS_KEY);

      // The row is already removed optimistically; nothing to reconcile on
      // success since the server returns no data.
      qc.setQueryData<TodoItem[]>(TODOS_KEY, (old = []) =>
        old.filter((todo) => todo.id !== id)
      );

      return { previous };
    },
    onError: (err, _id, context) => {
      alert(err.message);
      qc.setQueryData(TODOS_KEY, context?.previous);
    },
  });
}
