import { useEffect } from 'react';
import type { ShortlistEntry } from '../../lib/shortlist';
import { CRITERION_LABELS } from '../../types';
import { formatAverage } from '../../lib/scores';
import { downloadShortlistCsv } from '../../lib/exportCsv';
import './ShortlistPanel.css';

interface ShortlistPanelProps {
  entries: ShortlistEntry[];
  targetCount: number;
  onRemove: (ideaId: string) => void;
  onClose: () => void;
}

export function ShortlistPanel({
  entries,
  targetCount,
  onRemove,
  onClose,
}: ShortlistPanelProps) {
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const count = entries.length;
  const isOverTarget = count > targetCount;
  const canExport = count > 0;

  const handleExport = () => {
    if (!canExport) return;
    downloadShortlistCsv(
      entries.map(({ idea, score }) => ({ idea, score })),
    );
  };

  return (
    <div
      className="shortlist-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortlist-title"
    >
      <div className="shortlist-overlay__backdrop" onClick={onClose} />

      <div className="shortlist-panel">
        <header className="shortlist-panel__header">
          <div>
            <h2 id="shortlist-title" className="shortlist-panel__title">
              Shortlist — sélection pour le jury
            </h2>
            <p className="shortlist-panel__subtitle">
              <span
                className={
                  'shortlist-panel__count' +
                  (isOverTarget ? ' shortlist-panel__count--warn' : '')
                }
              >
                {count} / {targetCount} idées
              </span>
              {isOverTarget && (
                <> — la shortlist dépasse la cible recommandée.</>
              )}
            </p>
          </div>
          <button
            type="button"
            className="shortlist-panel__close"
            onClick={onClose}
            aria-label="Fermer"
          >
            ×
          </button>
        </header>

        <div className="shortlist-panel__body">
          {count === 0 ? (
            <div className="shortlist-panel__empty">
              <h3 className="shortlist-panel__empty-title">
                Aucune idée sélectionnée
              </h3>
              <p className="shortlist-panel__empty-text">
                Cliquez sur le bouton <strong>+</strong> dans le tableau
                pour ajouter des idées à la shortlist. Les idées notées
                apparaîtront triées par moyenne décroissante.
              </p>
            </div>
          ) : (
            <ol className="shortlist-panel__list">
              {entries.map((entry, index) => (
                <ShortlistRow
                  key={entry.idea.id}
                  entry={entry}
                  rank={index + 1}
                  onRemove={onRemove}
                />
              ))}
            </ol>
          )}
        </div>

        <footer className="shortlist-panel__footer">
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Fermer
          </button>
          <button
            type="button"
            className="btn btn--primary"
            onClick={handleExport}
            disabled={!canExport}
            title={canExport ? undefined : 'La shortlist est vide'}
          >
            ⬇ Exporter en CSV
          </button>
        </footer>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */

interface ShortlistRowProps {
  entry: ShortlistEntry;
  rank: number;
  onRemove: (ideaId: string) => void;
}

function ShortlistRow({ entry, rank, onRemove }: ShortlistRowProps) {
  const { idea, score, average } = entry;

  return (
    <li className="shortlist-item">
      <div className="shortlist-item__rank">{rank}</div>

      <div className="shortlist-item__content">
        <div className="shortlist-item__head">
          <span className="shortlist-item__id">{idea.id}</span>
          <h3 className="shortlist-item__title">{idea.titre}</h3>
        </div>

        <p className="shortlist-item__meta">
          {idea.prenom} {idea.nom}
          {idea.direction && <> · {idea.direction}</>}
          {idea.site && <> · {idea.site}</>}
        </p>

        <div className="shortlist-item__scores">
          {(['impact', 'faisabilite', 'alignement', 'innovation'] as const).map(
            (criterion) => {
              const value = score?.[criterion] ?? null;
              return (
                <span
                  key={criterion}
                  className="shortlist-item__criterion"
                  title={CRITERION_LABELS[criterion]}
                >
                  <span className="shortlist-item__criterion-label">
                    {shortenCriterion(CRITERION_LABELS[criterion])}
                  </span>
                  <span
                    className={
                      'shortlist-item__criterion-value' +
                      (value === null
                        ? ' shortlist-item__criterion-value--empty'
                        : '')
                    }
                  >
                    {value ?? '—'}
                  </span>
                </span>
              );
            },
          )}
          <span className="shortlist-item__average">
            Moyenne : <strong>{formatAverage(average)}</strong>
          </span>
        </div>

        {score?.justification && (
          <p className="shortlist-item__justification">
            {score.justification}
          </p>
        )}
      </div>

      <button
        type="button"
        className="shortlist-item__remove"
        onClick={() => onRemove(idea.id)}
        aria-label={`Retirer ${idea.titre} de la shortlist`}
        title="Retirer de la shortlist"
      >
        ×
      </button>
    </li>
  );
}

/** Raccourcit les libellés longs pour la grille compacte. */
function shortenCriterion(label: string): string {
  const map: Record<string, string> = {
    'Impact entreprise': 'Impact',
    'Faisabilité': 'Faisab.',
    'Alignement stratégique': 'Align.',
    'Caractère innovant': 'Innova.',
  };
  return map[label] ?? label;
}