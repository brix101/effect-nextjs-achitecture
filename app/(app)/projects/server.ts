import { Effect } from "effect";
import { ProjectService } from "@/app/server/features/project/project.service";
import type { Project } from "@/app/server/features/project/project.models";

export const getProjects = (userId: string): Effect.Effect<Project[], never, ProjectService> =>
  Effect.gen(function* () {
    const service = yield* ProjectService;
    return yield* service.list(userId);
  });
