import type { Idea, Score } from '../types';
import { averageScore } from './scores';
import { formatBudgetEur, parseBudget } from './formatters';

/** Séparateur point-virgule — convention Excel FR. */
const SEPARATOR = ';';

/** BOM UTF-8 : sans ça, Excel mange les accents (Énergie -> Ã‰nergie). */
const BOM = '\uFEFF';

/** Fin de ligne RFC 4180 — CRLF, compatible Excel/LibreOffice. */
const EOL = '\r\n';

/**
 * Échappe un champ CSV : entoure de guillemets si le champ contient
 * un séparateur, un guillemet, un saut de ligne. Double les guillemets
 * internes (règle RFC 4180).
 */
function escapeField(value: string): string {
  const needsQuotes =
    value.includes(SEPARATOR) ||
    value.includes('"') ||
    value.includes('\n') ||
    value.includes('\r');
  if (!needsQuotes) return value;
  return `"${value.replace(/"/g, '""')}"`;
}

export interface ExportRow {
  idea: Idea;
  score: Score | null;
}

/**
 * Construit le contenu CSV de la shortlist.
 * Colonnes : identifiant, titre, auteur, direction, site, thème,
 * budget, 4 critères, moyenne, justification.
 */
export function buildShortlistCsv(rows: ExportRow[]): string {
  const headers = [
    'Identifiant',
    'Titre',
    'Auteur',
    'Direction',
    'Site',
    'Thème',
    'Budget',
    'Impact',
    'Faisabilité',
    'Alignement',
    'Innovation',
    'Moyenne',
    'Justification',
  ];

  const lines: string[] = [];
  lines.push(headers.map(escapeField).join(SEPARATOR));

  for (const { idea, score } of rows) {
    const budget = parseBudget(idea.budgetEstime);
    const avg = score ? averageScore(score) : null;

    const values = [
      idea.id,
      idea.titre,
      `${idea.prenom} ${idea.nom}`.trim(),
      idea.direction,
      idea.site,
      idea.theme,
      formatBudgetEur(budget, idea.budgetEstime),
      score?.impact?.toString() ?? '',
      score?.faisabilite?.toString() ?? '',
      score?.alignement?.toString() ?? '',
      score?.innovation?.toString() ?? '',
      avg !== null ? avg.toFixed(1) : '',
      score?.justification ?? '',
    ];

    lines.push(values.map(escapeField).join(SEPARATOR));
  }

  return BOM + lines.join(EOL);
}

/**
 * Déclenche le téléchargement du CSV dans le navigateur.
 * Nom de fichier daté pour éviter les collisions entre exports.
 */
export function downloadShortlistCsv(rows: ExportRow[]): void {
  const csv = buildShortlistCsv(rows);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  link.href = url;
  link.download = `shortlist-hexavia-${today}.csv`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}