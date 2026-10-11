"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchProjects } from "./queries";
import { createProject } from "./actions";
import { unwrapResponse } from "@/app/lib/api-response";

const PROJECTS_KEY = ["projects"] as const;

export function useProjects() {
  return useQuery({
    queryKey: PROJECTS_KEY,
    queryFn: () => fetchProjects(),
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => createProject({ name }).then(unwrapResponse),
    onSuccess: () => qc.invalidateQueries({ queryKey: PROJECTS_KEY }),
  });
}
