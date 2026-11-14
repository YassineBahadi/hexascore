import { describe, it, expect } from 'vitest';
import {
  normalizeForSearch,
  filterIdeas,
  buildFilterOptions,
  hasEmptyValues,
  hasActiveFilters,
} from '../src/lib/filters';
import { EMPTY_FILTER, EMPTY_FILTERS } from '../src/types';
import { makeIdea } from './helpers';

describe('normalizeForSearch', () => {
  it('retire les accents', () => {
    expect(normalizeForSearch('Énergie')).toBe('energie');
  });
  it('met en minuscules', () => {
    expect(normalizeForSearch('ENERGIE')).toBe('energie');
  });
  it('trim et normalise les espaces', () => {
    expect(normalizeForSearch('  Énergie  ')).toBe('energie');
  });
});

describe('filterIdeas', () => {
  const ideas = [
    makeIdea({ id: 'A', direction: 'Maintenance', site: 'Lyon', theme: 'Énergie' }),
    makeIdea({ id: 'B', direction: 'RH', site: 'Siège', theme: '' }),
    makeIdea({ id: 'C', direction: 'Maintenance', site: 'Lille', theme: 'Process' }),
  ];

  it('retourne tout si aucun filtre', () => {
    expect(filterIdeas(ideas, EMPTY_FILTERS)).toHaveLength(3);
  });
  it('filtre par direction', () => {
    const result = filterIdeas(ideas, { ...EMPTY_FILTERS, direction: 'Maintenance' });
    expect(result.map((i) => i.id)).toEqual(['A', 'C']);
  });
  it('filtre les valeurs vides avec EMPTY_FILTER', () => {
    const result = filterIdeas(ideas, { ...EMPTY_FILTERS, theme: EMPTY_FILTER });
    expect(result.map((i) => i.id)).toEqual(['B']);
  });
  it('recherche dans titre, description, bénéfices, auteur', () => {
    const testIdeas = [
      makeIdea({ id: 'A', titre: 'Capteurs de vibration', description: 'sur les compresseurs' }),
      makeIdea({ id: 'B', titre: 'Café gratuit', description: 'dans les ateliers' }),
    ];
    const result = filterIdeas(testIdeas, { ...EMPTY_FILTERS, search: 'compresseur' });
    expect(result.map((i) => i.id)).toEqual(['A']);
  });
  it('la recherche est insensible aux accents', () => {
    const testIdeas = [
      makeIdea({ id: 'A', description: 'Réduction des coûts' }),
      makeIdea({ id: 'B', description: 'Autre chose' }),
    ];
    const result = filterIdeas(testIdeas, { ...EMPTY_FILTERS, search: 'reduction' });
    expect(result.map((i) => i.id)).toEqual(['A']);
  });
  it('combine les filtres avec AND', () => {
    const result = filterIdeas(ideas, {
      ...EMPTY_FILTERS,
      direction: 'Maintenance',
      site: 'Lyon',
    });
    expect(result.map((i) => i.id)).toEqual(['A']);
  });
});

describe('buildFilterOptions', () => {
  it('retourne des valeurs uniques triées', () => {
    const ideas = [
      makeIdea({ direction: 'Zeta' }),
      makeIdea({ direction: 'Alpha' }),
      makeIdea({ direction: 'Alpha' }),
    ];
    expect(buildFilterOptions(ideas, 'direction')).toEqual(['Alpha', 'Zeta']);
  });
  it('ignore les valeurs vides', () => {
    const ideas = [makeIdea({ theme: '' }), makeIdea({ theme: 'X' })];
    expect(buildFilterOptions(ideas, 'theme')).toEqual(['X']);
  });
});

describe('hasEmptyValues', () => {
  it('détecte la présence de valeurs vides', () => {
    expect(hasEmptyValues([makeIdea({ theme: '' })], 'theme')).toBe(true);
    expect(hasEmptyValues([makeIdea({ theme: 'X' })], 'theme')).toBe(false);
  });
});

describe('hasActiveFilters', () => {
  it('faux si aucun filtre', () => {
    expect(hasActiveFilters(EMPTY_FILTERS)).toBe(false);
  });
  it('vrai si search renseigné', () => {
    expect(hasActiveFilters({ ...EMPTY_FILTERS, search: 'x' })).toBe(true);
  });
  it('vrai si un select est renseigné', () => {
    expect(hasActiveFilters({ ...EMPTY_FILTERS, direction: 'X' })).toBe(true);
  });
});