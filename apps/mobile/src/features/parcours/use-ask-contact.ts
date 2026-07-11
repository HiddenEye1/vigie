import { useCallback } from 'react';
import { Alert, Linking } from 'react-native';

import { buildContactUrl, buildHelpMessage, firstName, useTrustedContact } from '@/features/family';

/**
 * « Prévenir un proche », mutualisé entre les parcours. Ouvre le compositeur
 * natif déjà adressé au proche, avec un message pré-rempli que la personne
 * relit et envoie elle-même. Si aucun proche n'est configuré, on oriente vers
 * les réglages sans bloquer.
 *
 * Sans `message` explicite, le message d'aide par défaut est composé au moment
 * du clic, salué avec le prénom du proche enregistré.
 */
export function useAskContact(message?: string): () => void {
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
      const body = message ?? buildHelpMessage(firstName(contact.name));
      try {
        await Linking.openURL(buildContactUrl(contact, body));
      } catch {
        Alert.alert(
          'Envoi impossible',
          'Aucune application de ce téléphone ne peut écrire à votre proche. Vérifiez le moyen de contact enregistré dans les réglages.',
        );
      }
    })();
  }, [contact, message]);
}
