import { Schema } from "effect";

export class CreateTodoInput extends Schema.Class<CreateTodoInput>("CreateTodoInput")({
  title: Schema.String.check(Schema.isMinLength(1), Schema.isMaxLength(200)),
}) {}

export class ToggleTodoInput extends Schema.Class<ToggleTodoInput>("ToggleTodoInput")({
  id: Schema.String.check(Schema.isMinLength(1)),
}) {}

export class DeleteTodoInput extends Schema.Class<DeleteTodoInput>("DeleteTodoInput")({
  id: Schema.String.check(Schema.isMinLength(1)),
}) {}
