import { Schema } from "effect";

export const Todo = Schema.Struct({
  id: Schema.String,
  title: Schema.String,
  completed: Schema.Boolean,
  userId: Schema.String,
  createdAt: Schema.Date,
});
export type Todo = typeof Todo.Type;
