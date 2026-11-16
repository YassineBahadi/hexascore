import { useMemo, useState } from 'react';
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
  const { filters, setFilters, reset, isActive } = useFilters();
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

  const totalIdeas = ideas.length;
  const progressPct = totalIdeas > 0 ? Math.round((startedCount / totalIdeas) * 100) : 0;
  const shortlistIsFull = shortlist.count >= SHORTLIST_TARGET;
  const shortlistIsNearFull = shortlist.count === SHORTLIST_TARGET - 1;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-30 bg-surface border-b border-border">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-3 lg:py-4">
          <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr_auto] items-center gap-3 lg:gap-8">
            {/* Brand */}
            <div>
              <h1 className="text-xl font-bold text-text tracking-tight leading-tight">
                HexaScore
              </h1>
              <p className="text-xs text-text-muted mt-0.5">
                Challenge innovation · <strong className="text-text font-semibold">Hexavia</strong>
              </p>
            </div>

            {/* Progression */}
            {state.status === 'success' && (
              <div
                className="hidden lg:flex flex-col gap-1 max-w-md w-full justify-self-center"
                role="progressbar"
                aria-valuenow={startedCount}
                aria-valuemin={0}
                aria-valuemax={totalIdeas}
                aria-label="Progression de la notation"
              >
                <div className="flex justify-between items-baseline text-xs">
                  <span className="text-text-muted font-semibold uppercase tracking-wider">
                    Progression
                  </span>
                  <span className="text-text font-semibold tabular-nums">
                    {startedCount} / {totalIdeas} · {progressPct}%
                  </span>
                </div>
                <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-purple-600 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
            )}

            {/* Actions */}
            {state.status === 'success' && (
              <div className="flex gap-2 items-center justify-end">
                <button
                  type="button"
                  onClick={() => setShowDuplicates(true)}
                  disabled={duplicateGroups.length === 0}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium border border-border bg-surface text-text-muted hover:bg-surface-2 hover:text-text transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  <span aria-hidden="true">⚠</span>
                  <span>
                    {duplicateGroups.length} doublon{duplicateGroups.length > 1 ? 's' : ''}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowShortlist(true)}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                    shortlistIsFull
                      ? 'bg-warning text-white hover:bg-warning/90'
                      : shortlistIsNearFull
                        ? 'bg-warning text-white hover:bg-warning/90'
                        : 'bg-primary text-white hover:bg-primary-hover'
                  }`}
                >
                  <span aria-hidden="true">★</span>
                  <span>
                    {shortlistIsFull
                      ? `Complète · ${shortlist.count}/${SHORTLIST_TARGET}`
                      : `Shortlist · ${shortlist.count}/${SHORTLIST_TARGET}`}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 lg:px-8 py-6 lg:py-8">
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