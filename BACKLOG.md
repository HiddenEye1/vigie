# BACKLOG — Vigie

Points reportés volontairement, avec la phase prévue pour les traiter.

| #   | Sujet                                  | Détail                                                                                                                                                                                                          | Phase cible   |
| :-- | :------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------ |
| 1   | Initialisation Expo                    | `apps/mobile` est un dossier vide : l'app Expo sera créée via `create-expo-app` en Phase 3 pour éviter un squelette qui divergerait du template officiel.                                                       | Phase 3       |
| 2   | Build de production de `@vigie/shared` | Le package est consommé en source TypeScript (`exports` → `src/index.ts`), suffisant pour vitest/tsx en dev. Un build (tsc) sera ajouté au moment du Dockerfile de prod.                                        | Phase 2       |
| 3   | Docker Desktop                         | Non installé sur la machine de dev (nécessite WSL2 + droits admin + redémarrage). `docker-compose.yml` est prêt ; Postgres n'est réellement requis qu'à partir de la Phase 2 (waitlist, télémétrie, cache URL). | Avant Phase 2 |
