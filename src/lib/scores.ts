import type { Score, ScoreCriterion } from '../types';

/** Ordre canonique des critères — utilisé partout dans l'UI. */
export const CRITERIA: ScoreCriterion[] = [
  'impact',
  'faisabilite',
  'alignement',
  'innovation',
];

/**
 * Crée un score vierge pour une idée donnée.
 * Tout à null / vide / false.
 */
export function emptyScore(ideaId: string): Score {
  return {
    ideaId,
    impact: null,
    faisabilite: null,
    alignement: null,
    innovation: null,
    justification: '',
    suggestedByAi: false,
    updatedAt: new Date().toISOString(),
  };
}

/** Vrai si au moins un critère est noté. */
export function isScoreStarted(score: Score): boolean {
  return CRITERIA.some((c) => score[c] !== null);
}

/** Vrai si les 4 critères sont tous notés. */
export function isScoreComplete(score: Score): boolean {
  return CRITERIA.every((c) => score[c] !== null);
}

/**
 * Moyenne des critères notés (ignore les null).
 * Retourne null si aucun critère n'est noté.
 */
export function averageScore(score: Score): number | null {
  const values = CRITERIA
    .map((c) => score[c])
    .filter((v): v is number => v !== null);
  if (values.length === 0) return null;
  const sum = values.reduce((a, b) => a + b, 0);
  return sum / values.length;
}

/** Formate une moyenne pour l'affichage : "3.5" ou "—". */
export function formatAverage(avg: number | null): string {
  if (avg === null) return '—';
  return avg.toFixed(1);
}

/**
 * Vrai si le score est vide au sens strict :
 * aucun critère noté ET aucune justification saisie.
 * Utilisé pour décider si on garde ou supprime une entrée.
 */
export function isScoreBlank(score: Score): boolean {
  return !isScoreStarted(score) && score.justification.trim() === '';
}