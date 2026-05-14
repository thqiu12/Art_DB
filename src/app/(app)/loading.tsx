export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 bg-[#E2E0DA] rounded" />
        <div className="bg-white rounded-2xl border border-[#E2E0DA] p-5">
          <div className="space-y-3">
            <div className="h-4 w-full bg-[#F5F4F0] rounded" />
            <div className="h-4 w-11/12 bg-[#F5F4F0] rounded" />
            <div className="h-4 w-10/12 bg-[#F5F4F0] rounded" />
            <div className="h-4 w-full bg-[#F5F4F0] rounded" />
            <div className="h-4 w-9/12 bg-[#F5F4F0] rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
