import { useEffect, useState } from 'react';
import type { Idea, Score, ScoreCriterion } from '../../types';
import { CRITERION_LABELS } from '../../types';
import { CRITERIA, averageScore, emptyScore } from '../../lib/scores';
import { suggestScore } from '../../lib/aiSimulation';
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
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);

  useEffect(() => {
    setForm(initialScore ?? emptyScore(idea.id));
    setSuggestionError(null);
    setIsSuggesting(false);
  }, [idea.id, initialScore]);

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

  /** Modifie un critère manuellement — désactive le flag IA. */
  const setCriterion = (criterion: ScoreCriterion, value: number | null) => {
    setForm((prev) => ({
      ...prev,
      [criterion]: value,
      suggestedByAi: false,
    }));
  };

  const setJustification = (value: string) => {
    setForm((prev) => ({
      ...prev,
      justification: value,
      suggestedByAi: false,
    }));
  };

  const handleSuggest = async () => {
    setIsSuggesting(true);
    setSuggestionError(null);
    try {
      const suggestion = await suggestScore(idea);
      setForm((prev) => ({
        ...prev,
        impact: suggestion.impact,
        faisabilite: suggestion.faisabilite,
        alignement: suggestion.alignement,
        innovation: suggestion.innovation,
        justification: suggestion.justification,
        suggestedByAi: true,
      }));
    } catch {
      setSuggestionError(
        'La suggestion IA a échoué. Vous pouvez noter manuellement.',
      );
    } finally {
      setIsSuggesting(false);
    }
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
          <div className="score-context">
            <div className="score-context__tags">
              {idea.theme && (
                <span className="score-context__tag score-context__tag--theme">
                  {idea.theme}
                </span>
              )}
              <span className="score-context__tag">
                {idea.direction || 'Direction non renseignée'}
              </span>
              <span className="score-context__tag">
                {idea.site || 'Site non renseigné'}
              </span>
              <span className="score-context__tag score-context__tag--budget">
                Budget&nbsp;: {formatBudgetEur(budget, idea.budgetEstime)}
              </span>
            </div>

            <p className="score-context__description">{idea.description}</p>

            {idea.beneficesAttendus && (
              <p className="score-context__benefit">
                <strong>Bénéfices attendus&nbsp;:</strong> {idea.beneficesAttendus}
              </p>
            )}
          </div>

          {form.suggestedByAi && (
            <div className="score-panel__ai-banner" role="status">
              <span className="score-panel__ai-icon" aria-hidden="true">💡</span>
              <span>
                <strong>Suggestion IA</strong> — proposition de notation que
                vous pouvez corriger librement. Le texte de la justification
                est modifiable.
              </span>
            </div>
          )}

          {suggestionError && (
            <div className="score-panel__ai-error" role="alert">
              {suggestionError}
            </div>
          )}

          <div className="score-panel__suggest-row">
            <button
              type="button"
              className="btn btn--ai"
              onClick={handleSuggest}
              disabled={isSuggesting}
            >
              {isSuggesting ? 'Suggestion en cours…' : '✨ Suggérer une note'}
            </button>
            <span className="score-panel__suggest-hint">
              Remplit les 4 critères et la justification à partir de l'idée.
            </span>
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
              Justification{' '}
              <span className="score-panel__label-hint">(optionnel)</span>
            </label>
            <textarea
              id="justification"
              className="score-panel__textarea"
              rows={4}
              placeholder="Pourquoi ces notes ? Ce texte pourra être repris dans la shortlist."
              value={form.justification}
              onChange={(e) => setJustification(e.target.value)}
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