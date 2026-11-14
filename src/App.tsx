import './styles/global.css'

import { useIdeas } from './hooks/useIdeas';
import { IdeaTable } from './components/IdeaTable/IdeaTable';
import { LoadingState } from './components/LoadingState';
import { ErrorState } from './components/ErrorState';

export default function App() {
  const state = useIdeas();

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
              {state.ideas.length} idées
            </div>
          )}
        </div>
      </header>

      <main className="app-main">
        {state.status === 'loading' && <LoadingState />}
        {state.status === 'error' && <ErrorState message={state.message} />}
        {state.status === 'success' && <IdeaTable ideas={state.ideas} />}
      </main>
    </div>
  );
}