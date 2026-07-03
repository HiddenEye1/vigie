/**
 * Partage entrant (F10) via expo-share-intent — module natif absent d'Expo Go
 * (il nécessite un development build). Le chargement est donc défensif :
 * sans le module, l'app fonctionne normalement, sans partage entrant.
 */
interface IncomingFile {
  readonly path: string;
  readonly mimeType: string;
  readonly width?: number | null;
}

interface IncomingShare {
  readonly text?: string | null;
  readonly webUrl?: string | null;
  readonly files?: readonly IncomingFile[] | null;
}

interface ShareIntentHookResult {
  readonly hasShareIntent: boolean;
  readonly shareIntent: IncomingShare | null;
  readonly resetShareIntent: () => void;
}

interface ShareIntentModule {
  readonly useShareIntent: (options?: { resetOnBackground?: boolean }) => ShareIntentHookResult;
}

let shareIntentModule: ShareIntentModule | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- chargement conditionnel d'un module natif optionnel
  shareIntentModule = require('expo-share-intent') as ShareIntentModule;
} catch {
  shareIntentModule = null;
}

const EMPTY: ShareIntentHookResult = {
  hasShareIntent: false,
  shareIntent: null,
  resetShareIntent: () => undefined,
};

/**
 * Hook stable : `shareIntentModule` est figé au chargement du bundle, l'ordre
 * des hooks React est donc constant pour toute la vie de l'application.
 */
export function useIncomingShare(): ShareIntentHookResult {
  if (!shareIntentModule) {
    return EMPTY;
  }
  return shareIntentModule.useShareIntent({ resetOnBackground: true });
}
