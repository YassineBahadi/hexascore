import { useEffect, useState } from 'react';
import { fetchIdeas } from '../lib/csv';
import type { Idea } from '../types';

/**
 * État de chargement des idées.
 * Union discriminée : le champ `status` détermine les champs présents.
 */
export type IdeasState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; ideas: Idea[] };

/**
 * Hook qui charge les idées depuis le CSV au montage du composant.
 * Retourne un état typé : loading, error, ou success.
 */
export function useIdeas(): IdeasState {
  const [state, setState] = useState<IdeasState>({ status: 'loading' });

  useEffect(() => {
    // Flag pour éviter de setState après démontage
    // (React 18 le gère mieux mais c'est une bonne hygiène)
    let cancelled = false;

    fetchIdeas()
      .then((ideas) => {
        if (!cancelled) {
          setState({ status: 'success', ideas });
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const message =
            err instanceof Error ? err.message : 'Erreur inconnue';
          setState({ status: 'error', message });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}