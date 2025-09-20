export function DashboardHomeSkeleton() {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-success-border bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-3">
              <div className="h-4 w-20 rounded-full bg-gradient-to-r from-success-surface via-white to-success-surface bg-[length:400%_100%] animate-shimmer" />
              <div className="h-7 w-32 rounded-full bg-gradient-to-r from-success-surface via-white to-success-surface bg-[length:400%_100%] animate-shimmer" />
            </div>
          ))}
        </div>
      </section>
      <section className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="rounded-3xl border border-success-border bg-white p-6 shadow-sm">
            <div className="h-5 w-28 rounded-full bg-gradient-to-r from-success-surface via-white to-success-surface bg-[length:400%_100%] animate-shimmer" />
            <div className="mt-6 space-y-4">
              {Array.from({ length: 4 }).map((__, row) => (
                <div
                  key={row}
                  className="h-4 w-full rounded-full bg-gradient-to-r from-success-surface via-white to-success-surface bg-[length:400%_100%] animate-shimmer"
                />
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
