# HexaScore

[![CI](https://github.com/YassineBahadi/hexascore/actions/workflows/ci.yml/badge.svg)](https://github.com/YassineBahadi/hexascore/actions)

Outil de dépouillement du challenge innovation Hexavia, pour les consultants INSKIP.

## Aperçu

## 4. Fiabilisation

### Ce qui est testé et pourquoi

La logique métier est isolée dans `src/lib/` et testée avec **Vitest** (57 tests,
6 fichiers). L'objectif n'est pas la couverture à 100 %, mais de **figer les
comportements qui comptent** :

| Module | Tests | Ce qu'on protège |
|---|---|---|
| `formatters` | 17 | Parsing des dates hétérogènes (ISO + FR) et des budgets libres (`"40 000 €"`, `"15k"`, `"?"`, vide) |
| `filters` | 14 | Recherche insensible aux accents, sentinelle `__empty__`, combinaisons AND |
| `scores` | 10 | Moyenne calculée sur les critères notés seulement, distinction vide/partiel/complet |
| `duplicates` | 7 | Les **vrais doublons** du CSV : 002/014 (titre identique), 003/019 (assistant IA RH ~ chatbot RH), 017/018 (dictée vocale ~ copilote IA), transitivité, absence de faux positifs |
| `shortlist` | 4 | Tri par moyenne décroissante, nulls en fin, IDs orphelins ignorés |
| `exportCsv` | 5 | BOM UTF-8, séparateur `;`, échappement RFC 4180 des `"` et `;` |

**Ce qui n'est pas testé** (assumé) :
- Composants React (ScorePanel, DuplicatePanel, ShortlistPanel) : testés manuellement via QA, ajout de `@testing-library/react` en V1.5
- `src/storage/` : nécessite jsdom, déprioritisé en V1
- `aiSimulation` : déterministe et sans état, ses sorties sont validées par les tests d'intégration manuels

### La CI

`.github/workflows/ci.yml` lance à chaque `push` et `pull_request` sur `main` :

1. `npm ci` — installation reproductible
2. `npm test` — les 57 tests
3. `npm run build` — TypeScript strict + build Vite

**Statut** : ![CI](https://github.com/TON_USERNAME/hexascore/actions/workflows/ci.yml/badge.svg)

*(remplace `TON_USERNAME` par ton nom GitHub)*

### Limites connues

- Pas de test sur le rendu visuel — un composant peut régresser sans que la CI le voie
- Pas de test E2E (Playwright) — la session est d'une demi-journée, on ne rajoute pas Playwright
- L'export CSV utilise `;` (Excel FR) ; un utilisateur sur un Excel EN verra un seule colonne. Documenté dans le README section 5.

## Lancer l'outil

```bash
npm install
npm run dev
# → http://localhost:5173