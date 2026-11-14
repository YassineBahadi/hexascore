import type { ReactNode } from 'react';

import {
  formatBudgetEur,
  formatDateFr,
  parseBudget,
  parseDateToIso,
} from '../../lib/formatters';
import './IdeaTable.css';
import type { Idea } from '../../types';

interface IdeaTableProps {
  ideas: Idea[];
}

export function IdeaTable({ ideas }: IdeaTableProps) {
  if (ideas.length === 0) {
    return (
      <div className="empty-state">
        <h2 className="empty-state__title">Aucune idée à afficher</h2>
        <p className="empty-state__text">
          Le fichier a été chargé mais ne contient aucune idée valide.
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
          </tr>
        </thead>
        <tbody>
          {ideas.map((idea) => (
            <IdeaRow key={idea.id} idea={idea} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---------------------------------------------------------------- */

function IdeaRow({ idea }: { idea: Idea }) {
  const dateIso = parseDateToIso(idea.dateDepot);
  const budget = parseBudget(idea.budgetEstime);

  return (
    <tr>
      <td className="idea-cell--title">
        <div className="idea-title">{idea.titre}</div>
        <div className="idea-meta">
          <span className="idea-id">{idea.id}</span>
          {dateIso && (
            <span>Déposée le {formatDateFr(dateIso)}</span>
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