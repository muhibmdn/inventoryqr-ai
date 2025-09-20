export default function MarketingLoading() {
  return (
    <div className="mx-auto min-h-[60vh] w-full max-w-5xl space-y-12 px-6 py-12">
      <div className="space-y-4 text-center">
        <div className="mx-auto h-10 w-56 rounded-full bg-gradient-to-r from-success-surface via-white to-success-surface bg-[length:400%_100%] animate-shimmer" />
        <div className="mx-auto h-6 w-80 rounded-full bg-gradient-to-r from-success-surface via-white to-success-surface bg-[length:400%_100%] animate-shimmer" />
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="rounded-3xl border border-success-border/80 bg-white p-6 shadow-sm"
          >
            <div className="h-6 w-32 rounded-full bg-gradient-to-r from-success-surface via-white to-success-surface bg-[length:400%_100%] animate-shimmer" />
            <div className="mt-4 space-y-2">
              <div className="h-4 w-full rounded-full bg-gradient-to-r from-success-surface via-white to-success-surface bg-[length:400%_100%] animate-shimmer" />
              <div className="h-4 w-3/4 rounded-full bg-gradient-to-r from-success-surface via-white to-success-surface bg-[length:400%_100%] animate-shimmer" />
            </div>
            <div className="mt-6 h-10 w-full rounded-full bg-gradient-to-r from-success-surface via-white to-success-surface bg-[length:400%_100%] animate-shimmer" />
          </div>
        ))}
      </div>
    </div>
  );
}