import { useCallback, useMemo, useState } from 'react';
import { EMPTY_FILTERS, type Filters } from '../types';
import {  hasActiveFilters } from '../lib/filters';

export function useFilters() {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);

  const reset = useCallback(() => {
    setFilters(EMPTY_FILTERS);
  }, []);

  const isActive = useMemo(() => hasActiveFilters(filters), [filters]);

  return { filters, setFilters, reset, isActive };
}