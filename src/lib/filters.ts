import type { Idea, Filters } from '../types';
import { EMPTY_FILTER } from '../types';

/* ---------------------------------------------------------------- */
/* NORMALISATION POUR LA RECHERCHE                                   */
/* ---------------------------------------------------------------- */

/**
 * Prépare une chaîne pour la recherche : retire les accents, passe en
 * minuscules. Permet à "energie" de matcher "Énergie" ou "ENERGIE".
 */
export function normalizeForSearch(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/* ---------------------------------------------------------------- */
/* MATCHING D'UN CHAMP                                               */
/* ---------------------------------------------------------------- */

/**
 * Vérifie si une valeur de champ matche un filtre donné.
 * - filter vide → tout passe
 * - filter '__empty__' → seulement les valeurs vides
 * - filter X → seulement la valeur exacte X
 */
function matchesField(value: string, filter: string): boolean {
  if (!filter) return true;
  if (filter === EMPTY_FILTER) return value === '';
  return value === filter;
}

/* ---------------------------------------------------------------- */
/* FILTRAGE                                                          */
/* ---------------------------------------------------------------- */

/**
 * Retourne les idées qui passent TOUS les filtres actifs.
 * Fonction pure : aucune dépendance à React ni au DOM.
 */
export function filterIdeas(ideas: Idea[], filters: Filters): Idea[] {
  const search = normalizeForSearch(filters.search);

  return ideas.filter((idea) => {
    if (!matchesField(idea.direction, filters.direction)) return false;
    if (!matchesField(idea.site, filters.site)) return false;
    if (!matchesField(idea.theme, filters.theme)) return false;

    if (search) {
      const haystack = normalizeForSearch(
        [
          idea.titre,
          idea.description,
          idea.beneficesAttendus,
          idea.prenom,
          idea.nom,
        ].join(' '),
      );
      if (!haystack.includes(search)) return false;
    }

    return true;
  });
}

/* ---------------------------------------------------------------- */
/* OPTIONS DE FILTRE                                                 */
/* ---------------------------------------------------------------- */

export type FilterableField = 'direction' | 'site' | 'theme';

/**
 * Construit la liste triée des valeurs distinctes non vides pour un champ.
 * Utilise la locale française pour un tri alphabétique correct (accents).
 */
export function buildFilterOptions(
  ideas: Idea[],
  field: FilterableField,
): string[] {
  const seen = new Set<string>();
  for (const idea of ideas) {
    const value = idea[field];
    if (value) seen.add(value);
  }
  return Array.from(seen).sort((a, b) => a.localeCompare(b, 'fr'));
}

/**
 * Indique si au moins une idée a ce champ vide (pour afficher
 * l'option "Non renseigné" dans le select correspondant).
 */
export function hasEmptyValues(
  ideas: Idea[],
  field: FilterableField,
): boolean {
  return ideas.some((idea) => idea[field] === '');
}

/**
 * Vrai si au moins un filtre est actif (search non vide, ou un select
 * autre que "Tous"). Sert à activer/désactiver le bouton Réinitialiser.
 */
export function hasActiveFilters(filters: Filters): boolean {
  return (
    filters.search.trim() !== '' ||
    filters.direction !== '' ||
    filters.site !== '' ||
    filters.theme !== ''
  );
}