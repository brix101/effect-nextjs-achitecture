import { Data } from "effect";

// Base error that page-builder maps to next/navigation notFound()
export class NotFoundError extends Data.TaggedError("NotFoundError")<{
  readonly message: string;
}> {}

// Auth error for unauthenticated access
export class UnauthorizedError extends Data.TaggedError("UnauthorizedError")<{
  readonly message: string;
}> {}

// Generic validation error for schema failures
export class ValidationError extends Data.TaggedError("ValidationError")<{
  readonly message: string;
}> {}
