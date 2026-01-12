const Loading = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header skeleton */}
      <div className="border-b border-border px-6 py-4">
        <div className="h-6 w-40 rounded-md bg-muted animate-pulse" />
      </div>

      {/* Main content */}
      <div className="p-6 space-y-6">
        {/* Greeting */}
        <div className="h-8 w-64 rounded-md bg-muted animate-pulse" />

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-32 rounded-xl border border-border bg-card p-4 animate-pulse"
            >
              <div className="h-4 w-24 bg-muted rounded mb-3" />
              <div className="h-6 w-32 bg-muted rounded" />
            </div>
          ))}
        </div>

        {/* Table / list skeleton */}
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-4 w-full bg-muted rounded animate-pulse"
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default Loading