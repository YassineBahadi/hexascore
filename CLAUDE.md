# HexaScore — Instructions pour l'assistant IA

Ce fichier décrit le projet, les conventions et les patterns à respecter lorsque tu génères du code pour HexaScore. Lis-le avant chaque intervention.

## Contexte produit

HexaScore est un outil de dépouillement du challenge innovation Hexavia, développé pour les consultants INSKIP. L'utilisatrice principale, Camille, est consultante et non technicienne. L'outil doit être **évident**, rapide, en français, avec des messages d'erreur clairs.

## Stack

- **Vite + React 18 + TypeScript** (strict)
- **CSS pur** avec variables CSS (`src/styles/variables.css`)
- **papaparse** pour le CSV
- **localStorage** derrière `src/storage/` (abstraction pour brancher Supabase plus tard)
- **Vitest** pour les tests (à venir)
- **Vercel** pour le déploiement

**Ne jamais introduire :** Tailwind, CSS-in-JS, Redux, Next.js, Zustand, React Router, framer-motion. La V1 doit rester simple et lisible.

## Architecture

````text
src/
├── components/   # Composants React purs, un dossier par composant
├── hooks/        # Hooks custom (useIdeas, useFilters, useScores)
├── lib/          # Logique métier pure, sans React
├── storage/      # Persistance (localStorage en V1)
├── styles/       # variables.css + global.css
└── types/        # Toutes les interfaces TypeScript
````

**Règle d'or :** la logique métier (parsing CSV, scoring, filtres, doublons, simulation IA) va dans `src/lib/`. Elle est **pure**, **testable**, sans dépendance à React. Les composants **consomment** cette logique.

## Conventions de code

### Nommage

- Fichiers composants : `PascalCase.tsx` (ex. `ScorePanel.tsx`)
- Fichiers logique : `camelCase.ts` (ex. `aiSimulation.ts`)
- Hooks : `useXxx.ts` (ex. `useScores.ts`)
- CSS : colocalisé, même nom que le composant (ex. `ScorePanel.css`)
- Classes CSS : BEM simplifié (`.score-panel__title`, `.rating-btn--active`)

### TypeScript

- `strict: true` — pas de `any` implicite
- Préférer les **unions discriminées** pour les états (`{ status: 'loading' | ... }`)
- Typer les props avec `interface XxxProps`
- Ne jamais typer une fonction avec `: any` — chercher le vrai type

### React

- Composants **fonctionnels uniquement**, hooks
- Pas de `useEffect` pour ce qui peut être calculé au render
- `useCallback` pour les fonctions passées en props à des enfants
- `useMemo` **seulement** sur des calculs non triviaux (>100 itérations)
- Une **seule** source de vérité par état : un hook custom appelé **une fois** à la racine, propagé en props

### CSS

- Utiliser **toujours** les variables (`var(--color-primary)`, `var(--space-4)`)
- Jamais de couleur hardcodée sauf `#fff` sur bouton primaire
- Un fichier CSS par composant, importé en haut du `.tsx`
- Transitions sur `hover`/`focus` avec durée `0.15s`

### Commits

Format **Conventional Commits** :

- `feat: ...` — nouvelle fonctionnalité
- `fix: ...` — correction
- `docs: ...` — README, CLAUDE.md
- `test: ...` — ajout de tests
- `chore: ...` — setup, dépendances

Le corps du commit **explique le pourquoi**, pas le quoi.

Exemple : `feat: score blank is not stored (keeps 'notées' counter meaningful)`

## Patterns à respecter

### Persistance

Jamais d'appel direct à `localStorage` depuis un composant. Toujours passer par `src/storage/index.ts` (`loadScores`, `saveScores`).

### Hooks custom

Un hook custom = un `useState` interne. Il doit être appelé **une seule fois** à la racine de l'arbre (`App.tsx`), puis propagé en props. Sinon on a N copies désynchronisées.

### IA dans l'outil

La simulation est dans `src/lib/aiSimulation.ts`. Interface : `suggestScore(idea): Promise<AiSuggestion>`. Pour brancher un vrai modèle, on réécrit **uniquement** le corps de `suggestScore`, on garde la signature. Aucun composant ne doit savoir si c'est simulé ou réel.

## Ce que tu ne dois PAS faire

-  Ajouter des dépendances sans demander
-  Créer un `useState` là où un `useMemo` suffit
-  Mettre de la logique métier dans un composant React
-  Utiliser `console.log` (utiliser `console.warn` ou `console.error` si nécessaire)
-  Ignorer les cas d'erreur (toujours gérer `loading` + `error` + `empty`)
-  Réécrire un fichier entier pour changer 3 lignes — faire un patch ciblé
-  Utiliser `document.querySelector` — passer par les refs React
-  Stocker un secret en clair dans le code

## Comment je veux que tu m'aides

1. **Explique ton plan** avant de coder (5 lignes max)
2. **Attends ma validation** avant de créer plusieurs fichiers
3. **Un fichier à la fois**, pas un dump de 10 fichiers
4. **Commente uniquement le pourquoi** (les décisions), pas le comment
5. **Propose un test** pour chaque fonction métier que tu crées

## Ce que je veux voir dans tes réponses

- Les **types TypeScript** avant le code
- Les **cas limites** que tu as identifiés
- Les **alternatives** que tu as écartées et pourquoi