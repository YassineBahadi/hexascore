/**
 * Représente une idée telle que fournie dans le CSV.
 * Toutes les valeurs sont des strings car le CSV est un export brut
 * et imparfait (budgets en texte libre, thèmes parfois vides...).
 */
export interface Idea {
  id: string;
  dateDepot: string;
  prenom: string;
  nom: string;
  direction: string;
  site: string;
  theme: string;
  titre: string;
  description: string;
  beneficesAttendus: string;
  budgetEstime: string;
}

/**
 * Notation d'une idée sur la grille client.
 * Chaque critère va de 1 à 5, ou null si pas encore noté.
 */
export interface Score {
  ideaId: string;
  impact: number | null;
  faisabilite: number | null;
  alignement: number | null;
  innovation: number | null;
  justification: string;
  suggestedByAi: boolean;
  updatedAt: string;
}

/**
 * Un groupe d'idées considérées comme doublons probables.
 */
export interface DuplicateGroup {
  id: string;
  ideaIds: string[];
  confidence: number;
  reason: string;
}

/** Les 4 critères de la grille client. */
export type ScoreCriterion = 'impact' | 'faisabilite' | 'alignement' | 'innovation';

/** Libellés des critères, en français, pour l'UI. */
export const CRITERION_LABELS: Record<ScoreCriterion, string> = {
  impact: 'Impact entreprise',
  faisabilite: 'Faisabilité',
  alignement: 'Alignement stratégique',
  innovation: 'Caractère innovant',
};


/** État des filtres de la vue principale. '' = pas de filtre. */
export interface Filters {
  search: string;
  direction: string;
  site: string;
  theme: string;
}

/** Valeur sentinelle pour filtrer les idées au champ vide. */
export const EMPTY_FILTER = '__empty__';

/** État initial des filtres : aucun filtre actif. */
export const EMPTY_FILTERS: Filters = {
  search: '',
  direction: '',
  site: '',
  theme: '',
};