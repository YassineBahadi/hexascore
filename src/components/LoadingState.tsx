export function LoadingState() {
  return (
    <div className="flex flex-col gap-3" role="status" aria-label="Chargement des idées">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="rounded-lg border border-border bg-surface p-4 flex flex-col gap-2"
        >
          <div className="h-4 w-3/5 rounded-sm bg-surface-2 animate-shimmer bg-[linear-gradient(90deg,#F1F5F9_0%,#F8FAFC_50%,#F1F5F9_100%)] bg-[length:200%_100%]" />
          <div className="h-2.5 w-1/3 rounded-sm bg-surface-2 animate-shimmer bg-[linear-gradient(90deg,#F1F5F9_0%,#F8FAFC_50%,#F1F5F9_100%)] bg-[length:200%_100%]" />
          <div className="h-3 w-11/12 rounded-sm bg-surface-2 animate-shimmer bg-[linear-gradient(90deg,#F1F5F9_0%,#F8FAFC_50%,#F1F5F9_100%)] bg-[length:200%_100%]" />
        </div>
      ))}
    </div>
  );
}