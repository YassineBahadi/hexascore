import { describe, it, expect } from 'vitest';
import {
  emptyScore,
  isScoreStarted,
  isScoreComplete,
  averageScore,
  formatAverage,
  isScoreBlank,
} from '../src/lib/scores';

describe('emptyScore', () => {
  it('produit un score vierge', () => {
    const score = emptyScore('IDEA-001');
    expect(score.ideaId).toBe('IDEA-001');
    expect(score.impact).toBeNull();
    expect(score.faisabilite).toBeNull();
    expect(score.alignement).toBeNull();
    expect(score.innovation).toBeNull();
    expect(score.justification).toBe('');
    expect(score.suggestedByAi).toBe(false);
  });
});

describe('isScoreStarted', () => {
  it('faux si aucun critère noté', () => {
    expect(isScoreStarted(emptyScore('X'))).toBe(false);
  });
  it('vrai dès un critère noté', () => {
    const score = { ...emptyScore('X'), impact: 3 };
    expect(isScoreStarted(score)).toBe(true);
  });
});

describe('isScoreComplete', () => {
  it('faux si partiel', () => {
    const score = { ...emptyScore('X'), impact: 3, faisabilite: 4 };
    expect(isScoreComplete(score)).toBe(false);
  });
  it('vrai si les 4 critères notés', () => {
    const score = {
      ...emptyScore('X'),
      impact: 3, faisabilite: 4, alignement: 5, innovation: 2,
    };
    expect(isScoreComplete(score)).toBe(true);
  });
});

describe('averageScore', () => {
  it('retourne null si rien de noté', () => {
    expect(averageScore(emptyScore('X'))).toBeNull();
  });
  it('moyenne des critères notés uniquement', () => {
    const score = { ...emptyScore('X'), impact: 4, faisabilite: 2 };
    expect(averageScore(score)).toBe(3);
  });
  it('moyenne des 4 critères', () => {
    const score = {
      ...emptyScore('X'),
      impact: 4, faisabilite: 3, alignement: 4, innovation: 5,
    };
    expect(averageScore(score)).toBe(4);
  });
});

describe('formatAverage', () => {
  it('retourne un tiret sur null', () => {
    expect(formatAverage(null)).toBe('—');
  });
  it('affiche 1 décimale', () => {
    expect(formatAverage(3.5)).toBe('3.5');
    expect(formatAverage(4)).toBe('4.0');
  });
});

describe('isScoreBlank', () => {
  it('vrai si tout est vide', () => {
    expect(isScoreBlank(emptyScore('X'))).toBe(true);
  });
  it('faux si justification présente', () => {
    const score = { ...emptyScore('X'), justification: 'Note perso' };
    expect(isScoreBlank(score)).toBe(false);
  });
  it('faux si un critère noté', () => {
    expect(isScoreBlank({ ...emptyScore('X'), impact: 1 })).toBe(false);
  });
});