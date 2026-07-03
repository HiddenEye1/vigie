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

| Commande                             | Effet                                                     |
| :----------------------------------- | :-------------------------------------------------------- |
| `npm run check`                      | Lint + typecheck + tests sur tout le monorepo             |
| `npm run lint`                       | ESLint seul                                               |
| `npm run typecheck`                  | `tsc --noEmit` dans chaque workspace                      |
| `npm run test`                       | Tests (Vitest) dans chaque workspace                      |
| `npm run format`                     | Formatage Prettier                                        |
| `npm run dev --workspace @vigie/api` | Démarre l'API en développement (rechargement auto)        |
| `docker compose up -d`               | Démarre PostgreSQL local                                  |
| `docker compose down`                | Arrête PostgreSQL (les données persistent dans le volume) |

## Backend — API

Routes disponibles (Phases 1–2) :

- `GET /v1/health` — healthcheck.
- `POST /v1/analyze` — analyse d'un contenu suspect. Trois formes :
  - texte : JSON `{ kind: "text", content, device_id }` ;
  - lien : JSON `{ kind: "url", content, device_id }` — le backend suit les
    redirections (max 5), extrait titre/description (20 Ko max), calcule l'âge
    du domaine (RDAP, mis en cache) et vérifie la liste locale
    [official-domains.json](apps/api/src/data/official-domains.json) ;
  - capture d'écran : `multipart/form-data` avec `kind=image`, `device_id` et
    `image` (JPEG/PNG/WebP, 8 Mo max, type vérifié par nombres magiques —
    l'image est traitée en mémoire et jamais stockée).
    Erreurs : `400` (entrée invalide ou URL bloquée), `413` (image trop lourde),
    `429` (limite de requêtes), `503` (IA indisponible) — messages en français
    réutilisables tels quels dans l'app.
- `POST /v1/waitlist` — `{ email, device_id }` → `201` (validation stricte,
  dédoublonnage silencieux, date de consentement enregistrée).
- `POST /v1/event` — `{ name: "share_verdict", device_id }` → `204`.

Rate limiting : 10 analyses/heure et 30/jour par `device_id` **et** par IP
(configurable via `RATE_LIMIT_PER_HOUR` / `RATE_LIMIT_PER_DAY`).

### Sécurité anti-SSRF (analyse d'URL)

Toute URL soumise passe par [ssrf.ts](apps/api/src/security/ssrf.ts) :

- schémas `http(s)` et ports web uniquement, identifiants embarqués refusés ;
- IP privées, réservées, lien-local (métadonnées cloud), CGNAT, multicast,
  IPv6 ULA/mappées/NAT64 et `localhost` refusées — y compris à **chaque saut
  de redirection** ;
- le contrôle est ré-appliqué au moment de la connexion via un résolveur DNS
  personnalisé (dispatcher undici), ce qui neutralise le DNS rebinding ;
- lecture plafonnée à 20 Ko, contenu jamais exécuté, délai total 5 s.

### Base de données

PostgreSQL via Drizzle, utilisée **uniquement** pour : waitlist, télémétrie
anonyme (`request_id`, `device_id`, `kind`, verdict, catégorie, latence — jamais
de contenu), cache d'âge de domaine. Migrations SQL dans
[apps/api/migrations](apps/api/migrations), appliquées automatiquement au
démarrage. Sans base joignable, l'analyse fonctionne quand même (waitlist et
événements répondent 503).

> **Windows sans Docker** : PostgreSQL 16 peut être installé nativement
> (`winget install PostgreSQL.PostgreSQL.16`), puis créez le rôle et la base :
> `CREATE ROLE vigie LOGIN PASSWORD 'vigie_local_dev'; CREATE DATABASE vigie OWNER vigie;`

### Image Docker de production

```bash
docker build -f apps/api/Dockerfile -t vigie-api .
docker run --env-file .env -p 3000:3000 vigie-api
```

Multi-stage, exécution non-root, healthcheck intégré, bundle esbuild.

### Moteur d'analyse : l'interface `AIProvider`

L'appel au modèle est encapsulé derrière une interface unique
([provider.ts](apps/api/src/ai/provider.ts)) :

```ts
interface AIProvider {
  analyze(input: AnalyzeInput): Promise<AIVerdict>;
}
```

Deux implémentations, choisies par la variable d'environnement `MOCK_AI` :

- **`MockProvider`** (`MOCK_AI=true`, défaut en dev) — aucun appel réseau, aucune clé requise.
- **`AnthropicProvider`** (`MOCK_AI=false`) — appel réel à l'API Anthropic
  (`claude-sonnet-4-6`), sortie JSON stricte validée par Zod, 1 retry en cas de
  JSON invalide, sinon repli `INDETERMINE`. Testé avec appel mocké.

Brancher un autre fournisseur pour le calibrage = écrire une classe qui implémente
`AIProvider`, sans toucher au reste du code.

Les garde-fous s'appliquent **côté serveur, quel que soit le fournisseur** :

- `confidence < 0.5` → verdict dégradé en `INDETERMINE` (§4.2) ;
- injection de prompt détectée dans le contenu analysé → le verdict ne peut
  jamais être `PLUTOT_SUR` (suite de tests dédiée, §13).

### Mode mock (`MOCK_AI=true`)

Le `MockProvider` renvoie des verdicts réalistes et **déterministes** pour tester
l'UI dans tous ses états, selon le contenu soumis :

| Contenu contenant…                               | Verdict                                  | Catégorie                 |
| :----------------------------------------------- | :--------------------------------------- | :------------------------ |
| « colis », « Chronopost », « livraison »…        | ARNAQUE_PROBABLE                         | PHISHING_COLIS            |
| « banque », « conseiller », « compte bloqué »…   | ARNAQUE_PROBABLE                         | FAUX_CONSEILLER_BANCAIRE  |
| « impôts », « amende », « Ameli », « ANTAI »…    | SUSPECT                                  | PHISHING_ADMINISTRATION   |
| « crypto », « placement », « livret »…           | ARNAQUE_PROBABLE                         | INVESTISSEMENT_FRAUDULEUX |
| « Vinted », « Leboncoin »…                       | SUSPECT                                  | ARNAQUE_PETITES_ANNONCES  |
| « CPF », « compte formation »…                   | ARNAQUE_PROBABLE                         | FRAUDE_CPF_AIDES          |
| « Microsoft », « virus », « support technique »… | ARNAQUE_PROBABLE                         | FAUX_SUPPORT_TECHNIQUE    |
| moins de 15 caractères                           | INDETERMINE                              | AUCUNE                    |
| autre texte                                      | rotation déterministe sur les 4 verdicts | —                         |

## App mobile (Expo)

```bash
# Démarrer l'API (terminal 1) puis le bundler Expo (terminal 2) :
npm run dev --workspace @vigie/api
npm run start --workspace @vigie/mobile
# Scannez le QR code avec Expo Go (Android/iOS) sur le même réseau Wi-Fi.
```

- L'app détecte automatiquement l'adresse de l'API en développement (même
  machine que le bundler, port 3000). Pour un autre backend :
  `apps/mobile/.env` → `EXPO_PUBLIC_API_URL` (voir
  [apps/mobile/.env.example](apps/mobile/.env.example)).
- Écrans Phase 3 : Accueil → « Vérifier un message » (saisie/coller) →
  attente avec messages rotatifs → verdict §4.2 ; onglet Historique
  (100 % local, plafonné à 200 entrées, purge totale).
- Tests : `npm run test --workspace @vigie/mobile` (Jest + React Native
  Testing Library — rendu des 4 verdicts, navigation, store, client API).

## Variables d'environnement

Voir [.env.example](./.env.example) — copiez-le en `.env` et complétez.
Le fichier `.env` est ignoré par git : **aucun secret ne doit jamais être commité**.

## Suivi du projet

Les points reportés sont consignés dans [BACKLOG.md](./BACKLOG.md).
Le build suit le plan de phases du cahier des charges (§14) : Phase 0 (socle) →
Phase 5 (finitions).
