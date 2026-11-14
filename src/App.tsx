import { useMemo, useState } from 'react';
import './App.css';
import type { Idea } from './types';
import { useIdeas } from './hooks/useIdeas';
import { useFilters } from './hooks/useFilters';
import { useScores } from './hooks/useScores';
import { filterIdeas } from './lib/filters';
import { IdeaTable } from './components/IdeaTable/IdeaTable';
import { FilterBar } from './components/FilterBar/FilterBar';
import { LoadingState } from './components/LoadingState';
import { ErrorState } from './components/ErrorState';
import { ScorePanel } from './components/ScorePanel/ScorePanel';

export default function App() {
  const state = useIdeas();
  const { filters, setFilters, reset, isActive } = useFilters();
  const { scores, get, upsert, startedCount } = useScores();

  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);

  const ideas = state.status === 'success' ? state.ideas : [];

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
            <div className="app-header__badges">
              <div className="app-header__meta">
                {isActive
                  ? `${filteredIdeas.length} / ${state.ideas.length} idées`
                  : `${state.ideas.length} idées`}
              </div>
              <div className="app-header__meta app-header__meta--success">
                {startedCount} / {state.ideas.length} notées
              </div>
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
            <IdeaTable
              ideas={filteredIdeas}
              scores={scores}
              onSelectIdea={setSelectedIdea}
            />
          </>
        )}
      </main>

      {selectedIdea && (
        <ScorePanel
          idea={selectedIdea}
          initialScore={get(selectedIdea.id)}
          onSave={upsert}
          onClose={() => setSelectedIdea(null)}
        />
      )}
    </div>
  );
}