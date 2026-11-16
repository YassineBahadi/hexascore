import type { KeyboardEvent } from 'react';
import type { DuplicateGroup, Idea, Score } from '../../types';
import {
  formatBudgetEur,
  formatDateFr,
  parseBudget,
  parseDateToIso,
} from '../../lib/formatters';
import { averageScore, formatAverage, isScoreBlank } from '../../lib/scores';
import { findDuplicateGroup } from '../../lib/duplicates';
import { ScorePill } from './ScorePill';

interface IdeaTableProps {
  ideas: Idea[];
  scores: Record<string, Score>;
  duplicateGroups: DuplicateGroup[];
  shortlistIds: string[];
  onToggleShortlist: (ideaId: string) => void;
  onSelectIdea: (idea: Idea) => void;
}

export function IdeaTable({
  ideas,
  scores,
  duplicateGroups,
  shortlistIds,
  onToggleShortlist,
  onSelectIdea,
}: IdeaTableProps) {
  if (ideas.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border-strong bg-surface p-12 text-center">
        <h2 className="text-lg font-semibold text-text mb-2">Aucune idée à afficher</h2>
        <p className="text-sm text-text-muted max-w-md mx-auto">
          Aucune idée ne correspond aux filtres actifs. Modifie ou réinitialise
          les filtres pour en voir davantage.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile : card layout (< 1024px) — FIX du bug critique */}
      <div className="lg:hidden flex flex-col gap-3">
        {ideas.map((idea) => (
          <IdeaCard
            key={idea.id}
            idea={idea}
            score={scores[idea.id] ?? null}
            duplicateGroup={findDuplicateGroup(idea.id, duplicateGroups)}
            isInShortlist={shortlistIds.includes(idea.id)}
            onToggleShortlist={onToggleShortlist}
            onSelect={onSelectIdea}
          />
        ))}
      </div>

      {/* Desktop : table layout (≥ 1024px) */}
      <div className="hidden lg:block rounded-lg border border-border bg-surface shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-2 border-b border-border">
              <tr>
                <th scope="col" className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Idée
                </th>
                <th scope="col" className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider w-40">
                  Auteur
                </th>
                <th scope="col" className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider w-32">
                  Direction
                </th>
                <th scope="col" className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider w-24">
                  Site
                </th>
                <th scope="col" className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider w-32">
                  Thème
                </th>
                <th scope="col" className="text-right px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider w-28">
                  Budget
                </th>
                <th scope="col" className="text-right px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider w-28">
                  Note
                </th>
                <th scope="col" className="text-center px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider w-16">
                  ★
                </th>
              </tr>
            </thead>
            <tbody>
              {ideas.map((idea) => (
                <IdeaRow
                  key={idea.id}
                  idea={idea}
                  score={scores[idea.id] ?? null}
                  duplicateGroup={findDuplicateGroup(idea.id, duplicateGroups)}
                  isInShortlist={shortlistIds.includes(idea.id)}
                  onToggleShortlist={onToggleShortlist}
                  onSelect={onSelectIdea}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

/* ================================================================ */
/* DESKTOP ROW                                                       */
/* ================================================================ */

interface RowProps {
  idea: Idea;
  score: Score | null;
  duplicateGroup: DuplicateGroup | null;
  isInShortlist: boolean;
  onToggleShortlist: (ideaId: string) => void;
  onSelect: (idea: Idea) => void;
}

function IdeaRow({
  idea,
  score,
  duplicateGroup,
  isInShortlist,
  onToggleShortlist,
  onSelect,
}: RowProps) {
  const dateIso = parseDateToIso(idea.dateDepot);
  const budget = parseBudget(idea.budgetEstime);
  const hasScore = score !== null && !isScoreBlank(score);

  const otherIds = duplicateGroup
    ? duplicateGroup.ideaIds.filter((id) => id !== idea.id)
    : [];

  const handleKey = (e: KeyboardEvent<HTMLTableRowElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(idea);
    }
  };

  return (
    <tr
      tabIndex={0}
      role="button"
      aria-label={`Noter ${idea.titre}`}
      onClick={() => onSelect(idea)}
      onKeyDown={handleKey}
      className={`group border-b border-border last:border-b-0 cursor-pointer transition-colors hover:bg-surface-2 ${
        isInShortlist ? 'bg-primary-soft' : ''
      }`}
    >
      <td className="px-4 py-3 align-top">
        <div className="text-[15px] font-semibold text-text leading-snug truncate max-w-md">
          {idea.titre}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-text-muted">
          <span className="font-mono text-text-subtle whitespace-nowrap">{idea.id}</span>
          {dateIso && (
            <>
              <span aria-hidden="true">·</span>
              <span className="whitespace-nowrap">{formatDateFr(dateIso)}</span>
            </>
          )}
          {duplicateGroup && otherIds.length > 0 && (
            <span
              className="inline-flex items-center gap-1 rounded-sm bg-warning-soft text-warning px-1.5 py-0.5 font-medium whitespace-nowrap"
              title={`Doublon probable de : ${otherIds.join(', ')}`}
            >
              ⚠ Doublon · {otherIds.join(', ')}
            </span>
          )}
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-text-muted truncate">
        {idea.prenom} {idea.nom}
      </td>
      <td className="px-4 py-3">
        <span className="inline-block rounded-sm bg-bg px-2 py-0.5 text-xs text-text-muted border border-border whitespace-nowrap">
          {idea.direction || '—'}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className="inline-block rounded-sm bg-bg px-2 py-0.5 text-xs text-text-muted border border-border whitespace-nowrap">
          {idea.site || '—'}
        </span>
      </td>
      <td className="px-4 py-3">
        {idea.theme ? (
          <span className="inline-block rounded-sm bg-primary-soft text-primary-hover px-2 py-0.5 text-xs font-medium whitespace-nowrap">
            {idea.theme}
          </span>
        ) : (
          <span className="text-text-subtle text-xs">—</span>
        )}
      </td>
      <td className="px-4 py-3 text-right text-sm text-text tabular-nums whitespace-nowrap">
        {formatBudgetEur(budget, idea.budgetEstime)}
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-2">
          <ScorePill score={score} />
          <span
            className={`text-xs font-medium text-primary whitespace-nowrap transition-opacity ${
              hasScore ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'
            }`}
          >
            {hasScore ? 'Modifier' : 'Noter'}
          </span>
        </div>
      </td>
      <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleShortlist(idea.id);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') e.stopPropagation();
          }}
          aria-pressed={isInShortlist}
          aria-label={
            isInShortlist
              ? `Retirer ${idea.titre} de la shortlist`
              : `Ajouter ${idea.titre} à la shortlist`
          }
          className={`w-9 h-9 rounded-full flex items-center justify-center text-base transition-colors ${
            isInShortlist
              ? 'bg-primary text-white border border-primary hover:bg-primary-hover'
              : 'bg-surface text-text-subtle border border-border-strong hover:border-primary hover:text-primary'
          }`}
        >
          {isInShortlist ? '★' : '☆'}
        </button>
      </td>
    </tr>
  );
}

/* ================================================================ */
/* MOBILE CARD                                                       */
/* ================================================================ */

interface CardProps {
  idea: Idea;
  score: Score | null;
  duplicateGroup: DuplicateGroup | null;
  isInShortlist: boolean;
  onToggleShortlist: (ideaId: string) => void;
  onSelect: (idea: Idea) => void;
}

function IdeaCard({
  idea,
  score,
  duplicateGroup,
  isInShortlist,
  onToggleShortlist,
  onSelect,
}: CardProps) {
  const dateIso = parseDateToIso(idea.dateDepot);
  const budget = parseBudget(idea.budgetEstime);
  const hasScore = score !== null && !isScoreBlank(score);
  const avg = score ? averageScore(score) : null;

  const otherIds = duplicateGroup
    ? duplicateGroup.ideaIds.filter((id) => id !== idea.id)
    : [];

  return (
    <div className="rounded-lg border border-border bg-surface shadow-card overflow-hidden">
      <button
        type="button"
        onClick={() => onSelect(idea)}
        className="w-full text-left p-4 hover:bg-surface-2 transition-colors"
      >
        <h3 className="text-[15px] font-semibold text-text leading-snug mb-2 line-clamp-2">
          {idea.titre}
        </h3>
        <div className="flex flex-wrap items-center gap-2 text-xs text-text-muted mb-2">
          <span className="font-mono text-text-subtle whitespace-nowrap">{idea.id}</span>
          {dateIso && (
            <>
              <span aria-hidden="true">·</span>
              <span className="whitespace-nowrap">{formatDateFr(dateIso)}</span>
            </>
          )}
          {duplicateGroup && otherIds.length > 0 && (
            <span className="inline-flex items-center gap-1 rounded-sm bg-warning-soft text-warning px-1.5 py-0.5 font-medium whitespace-nowrap">
              ⚠ Doublon
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-text-muted mb-2">
          <span>{idea.prenom} {idea.nom}</span>
          {idea.direction && (
            <>
              <span aria-hidden="true">·</span>
              <span>{idea.direction}</span>
            </>
          )}
          {idea.site && (
            <>
              <span aria-hidden="true">·</span>
              <span>{idea.site}</span>
            </>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {idea.theme && (
            <span className="inline-block rounded-sm bg-primary-soft text-primary-hover px-2 py-0.5 font-medium">
              {idea.theme}
            </span>
          )}
          <span className="text-text-muted tabular-nums">
            {formatBudgetEur(budget, idea.budgetEstime)}
          </span>
        </div>
      </button>

      <div className="flex items-center gap-2 px-4 pb-4 pt-2 border-t border-border">
        <button
          type="button"
          onClick={() => onSelect(idea)}
          className="flex-1 min-h-[44px] rounded-md bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors flex items-center justify-center gap-2"
        >
          {hasScore ? (
            <>
              <span>Modifier la note</span>
              <ScorePill score={score} />
            </>
          ) : (
            <>Noter cette idée</>
          )}
        </button>
        <button
          type="button"
          onClick={() => onToggleShortlist(idea.id)}
          aria-pressed={isInShortlist}
          aria-label={
            isInShortlist
              ? `Retirer ${idea.titre} de la shortlist`
              : `Ajouter ${idea.titre} à la shortlist`
          }
          className={`min-w-[44px] min-h-[44px] rounded-md flex items-center justify-center text-lg transition-colors ${
            isInShortlist
              ? 'bg-primary text-white border border-primary'
              : 'bg-surface text-text-subtle border border-border-strong hover:border-primary hover:text-primary'
          }`}
        >
          {isInShortlist ? '★' : '☆'}
        </button>
      </div>
    </div>
  );
}