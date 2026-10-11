import { Brand, Effect } from "effect";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// ─── Branded UserId for type safety across layers ───────────────────────────

export type UserId = string & Brand.Brand<"UserId">;
export const UserId = Brand.nominal<UserId>();

// ─── Auth check ─────────────────────────────────────────────────────────────
// In production, this reads session tokens from cookies/headers via your auth
// library (better-auth, next-auth, lucia, etc.).
//
// For this demo, we simulate auth with a simple cookie. Visit /login to "sign in"
// or /logout to "sign out". Protected pages redirect to /login when unauthenticated.

export const getUserId = (): Effect.Effect<UserId, never, never> =>
  Effect.promise(() => cookies()).pipe(
    Effect.flatMap((jar) => {
      const session = jar.get("demo-session");

      if (!session?.value) {
        // In an Effect context we can't call redirect() directly (it throws).
        // We use Effect.die to propagate the Next.js redirect error, which the
        // page builder re-throws so Next.js handles it normally.
        return Effect.sync(() => redirect("/login"));
      }

      return Effect.succeed(UserId(session.value));
    })
  );
