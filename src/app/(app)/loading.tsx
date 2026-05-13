export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 bg-zinc-200 rounded" />
        <div className="bg-white rounded-2xl border border-zinc-200 p-5">
          <div className="space-y-3">
            <div className="h-4 w-full bg-zinc-100 rounded" />
            <div className="h-4 w-11/12 bg-zinc-100 rounded" />
            <div className="h-4 w-10/12 bg-zinc-100 rounded" />
            <div className="h-4 w-full bg-zinc-100 rounded" />
            <div className="h-4 w-9/12 bg-zinc-100 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
