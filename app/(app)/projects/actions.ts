"use server";

import { action } from "@/app/lib/actions";
import { ProjectService } from "@/app/server/features/project/project.service";
import { Effect } from "effect";
import { CreateProjectInput } from "./schemas";
import type { ApiResponse } from "@/app/lib/api-response";
import type { Project } from "@/app/server/features/project/project.models";

const _createProject = action
  .schema(CreateProjectInput)
  .protectedEffect(({ input, userId }) =>
    Effect.gen(function* () {
      const service = yield* ProjectService;
      return yield* service.create({ name: input.name, userId });
    })
  );

export async function createProject(input: typeof CreateProjectInput.Type): Promise<ApiResponse<Project>> {
  return _createProject(input);
}
