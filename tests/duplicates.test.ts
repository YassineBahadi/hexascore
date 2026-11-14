import { describe, it, expect } from 'vitest';
import { detectDuplicates } from '../src/lib/duplicates';
import { makeIdea } from './helpers';

describe('detectDuplicates', () => {
  it('retourne [] sur entrée vide ou unitaire', () => {
    expect(detectDuplicates([])).toEqual([]);
    expect(detectDuplicates([makeIdea()])).toEqual([]);
  });

  it('détecte les titres identiques + même direction', () => {
    const ideas = [
      makeIdea({
        id: 'IDEA-002',
        titre: 'Tableau de bord des retards fournisseurs',
        direction: 'Supply chain',
      }),
      makeIdea({
        id: 'IDEA-014',
        titre: 'Tableau de bord des retards fournisseurs',
        direction: 'Supply chain',
      }),
    ];
    const groups = detectDuplicates(ideas);
    expect(groups).toHaveLength(1);
    expect(groups[0].ideaIds).toEqual(['IDEA-002', 'IDEA-014']);
    expect(groups[0].confidence).toBeGreaterThanOrEqual(0.9);
  });

  it('détecte les paraphrases via concepts (chatbot ~ assistant IA RH)', () => {
    const ideas = [
      makeIdea({
        id: 'IDEA-003',
        titre: 'Assistant IA pour les questions RH',
        description:
          "Un assistant conversationnel qui répond aux questions courantes des salariés : congés, mutuelle.",
        direction: 'RH',
        theme: 'RH & bien-être',
      }),
      makeIdea({
        id: 'IDEA-019',
        titre: 'Chatbot RH',
        description:
          'Un robot qui répond aux questions des salariés sur la paie et les congés.',
        direction: 'RH',
        theme: 'RH & bien-être',
      }),
    ];
    const groups = detectDuplicates(ideas);
    expect(groups).toHaveLength(1);
  });

  it('détecte les paraphrases (dictée vocale ~ copilote IA rapports)', () => {
    const ideas = [
      makeIdea({
        id: 'IDEA-017',
        titre: "Copilote IA pour les rapports d'intervention",
        description: 'Les techniciens dictent leurs constats et une IA rédige le rapport.',
        direction: 'IT',
      }),
      makeIdea({
        id: 'IDEA-018',
        titre: 'Dictée vocale des comptes rendus',
        description: "Dicter son compte rendu d'intervention au lieu de le taper.",
        direction: 'Maintenance',
      }),
    ];
    const groups = detectDuplicates(ideas);
    expect(groups).toHaveLength(1);
  });

  it('ne remonte pas deux idées sans rapport', () => {
    const ideas = [
      makeIdea({
        id: 'IDEA-015',
        titre: 'Café gratuit',
        description: 'Rendre le café gratuit dans tous les ateliers.',
        direction: 'Production',
        theme: '',
      }),
      makeIdea({
        id: 'IDEA-025',
        titre: 'Ombrières solaires sur les parkings',
        description: "Couvrir les parkings d'ombrières photovoltaïques.",
        direction: 'QHSE',
        theme: 'Environnement',
      }),
    ];
    expect(detectDuplicates(ideas)).toHaveLength(0);
  });

  it('ne remonte pas deux idées avec un seul concept partagé', () => {
    const ideas = [
      makeIdea({
        id: 'A',
        titre: 'Récupération de la chaleur des fours',
        description: 'Chauffer les bureaux avec la chaleur perdue.',
        direction: 'QHSE',
        theme: 'Environnement',
      }),
      makeIdea({
        id: 'B',
        titre: 'Ombrières solaires sur les parkings',
        description: 'Couvrir les parkings de photovoltaïque.',
        direction: 'QHSE',
        theme: 'Environnement',
      }),
    ];
    expect(detectDuplicates(ideas)).toHaveLength(0);
  });

  it('regroupe par transitivité (A~B et B~C => 1 groupe)', () => {
    const ideas = [
      makeIdea({ id: 'A', titre: 'Chatbot RH', direction: 'RH' }),
      makeIdea({ id: 'B', titre: 'Assistant IA RH', direction: 'RH' }),
      makeIdea({ id: 'C', titre: 'Robot conversationnel RH', direction: 'RH' }),
    ];
    const groups = detectDuplicates(ideas);
    const allIds = groups.flatMap((g) => g.ideaIds);
    expect(new Set(allIds)).toEqual(new Set(['A', 'B', 'C']));
  });
});