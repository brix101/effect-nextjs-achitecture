// SSR data-fetching functions — the source of truth for page rendering.
// These are plain Effect programs that yield services from the runtime.

import { Effect } from "effect";
import { TodoService } from "@/app/server/features/todo/todo.service";
import type { Todo } from "@/app/server/features/todo/todo.schema";

export const getTodos = (userId: string): Effect.Effect<Todo[], never, TodoService> =>
  Effect.gen(function* () {
    const service = yield* TodoService;
    return yield* service.list(userId);
  });
