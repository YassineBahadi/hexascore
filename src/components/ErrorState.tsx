interface ErrorStateProps {
  message: string;
}

export function ErrorState({ message }: ErrorStateProps) {
  return (
    <div className="empty-state empty-state--error">
      <h2 className="empty-state__title">Impossible de charger les idées</h2>
      <p className="empty-state__text">{message}</p>
      <p className="empty-state__hint">
        Vérifie que le fichier <code>public/data/idees_hexavia.csv</code> est bien présent.
      </p>
    </div>
  );
}