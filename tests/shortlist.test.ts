import { describe, it, expect } from 'vitest';
import { buildShortlist } from '../src/lib/shortlist';
import { emptyScore } from '../src/lib/scores';
import type { Score } from '../src/types';
import { makeIdea } from './helpers';

function fullScore(ideaId: string, value: number): Score {
  return {
    ...emptyScore(ideaId),
    impact: value, faisabilite: value, alignement: value, innovation: value,
  };
}

describe('buildShortlist', () => {
  it('trie par moyenne décroissante', () => {
    const ideasById = {
      A: makeIdea({ id: 'A' }),
      B: makeIdea({ id: 'B' }),
    };
    const scores = { A: fullScore('A', 5), B: fullScore('B', 2) };
    const entries = buildShortlist(['B', 'A'], ideasById, scores);
    expect(entries.map((e) => e.idea.id)).toEqual(['A', 'B']);
  });

  it('place les idées non notées en fin', () => {
    const ideasById = {
      A: makeIdea({ id: 'A' }),
      B: makeIdea({ id: 'B' }),
      C: makeIdea({ id: 'C' }),
    };
    const scores = { A: fullScore('A', 3), B: fullScore('B', 4) };
    const entries = buildShortlist(['C', 'A', 'B'], ideasById, scores);
    expect(entries.map((e) => e.idea.id)).toEqual(['B', 'A', 'C']);
  });

  it('ignore les IDs orphelins', () => {
    const ideasById = { A: makeIdea({ id: 'A' }) };
    const entries = buildShortlist(['A', 'GHOST'], ideasById, {});
    expect(entries).toHaveLength(1);
  });

  it('retourne [] si ids vide', () => {
    expect(buildShortlist([], {}, {})).toEqual([]);
  });
});