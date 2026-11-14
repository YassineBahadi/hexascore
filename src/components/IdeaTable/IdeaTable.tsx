import type { KeyboardEvent, ReactNode } from 'react';
import type { DuplicateGroup, Idea, Score } from '../../types';
import {
  formatBudgetEur,
  formatDateFr,
  parseBudget,
  parseDateToIso,
} from '../../lib/formatters';
import { averageScore, formatAverage } from '../../lib/scores';
import { findDuplicateGroup } from '../../lib/duplicates';
import './IdeaTable.css';

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
      <div className="empty-state">
        <h2 className="empty-state__title">Aucune idée à afficher</h2>
        <p className="empty-state__text">
          Aucune idée ne correspond aux filtres actifs. Modifie ou
          réinitialise les filtres pour en voir davantage.
        </p>
      </div>
    );
  }

  return (
    <div className="idea-table-wrapper">
      <table className="idea-table">
        <thead>
          <tr>
            <th>Idée</th>
            <th>Auteur</th>
            <th>Direction</th>
            <th>Site</th>
            <th>Thème</th>
            <th>Budget</th>
            <th>Note</th>
            <th className="idea-cell--shortlist">Shortlist</th>
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
  );
}

/* ---------------------------------------------------------------- */

interface IdeaRowProps {
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
}: IdeaRowProps) {
  const dateIso = parseDateToIso(idea.dateDepot);
  const budget = parseBudget(idea.budgetEstime);
  const avg = score ? averageScore(score) : null;

  const otherIds = duplicateGroup
    ? duplicateGroup.ideaIds.filter((id) => id !== idea.id)
    : [];
  const duplicateTitle = otherIds.length
    ? `Doublon probable de : ${otherIds.join(', ')}`
    : undefined;

  const handleClick = () => onSelect(idea);
  const handleKey = (e: KeyboardEvent<HTMLTableRowElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(idea);
    }
  };

  return (
    <tr
      className={`idea-row${isInShortlist ? ' idea-row--selected' : ''}`}
      tabIndex={0}
      role="button"
      aria-label={`Noter ${idea.titre}`}
      onClick={handleClick}
      onKeyDown={handleKey}
    >
      <td className="idea-cell--title">
        <div className="idea-title">{idea.titre}</div>
        <div className="idea-meta">
          <span className="idea-id">{idea.id}</span>
          {dateIso && <span>Déposée le {formatDateFr(dateIso)}</span>}
          {duplicateGroup && (
            <span
              className="dup-badge"
              title={duplicateTitle}
              aria-label={duplicateTitle}
            >
              ⚠ Doublon
            </span>
          )}
        </div>
        <div className="idea-description">{idea.description}</div>
      </td>
      <td>
        {idea.prenom} {idea.nom}
      </td>
      <td>
        <Badge>{idea.direction || '—'}</Badge>
      </td>
      <td>
        <Badge>{idea.site || '—'}</Badge>
      </td>
      <td>
        {idea.theme ? (
          <Badge variant="theme">{idea.theme}</Badge>
        ) : (
          <span className="text-muted">—</span>
        )}
      </td>
      <td className="idea-cell--budget">
        {formatBudgetEur(budget, idea.budgetEstime)}
      </td>
      <td className="idea-cell--score">
        {avg !== null ? (
          <span className="score-badge score-badge--filled">
            {formatAverage(avg)} / 5
          </span>
        ) : (
          <span className="score-badge score-badge--empty">Noter</span>
        )}
      </td>
      <td
        className="idea-cell--shortlist"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className={`shortlist-btn${isInShortlist ? ' shortlist-btn--active' : ''}`}
          aria-pressed={isInShortlist}
          aria-label={
            isInShortlist
              ? `Retirer ${idea.titre} de la shortlist`
              : `Ajouter ${idea.titre} à la shortlist`
          }
          onClick={(e) => {
            e.stopPropagation();
            onToggleShortlist(idea.id);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.stopPropagation();
            }
          }}
        >
          {isInShortlist ? '✓' : '+'}
        </button>
      </td>
    </tr>
  );
}

/* ---------------------------------------------------------------- */

interface BadgeProps {
  children: ReactNode;
  variant?: 'theme';
}

function Badge({ children, variant }: BadgeProps) {
  const className = variant ? `badge badge--${variant}` : 'badge';
  return <span className={className}>{children}</span>;
}