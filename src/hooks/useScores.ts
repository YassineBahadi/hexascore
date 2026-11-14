import { useCallback, useState } from 'react';
import type { Score } from '../types';
import { loadScores, saveScores } from '../storage';
import { isScoreBlank, isScoreStarted } from '../lib/scores';

/**
 * Gère l'ensemble des scores : chargement initial, mise à jour,
 * suppression, et persistance automatique dans localStorage.
 */
export function useScores() {
  const [scores, setScores] = useState<Record<string, Score>>(() =>
    loadScores(),
  );

  /**
   * Enregistre (ou met à jour) le score d'une idée.
   * Si le score est strictement vide (aucun critère, aucune justification),
   * on supprime l'entrée plutôt que de stocker du vide.
   */
  const upsert = useCallback((score: Score) => {
    setScores((prev) => {
      const next = { ...prev };
      if (isScoreBlank(score)) {
        delete next[score.ideaId];
      } else {
        next[score.ideaId] = { ...score, updatedAt: new Date().toISOString() };
      }
      saveScores(next);
      return next;
    });
  }, []);

  const remove = useCallback((ideaId: string) => {
    setScores((prev) => {
      if (!(ideaId in prev)) return prev;
      const next = { ...prev };
      delete next[ideaId];
      saveScores(next);
      return next;
    });
  }, []);

  const get = useCallback(
    (ideaId: string): Score | null => scores[ideaId] ?? null,
    [scores],
  );

  /** Nombre d'idées pour lesquelles au moins un critère est noté. */
  const startedCount = Object.values(scores).filter(isScoreStarted).length;

  return { scores, get, upsert, remove, startedCount };
}