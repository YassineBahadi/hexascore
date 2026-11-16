interface ErrorStateProps {
  message: string;
}

export function ErrorState({ message }: ErrorStateProps) {
  return (
    <div className="rounded-lg border border-danger bg-danger-soft p-8 text-center">
      <h2 className="text-lg font-semibold text-danger mb-2">
        Impossible de charger les idées
      </h2>
      <p className="text-sm text-text-muted max-w-lg mx-auto mb-3">{message}</p>
      <p className="text-xs text-text-subtle">
        Vérifie que le fichier{' '}
        <code className="bg-surface px-1.5 py-0.5 rounded-sm font-mono text-text">
          public/data/idees_hexavia.csv
        </code>{' '}
        est bien présent.
      </p>
    </div>
  );
}