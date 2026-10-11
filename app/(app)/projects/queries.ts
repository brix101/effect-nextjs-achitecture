"use server";

import { runtime } from "@/app/server/runtime";
import { getUserId } from "@/app/lib/auth";
import { Effect } from "effect";
import { getProjects } from "./server";
import type { Project } from "@/app/server/features/project/project.models";

export async function fetchProjects(): Promise<Project[]> {
  return runtime.runPromise(
    getUserId().pipe(Effect.flatMap((userId) => getProjects(userId)))
  );
}
