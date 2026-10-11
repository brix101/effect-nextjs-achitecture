import { Context, Effect, Layer } from "effect";
import { ProjectRepository } from "./project.repository";
import type { Project } from "./project.models";

export class ProjectService extends Context.Service<
  ProjectService,
  {
    readonly list: (userId: string) => Effect.Effect<Project[]>;
    readonly create: (args: { name: string; userId: string }) => Effect.Effect<Project>;
  }
>()("ProjectService") {}

export const ProjectServiceLive = Layer.effect(
  ProjectService,
  Effect.gen(function* () {
    const repo = yield* ProjectRepository;

    return {
      list: (userId: string) => repo.findAllByUserId(userId),

      create: ({ name, userId }: { name: string; userId: string }) => {
        const project: Project = {
          id: crypto.randomUUID(),
          name,
          userId,
          createdAt: new Date(),
        };
        return repo.create(project);
      },
    };
  })
);
