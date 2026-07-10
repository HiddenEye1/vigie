import { useRouter } from 'expo-router';
import type { ReactElement } from 'react';
import { useState } from 'react';
import { Alert, Linking, StyleSheet, View } from 'react-native';

import { buildContactUrl, buildHelpMessage, useTrustedContact } from '@/features/family';
import { palette } from '@/lib/theme';

import { showEmergencySteps } from './emergency';
import { ParcoursQuestionView } from './parcours-question';
import { ParcoursResultView } from './parcours-result';
import type { ParcoursAnswers, ParcoursDefinition } from './types';

/**
 * Déroulé d'un parcours : pose les questions une à une, mémorise les réponses
 * en LOCAL (rien n'est envoyé), puis affiche le résultat. Réutilisable tel quel
 * par les futurs parcours.
 */
export function ParcoursRunner({
  definition,
}: {
  readonly definition: ParcoursDefinition;
}): ReactElement {
  const router = useRouter();
  const contact = useTrustedContact((state) => state.contact);
  const [answers, setAnswers] = useState<ParcoursAnswers>({});
  const [index, setIndex] = useState(0);
  const [finished, setFinished] = useState(false);

  const { questions } = definition;

  const handleAnswer = (optionId: string): void => {
    const question = questions[index];
    if (question === undefined) {
      return;
    }
    setAnswers((previous) => ({ ...previous, [question.id]: optionId }));
    if (index + 1 >= questions.length) {
      setFinished(true);
    } else {
      setIndex(index + 1);
    }
  };

  const restart = (): void => {
    setAnswers({});
    setIndex(0);
    setFinished(false);
  };

  const askContact = async (): Promise<void> => {
    if (!contact) {
      Alert.alert(
        'Ajouter un proche',
        'Pour demander l’avis d’un proche, enregistrez d’abord son contact dans les réglages de Vigie.',
      );
      return;
    }
    try {
      await Linking.openURL(buildContactUrl(contact, buildHelpMessage()));
    } catch {
      Alert.alert(
        'Envoi impossible',
        'Aucune application de ce téléphone ne peut écrire à votre proche. Vérifiez le moyen de contact enregistré dans les réglages.',
      );
    }
  };

  if (finished) {
    return (
      <View style={styles.screen}>
        <ParcoursResultView
          outcome={definition.evaluate(answers)}
          onAnalyze={() => {
            router.push('/verifier-texte');
          }}
          onAskContact={() => {
            void askContact();
          }}
          onEmergency={showEmergencySteps}
          onRestart={restart}
        />
      </View>
    );
  }

  const current = questions[index];
  if (current === undefined) {
    return <View style={styles.screen} />;
  }

  return (
    <View style={styles.screen}>
      <ParcoursQuestionView
        question={current}
        index={index}
        total={questions.length}
        onAnswer={handleAnswer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.nuit,
  },
});
