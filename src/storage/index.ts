import type { Score } from '../types';

/** Clé de stockage versionnée — le v1 permet une migration propre plus tard. */
const SCORES_KEY = 'hexascore:scores:v1';

/**
 * Teste si localStorage est utilisable (peut échouer en navigation privée
 * sur certains navigateurs ou si l'utilisateur a bloqué le stockage).
 */
function isLocalStorageAvailable(): boolean {
  try {
    const probe = '__hexascore_probe__';
    window.localStorage.setItem(probe, probe);
    window.localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

const STORAGE_AVAILABLE = isLocalStorageAvailable();

/**
 * Vérifie la forme minimale d'un score. Tolère les champs optionnels manquants
 * en les remplaçant par leurs valeurs par défaut. Si la structure est vraiment
 * cassée (pas un objet, ideaId manquant…), on rejette et on ignore l'entrée.
 */
function sanitizeScore(raw: unknown, expectedId?: string): Score | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const r = raw as Record<string, unknown>;

  const ideaId = typeof r.ideaId === 'string' ? r.ideaId : expectedId;
  if (!ideaId) return null;

  const num = (v: unknown): number | null =>
    typeof v === 'number' && v >= 1 && v <= 5 ? v : null;

  return {
    ideaId,
    impact: num(r.impact),
    faisabilite: num(r.faisabilite),
    alignement: num(r.alignement),
    innovation: num(r.innovation),
    justification: typeof r.justification === 'string' ? r.justification : '',
    suggestedByAi: typeof r.suggestedByAi === 'boolean' ? r.suggestedByAi : false,
    updatedAt:
      typeof r.updatedAt === 'string' ? r.updatedAt : new Date().toISOString(),
  };
}

/**
 * Charge tous les scores depuis localStorage.
 * Retourne un objet vide en cas de problème (storage indisponible,
 * JSON corrompu, structure cassée…) — on ne crash jamais.
 */
export function loadScores(): Record<string, Score> {
  if (!STORAGE_AVAILABLE) return {};
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(SCORES_KEY);
  } catch (err) {
    console.warn('[storage] lecture impossible :', err);
    return {};
  }
  if (!raw) return {};

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    console.warn('[storage] JSON corrompu, on ignore :', err);
    return {};
  }
  if (typeof parsed !== 'object' || parsed === null) return {};

  const out: Record<string, Score> = {};
  for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
    const clean = sanitizeScore(value, key);
    if (clean) out[key] = clean;
  }
  return out;
}

/**
 * Écrit tous les scores dans localStorage.
 * Silencieux en cas d'échec (quota, navigation privée…).
 */
export function saveScores(scores: Record<string, Score>): void {
  if (!STORAGE_AVAILABLE) return;
  try {
    window.localStorage.setItem(SCORES_KEY, JSON.stringify(scores));
  } catch (err) {
    console.warn('[storage] écriture impossible :', err);
  }
}

/** Exposé pour les tests (Vitest) — pas utilisé dans l'app. */
export const _internal = { SCORES_KEY };