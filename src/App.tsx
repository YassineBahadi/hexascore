import { useMemo, useState } from 'react';
import './App.css';
import type { Idea } from './types';
import { useIdeas } from './hooks/useIdeas';
import { useFilters } from './hooks/useFilters';
import { useScores } from './hooks/useScores';
import { useShortlist } from './hooks/useShortlist';
import { filterIdeas } from './lib/filters';
import { detectDuplicates } from './lib/duplicates';
import { buildShortlist } from './lib/shortlist';
import { IdeaTable } from './components/IdeaTable/IdeaTable';
import { FilterBar } from './components/FilterBar/FilterBar';
import { LoadingState } from './components/LoadingState';
import { ErrorState } from './components/ErrorState';
import { ScorePanel } from './components/ScorePanel/ScorePanel';
import { DuplicatesPanel } from './components/DuplicatesPanel/DuplicatesPanel';
import { ShortlistPanel } from './components/ShortlistPanel/ShortlistPanel';
import { Analytics } from '@vercel/analytics/react';

const SHORTLIST_TARGET = 8;

export default function App() {
  const state = useIdeas();
  const { filters, setFilters, reset } = useFilters();
  const { scores, get, upsert, startedCount } = useScores();
  const shortlist = useShortlist();

  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [showDuplicates, setShowDuplicates] = useState(false);
  const [showShortlist, setShowShortlist] = useState(false);

  const ideas = state.status === 'success' ? state.ideas : [];

  const filteredIdeas = useMemo(
    () => filterIdeas(ideas, filters),
    [ideas, filters],
  );

  const duplicateGroups = useMemo(() => detectDuplicates(ideas), [ideas]);

  const ideasById = useMemo(() => {
    const map: Record<string, Idea> = {};
    for (const idea of ideas) map[idea.id] = idea;
    return map;
  }, [ideas]);

  const shortlistEntries = useMemo(
    () => buildShortlist(shortlist.ids, ideasById, scores),
    [shortlist.ids, ideasById, scores],
  );

  const isShortlistOverTarget = shortlist.count > SHORTLIST_TARGET;

  return (
    <div className="app">
      <header className="app-header">
  <div className="app-header__inner">
    <div className="app-brand">
      <h1 className="app-title">HexaScore</h1>
      <p className="app-subtitle">
        Challenge innovation · <strong>Hexavia</strong>
      </p>
    </div>

    {state.status === 'success' && (
      <>
        <div className="app-progress">
          <div className="app-progress__header">
            <span className="app-progress__label">Progression</span>
            <span className="app-progress__value">
              {startedCount} / {state.ideas.length} notées
            </span>
          </div>
          <div className="app-progress__bar">
            <div
              className="app-progress__fill"
              style={{ width: `${(startedCount / state.ideas.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="app-actions">
          <button
            type="button"
            className="app-action app-action--secondary"
            onClick={() => setShowDuplicates(true)}
            disabled={duplicateGroups.length === 0}
          >
            <span className="app-action__icon">⚠</span>
            <span>
              {duplicateGroups.length} doublon{duplicateGroups.length > 1 ? 's' : ''}
            </span>
          </button>

          <button
            type="button"
            className={
              'app-action app-action--primary' +
              (isShortlistOverTarget ? ' app-action--warn' : '')
            }
            onClick={() => setShowShortlist(true)}
          >
            <span className="app-action__icon">★</span>
            <span>
              Shortlist · {shortlist.count}/{SHORTLIST_TARGET}
            </span>
          </button>
        </div>
      </>
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
              duplicateGroups={duplicateGroups}
              shortlistIds={shortlist.ids}
              onToggleShortlist={shortlist.toggle}
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

      {showDuplicates && (
        <DuplicatesPanel
          groups={duplicateGroups}
          ideasById={ideasById}
          onClose={() => setShowDuplicates(false)}
        />
      )}

      {showShortlist && (
        <ShortlistPanel
          entries={shortlistEntries}
          targetCount={SHORTLIST_TARGET}
          onRemove={shortlist.remove}
          onClose={() => setShowShortlist(false)}
        />
      )}
      <Analytics />
    </div>
  );
}