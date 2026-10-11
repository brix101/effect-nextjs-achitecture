"use client";

import { useState } from "react";
import { useProjects, useCreateProject } from "./use-projects";

export function ProjectList() {
  const [name, setName] = useState("");
  const { data: projects, isLoading } = useProjects();
  const create = useCreateProject();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    create.mutate(name.trim(), { onSuccess: () => setName("") });
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New project name..."
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={create.isPending || !name.trim()}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Create
        </button>
      </form>

      {isLoading ? (
        <p className="text-gray-500 text-sm">Loading...</p>
      ) : !projects?.length ? (
        <p className="text-gray-500 text-sm">No projects yet. Create one above!</p>
      ) : (
        <ul className="space-y-2">
          {projects.map((project) => (
            <li
              key={project.id}
              className="rounded-md border border-gray-200 px-3 py-2"
            >
              <span className="text-sm text-gray-800">{project.name}</span>
              <span className="ml-2 text-xs text-gray-400">
                {new Date(project.createdAt).toLocaleDateString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
