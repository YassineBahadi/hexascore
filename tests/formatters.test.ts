import { describe, it, expect } from 'vitest';
import {
  parseDateToIso,
  formatDateFr,
  parseBudget,
  formatBudgetEur,
} from '../src/lib/formatters';

describe('parseDateToIso', () => {
  it('retourne une date ISO inchangée', () => {
    expect(parseDateToIso('2026-09-15')).toBe('2026-09-15');
  });
  it('convertit une date FR en ISO', () => {
    expect(parseDateToIso('03/10/2026')).toBe('2026-10-03');
  });
  it('retourne null si vide', () => {
    expect(parseDateToIso('')).toBeNull();
    expect(parseDateToIso('   ')).toBeNull();
  });
  it('retourne null sur format inconnu', () => {
    expect(parseDateToIso('15.09.2026')).toBeNull();
    expect(parseDateToIso('pas une date')).toBeNull();
  });
});

describe('formatDateFr', () => {
  it('convertit ISO en DD/MM/YYYY', () => {
    expect(formatDateFr('2026-09-15')).toBe('15/09/2026');
  });
  it('retourne un tiret sur null', () => {
    expect(formatDateFr(null)).toBe('—');
  });
});

describe('parseBudget', () => {
  it('parse "40 000 €"', () => {
    expect(parseBudget('40 000 €')).toBe(40000);
  });
  it('parse "15k€"', () => {
    expect(parseBudget('15k€')).toBe(15000);
  });
  it('parse "15k"', () => {
    expect(parseBudget('15k')).toBe(15000);
  });
  it('parse "30 000 euros"', () => {
    expect(parseBudget('30 000 euros')).toBe(30000);
  });
  it('parse "0" comme 0', () => {
    expect(parseBudget('0')).toBe(0);
  });
  it('retourne null sur "?"', () => {
    expect(parseBudget('?')).toBeNull();
  });
  it('retourne null si vide', () => {
    expect(parseBudget('')).toBeNull();
    expect(parseBudget('   ')).toBeNull();
  });
  it('retourne null si non-parsable', () => {
    expect(parseBudget('abc')).toBeNull();
  });
});

describe('formatBudgetEur', () => {
  it('formate en devise FR', () => {
    const result = formatBudgetEur(40000, '');
    // Intl.NumberFormat('fr-FR') utilise des espaces insécables variables.
    // On retire tous les espaces pour comparer les chiffres de manière fiable.
    expect(result.replace(/[\s\u00A0\u202F]/g, '')).toBe('40000€');
  });
  it('retourne la valeur brute si non-parsable', () => {
    expect(formatBudgetEur(null, '?')).toBe('?');
  });
  it('retourne un tiret si vide', () => {
    expect(formatBudgetEur(null, '')).toBe('—');
    expect(formatBudgetEur(null, '   ')).toBe('—');
  });
});