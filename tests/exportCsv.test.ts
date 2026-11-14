import { describe, it, expect } from 'vitest';
import { buildShortlistCsv } from '../src/lib/exportCsv';
import { emptyScore } from '../src/lib/scores';
import { makeIdea } from './helpers';

describe('buildShortlistCsv', () => {
  it('commence par le BOM UTF-8', () => {
    const csv = buildShortlistCsv([]);
    expect(csv.charAt(0)).toBe('\uFEFF');
  });

  it('utilise le point-virgule et des en-têtes FR', () => {
    const csv = buildShortlistCsv([]);
    const header = csv.replace(/^\uFEFF/, '').split('\r\n')[0];
    expect(header).toContain('Identifiant;Titre');
    expect(header).toContain('Moyenne');
    expect(header).toContain('Justification');
  });

  it('échappe les champs contenant un point-virgule', () => {
    const row = { idea: makeIdea({ titre: 'A; B' }), score: null };
    const csv = buildShortlistCsv([row]);
    expect(csv).toContain('"A; B"');
  });

  it('échappe les guillemets internes', () => {
    const row = { idea: makeIdea({ titre: 'A "B" C' }), score: null };
    const csv = buildShortlistCsv([row]);
    expect(csv).toContain('"A ""B"" C"');
  });

  it('inclut les 4 notes et la moyenne', () => {
    const score = {
      ...emptyScore('X'),
      impact: 4, faisabilite: 3, alignement: 5, innovation: 2,
      justification: 'Idée solide',
    };
    const row = { idea: makeIdea({ id: 'IDEA-X' }), score };
    const csv = buildShortlistCsv([row]);
    // Vérifie l'ordre des colonnes sur la ligne de données
    const dataLine = csv.replace(/^\uFEFF/, '').split('\r\n')[1];
    expect(dataLine).toContain('4;3;5;2;3.5');
    expect(dataLine).toContain('Idée solide');
  });
});