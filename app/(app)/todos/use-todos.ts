"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchTodos } from "./queries";
import { createTodo, toggleTodo, deleteTodo } from "./actions";
import { unwrapResponse } from "@/app/lib/api-response";

const TODOS_KEY = ["todos"] as const;

export function useTodos() {
  return useQuery({
    queryKey: TODOS_KEY,
    queryFn: () => fetchTodos(),
  });
}

export function useCreateTodo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (title: string) => createTodo({ title }).then(unwrapResponse),
    onSuccess: () => qc.invalidateQueries({ queryKey: TODOS_KEY }),
  });
}

export function useToggleTodo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => toggleTodo({ id }).then(unwrapResponse),
    onSuccess: () => qc.invalidateQueries({ queryKey: TODOS_KEY }),
  });
}

export function useDeleteTodo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTodo({ id }).then(unwrapResponse),
    onSuccess: () => qc.invalidateQueries({ queryKey: TODOS_KEY }),
  });
}
