import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  // If already logged in, redirect to app
  const jar = await cookies();
  if (jar.get("demo-session")) {
    redirect("/todos");
  }

  const params = await searchParams;
  const from = params.from ?? "/todos";

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-bold mb-4">Sign in</h1>
      <p className="text-gray-600 text-sm mb-6">
        This is a demo auth page. In production, this would be your real login
        form (email/password, OAuth, passkey, etc.).
      </p>
      <form action={login.bind(null, from)}>
        <button
          type="submit"
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Sign in as demo user
        </button>
      </form>
    </div>
  );
}

async function login(from: string) {
  "use server";
  const jar = await cookies();
  jar.set("demo-session", "user_demo_123", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 1 day
  });
  redirect(from);
}
