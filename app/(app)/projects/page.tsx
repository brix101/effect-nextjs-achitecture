import { page } from "@/app/lib/page-builder";
import { getProjects } from "./server";
import { ProjectList } from "./project-list";

export default page
  .protectedEffect(({ userId }) => getProjects(userId))
  .render((_initialProjects) => (
    <div>
      <h1 className="text-2xl font-bold mb-6">Projects</h1>
      <ProjectList />
    </div>
  ));
