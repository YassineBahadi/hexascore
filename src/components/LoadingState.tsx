export function LoadingState() {
  return (
    <div className="skeleton-table" aria-label="Chargement des idées" role="status">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="skeleton-row">
          <div className="skeleton-bar skeleton-bar--title" />
          <div className="skeleton-bar skeleton-bar--meta" />
          <div className="skeleton-bar skeleton-bar--desc" />
        </div>
      ))}
    </div>
  );
}
