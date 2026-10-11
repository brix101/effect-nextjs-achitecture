import { page } from "@/app/lib/page-builder";
import { getTodos } from "./server";
import { TodoList } from "./todo-list";

export default page
  .protectedEffect(({ userId }) => getTodos(userId))
  .render((_initialTodos) => (
    <div>
      <h1 className="text-2xl font-bold mb-6">Todos</h1>
      <TodoList />
    </div>
  ));
