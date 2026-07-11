import type { AnalyzeResponse } from '@vigie/shared';
import type { ReactElement } from 'react';
import { Alert, Linking } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';

import { useAdviceRequests } from './advice-requests.store';
import { useTrustedContact } from './contact.store';
import { buildAdviceMessage, buildContactUrl, firstName } from './messages';

interface AskTrustedContactProps {
  readonly result: AnalyzeResponse;
}

/**
 * « Envoyer à [prénom] pour avis » — première brique du Bouclier famille.
 * Rien ne part sans que le senior le déclenche : le bouton ouvre le compositeur
 * natif déjà adressé au proche, avec le verdict pré-écrit. Le senior relit et
 * envoie lui-même. Absent tant qu'aucun proche n'est enregistré.
 */
export function AskTrustedContact({ result }: AskTrustedContactProps): ReactElement | null {
  const contact = useTrustedContact((state) => state.contact);
  const record = useAdviceRequests((state) => state.add);

  if (!contact) {
    return null;
  }

  const prenom = firstName(contact.name);

  const send = async (): Promise<void> => {
    const url = buildContactUrl(contact, buildAdviceMessage(result, prenom));
    try {
      await Linking.openURL(url);
      // Trace locale, seulement après ouverture réussie du compositeur.
      record({
        contactFirstName: prenom,
        situation: result.url_analysis !== null ? 'lien' : 'message',
        verdict: result.verdict,
        category: result.category,
      });
    } catch {
      Alert.alert(
        'Envoi impossible',
        `Aucune application de ce téléphone ne peut écrire à ${prenom}. Vérifiez le moyen de contact enregistré dans les réglages.`,
      );
    }
  };

  return (
    <PrimaryButton
      label={`Envoyer à ${prenom} pour avis`}
      icon="paper-plane"
      onPress={() => {
        void send();
      }}
    />
  );
}
