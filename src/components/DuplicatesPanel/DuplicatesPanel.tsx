import { useEffect } from 'react';
import type { Idea, DuplicateGroup } from '../../types';
import {
  formatBudgetEur,
  parseBudget,
} from '../../lib/formatters';
import './DuplicatesPanel.css';

interface DuplicatesPanelProps {
  groups: DuplicateGroup[];
  ideasById: Record<string, Idea>;
  onClose: () => void;
}

export function DuplicatesPanel({
  groups,
  ideasById,
  onClose,
}: DuplicatesPanelProps) {
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

  return (
    <div
      className="duplicates-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="duplicates-title"
    >
      <div className="duplicates-overlay__backdrop" onClick={onClose} />

      <div className="duplicates-panel">
        <header className="duplicates-panel__header">
          <div>
            <h2 id="duplicates-title" className="duplicates-panel__title">
              Doublons détectés
            </h2>
            <p className="duplicates-panel__subtitle">
              {groups.length} groupe{groups.length > 1 ? 's' : ''} de doublons
              probables. Vérifiez chaque groupe avant la shortlist.
            </p>
          </div>
          <button
            type="button"
            className="duplicates-panel__close"
            onClick={onClose}
            aria-label="Fermer"
          >
            ×
          </button>
        </header>

        <div className="duplicates-panel__body">
          {groups.length === 0 ? (
            <p className="duplicates-panel__empty">
              Aucun doublon détecté dans les idées actuelles.
            </p>
          ) : (
            groups.map((group, i) => (
              <DuplicateGroupCard
                key={group.id}
                group={group}
                index={i + 1}
                ideasById={ideasById}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */

interface DuplicateGroupCardProps {
  group: DuplicateGroup;
  index: number;
  ideasById: Record<string, Idea>;
}

function DuplicateGroupCard({
  group,
  index,
  ideasById,
}: DuplicateGroupCardProps) {
  const confidencePct = Math.round(group.confidence * 100);
  const confidenceLabel =
    confidencePct >= 90
      ? 'très élevée'
      : confidencePct >= 70
      ? 'élevée'
      : 'modérée';

  return (
    <section className="dup-group">
      <header className="dup-group__header">
        <span className="dup-group__index">Groupe {index}</span>
        <span className="dup-group__confidence">
          Confiance {confidenceLabel} ({confidencePct} %)
        </span>
      </header>
      <p className="dup-group__reason">{group.reason}</p>

      <div className="dup-group__ideas">
        {group.ideaIds.map((id) => {
          const idea = ideasById[id];
          if (!idea) return null;
          return (
            <article key={id} className="dup-idea">
              <div className="dup-idea__id">{idea.id}</div>
              <h3 className="dup-idea__title">{idea.titre}</h3>
              <p className="dup-idea__meta">
                {idea.prenom} {idea.nom}
                {idea.direction && <> · {idea.direction}</>}
                {idea.site && <> · {idea.site}</>}
              </p>
              <p className="dup-idea__budget">
                Budget :{' '}
                {formatBudgetEur(
                  parseBudget(idea.budgetEstime),
                  idea.budgetEstime,
                )}
              </p>
              <p className="dup-idea__description">{idea.description}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}