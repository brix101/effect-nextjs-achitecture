import { Schema } from "effect";

export class CreateProjectInput extends Schema.Class<CreateProjectInput>("CreateProjectInput")({
  name: Schema.String.check(Schema.isMinLength(1), Schema.isMaxLength(200)),
}) {}
