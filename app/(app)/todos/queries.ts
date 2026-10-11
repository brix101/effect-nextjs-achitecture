"use server";

// Server-side query wrappers for React Query.
// These run on the server and return plain data (no Effect leaks to client).

import { runtime } from "@/app/server/runtime";
import { getUserId } from "@/app/lib/auth";
import { Effect } from "effect";
import { getTodos } from "./server";
import type { Todo } from "@/app/server/features/todo/todo.schema";

export async function fetchTodos(): Promise<Todo[]> {
  return runtime.runPromise(
    getUserId().pipe(Effect.flatMap((userId) => getTodos(userId)))
  );
}
