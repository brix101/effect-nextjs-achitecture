import { Layer, ManagedRuntime } from "effect";
import { DatabaseLive } from "./shared/infrastructure/database";
import { TodoRepositoryLive } from "./features/todo/todo.repository";
import { TodoServiceLive } from "./features/todo/todo.service";
import { ProjectRepositoryLive } from "./features/project/project.repository";
import { ProjectServiceLive } from "./features/project/project.service";

// ─── Layer composition ──────────────────────────────────────────────────────
//
// Layer 1: Infrastructure
//   DatabaseLive (in-memory Maps)
//
// Layer 2: Repositories (depend on Database)
//   TodoRepositoryLive, ProjectRepositoryLive
//
// Layer 3: Services (depend on Repositories)
//   TodoServiceLive, ProjectServiceLive

const RepositoriesLive = Layer.mergeAll(
  TodoRepositoryLive,
  ProjectRepositoryLive
).pipe(Layer.provide(DatabaseLive));

const ServicesLive = Layer.mergeAll(
  TodoServiceLive,
  ProjectServiceLive
).pipe(Layer.provide(RepositoriesLive));

// ─── ManagedRuntime ─────────────────────────────────────────────────────────
// Single runtime instance shared across all server-side code.
// ManagedRuntime ensures layers are initialized once and reused.

export const runtime = ManagedRuntime.make(ServicesLive);
