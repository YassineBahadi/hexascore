import { useEffect, useState } from 'react';
import type { Idea, Score, ScoreCriterion } from '../../types';
import { CRITERION_LABELS } from '../../types';
import { CRITERIA, averageScore, emptyScore } from '../../lib/scores';
import { formatBudgetEur, parseBudget } from '../../lib/formatters';
import './ScorePanel.css';

interface ScorePanelProps {
  idea: Idea;
  initialScore: Score | null;
  onSave: (score: Score) => void;
  onClose: () => void;
}

export function ScorePanel({
  idea,
  initialScore,
  onSave,
  onClose,
}: ScorePanelProps) {
  const [form, setForm] = useState<Score>(
    () => initialScore ?? emptyScore(idea.id),
  );

  // Réinitialise le formulaire si on change d'idée (nouveau clic).
  useEffect(() => {
    setForm(initialScore ?? emptyScore(idea.id));
  }, [idea.id, initialScore]);

  // Bloque le scroll du body pendant l'ouverture.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  // Fermeture par Échap.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const setCriterion = (criterion: ScoreCriterion, value: number | null) => {
    setForm((prev) => ({ ...prev, [criterion]: value }));
  };

  const handleSave = () => {
    onSave(form);
    onClose();
  };

  const avg = averageScore(form);
  const budget = parseBudget(idea.budgetEstime);

  return (
    <div
      className="score-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="score-panel-title"
    >
      <div className="score-overlay__backdrop" onClick={onClose} />

      <div className="score-panel">
        <header className="score-panel__header">
          <div>
            <span className="score-panel__id">{idea.id}</span>
            <h2 id="score-panel-title" className="score-panel__title">
              {idea.titre}
            </h2>
            <p className="score-panel__author">
              {idea.prenom} {idea.nom}
              {idea.direction && <> · {idea.direction}</>}
              {idea.site && <> · {idea.site}</>}
            </p>
          </div>
          <button
            type="button"
            className="score-panel__close"
            onClick={onClose}
            aria-label="Fermer le panneau"
          >
            ×
          </button>
        </header>

        <div className="score-panel__body">
          <p className="score-panel__description">{idea.description}</p>

          <div className="score-panel__meta">
            {idea.theme && (
              <span className="score-panel__chip">{idea.theme}</span>
            )}
            <span className="score-panel__chip score-panel__chip--neutral">
              Budget : {formatBudgetEur(budget, idea.budgetEstime)}
            </span>
            {idea.beneficesAttendus && (
              <span className="score-panel__chip score-panel__chip--neutral">
                Bénéfices : {idea.beneficesAttendus}
              </span>
            )}
          </div>

          <h3 className="score-panel__section-title">
            Notez chaque critère de 1 à 5
          </h3>

          {CRITERIA.map((criterion) => (
            <RatingRow
              key={criterion}
              criterion={criterion}
              label={CRITERION_LABELS[criterion]}
              value={form[criterion]}
              onChange={(v) => setCriterion(criterion, v)}
            />
          ))}

          <div className="score-panel__justification">
            <label htmlFor="justification" className="score-panel__label">
              Justification <span className="score-panel__label-hint">(optionnel)</span>
            </label>
            <textarea
              id="justification"
              className="score-panel__textarea"
              rows={4}
              placeholder="Pourquoi ces notes ? Ce texte pourra être repris dans la shortlist."
              value={form.justification}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, justification: e.target.value }))
              }
            />
          </div>

          <div className="score-panel__average">
            {avg !== null ? (
              <>
                Moyenne : <strong>{avg.toFixed(1)} / 5</strong>
              </>
            ) : (
              <>Aucun critère noté pour le moment.</>
            )}
          </div>
        </div>

        <footer className="score-panel__footer">
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Annuler
          </button>
          <button
            type="button"
            className="btn btn--primary"
            onClick={handleSave}
          >
            Enregistrer
          </button>
        </footer>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */

interface RatingRowProps {
  criterion: ScoreCriterion;
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
}

function RatingRow({ criterion, label, value, onChange }: RatingRowProps) {
  const labelId = `rating-label-${criterion}`;
  return (
    <div className="rating-row">
      <span className="rating-row__label" id={labelId}>
        {label}
      </span>
      <div
        className="rating-row__buttons"
        role="radiogroup"
        aria-labelledby={labelId}
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${label} : ${n} sur 5`}
            className={
              'rating-btn' + (value === n ? ' rating-btn--active' : '')
            }
            onClick={() => onChange(value === n ? null : n)}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}