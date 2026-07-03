# Vigie — vérificateur d'arnaques

Application mobile (iOS + Android) qui aide le grand public français à identifier les
arnaques en ligne : on soumet un texte, une capture d'écran ou un lien suspect, et on
reçoit en quelques secondes un verdict clair, une explication pédagogique et des actions
concrètes.

Spécification complète : [cahier-des-charges-vigie-v1.md](./cahier-des-charges-vigie-v1.md).

## Architecture

```
vigie/
├── apps/
│   ├── mobile/          # App Expo (React Native) — initialisée en Phase 3
│   └── api/             # Backend Hono (Node.js + TypeScript)
├── packages/
│   └── shared/          # Types et schémas Zod partagés (verdict, etc.)
├── docker-compose.yml   # PostgreSQL local
└── README.md
```

- **App mobile** : Expo + Expo Router, TypeScript strict, Zustand + AsyncStorage.
- **Backend** : Hono + Drizzle + PostgreSQL. L'IA (API Anthropic, `claude-sonnet-4-6`)
  est appelée **exclusivement côté backend**.
- **Sécurité** : aucun secret dans le code ; tout passe par des variables d'environnement.

## Prérequis

- Node.js ≥ 22 (LTS)
- Docker Desktop (pour PostgreSQL local — requis à partir de la Phase 2)
- Une clé API Anthropic (requise à partir de la Phase 1)

## Démarrage rapide

```bash
# 1. Cloner et entrer dans le projet
git clone <url-du-repo> && cd vigie

# 2. Installer les dépendances (workspaces npm)
npm install

# 3. Créer le fichier d'environnement, puis remplir ANTHROPIC_API_KEY
cp .env.example .env

# 4. Démarrer PostgreSQL local
docker compose up -d

# 5. Vérifier que tout est vert (lint + typecheck + tests)
npm run check
```

## Commandes utiles

| Commande               | Effet                                                     |
| :--------------------- | :-------------------------------------------------------- |
| `npm run check`        | Lint + typecheck + tests sur tout le monorepo             |
| `npm run lint`         | ESLint seul                                               |
| `npm run typecheck`    | `tsc --noEmit` dans chaque workspace                      |
| `npm run test`         | Tests (Vitest) dans chaque workspace                      |
| `npm run format`       | Formatage Prettier                                        |
| `docker compose up -d` | Démarre PostgreSQL local                                  |
| `docker compose down`  | Arrête PostgreSQL (les données persistent dans le volume) |

## Variables d'environnement

Voir [.env.example](./.env.example) — copiez-le en `.env` et complétez.
Le fichier `.env` est ignoré par git : **aucun secret ne doit jamais être commité**.

## Suivi du projet

Les points reportés sont consignés dans [BACKLOG.md](./BACKLOG.md).
Le build suit le plan de phases du cahier des charges (§14) : Phase 0 (socle) →
Phase 5 (finitions).
