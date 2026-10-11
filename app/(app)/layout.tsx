import Link from "next/link";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <nav className="mb-8 flex items-center gap-6 border-b border-gray-200 pb-4">
        <Link href="/todos" className="text-sm font-medium text-blue-600 hover:text-blue-800">
          Todos
        </Link>
        <Link href="/projects" className="text-sm font-medium text-blue-600 hover:text-blue-800">
          Projects
        </Link>
        <div className="flex-1" />
        <Link href="/logout" className="text-sm text-gray-500 hover:text-gray-700">
          Sign out
        </Link>
      </nav>
      {children}
    </div>
  );
}
