import type { Idea, Score } from '../types';
import { averageScore } from './scores';

export interface ShortlistEntry {
  idea: Idea;
  score: Score | null;
  average: number | null;
}

/**
 * Construit la liste des entrées de shortlist, triée par moyenne
 * décroissante. Les idées non notées passent à la fin.
 * Ignore les IDs orphelins (idée supprimée ou CSV réimporté).
 */
export function buildShortlist(
  ids: string[],
  ideasById: Record<string, Idea>,
  scores: Record<string, Score>,
): ShortlistEntry[] {
  const entries: ShortlistEntry[] = [];

  for (const id of ids) {
    const idea = ideasById[id];
    if (!idea) continue;
    const score = scores[id] ?? null;
    entries.push({
      idea,
      score,
      average: score ? averageScore(score) : null,
    });
  }

  return entries.sort((a, b) => {
    const aAvg = a.average ?? -1;
    const bAvg = b.average ?? -1;
    if (bAvg !== aAvg) return bAvg - aAvg;
    return a.idea.id.localeCompare(b.idea.id);
  });
}