import { useMemo } from 'react';
import type { Idea, Filters } from '../../types';
import { EMPTY_FILTER } from '../../types';
import {
  buildFilterOptions,
  hasActiveFilters,
  hasEmptyValues,
  type FilterableField,
} from '../../lib/filters';
import './FilterBar.css';

interface FilterBarProps {
  ideas: Idea[];
  filters: Filters;
  onChange: (next: Filters) => void;
  onReset: () => void;
  resultCount: number;
}

export function FilterBar({
  ideas,
  filters,
  onChange,
  onReset,
  resultCount,
}: FilterBarProps) {
  const directionOptions = useMemo(() => buildFilterOptions(ideas, 'direction'), [ideas]);
  const siteOptions = useMemo(() => buildFilterOptions(ideas, 'site'), [ideas]);
  const themeOptions = useMemo(() => buildFilterOptions(ideas, 'theme'), [ideas]);

  const hasEmptyDirection = useMemo(() => hasEmptyValues(ideas, 'direction'), [ideas]);
  const hasEmptySite = useMemo(() => hasEmptyValues(ideas, 'site'), [ideas]);
  const hasEmptyTheme = useMemo(() => hasEmptyValues(ideas, 'theme'), [ideas]);

  const isActive = hasActiveFilters(filters);

  return (
    <div className="filter-bar" role="search" aria-label="Filtrer les idées">
      <FilterSelect
        label="Direction"
        field="direction"
        value={filters.direction}
        options={directionOptions}
        includeEmpty={hasEmptyDirection}
        onChange={(value) => onChange({ ...filters, direction: value })}
      />
      <FilterSelect
        label="Site"
        field="site"
        value={filters.site}
        options={siteOptions}
        includeEmpty={hasEmptySite}
        onChange={(value) => onChange({ ...filters, site: value })}
      />
      <FilterSelect
        label="Thème"
        field="theme"
        value={filters.theme}
        options={themeOptions}
        includeEmpty={hasEmptyTheme}
        onChange={(value) => onChange({ ...filters, theme: value })}
      />

      <div className="filter-bar__field filter-bar__search">
        <label className="filter-bar__label" htmlFor="filter-search">
          Recherche
        </label>
        <input
          id="filter-search"
          type="search"
          className="filter-bar__input"
          placeholder="Titre, description, bénéfice, auteur…"
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
        />
      </div>

      <div className="filter-bar__actions">
        <span className="filter-bar__count" aria-live="polite">
          <strong>{resultCount}</strong>
          <span className="filter-bar__count-sep"> / </span>
          {ideas.length} idées
        </span>
        <button
          type="button"
          className="filter-bar__reset"
          onClick={onReset}
          disabled={!isActive}
        >
          Réinitialiser
        </button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* SOUS-COMPOSANT                                                    */
/* ---------------------------------------------------------------- */

interface FilterSelectProps {
  label: string;
  field: FilterableField;
  value: string;
  options: string[];
  includeEmpty: boolean;
  onChange: (value: string) => void;
}

function FilterSelect({
  label,
  field,
  value,
  options,
  includeEmpty,
  onChange,
}: FilterSelectProps) {
  const id = `filter-${field}`;
  return (
    <div className="filter-bar__field">
      <label className="filter-bar__label" htmlFor={id}>
        {label}
      </label>
      <select
        id={id}
        className="filter-bar__select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Tous</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
        {includeEmpty && (
          <option value={EMPTY_FILTER}>Non renseigné</option>
        )}
      </select>
    </div>
  );
}