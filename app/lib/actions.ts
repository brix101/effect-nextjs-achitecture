import { Effect, Schema, Exit, Cause, Result } from "effect";
import type { ApiResponse } from "./api-response";
import { getUserId, type UserId } from "./auth";
import { runtime } from "@/app/server/runtime";

// ─── Types ──────────────────────────────────────────────────────────────────

type Runtime = typeof runtime;
type RuntimeContext = Runtime extends { runPromise: (e: Effect.Effect<infer _A, infer _E, infer R>) => any } ? R : never;

// ─── Exit → ApiResponse conversion ─────────────────────────────────────────

function toApiResponse<T>(exit: Exit.Exit<T, unknown>): ApiResponse<T> {
  if (Exit.isSuccess(exit)) {
    return { success: true, data: exit.value };
  }

  const cause = exit.cause;
  const failure = Cause.findErrorOption(cause);

  if (failure._tag === "Some") {
    const error = failure.value;
    if (typeof error === "object" && error !== null && "_tag" in error) {
      return {
        success: false,
        error: {
          type: (error as any)._tag,
          message: String((error as any).message ?? error),
        },
      };
    }
    return {
      success: false,
      error: { type: "UnknownError", message: String(error) },
    };
  }

  const defects = cause.reasons.filter(Cause.isDieReason).map((r) => r.defect);
  if (defects.length > 0) {
    const d = defects[0];
    return {
      success: false,
      error: {
        type: "Defect",
        message: d instanceof Error ? d.message : String(d),
      },
    };
  }

  return {
    success: false,
    error: { type: "UnknownError", message: "An unexpected error occurred" },
  };
}

// ─── Action Builder ─────────────────────────────────────────────────────────
//
// Fluent API for building type-safe server actions with Effect.ts:
//
//   action.schema(S).protectedEffect(fn)  — validated + auth
//   action.schema(S).effect(fn)           — validated, no auth
//   action.protectedEffect(fn)            — auth only, no input

export const action = {
  schema<A, I>(schema: Schema.Codec<A, I>) {
    return {
      // Validated + authenticated
      protectedEffect<T>(
        fn: (args: { input: A; userId: UserId }) => Effect.Effect<T, any, RuntimeContext>
      ): (raw: I) => Promise<ApiResponse<T>> {
        return async (raw: I) => {
          const decoded = Schema.decodeUnknownResult(schema)(raw);
          if (Result.isFailure(decoded)) {
            return {
              success: false,
              error: { type: "ValidationError", message: "Invalid input" },
            };
          }
          const exit = await runtime.runPromiseExit(
            getUserId().pipe(
              Effect.flatMap((userId) => fn({ input: decoded.success, userId }))
            )
          );
          return toApiResponse(exit);
        };
      },

      // Validated, no auth
      effect<T>(
        fn: (args: { input: A }) => Effect.Effect<T, any, RuntimeContext>
      ): (raw: I) => Promise<ApiResponse<T>> {
        return async (raw: I) => {
          const decoded = Schema.decodeUnknownResult(schema)(raw);
          if (Result.isFailure(decoded)) {
            return {
              success: false,
              error: { type: "ValidationError", message: "Invalid input" },
            };
          }
          const exit = await runtime.runPromiseExit(fn({ input: decoded.success }));
          return toApiResponse(exit);
        };
      },
    };
  },

  // Auth only, no input schema
  protectedEffect<T>(
    fn: (args: { userId: UserId }) => Effect.Effect<T, any, RuntimeContext>
  ): () => Promise<ApiResponse<T>> {
    return async () => {
      const exit = await runtime.runPromiseExit(
        getUserId().pipe(Effect.flatMap((userId) => fn({ userId })))
      );
      return toApiResponse(exit);
    };
  },
};
