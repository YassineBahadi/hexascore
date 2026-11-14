import type { Idea } from '../types';

/**
 * Suggestion de notation produite par la simulation IA.
 * Interface volontairement identique à ce que produirait un vrai modèle,
 * pour que le branchement futur soit transparent.
 */
export interface AiSuggestion {
  impact: number;
  faisabilite: number;
  alignement: number;
  innovation: number;
  justification: string;
}

/** Délai artificiel pour imiter un appel réseau (ms). */
const SIMULATED_LATENCY_MS = 550;

/* ---------------------------------------------------------------- */
/* BANQUES DE MOTS-CLÉS                                              */
/* ---------------------------------------------------------------- */

const IMPACT_KEYWORDS = [
  'économi', 'gagn', 'rédui', 'diminu', 'baisse', 'producti',
  'temps', 'arrêt', 'coût', 'co2', 'sécurité', 'accident',
  '%', 'jour', 'heure', 'recurrent', 'récurrent',
];

const FEASIBILITY_NEGATIVE_KEYWORDS = [
  'ia ', 'intelligence artificielle', 'réalité augmentée', 'digital twin',
  'exosquelette', 'caméra', 'capteur', 'photovolta', 'jumeau numérique',
  'algorithme', 'modèle',
];

const INNOVATION_KEYWORDS = [
  'ia', 'intelligence artificielle', 'digital twin', 'réalité augmentée',
  'exosquelette', 'capteur', 'prédicti', 'photovolta', 'jumeau numérique',
  'algorithme', 'modèle', 'automatique', 'connecté',
];

const ALIGNMENT_KEYWORDS = [
  'sécurité', 'environnement', 'énergie', 'co2', 'carbone',
  'maintenance prédictive', 'production', 'qualité', 'lean',
];

/* ---------------------------------------------------------------- */
/* UTILITAIRES INTERNES                                              */
/* ---------------------------------------------------------------- */

/** Compte les mots-clés d'une liste présents dans un texte (case-insensitive). */
function countKeywords(text: string, keywords: string[]): number {
  const haystack = text.toLowerCase();
  return keywords.reduce(
    (acc, kw) => (haystack.includes(kw.toLowerCase()) ? acc + 1 : acc),
    0,
  );
}

/** Clamp dans [1, 5] et arrondi à l'entier. */
function clamp5(value: number): number {
  return Math.max(1, Math.min(5, Math.round(value)));
}

/** Extrait un budget numérique d'une chaîne libre ("40 000 €", "15k"...). */
function parseBudgetSafe(raw: string): number | null {
  const cleaned = raw.replace(/\s/g, '').replace(',', '.');
  if (!cleaned || cleaned === '?') return null;
  const kMatch = cleaned.match(/^(\d+(?:\.\d+)?)k(?:€|euros?)?$/i);
  if (kMatch) return parseFloat(kMatch[1]) * 1000;
  const plain = cleaned.match(/^(\d+(?:\.\d+)?)(?:€|euros?)?$/i);
  if (plain) return parseFloat(plain[1]);
  return null;
}

/* ---------------------------------------------------------------- */
/* SCORING PAR CRITÈRE                                               */
/* ---------------------------------------------------------------- */

function scoreImpact(idea: Idea): number {
  const text = `${idea.titre} ${idea.description} ${idea.beneficesAttendus}`;
  const keywordHits = countKeywords(text, IMPACT_KEYWORDS);
  const hasQuantifiedBenefit = /\d/.test(idea.beneficesAttendus);
  const descriptionLength = idea.description.length;

  let base = 2;
  base += Math.min(keywordHits, 3);          // +0 à +3 pour mots-clés
  if (hasQuantifiedBenefit) base += 1;        // bénéfice chiffré = signal fort
  if (descriptionLength > 150) base += 0.5;   // idée détaillée = probablement solide
  if (descriptionLength < 50) base -= 0.5;    // idée vague = impact incertain

  return clamp5(base);
}

function scoreFeasibility(idea: Idea): number {
  const text = `${idea.titre} ${idea.description}`;
  const techHits = countKeywords(text, FEASIBILITY_NEGATIVE_KEYWORDS);
  const budget = parseBudgetSafe(idea.budgetEstime);

  let base = 4;
  base -= Math.min(techHits, 2) * 0.75;       // technos complexes = -0.75 par hit
  if (budget !== null) {
    if (budget >= 200_000) base -= 1.5;       // > 200k = lourd
    else if (budget >= 100_000) base -= 1;    // 100-200k = significatif
    else if (budget >= 50_000) base -= 0.5;   // 50-100k = modéré
    else if (budget === 0) base += 0.5;       // gratuit = très faisable
  }

  return clamp5(base);
}

function scoreAlignment(idea: Idea): number {
  const text = `${idea.titre} ${idea.description} ${idea.beneficesAttendus}`;
  const keywordHits = countKeywords(text, ALIGNMENT_KEYWORDS);
  const directionBonus: Record<string, number> = {
    Production: 1.5,
    Maintenance: 1.5,
    QHSE: 1.5,
    'R&D': 1,
    'Supply chain': 1,
    IT: 0.5,
    RH: 0,
    Finance: 0,
    Commercial: 0,
  };

  let base = 2;
  base += Math.min(keywordHits, 2);            // +0 à +2
  base += directionBonus[idea.direction] ?? 0;

  return clamp5(base);
}

function scoreInnovation(idea: Idea): number {
  const text = `${idea.titre} ${idea.description}`;
  const keywordHits = countKeywords(text, INNOVATION_KEYWORDS);

  let base = 2;
  base += Math.min(keywordHits, 3);            // +0 à +3

  return clamp5(base);
}

/* ---------------------------------------------------------------- */
/* JUSTIFICATION TEXTUELLE                                           */
/* ---------------------------------------------------------------- */

function buildJustification(
  scores: Omit<AiSuggestion, 'justification'>,
): string {
  const fragments: string[] = [];

  if (scores.impact >= 4) {
    fragments.push(
      "l'impact est estimé élevé, porté par des bénéfices explicites et quantifiés",
    );
  } else if (scores.impact <= 2) {
    fragments.push(
      "l'impact direct sur l'activité semble limité au vu de la description",
    );
  }

  if (scores.faisabilite >= 4) {
    fragments.push(
      'la mise en œuvre paraît accessible techniquement et budgétairement',
    );
  } else if (scores.faisabilite <= 2) {
    fragments.push(
      'la réalisation demande des moyens techniques ou budgétaires significatifs',
    );
  }

  if (scores.innovation >= 4) {
    fragments.push(
      'le recours à des technologies récentes (IA, capteurs, simulateurs) tire le caractère innovant vers le haut',
    );
  } else if (scores.innovation <= 2) {
    fragments.push(
      "l'approche reste classique et s'appuie sur des solutions déjà éprouvées",
    );
  }

  if (fragments.length === 0) {
    fragments.push(
      "l'idée présente un profil équilibré sur les quatre critères de la grille",
    );
  }

  return `Suggestion basée sur l'analyse du texte, du budget et du rattachement de l'idée : ${fragments.join(' ; ')}. Note à valider ou corriger par le consultant.`;
}

/* ---------------------------------------------------------------- */
/* POINT D'ENTRÉE                                                    */
/* ---------------------------------------------------------------- */

/**
 * Génère une suggestion de notation pour une idée.
 * Simulation déterministe : aucune clé API, aucun appel réseau.
 * Le délai est artificiel pour imiter un vrai modèle.
 */
export async function suggestScore(idea: Idea): Promise<AiSuggestion> {
  const impact = scoreImpact(idea);
  const faisabilite = scoreFeasibility(idea);
  const alignement = scoreAlignment(idea);
  const innovation = scoreInnovation(idea);

  const justification = buildJustification(idea, {
    impact,
    faisabilite,
    alignement,
    innovation,
  });

  // Délai simulé, annulable par un AbortController si on veut être rigoureux
  // plus tard — pour la V1 un simple setTimeout suffit.
  await new Promise((resolve) => setTimeout(resolve, SIMULATED_LATENCY_MS));

  return { impact, faisabilite, alignement, innovation, justification };
}

/**
 * Point d'extension pour un futur appel réel.
 * Exposé uniquement pour documentation — non utilisé en V1.
 */
export function isRealAiEnabled(): boolean {
  // Vite expose les variables d'env commençant par VITE_ via import.meta.env.
  // En V1, on n'active JAMAIS le vrai modèle : la clé peut être présente,
  // on la détecte pour la suite mais on ne l'utilise pas.
  const key = import.meta.env.VITE_AI_API_KEY as string | undefined;
  return false && Boolean(key);
}