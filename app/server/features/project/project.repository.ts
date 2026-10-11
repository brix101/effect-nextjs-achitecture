import { Context, Effect, Layer, Ref } from "effect";
import { Database } from "@/app/server/shared/infrastructure/database";
import type { Project } from "./project.models";

export class ProjectRepository extends Context.Service<
  ProjectRepository,
  {
    readonly findAllByUserId: (userId: string) => Effect.Effect<Project[]>;
    readonly create: (project: Project) => Effect.Effect<Project>;
  }
>()("ProjectRepository") {}

export const ProjectRepositoryLive = Layer.effect(
  ProjectRepository,
  Effect.gen(function* () {
    const db = yield* Database;

    return {
      findAllByUserId: (userId: string) =>
        Ref.get(db.projects).pipe(
          Effect.map((map) =>
            Array.from(map.values())
              .filter((p) => p.userId === userId)
              .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          )
        ),

      create: (project: Project) =>
        Ref.update(db.projects, (map) => new Map(map).set(project.id, project)).pipe(
          Effect.map(() => project)
        ),
    };
  })
);
