import { useMemo } from 'react';
import './App.css';
import { useIdeas } from './hooks/useIdeas';
import { useFilters } from './hooks/useFilters';
import { filterIdeas } from './lib/filters';
import { IdeaTable } from './components/IdeaTable/IdeaTable';
import { FilterBar } from './components/FilterBar/FilterBar';
import { LoadingState } from './components/LoadingState';
import { ErrorState } from './components/ErrorState';

export default function App() {
  const state = useIdeas();
  const { filters, setFilters, reset, isActive } = useFilters();

  const ideas = state.status === 'success' ? state.ideas : [];

  // useMemo : inutile sur 40 idées, mais c'est le bon réflexe à avoir
  // dès qu'on filtre. Ça évite de recalculer à chaque render du parent.
  const filteredIdeas = useMemo(
    () => filterIdeas(ideas, filters),
    [ideas, filters],
  );

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header__inner">
          <div>
            <h1 className="app-title">HexaScore</h1>
            <p className="app-subtitle">
              Dépouillement du challenge innovation Hexavia
            </p>
          </div>
          {state.status === 'success' && (
            <div className="app-header__meta">
              {isActive
                ? `${filteredIdeas.length} / ${state.ideas.length} idées`
                : `${state.ideas.length} idées`}
            </div>
          )}
        </div>
      </header>

      <main className="app-main">
        {state.status === 'loading' && <LoadingState />}
        {state.status === 'error' && <ErrorState message={state.message} />}
        {state.status === 'success' && (
          <>
            <FilterBar
              ideas={state.ideas}
              filters={filters}
              onChange={setFilters}
              onReset={reset}
              resultCount={filteredIdeas.length}
            />
            <IdeaTable ideas={filteredIdeas} />
          </>
        )}
      </main>
    </div>
  );
}