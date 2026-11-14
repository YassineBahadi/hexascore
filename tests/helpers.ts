import type { Idea } from '../src/types';

/**
 * Construit une Idea avec des valeurs par défaut.
 * On ne remplit que ce dont chaque test a besoin.
 */
export function makeIdea(overrides: Partial<Idea> = {}): Idea {
  return {
    id: 'IDEA-000',
    dateDepot: '2026-09-15',
    prenom: 'Test',
    nom: 'User',
    direction: 'Direction A',
    site: 'Site A',
    theme: 'Thème A',
    titre: 'Titre test',
    description: 'Description test',
    beneficesAttendus: 'Bénéfices test',
    budgetEstime: '0 €',
    ...overrides,
  };
}