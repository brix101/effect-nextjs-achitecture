"use server";

import { action } from "@/app/lib/actions";
import { TodoService } from "@/app/server/features/todo/todo.service";
import { Effect } from "effect";
import { CreateTodoInput, ToggleTodoInput, DeleteTodoInput } from "./schemas";
import type { ApiResponse } from "@/app/lib/api-response";
import type { Todo } from "@/app/server/features/todo/todo.schema";

const _createTodo = action
  .schema(CreateTodoInput)
  .protectedEffect(({ input, userId }) =>
    Effect.gen(function* () {
      const service = yield* TodoService;
      return yield* service.create({ title: input.title, userId });
    })
  );

const _toggleTodo = action
  .schema(ToggleTodoInput)
  .protectedEffect(({ input }) =>
    Effect.gen(function* () {
      const service = yield* TodoService;
      return yield* service.toggle(input.id);
    })
  );

const _deleteTodo = action
  .schema(DeleteTodoInput)
  .protectedEffect(({ input }) =>
    Effect.gen(function* () {
      const service = yield* TodoService;
      return yield* service.remove(input.id);
    })
  );

// Next.js requires server actions to be directly declared async functions
export async function createTodo(input: typeof CreateTodoInput.Type): Promise<ApiResponse<Todo>> {
  return _createTodo(input);
}

export async function toggleTodo(input: typeof ToggleTodoInput.Type): Promise<ApiResponse<Todo>> {
  return _toggleTodo(input);
}

export async function deleteTodo(input: typeof DeleteTodoInput.Type): Promise<ApiResponse<void>> {
  return _deleteTodo(input);
}
