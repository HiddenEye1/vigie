import { useCallback } from 'react';
import { Alert, Linking } from 'react-native';

import { buildContactUrl, buildHelpMessage, useTrustedContact } from '@/features/family';

/**
 * « Prévenir un proche », mutualisé entre les parcours. Ouvre le compositeur
 * natif déjà adressé au proche, avec un message pré-rempli que la personne
 * relit et envoie elle-même. Si aucun proche n'est configuré, on oriente vers
 * les réglages sans bloquer.
 */
export function useAskContact(message: string = buildHelpMessage()): () => void {
  const contact = useTrustedContact((state) => state.contact);
  return useCallback(() => {
    void (async () => {
      if (!contact) {
        Alert.alert(
          'Ajouter un proche',
          'Pour prévenir un proche en un geste, enregistrez d’abord son contact dans les réglages de Vigie.',
        );
        return;
      }
      try {
        await Linking.openURL(buildContactUrl(contact, message));
      } catch {
        Alert.alert(
          'Envoi impossible',
          'Aucune application de ce téléphone ne peut écrire à votre proche. Vérifiez le moyen de contact enregistré dans les réglages.',
        );
      }
    })();
  }, [contact, message]);
}
