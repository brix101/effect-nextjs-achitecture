import { Context, Effect, Layer, Ref } from "effect";
import { Database } from "@/app/server/shared/infrastructure/database";
import { NotFoundError } from "@/app/lib/errors";
import type { Todo } from "./todo.schema";

export class TodoRepository extends Context.Service<
  TodoRepository,
  {
    readonly findAllByUserId: (userId: string) => Effect.Effect<Todo[]>;
    readonly findById: (id: string) => Effect.Effect<Todo, NotFoundError>;
    readonly create: (todo: Todo) => Effect.Effect<Todo>;
    readonly update: (id: string, data: Partial<Todo>) => Effect.Effect<Todo, NotFoundError>;
    readonly remove: (id: string) => Effect.Effect<void, NotFoundError>;
  }
>()("TodoRepository") {}

export const TodoRepositoryLive = Layer.effect(
  TodoRepository,
  Effect.gen(function* () {
    const db = yield* Database;

    return {
      findAllByUserId: (userId: string) =>
        Ref.get(db.todos).pipe(
          Effect.map((map) =>
            Array.from(map.values())
              .filter((t) => t.userId === userId)
              .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          )
        ),

      findById: (id: string) =>
        Ref.get(db.todos).pipe(
          Effect.flatMap((map) => {
            const todo = map.get(id);
            return todo
              ? Effect.succeed(todo)
              : Effect.fail(new NotFoundError({ message: `Todo ${id} not found` }));
          })
        ),

      create: (todo: Todo) =>
        Ref.update(db.todos, (map) => new Map(map).set(todo.id, todo)).pipe(
          Effect.map(() => todo)
        ),

      update: (id: string, data: Partial<Todo>) =>
        Ref.get(db.todos).pipe(
          Effect.flatMap((map) => {
            const existing = map.get(id);
            if (!existing)
              return Effect.fail(new NotFoundError({ message: `Todo ${id} not found` }));
            const updated = { ...existing, ...data };
            return Ref.update(db.todos, (m) => new Map(m).set(id, updated)).pipe(
              Effect.map(() => updated)
            );
          })
        ),

      remove: (id: string) =>
        Ref.get(db.todos).pipe(
          Effect.flatMap((map) => {
            if (!map.has(id))
              return Effect.fail(new NotFoundError({ message: `Todo ${id} not found` }));
            return Ref.update(db.todos, (m) => {
              const next = new Map(m);
              next.delete(id);
              return next;
            });
          })
        ),
    };
  })
);
