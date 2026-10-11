import { Schema } from "effect";

export const Project = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  userId: Schema.String,
  createdAt: Schema.Date,
});
export type Project = typeof Project.Type;
