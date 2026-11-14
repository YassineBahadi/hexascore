/**
 * Normaliseurs pour les données "sales" du CSV Hexavia.
 * Aucune dépendance à React : ces fonctions sont pures et testables.
 */

/* ---------------------------------------------------------------- */
/* DATES                                                             */
/* ---------------------------------------------------------------- */

/**
 * Convertit une date brute en ISO (YYYY-MM-DD).
 * Gère les deux formats présents dans le CSV :
 *  - "2026-09-15"  → déjà ISO
 *  - "03/10/2026"  → format FR
 * Retourne null si la date n'est pas reconnue.
 */
export function parseDateToIso(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  // Format ISO : YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  // Format FR : DD/MM/YYYY
  const frMatch = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (frMatch) {
    const [, day, month, year] = frMatch;
    return `${year}-${month}-${day}`;
  }

  return null;
}

/**
 * Affiche une date ISO au format français (DD/MM/YYYY).
 */
export function formatDateFr(iso: string | null): string {
  if (!iso) return '—';
  const parts = iso.split('-');
  if (parts.length !== 3) return iso;
  const [year, month, day] = parts;
  return `${day}/${month}/${year}`;
}

/* ---------------------------------------------------------------- */
/* BUDGETS                                                           */
/* ---------------------------------------------------------------- */

/**
 * Parse un budget en texte libre et retourne un nombre en euros,
 * ou null si non-parseable.
 *
 * Cas gérés (voir le CSV) :
 *   "40 000 €"     → 40000
 *   "15k€"         → 15000
 *   "15k"          → 15000
 *   "30 000 euros" → 30000
 *   "0"            → 0
 *   "?"            → null
 *   ""             → null
 */
export function parseBudget(raw: string): number | null {
  // 1. Nettoyage : on retire TOUS les espaces (y compris insécables)
  //    et on remplace la virgule décimale française par un point.
  const cleaned = raw.replace(/\s/g, '').replace(',', '.');

  if (!cleaned || cleaned === '?') return null;

  // 2. Format "k" : 15k€ / 15k / 15k euros
  const kMatch = cleaned.match(/^(\d+(?:\.\d+)?)k(?:€|euros?)?$/i);
  if (kMatch) {
    return Math.round(parseFloat(kMatch[1]) * 1000);
  }

  // 3. Format "plain" : 40000 / 40000€ / 40000 euros
  const plainMatch = cleaned.match(/^(\d+(?:\.\d+)?)(?:€|euros?)?$/i);
  if (plainMatch) {
    return parseFloat(plainMatch[1]);
  }

  return null;
}

/**
 * Affiche un budget de façon lisible pour l'UI.
 *  - Si parseable → format monétaire FR (ex: "40 000 €")
 *  - Sinon → on renvoie le texte brut ("?" par exemple), ou "—" si vide
 */
export function formatBudgetEur(value: number | null, raw: string): string {
  if (value !== null) {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(value);
  }
  const trimmed = raw.trim();
  return trimmed || '—';
}