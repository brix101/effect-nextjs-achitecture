import { Effect, Schema, Exit, Cause } from "effect";
import { notFound, redirect } from "next/navigation";
import { NotFoundError } from "./errors";
import { getUserId, type UserId } from "./auth";
import { ErrorCard } from "@/app/components/error-card";
import { runtime } from "@/app/server/runtime";

// ─── Types ──────────────────────────────────────────────────────────────────

type Runtime = typeof runtime;
type RuntimeContext = Runtime extends { runPromise: (e: Effect.Effect<infer _A, infer _E, infer R>) => any } ? R : never;

type PageProps = {
  params: Promise<Record<string, string>>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<Record<string, string>>;
};

// ─── Error handling ─────────────────────────────────────────────────────────

function isRedirectError(error: unknown): boolean {
  return (
    error instanceof Error &&
    "digest" in error &&
    typeof (error as any).digest === "string" &&
    (error as any).digest.startsWith("NEXT_REDIRECT")
  );
}

function isNotFoundError(error: unknown): boolean {
  return (
    error instanceof Error &&
    "digest" in error &&
    typeof (error as any).digest === "string" &&
    (error as any).digest === "NEXT_NOT_FOUND"
  );
}

function handleExit<A>(exit: Exit.Exit<A, unknown>): A {
  if (Exit.isSuccess(exit)) return exit.value;

  const cause = exit.cause;
  const failure = Cause.findErrorOption(cause);

  if (failure._tag === "Some") {
    const error = failure.value;

    // NotFoundError → 404
    if (error instanceof NotFoundError) notFound();

    // Unknown tagged error → error card data
    if (typeof error === "object" && error !== null && "_tag" in error) {
      throw { type: (error as any)._tag, message: String((error as any).message ?? error) };
    }

    throw { type: "UnknownError", message: String(error) };
  }

  // Defects (unexpected errors)
  const defects = cause.reasons.filter(Cause.isDieReason).map((r) => r.defect);
  if (defects.length > 0) {
    const d = defects[0];
    // Re-throw Next.js internal errors (redirect, notFound)
    if (isRedirectError(d)) throw d;
    if (isNotFoundError(d)) notFound();
    throw { type: "Defect", message: d instanceof Error ? d.message : String(d) };
  }

  throw { type: "UnknownError", message: "An unexpected error occurred" };
}

// ─── Render wrapper that catches Effect errors ──────────────────────────────

async function safeRender<T>(
  effectFn: () => Effect.Effect<T, any, RuntimeContext>,
  renderFn: (data: T) => React.ReactNode
): Promise<React.ReactNode> {
  try {
    const exit = await runtime.runPromiseExit(effectFn());
    const data = handleExit(exit);
    return renderFn(data);
  } catch (error) {
    // Re-throw Next.js internal errors
    if (isRedirectError(error)) throw error;
    if (typeof error === "object" && error !== null && "type" in error) {
      return <ErrorCard error={error as { type: string; message: string }} />;
    }
    return <ErrorCard error={{ type: "UnknownError", message: String(error) }} />;
  }
}

// ─── Page Builder ───────────────────────────────────────────────────────────
//
// Fluent API for building Next.js pages with Effect.ts:
//
//   page.params(Schema).protectedEffect(fn).render(fn)
//   page.protectedEffect(fn).render(fn)
//   page.protectedRender(fn)
//   page.effect(fn).render(fn)
//   page.render(fn)

export const page = {
  // With params schema validation
  params<P>(schema: Schema.Codec<P, Record<string, string>>) {
    return {
      protectedEffect<T>(effectFn: (args: { params: P; userId: UserId }) => Effect.Effect<T, any, RuntimeContext>) {
        return {
          render(renderFn: (data: T) => React.ReactNode) {
            return async function Page(props: PageProps) {
              const rawParams = await props.params;
              const params = Schema.decodeUnknownSync(schema)(rawParams);
              return safeRender(
                () =>
                  getUserId().pipe(
                    Effect.flatMap((userId) => effectFn({ params, userId }))
                  ),
                renderFn
              );
            };
          },
        };
      },
      effect<T>(effectFn: (args: { params: P }) => Effect.Effect<T, any, RuntimeContext>) {
        return {
          render(renderFn: (data: T) => React.ReactNode) {
            return async function Page(props: PageProps) {
              const rawParams = await props.params;
              const params = Schema.decodeUnknownSync(schema)(rawParams);
              return safeRender(() => effectFn({ params }), renderFn);
            };
          },
        };
      },
    };
  },

  // Protected (auth required) effect → render
  protectedEffect<T>(effectFn: (args: { userId: UserId }) => Effect.Effect<T, any, RuntimeContext>) {
    return {
      render(renderFn: (data: T) => React.ReactNode) {
        return async function Page(_props: PageProps) {
          return safeRender(
            () =>
              getUserId().pipe(
                Effect.flatMap((userId) => effectFn({ userId }))
              ),
            renderFn
          );
        };
      },
    };
  },

  // Protected render — auth check, no data fetching
  protectedRender(renderFn: (args: { userId: UserId }) => React.ReactNode) {
    return async function Page(_props: PageProps) {
      return safeRender(
        () => getUserId().pipe(Effect.map((userId) => ({ userId }))),
        ({ userId }) => renderFn({ userId })
      );
    };
  },

  // Public effect → render
  effect<T>(effectFn: () => Effect.Effect<T, any, RuntimeContext>) {
    return {
      render(renderFn: (data: T) => React.ReactNode) {
        return async function Page(_props: PageProps) {
          return safeRender(effectFn, renderFn);
        };
      },
    };
  },

  // Static render — no data fetching
  render(renderFn: () => React.ReactNode) {
    return function Page(_props: PageProps) {
      return renderFn();
    };
  },
};

// ─── Layout Builder ─────────────────────────────────────────────────────────

export const layout = {
  protectedEffect<T>(effectFn: (args: { userId: UserId }) => Effect.Effect<T, any, RuntimeContext>) {
    return {
      render(renderFn: (data: T & { children: React.ReactNode }) => React.ReactNode) {
        return async function Layout(props: LayoutProps) {
          return safeRender(
            () =>
              getUserId().pipe(
                Effect.flatMap((userId) => effectFn({ userId }))
              ),
            (data) => renderFn({ ...data, children: (props as any).children })
          );
        };
      },
    };
  },

  render(renderFn: (props: { children: React.ReactNode }) => React.ReactNode) {
    return function Layout(props: LayoutProps) {
      return renderFn({ children: (props as any).children });
    };
  },
};
