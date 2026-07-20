# Vigie — Audit de consolidation pour une V1 terrain

**Date :** 2026-07-15 · **Commit audité :** `9a9df29` (main) · **Nature :** audit de consolidation, aucune fonctionnalité ajoutée.

> Cet audit vérifie l'état **réel** du dépôt face aux fonctionnalités annoncées, repère les écarts, dettes et fragilités, et détermine ce qui manque pour tester Vigie **avec une vraie personne**.
> **Aucun code applicatif n'a été modifié.** Le seul fichier ajouté est ce document.

---

## A. Résumé exécutif

### ✅ Ce qui fonctionne (vérifié par exécution)

La base technique est **saine et solide**, bien au-delà d'un prototype :

| Contrôle                               | Résultat                          |
| -------------------------------------- | --------------------------------- |
| `eslint .`                             | **0 problème**                    |
| `tsc --noEmit` (api + mobile + shared) | **0 erreur**                      |
| Tests API (vitest)                     | **361 passés**                    |
| Tests mobile (jest-expo)               | **262 passés** / 44 suites        |
| Tests shared (vitest)                  | **23 passés**                     |
| `npm run check`                        | **vert**                          |
| `expo export --platform android`       | **succès** — bundle Hermes 5,1 Mo |

**646 tests au vert.** Signal fort : l'export de bundle réussit **hors Metro**, donc aucune dépendance cachée au serveur de développement — le code est packageable tel quel.

Fonctionnellement, **tout ce qui était annoncé existe réellement** : moteur de verdict enrichi et sa chaîne de 6 règles, 5 parcours proactifs, 4 voies d'analyse (texte/lien/capture/mail), détection locale de liens, Bouclier famille complet, Check-up sécurité complet (5 items, mode « Pour un proche »). Les garde-fous de confidentialité sont **réellement implémentés**, pas seulement documentés.

### 🟡 Ce qui est partiel

- **OCR / lecture de texte d'une capture** : toute la tuyauterie existe (`TextRecognizer`, `CaptureTextPanel`, tests), mais `getTextRecognizer()` renvoie **en dur** un fournisseur `available: false`. La voie est donc **inatteignable** aujourd'hui. Code volontairement préparé, mais mort en pratique.
- **Partage entrant (F10)** : `useIncomingShare` est câblé dans `_layout.tsx`, mais `expo-share-intent` est un module natif **absent d'Expo Go** → `require` protégé, fonctionnalité inerte.
- **Corpus d'évaluation** : 28 cas, mais **27 en texte et 1 seul en lien** — aucun cas image, aucun cas mail.
- **Rate limiting** : en mémoire (`Map`), donc **mono-instance** — suffisant en dev, fragile en cas de déploiement multi-instance.

### 🔵 Ce qui est mocké

- **Le moteur d'analyse tourne en mock par défaut.** `MOCK_AI=true` est la valeur documentée **et** la valeur du `.env` local, alors que `ANTHROPIC_API_KEY` est bien renseignée. `/v1/analyze` renvoie donc aujourd'hui des verdicts **déterministes du `MockProvider`** (34 scénarios par mots-clés), **pas de l'IA réelle**.
- Ce n'est **pas un bug** : c'est un choix de développement sain (gratuit, rapide, déterministe). Mais c'est une **décision structurante pour le test terrain** (voir §E et §F).

### 🔴 Ce qui est cassé

**Rien.** Aucun test en échec, aucune erreur de type, aucune erreur de lint, aucun `TODO`/`FIXME` en attente dans le code applicatif. Le dépôt est propre.

### ⚠️ Ce qui manque pour une V1 terrain

Deux sujets dominent, et ils sont **de nature produit/infra, pas de nature code** :

1. **L'API n'est pas joignable hors du poste de dev.** `apiBaseUrl()` retombe sur l'IP LAN de la machine qui sert Expo, port 3000. Il n'existe **aucun `apps/mobile/.env`** définissant `EXPO_PUBLIC_API_URL`. S'ajoutent les dépendances **PostgreSQL** et **CORS**. ⇒ **Un test chez la personne, hors de ton réseau, échoue sur le flux principal.** C'est le bloqueur n°1.
2. **Mock ou IA réelle : la décision n'est pas prise.** Tester en mock, c'est tester l'UX sans tester le moteur. Tester en réel, c'est fidèle mais introduit coût, latence et variabilité. Les deux sont défendables — il faut **choisir consciemment** et le documenter.

S'y ajoutent des manques mineurs mais utiles : **aucun mécanisme de remise à zéro pour une démo**, et **aucun jeu de messages factices versionné** dans le dépôt.

---

## B. Cartographie du dépôt

### Apps & packages

```
vigie/ (monorepo npm workspaces)
├── apps/api        @vigie/api      Hono + Drizzle + PostgreSQL
├── apps/mobile     @vigie/mobile   Expo SDK 57 + expo-router
├── packages/shared @vigie/shared   Contrats Zod partagés
├── fixtures/       corpus.json     28 cas d'évaluation
└── scripts/        eval.ts         Runner d'évaluation
```

**Scripts racine :** `lint`, `format`, `format:check`, `typecheck`, `test`, `check` (= lint + typecheck + test), `eval`.

### Responsabilités

| Zone                       | Responsabilité                                                                                                                                                                                |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/shared`          | Source de vérité des contrats : `verdict.ts` (verdict, confidence, catégorie, `url_analysis`), `verdict-extras.ts` (`risk_level`, `score`, `senior_summary`, `do_not`), `analyze-request.ts`. |
| `apps/api/src/ai`          | Fournisseurs (`AnthropicProvider`, `MockProvider`), prompt système, schéma de verdict, post-traitement.                                                                                       |
| `apps/api/src/ai/rules`    | Les 6 règles de post-traitement, testables isolément.                                                                                                                                         |
| `apps/api/src/security`    | Anti-injection, validation d'image, protection SSRF.                                                                                                                                          |
| `apps/api/src/url`         | Analyse d'URL, domaines officiels.                                                                                                                                                            |
| `apps/api/src/db`          | Schéma Drizzle et dépôts.                                                                                                                                                                     |
| `apps/mobile/src/app`      | **Routes uniquement** (18 écrans expo-router).                                                                                                                                                |
| `apps/mobile/src/features` | Domaines : `parcours`, `family`, `checkup`, `capture`.                                                                                                                                        |
| `apps/mobile/src/lib`      | API client, e-mail, thème, device-id, share-intent, fiches conseils.                                                                                                                          |
| `apps/mobile/src/store`    | Historique local.                                                                                                                                                                             |

### Routes API

| Méthode | Route          | Rôle                                |
| ------- | -------------- | ----------------------------------- |
| GET     | `/v1/health`   | Santé                               |
| GET     | `/privacy`     | Politique de confidentialité (HTML) |
| POST    | `/v1/analyze`  | Analyse texte / lien / image        |
| POST    | `/v1/waitlist` | Inscription liste d'attente         |
| POST    | `/v1/event`    | Événement produit anonyme           |

### Flux principal d'analyse

```
Écran (texte / lien / capture / mail)
  └─ lib/api.ts  →  POST {apiBaseUrl()}/v1/analyze
       └─ rate-limiter (Map en mémoire)
       └─ provider.analyze()        ← MockProvider (défaut) ou AnthropicProvider
       └─ finalizeVerdict()  →  chaîne de 6 règles, DANS L'ORDRE :
            1. confidence-degradation   dégrade en INDETERMINE si peu sûr
            2. injection-guard          remonte à SUSPECT si injection
            3. category-coherence       relève si verdict trop rassurant
            4. url-signals              relève selon signaux techniques du lien
            5. content-signals          relève selon procédés de fraude croisés
            6. extended-fields          dérive risk_level / score / senior_summary / do_not
       └─ log technique (SANS contenu) + télémétrie best-effort
  └─ Écran verdict enrichi  →  historique local (AsyncStorage)
```

Principe respecté : les règles **ne font qu'escalader**, jamais rétrograder — filet défensif.

### Flux famille

```
Réglages → Bouclier famille
  ├─ Proche de confiance (local, consenti, révocable)   store: vigie.trusted-contact
  ├─ Fiche « Comment ça marche ? »  → lien vers /checkup
  ├─ Depuis un verdict : message pré-rempli au proche (sms:/mailto:)
  │    messages.ts — JAMAIS le contenu original, ni raisons, ni score
  └─ Trace locale des demandes d'avis (cap 30)          store: vigie.advice-requests
```

### Flux Check-up

```
Accueil (CheckupHomeCard) ─┐
Réglages (carte)           ├─→ /checkup
Fiche Bouclier (lien)      ┘
  ├─ Onglets « Pour moi » / « Pour un proche »  (masqués en mode senior)
  ├─ deriveCheckup({ confirmed, hasContact, mode })  → 5 items, niveau doux
  │    mode 'moi'    : item 1 AUTO (lit vigie.trusted-contact)
  │    mode 'proche' : TOUS déclaratifs (estimation aidant)
  └─ store: vigie.security-checkup { confirmed, confirmedForProche, lastReviewedAt }
```

### Stores locaux (AsyncStorage)

`vigie.history` · `vigie.trusted-contact` · `vigie.advice-requests` · `vigie.security-checkup` · `vigie.settings` (mode senior)

---

## C. État fonctionnel

Légende confiance : 🟢 élevée (code lu + tests) · 🟡 moyenne (code lu) · 🟠 à confirmer en conditions réelles

| Fonctionnalité                                                        | État                        | Confiance | Fichiers                                                                               | Tests           | Problèmes                                                                        | Prochaine action                              |
| --------------------------------------------------------------------- | --------------------------- | --------- | -------------------------------------------------------------------------------------- | --------------- | -------------------------------------------------------------------------------- | --------------------------------------------- |
| Contrats partagés (`risk_level`, `score`, `senior_summary`, `do_not`) | **Fonctionnel**             | 🟢        | `packages/shared/src/verdict-extras.ts`                                                | 23              | —                                                                                | RAS                                           |
| Moteur de verdict + post-traitement                                   | **Fonctionnel**             | 🟢        | `ai/post-process.ts`, `ai/rules/index.ts`                                              | inclus dans 361 | Chaîne ordonnée, escalade seule                                                  | RAS                                           |
| Règles URL                                                            | **Fonctionnel**             | 🟢        | `ai/rules/url-signals.rule.ts`, `url/`                                                 | ✔               | 1 seul cas URL au corpus                                                         | Élargir le corpus (plus tard)                 |
| Règles contenu                                                        | **Fonctionnel**             | 🟢        | `ai/rules/content-signals.rule.ts`                                                     | ✔               | —                                                                                | RAS                                           |
| Anti-injection / cohérence                                            | **Fonctionnel**             | 🟢        | `injection-guard.rule.ts`, `category-coherence.rule.ts`, `security/injection-guard.ts` | ✔               | —                                                                                | RAS                                           |
| **Moteur IA réel (Anthropic)**                                        | **Mock par défaut**         | 🟠        | `ai/anthropic-provider.ts`, `.env`                                                     | mock testé      | `MOCK_AI=true` en local ⇒ verdicts mockés                                        | **Décider mock vs réel pour le terrain (§F)** |
| Interface de verdict enrichie                                         | **Fonctionnel**             | 🟢        | `components/verdict-content.tsx`                                                       | ✔               | Affiche « Score de risque X/100 » — abstrait pour un senior                      | Observer en test terrain                      |
| 5 parcours proactifs                                                  | **Fonctionnel**             | 🟢        | `features/parcours/registry.ts` + 5 définitions                                        | ✔               | `UPCOMING_PARCOURS` vide (normal)                                                | RAS                                           |
| Analyse texte                                                         | **Fonctionnel**             | 🟢        | `app/verifier-texte.tsx`, `lib/api.ts`                                                 | ✔               | —                                                                                | RAS                                           |
| Analyse lien                                                          | **Fonctionnel**             | 🟢        | `app/verifier-lien.tsx`                                                                | ✔               | —                                                                                | RAS                                           |
| Analyse capture (image)                                               | **Fonctionnel**             | 🟡        | `app/verifier-capture.tsx`                                                             | ✔               | Non couvert par le corpus d'éval                                                 | Tester manuellement                           |
| Analyse mail                                                          | **Fonctionnel**             | 🟢        | `app/verifier-mail.tsx`, `lib/email.ts`                                                | ✔               | Envoyé en `kind: 'text'` (pas d'auth SPF/DKIM)                                   | RAS (documenté)                               |
| Détection locale de liens (mail)                                      | **Fonctionnel**             | 🟢        | `lib/email.ts` (`extractLinks`)                                                        | ✔               | Max 5 liens                                                                      | RAS                                           |
| **OCR / lecture texte de capture**                                    | **Partiel (inatteignable)** | 🟢        | `features/capture/text-recognizer.ts`                                                  | ✔               | `getTextRecognizer()` renvoie en dur `available:false` ⇒ `CaptureTextPanel` mort | Laisser tel quel (attend dev build)           |
| **Partage entrant (F10)**                                             | **Partiel (inerte)**        | 🟡        | `lib/share-intent.ts`, `app/_layout.tsx`                                               | ✔               | Module natif absent d'Expo Go                                                    | Laisser tel quel                              |
| Bouclier famille — proche de confiance                                | **Fonctionnel**             | 🟢        | `features/family/contact.store.ts`                                                     | ✔               | —                                                                                | RAS                                           |
| Messages au proche                                                    | **Fonctionnel**             | 🟢        | `features/family/messages.ts`                                                          | ✔               | Exclut contenu/raisons/score ✔                                                   | RAS                                           |
| Trace locale des demandes d'avis                                      | **Fonctionnel**             | 🟢        | `features/family/advice-requests.store.ts`                                             | ✔               | Cap 30                                                                           | RAS                                           |
| Fiche « Comment fonctionne le Bouclier famille ? »                    | **Fonctionnel**             | 🟢        | `features/family/family-shield-explainer.tsx`                                          | ✔               | —                                                                                | RAS                                           |
| Check-up — bilan personnel (5 items)                                  | **Fonctionnel**             | 🟢        | `features/checkup/*`                                                                   | ✔               | —                                                                                | RAS                                           |
| Check-up — carte accueil                                              | **Fonctionnel**             | 🟢        | `features/checkup/checkup-home-card.tsx`                                               | ✔               | —                                                                                | RAS                                           |
| Check-up — rappel doux (90 j)                                         | **Fonctionnel**             | 🟢        | `features/checkup/checkup.reminder.ts`                                                 | ✔               | Local, jamais une notification ✔                                                 | RAS                                           |
| Check-up — item « argent / nouveau numéro » + rappel partageable      | **Fonctionnel**             | 🟢        | `checkup.items.ts`, `checkup.messages.ts`                                              | ✔               | Partage ne coche pas l'item ✔                                                    | RAS                                           |
| Check-up — mode « Pour un proche »                                    | **Fonctionnel**             | 🟢        | `checkup.derive.ts`, `app/checkup.tsx`                                                 | ✔               | États séparés, onglets masqués en senior ✔                                       | RAS                                           |
| Historique local                                                      | **Fonctionnel**             | 🟢        | `store/history.ts`                                                                     | ✔               | Cap 200, purement local                                                          | RAS                                           |
| Confidentialité serveur                                               | **Fonctionnel**             | 🟢        | `app.ts`, `db/schema.ts`                                                               | ✔               | Aucun contenu loggé ni persisté                                                  | RAS                                           |
| **API joignable hors réseau de dev**                                  | **Non commencé**            | 🟢        | `lib/api.ts`, `.env.example`                                                           | —               | Retombe sur l'IP LAN:3000 ; pas de `apps/mobile/.env`                            | **Bloqueur V1 terrain (§F)**                  |
| Reset de démo                                                         | **Non commencé**            | 🟢        | —                                                                                      | —               | Effacement possible seulement via « Supprimer toutes mes données »               | À arbitrer (§F)                               |
| Messages factices versionnés                                          | **Non commencé**            | 🟢        | —                                                                                      | —               | Aucun jeu d'exemples dans le dépôt                                               | À arbitrer (§F)                               |

---

## D. Dette technique

### 🔴 Critique (bloque la V1 terrain)

1. **Résolution de l'URL d'API inadaptée à un usage hors dev** — `lib/api.ts:56`. La cascade `EXPO_PUBLIC_API_URL → IP du bundler → localhost` suppose que l'API tourne sur la machine de dev, sur le même réseau. Aucun `apps/mobile/.env` n'existe. Couplé à PostgreSQL et au CORS (`http://localhost:8081`), cela rend un test hors réseau **impossible**.

### 🟠 Importante (à traiter avant d'industrialiser)

2. **Ambiguïté mock / réel non tracée à l'exécution.** Rien dans l'app n'indique si le verdict vient du mock ou de l'IA. En test terrain, un observateur ne peut pas savoir ce qu'il observe. _(Piste légère : exposer le mode dans `/v1/health`, sans le montrer à l'utilisateur.)_
3. **Rate limiting en mémoire** (`middleware/rate-limiter.ts:19`, `Map`) — mono-instance, remis à zéro à chaque redémarrage.
4. **Couverture d'évaluation déséquilibrée** — 28 cas : 27 texte, 1 lien, **0 image, 0 mail**. Les voies capture et mail ne sont pas mesurées.
5. **Code prêt mais inatteignable** — pipeline OCR (`getTextRecognizer()` figé) et partage entrant (natif absent). Justifié, mais à ne pas oublier : ce sont des chemins non exercés qui pourraient dériver silencieusement.

### 🟢 Amélioration (confort)

6. **`testTimeout` jest à 20 s** — nécessaire car les tests `renderRouter` sont lourds sous charge parallèle. À surveiller si la suite grossit encore.
7. **Dépendances légèrement en retard** — patchs/mineurs dans le SDK Expo 57 (expo 57.0.2 → 57.0.7, expo-router 57.0.3 → 57.0.7, hono, @anthropic-ai/sdk). Rien de cassant. `@react-native-async-storage/async-storage` est en 2.2.0 vs 3.1.1 en amont, mais **c'est la version épinglée par le SDK Expo** — ne pas forcer.
8. **`score` affiché sur le verdict** — cohérent avec les specs du verdict enrichi, mais en tension esthétique avec la philosophie « pas de chiffre » du Check-up. À trancher par l'observation terrain, pas par principe.

---

## E. Risques produit

| Risque                                       | Niveau         | Analyse                                                                                                                                                                                                                                                                                                   | Atténuation actuelle                                               |
| -------------------------------------------- | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| **Faux négatifs**                            | 🟠 Moyen       | Le corpus couvre 16 cas « danger », mais 0 image et 0 mail. Une arnaque en capture pourrait passer sans qu'on le sache.                                                                                                                                                                                   | Chaîne de règles défensives qui n'escalade que ; corpus à élargir. |
| **Faux positifs**                            | 🟢 Faible      | Explicitement travaillé : 6 cas « légitime » + 3 « ambigu » au corpus, et une mesure « règles seules » pour isoler les faux positifs. Correctif OTP isolé déjà en place.                                                                                                                                  | Solide. À revérifier avec l'IA réelle.                             |
| **Dépendance excessive à l'IA**              | 🟠 Moyen       | Le verdict vient d'un LLM. Mais la chaîne de 6 règles serveur agit en **filet défensif indépendant du modèle**, et le schéma Zod rejette toute réponse hors contrat (`api.ts:140` — on n'affiche jamais un verdict douteux).                                                                              | Bonne architecture : les règles ne dépendent pas du modèle.        |
| **Manque d'explicabilité**                   | 🟢 Faible      | Le verdict fournit `summary`, `reasons`, `actions`, `senior_summary`, `do_not`. La trace des règles reste **interne** (jamais exposée) — bon choix de confidentialité, mais l'utilisateur ne saura pas qu'une règle a relevé le verdict.                                                                  | Suffisant pour l'usage.                                            |
| **Données sensibles**                        | 🟢 Faible      | **Vérifié** : logs = `request_id`/`kind`/`verdict`/`category`/`latency` uniquement. Tables DB = waitlist, télémétrie (verdict+catégorie), events, cache de domaines. **Aucun contenu analysé n'est journalisé ni persisté.**                                                                              | Excellente posture.                                                |
| **Accessibilité senior**                     | 🟡 À confirmer | `MIN_TOUCH_TARGET = 56` (au-delà des 48 pt requis), échelle typo dédiée `simple.*`, mode simplifié complet, libellés d'accessibilité présents. Mais **jamais validé par un vrai senior**.                                                                                                                 | C'est précisément l'objet du test terrain.                         |
| **Confidentialité familiale**                | 🟢 Faible      | Proche stocké **localement**, consenti, révocable. Messages au proche **excluent** contenu original, raisons et score. Aucune donnée du proche en mode « Pour un proche » (booléens seuls).                                                                                                               | Conforme à la vision.                                              |
| **Confusion « veille » vs « surveillance »** | 🟡 À confirmer | Le vocabulaire est soigné et explicite (« Une veille, pas une surveillance », « Votre proche ne voit rien automatiquement »). Mais c'est une **perception**, elle ne se prouve qu'auprès d'un vrai utilisateur.                                                                                           | À observer en priorité au test.                                    |
| **Permissions mobiles**                      | 🟢 Faible      | Seule la galerie (image-picker) est requise. Aucune permission intrusive.                                                                                                                                                                                                                                 | RAS                                                                |
| **Erreurs réseau**                           | 🟡 Moyen       | Gestion complète et francophone : `network`, `rate_limited`, `service_unavailable`, `invalid_request`, `unknown`, timeout 30 s, messages prêts à afficher. **Mais** avec l'API injoignable hors dev, c'est le message « Connexion impossible » que verra la personne testée — un échec du flux principal. | Bon code, mauvais contexte : cf. bloqueur n°1.                     |
| **Limites du tout local**                    | 🟢 Faible      | Assumé et cohérent : rien ne se synchronise, tout se perd au changement d'appareil. Le Bouclier famille est un _renfort_, pas un réseau.                                                                                                                                                                  | Bien documenté dans l'app.                                         |

---

## F. Préparation V1 terrain

Objectif : rendre possible **une séance de test avec une vraie personne**, sans lancer de chantier lourd.

### F.1 Stabilité — rendre l'API joignable (bloqueur n°1)

Trois options, de la plus légère à la plus lourde :

| Option                                                                                                        | Effort         | Avantages                                                            | Limites                                                             |
| ------------------------------------------------------------------------------------------------------------- | -------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------- |
| **A. Test sur ton réseau** — la séance se fait chez toi / au même Wi-Fi, avec API + PostgreSQL + Metro lancés | ⭐ Très faible | Zéro modification de code ; fonctionne déjà aujourd'hui              | Impose le lieu ; la personne n'est pas dans son environnement       |
| **B. `EXPO_PUBLIC_API_URL` + tunnel temporaire** vers l'API locale                                            | ⭐⭐ Faible    | Test possible **chez la personne** ; aucune ligne de code applicatif | Ton poste doit rester allumé ; URL éphémère ; ajuster `CORS_ORIGIN` |
| **C. Déploiement de l'API** (Fly.io / Railway)                                                                | ⭐⭐⭐⭐       | Autonomie réelle, réutilisable                                       | **Hors périmètre actuel** — à classer « plus tard »                 |

**Recommandation : commencer par A** (aucune modification, aucun risque) pour la toute première séance. Passer à **B** seulement si tester **au domicile** de la personne s'avère indispensable.

### F.2 Mock ou IA réelle — décider avant la séance

|                  | Mock (`MOCK_AI=true`)                                             | IA réelle (`MOCK_AI=false`)                            |
| ---------------- | ----------------------------------------------------------------- | ------------------------------------------------------ |
| Stabilité        | Déterministe, reproductible                                       | Variable d'une exécution à l'autre                     |
| Coût / latence   | Nul / instantané                                                  | Coût par appel, ~quelques secondes                     |
| Ce qu'on teste   | **L'UX, la compréhension, les réflexes**                          | **Le moteur** en plus de l'UX                          |
| Risque en séance | Verdict incohérent si le message factice ne matche aucun scénario | Erreur réseau ou verdict surprenant devant la personne |

**Recommandation : mock pour la première séance.** Les objectifs annoncés du test (comprendre Vigie, savoir quoi faire, Check-up, Bouclier famille) sont **tous des objectifs UX** — le moteur n'a pas besoin d'être réel pour y répondre, et le mock supprime deux sources d'aléa. Prévoir une **seconde séance en IA réelle** une fois l'UX stabilisée.
⚠️ **Prérequis** : vérifier en amont que les messages factices choisis déclenchent bien les scénarios mock attendus (sinon verdict incohérent en direct).

### F.3 Reset de démo

Aujourd'hui, seul « Supprimer toutes mes données » (Réglages) remet à zéro — c'est efficace mais destructif et peu adapté à un enchaînement de séances. Pour repartir propre entre deux participants, le plus simple **sans code** : **désinstaller/réinstaller Expo Go** ou vider les données de l'app. Un vrai « mode démo » serait une fonctionnalité — **hors périmètre**.

### F.4 Scénarios de test & messages factices

Le protocole de test et la grille de notation ont déjà été rédigés (hors dépôt). **Action utile et non intrusive** : versionner les **messages factices** dans le dépôt (par ex. `fixtures/demo-messages.md`) pour qu'ils soient stables, relus, et cohérents avec les scénarios mock. Aucun impact applicatif.

### F.5 Fiabilité du flux principal

Le flux « coller → analyser → verdict → historique » est **le plus testé du dépôt** et bundle proprement. Sa seule fragilité réelle est **externe** : joignabilité de l'API. Une fois F.1 réglé, le flux est fiable.

**Vérification recommandée avant la séance** (5 min, manuelle) : lancer API + DB, faire une analyse texte, une analyse lien, une capture — confirmer verdict + historique. C'est le « pré-vol ».

### F.6 Points à observer pendant la séance

- Compréhension de l'objet de l'app en < 1 min (test des 5 secondes).
- Après le verdict : la personne **énonce-t-elle le bon réflexe** ou seulement « c'est une arnaque » ?
- Réaction au bloc **« Score de risque X/100 »** — est-il compris, ignoré, ou anxiogène ?
- Le Check-up **donne-t-il envie** d'agir sans doute préalable ?
- Le Bouclier famille est-il perçu comme **renfort** ou comme **surveillance** ?
- Gestes durs : coller un texte, choisir le bon mode parmi 4.
- Tout message d'erreur réseau vu par la personne (⇒ signale un problème de F.1).

---

## G. Priorités immédiates (5)

Classées par rapport valeur/effort, sans gros chantier.

### 1. 🔴 Rendre l'API joignable pour la séance de test — **option A d'abord**

**Pourquoi :** sans cela, le flux principal échoue devant la personne, et le test ne mesure plus rien.
**Action :** faire la première séance sur le réseau de dev, avec API + PostgreSQL + Metro lancés et vérifiés en pré-vol. Documenter la procédure de démarrage.
**Effort :** très faible · **Aucun code.**

### 2. 🔴 Trancher « mock vs IA réelle » et le figer par écrit

**Pourquoi :** c'est la variable qui détermine ce que le test prouve réellement.
**Action :** retenir le **mock** pour la séance 1 (objectifs 100 % UX), et vérifier au préalable que les messages factices déclenchent les bons scénarios. Planifier une séance 2 en IA réelle.
**Effort :** très faible · **Aucun code.**

### 3. 🟠 Versionner un jeu de messages factices de démo

**Pourquoi :** garantit des séances reproductibles et cohérentes avec le mock ; évite d'improviser devant la personne.
**Action :** ajouter `fixtures/demo-messages.md` (Ameli, colis, faux conseiller, faux proche, + 1 message légitime témoin), vérifiés contre les scénarios mock.
**Effort :** faible · **Contenu uniquement, aucun impact applicatif.**

### 4. 🟠 Faire la séance de test terrain et en tirer les correctifs

**Pourquoi :** c'est **la** priorité produit. Tout le reste est de la préparation. L'accessibilité senior et la perception « veille vs surveillance » ne peuvent être validées que là.
**Action :** dérouler le protocole existant, remplir la grille, en sortir 3 frictions majeures classées _garder / ajuster / refaire_.
**Effort :** moyen (temps humain) · **Aucun code.**

### 5. 🟢 Élargir le corpus d'évaluation aux voies non couvertes

**Pourquoi :** capture et mail sont fonctionnels mais **non mesurés** — c'est là que se cachent les faux négatifs.
**Action :** ajouter quelques cas `image` et des cas mail au corpus (27 texte / 1 lien aujourd'hui). À faire **après** le test terrain, sans urgence.
**Effort :** faible à moyen · Contenu de fixtures.

### Classés « plus tard » (hors périmètre actuel)

- **Déploiement de l'API** (Fly.io/Railway) — la vraie réponse au bloqueur n°1, mais c'est un chantier infra.
- **Dev build EAS** — débloquerait OCR natif, partage entrant, test iPhone réel.
- **Appairage réel aidant ↔ senior** — nécessite backend, comptes, synchronisation.
- **Rate limiting partagé** (Redis) — seulement si déploiement multi-instance.
- **Bouclier actif appels/SMS** — natif + base de numéros.

---

## Conclusion

Le dépôt est **en meilleure santé que la plupart des projets à ce stade** : 646 tests verts, zéro erreur de lint et de typage, bundle qui s'exporte, confidentialité réellement implémentée et non seulement promise, et une architecture de règles qui protège intelligemment contre la dépendance au modèle.

**Il n'y a rien de cassé à réparer.** Ce qui manque pour une V1 terrain n'est pas du code applicatif mais **deux décisions et une mise en condition** : rendre l'API joignable pendant la séance, et choisir consciemment entre mock et IA réelle. Les deux se règlent sans écrire une ligne de fonctionnalité.

La suite la plus utile n'est donc pas de développer — c'est **d'aller tester avec une vraie personne**.
