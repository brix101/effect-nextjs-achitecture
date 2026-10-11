import { Context, Effect, Layer, Ref } from "effect";
import type { Todo } from "@/app/server/features/todo/todo.schema";
import type { Project } from "@/app/server/features/project/project.schema";

// ─── In-memory database simulating a real DB ────────────────────────────────
// In production, this would be Drizzle/Prisma/etc.

export interface DatabaseState {
  todos: Map<string, Todo>;
  projects: Map<string, Project>;
}

export class Database extends Context.Service<
  Database,
  {
    readonly todos: Ref.Ref<Map<string, Todo>>;
    readonly projects: Ref.Ref<Map<string, Project>>;
  }
>()("Database") {}

export const DatabaseLive = Layer.effect(
  Database,
  Effect.gen(function* () {
    const todos = yield* Ref.make(new Map<string, Todo>());
    const projects = yield* Ref.make(new Map<string, Project>());
    return { todos, projects };
  })
);
