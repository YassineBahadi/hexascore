import { useCallback, useState } from 'react';
import { loadShortlist, saveShortlist } from '../storage';

/**
 * Gère la shortlist : sélection d'idées pour le jury.
 * Même pattern que useScores : state local + persistance auto.
 */
export function useShortlist() {
  const [ids, setIds] = useState<string[]>(() => loadShortlist());

  const toggle = useCallback((ideaId: string) => {
    setIds((prev) => {
      const next = prev.includes(ideaId)
        ? prev.filter((id) => id !== ideaId)
        : [...prev, ideaId];
      saveShortlist(next);
      return next;
    });
  }, []);

  const remove = useCallback((ideaId: string) => {
    setIds((prev) => {
      if (!prev.includes(ideaId)) return prev;
      const next = prev.filter((id) => id !== ideaId);
      saveShortlist(next);
      return next;
    });
  }, []);

  const has = useCallback(
    (ideaId: string) => ids.includes(ideaId),
    [ids],
  );

  return { ids, has, toggle, remove, count: ids.length };
}