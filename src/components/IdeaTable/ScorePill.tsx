import type { Score } from '../../types';
import { averageScore, formatAverage, getScoreTier, isScoreBlank } from '../../lib/scores';

const TIER_STYLES = {
  1: 'bg-score-1-bg text-score-1',
  2: 'bg-score-2-bg text-score-2',
  3: 'bg-score-3-bg text-score-3',
  4: 'bg-score-4-bg text-score-4',
} as const;

interface ScorePillProps {
  score: Score | null;
}

/**
 * Pastille de note — 3 états visuels distincts (design.md §5.5) :
 * - Pas de note → tiret discret
 * - Suggestion IA non validée → pastille pointillée violette avec ✨
 * - Note validée → pastille pleine avec couleur d'échelle
 */
export function ScorePill({ score }: ScorePillProps) {
  if (!score || isScoreBlank(score)) {
    return <span className="text-text-subtle text-sm" aria-label="Non notée">—</span>;
  }

  const avg = averageScore(score);
  if (avg === null) return null;

  if (score.suggestedByAi) {
    return (
      <span
        className="inline-flex items-center gap-1 rounded-full border border-dashed border-ai bg-ai-soft px-2 py-1 text-xs font-semibold text-ai tabular-nums"
        title="Suggestion IA — à valider"
      >
        <span aria-hidden="true">✨</span>
        {formatAverage(avg)}/5
      </span>
    );
  }

  const tier = getScoreTier(avg);
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold tabular-nums ${TIER_STYLES[tier]}`}
    >
      {formatAverage(avg)}/5
    </span>
  );
}