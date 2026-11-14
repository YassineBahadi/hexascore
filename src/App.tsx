// import './App.css';

import './styles/global.css';
export default function App() {
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
        </div>
      </header>

      <main className="app-main">
        <div className="empty-state">
          <h2 className="empty-state__title">
            Prêt à charger les idées
          </h2>
          <p className="empty-state__text">
            La prochaine étape affichera ici les 40 idées déposées par
            les collaborateurs Hexavia.
          </p>
        </div>
      </main>
    </div>
  );
}