import Papa from 'papaparse';
import type { Idea } from '../types';

/** Forme brute d'une ligne du CSV (avant typage métier). */
interface RawCsvRow {
  id: string;
  date_depot: string;
  prenom: string;
  nom: string;
  direction: string;
  site: string;
  theme: string;
  titre: string;
  description: string;
  benefices_attendus: string;
  budget_estime: string;
}

/**
 * Parse le contenu texte d'un CSV Hexavia et retourne un tableau d'Idea.
 * Tolère les cellules vides et les lignes incomplètes.
 */
export function parseIdeasCsv(csvText: string): Idea[] {
  const result = Papa.parse<RawCsvRow>(csvText, {
    header: true,          // la première ligne contient les noms de colonnes
    delimiter: ';',        // séparateur spécifique Hexavia
    skipEmptyLines: true,  // ignore les lignes vides en fin de fichier
    transformHeader: (h) => h.trim(),
  });

  // Les erreurs de papaparse sont souvent bénignes (guillemets, etc.)
  // On les log en dev mais on ne bloque pas : mieux vaut afficher
  // 39 idées que 0.
  if (result.errors.length > 0) {
    console.warn('[csv] erreurs de parsing:', result.errors);
  }

  return result.data
    // On garde seulement les lignes qui ont au moins un id et un titre
    .filter((row) => row.id?.trim() && row.titre?.trim())
    .map((row): Idea => ({
      id: row.id.trim(),
      dateDepot: row.date_depot?.trim() ?? '',
      prenom: row.prenom?.trim() ?? '',
      nom: row.nom?.trim() ?? '',
      direction: row.direction?.trim() ?? '',
      site: row.site?.trim() ?? '',
      theme: row.theme?.trim() ?? '',
      titre: row.titre.trim(),
      description: row.description?.trim() ?? '',
      beneficesAttendus: row.benefices_attendus?.trim() ?? '',
      budgetEstime: row.budget_estime?.trim() ?? '',
    }));
}

/**
 * Charge le CSV des idées depuis les assets statiques.
 * Le fichier doit être présent dans public/data/idees_hexavia.csv
 */
export async function fetchIdeas(): Promise<Idea[]> {
  const response = await fetch('/data/idees_hexavia.csv');
  if (!response.ok) {
    throw new Error(
      `Impossible de charger les idées (code ${response.status}). ` +
        `Vérifie que le fichier public/data/idees_hexavia.csv existe.`,
    );
  }
  const text = await response.text();
  return parseIdeasCsv(text);
}