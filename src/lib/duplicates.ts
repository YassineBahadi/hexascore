import type { Idea, DuplicateGroup } from '../types';

/* ================================================================ */
/* NORMALISATION                                                     */
/* ================================================================ */

const STOPWORDS = new Set([
  'de', 'des', 'du', 'la', 'le', 'les', 'un', 'une', 'et', 'ou', 'en',
  'au', 'aux', 'sur', 'sous', 'pour', 'par', 'avec', 'dans', 'que',
  'qui', 'ce', 'cette', 'ces', 'son', 'sa', 'ses', 'notre', 'nos',
  'nous', 'vous', 'ils', 'elles', 'il', 'elle', 'est', 'sont', 'etre',
  'avoir', 'a', 'plus', 'moins', 'tres', 'tout', 'toute', 'tous',
  'toutes', 'on', 'y', 'ne', 'pas', 'se', 'si', 'aujourd', 'hui',
]);

/** Minuscule, sans accents, sans ponctuation, espaces normalisés. */
function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Tokens significatifs : length >= 2, hors stopwords. */
function tokenize(text: string): Set<string> {
  const tokens = normalize(text).split(/\s+/);
  const out = new Set<string>();
  for (const t of tokens) {
    if (t.length >= 2 && !STOPWORDS.has(t)) out.add(t);
  }
  return out;
}

/* ================================================================ */
/* SIMILARITÉ JACCARD                                                */
/* ================================================================ */

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  const union = a.size + b.size - inter;
  return union === 0 ? 0 : inter / union;
}

/* ================================================================ */
/* CONCEPTS MÉTIER                                                   */
/* ================================================================ */

/**
 * Dictionnaire de concepts du domaine industriel Hexavia.
 * Chaque concept liste les mots-clés qui l'activent (en forme normalisée).
 * Ajouter un concept = ajouter une ligne. Rien d'autre à changer.
 */
const CONCEPTS: Record<string, string[]> = {
  ia: [
    'ia', 'intelligence', 'artificielle', 'chatbot', 'assistant',
    'conversationnel', 'copilote', 'llm', 'algorithme', 'modele',
  ],
  rh: [
    'rh', 'ressources', 'humaines', 'salarie', 'salaries', 'paie',
    'conge', 'conges', 'mutuelle', 'embauche', 'recrutement', 'parrainage',
  ],
  covoiturage: [
    'covoiturage', 'trajet', 'trajets', 'voiture', 'vehicule',
    'vehicules', 'mobilite', 'domicile',
  ],
  capteurs: ['capteur', 'capteurs', 'vibration', 'connecte', 'connectes'],
  predictive: [
    'predictif', 'predictive', 'maintenance', 'panne', 'pannes',
    'usure', 'prevoir',
  ],
  energie: [
    'energie', 'energetique', 'carbone', 'co2', 'photovoltaique',
    'photovoltaiques', 'solaire', 'solaires', 'gaz', 'electricite',
    'chaleur', 'four', 'fours',
  ],
  securite: [
    'securite', 'accident', 'epi', 'casque', 'risque', 'consignation',
    'prevention',
  ],
  digital: [
    'digital', 'ecran', 'ecrans', 'tablette', 'tablettes', 'application',
    'applications', 'logiciel', 'numerique', 'app', 'smartphone',
  ],
  reporting: [
    'rapport', 'rapports', 'compte', 'comptes', 'rendu', 'rendus',
    'redaction', 'redige', 'rediger',
  ],
  dictee: ['dictee', 'dicter', 'dicte', 'dictent', 'vocal', 'vocale', 'voix'],
  process: [
    'process', 'kanban', 'lean', 'atelier', 'ateliers', 'ilots',
    'flux', 'reorganisation', 'reorganiser',
  ],
};

function detectConcepts(text: string): Set<string> {
  const tokens = new Set(normalize(text).split(/\s+/));
  const found = new Set<string>();
  for (const [concept, keywords] of Object.entries(CONCEPTS)) {
    if (keywords.some((kw) => tokens.has(kw))) found.add(concept);
  }
  return found;
}

/* ================================================================ */
/* SCORING D'UNE PAIRE                                               */
/* ================================================================ */

interface PairScore {
  confidence: number;
  reason: string;
}

function scorePair(a: Idea, b: Idea): PairScore | null {
  const titleA = normalize(a.titre);
  const titleB = normalize(b.titre);
  const sameDirection =
    a.direction !== '' && a.direction === b.direction;
  const sameTheme = a.theme !== '' && a.theme === b.theme;

  // --- Tier A : titres strictement identiques ---
  if (titleA === titleB && sameDirection) {
    return {
      confidence: 1.0,
      reason: 'Titres identiques et même direction',
    };
  }

  // --- Tier B : titres très proches (Jaccard) ---
  const titleSim = jaccard(tokenize(a.titre), tokenize(b.titre));
  if (titleSim > 0.7) {
    return {
      confidence: Math.min(0.95, 0.6 + titleSim * 0.35),
      reason: 'Titres très proches',
    };
  }

  // --- Tier C : contenu similaire (titres + descriptions) ---
  const descSim = jaccard(
    tokenize(a.description),
    tokenize(b.description),
  );
  if (titleSim > 0.4 && descSim > 0.4) {
    return {
      confidence: (titleSim + descSim) / 2,
      reason: 'Contenu similaire (titres et descriptions)',
    };
  }

  // --- Tier D : concepts métier communs (paraphrases) ---
  const conceptsA = detectConcepts(`${a.titre} ${a.description}`);
  const conceptsB = detectConcepts(`${b.titre} ${b.description}`);
  const shared = [...conceptsA].filter((c) => conceptsB.has(c));

  if (shared.length >= 2 && (sameDirection || sameTheme)) {
    // +0.05 par concept en plus des 2 premiers, plafonné à 0.75
    const confidence = Math.min(
      0.75,
      0.65 + Math.max(0, shared.length - 2) * 0.05,
    );
    return {
      confidence,
      reason: `Concepts communs : ${shared.join(', ')}`,
    };
  }

  return null;
}

/* ================================================================ */
/* REGROUPEMENT EN GROUPES CONNEXES                                  */
/* ================================================================ */

interface RawPair {
  aId: string;
  bId: string;
  confidence: number;
  reason: string;
}

/** Fusionne les paires qui partagent un id (composantes connexes). */
function groupPairs(pairs: RawPair[]): DuplicateGroup[] {
  const groups: Array<{
    ids: Set<string>;
    confidence: number;
    reasons: Set<string>;
  }> = [];

  for (const pair of pairs) {
    const target = groups.find(
      (g) => g.ids.has(pair.aId) || g.ids.has(pair.bId),
    );
    if (target) {
      target.ids.add(pair.aId);
      target.ids.add(pair.bId);
      target.confidence = Math.max(target.confidence, pair.confidence);
      target.reasons.add(pair.reason);
    } else {
      groups.push({
        ids: new Set([pair.aId, pair.bId]),
        confidence: pair.confidence,
        reasons: new Set([pair.reason]),
      });
    }
  }

  return groups.map((g, i) => ({
    id: `dup-${i + 1}`,
    ideaIds: Array.from(g.ids).sort(),
    confidence: Math.round(g.confidence * 100) / 100,
    reason: Array.from(g.reasons).join(' • '),
  }));
}

/* ================================================================ */
/* POINT D'ENTRÉE                                                    */
/* ================================================================ */

const MIN_CONFIDENCE = 0.6;

/**
 * Détecte les groupes de doublons dans une liste d'idées.
 * Complexité O(n²) — négligeable pour 40 idées, on réévaluera pour 1000+.
 */
export function detectDuplicates(ideas: Idea[]): DuplicateGroup[] {
  const pairs: RawPair[] = [];

  for (let i = 0; i < ideas.length; i++) {
    for (let j = i + 1; j < ideas.length; j++) {
      const score = scorePair(ideas[i], ideas[j]);
      if (score && score.confidence >= MIN_CONFIDENCE) {
        pairs.push({
          aId: ideas[i].id,
          bId: ideas[j].id,
          confidence: score.confidence,
          reason: score.reason,
        });
      }
    }
  }

  return groupPairs(pairs);
}

/**
 * Retourne l'idée du groupe de doublons auquel appartient `ideaId`,
 * ou null si l'idée n'est pas dans un groupe.
 */
export function findDuplicateGroup(
  ideaId: string,
  groups: DuplicateGroup[],
): DuplicateGroup | null {
  return groups.find((g) => g.ideaIds.includes(ideaId)) ?? null;
}