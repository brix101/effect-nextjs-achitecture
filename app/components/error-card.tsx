export function ErrorCard({ error }: { error: { type: string; message: string } }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-800">
      <h2 className="text-lg font-semibold">Something went wrong</h2>
      <p className="mt-2 text-sm">
        <span className="font-mono text-xs bg-red-100 px-1 py-0.5 rounded">
          {error.type}
        </span>{" "}
        {error.message}
      </p>
    </div>
  );
}
