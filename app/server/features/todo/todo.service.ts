import { Context, Effect, Layer } from "effect";
import { TodoRepository } from "./todo.repository";
import { NotFoundError } from "@/app/lib/errors";
import type { Todo } from "./todo.schema";

export class TodoService extends Context.Service<
  TodoService,
  {
    readonly list: (userId: string) => Effect.Effect<Todo[]>;
    readonly create: (args: { title: string; userId: string }) => Effect.Effect<Todo>;
    readonly toggle: (id: string) => Effect.Effect<Todo, NotFoundError>;
    readonly remove: (id: string) => Effect.Effect<void, NotFoundError>;
  }
>()("TodoService") {}

export const TodoServiceLive = Layer.effect(
  TodoService,
  Effect.gen(function* () {
    const repo = yield* TodoRepository;

    return {
      list: (userId: string) => repo.findAllByUserId(userId),

      create: ({ title, userId }: { title: string; userId: string }) => {
        const todo: Todo = {
          id: crypto.randomUUID(),
          title,
          completed: false,
          userId,
          createdAt: new Date(),
        };
        return repo.create(todo);
      },

      toggle: (id: string) =>
        repo.findById(id).pipe(
          Effect.flatMap((todo) =>
            repo.update(id, { completed: !todo.completed })
          )
        ),

      remove: (id: string) => repo.remove(id),
    };
  })
);
