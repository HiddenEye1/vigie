import { useRouter } from 'expo-router';
import type { ReactElement } from 'react';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useSeniorMode } from '@/features/family';
import { palette } from '@/lib/theme';

import { ParcoursQuestionView } from './parcours-question';
import { ParcoursResultView } from './parcours-result';
import type { ParcoursAnswers, QuestionnaireParcours } from './types';
import { useAskContact } from './use-ask-contact';

/**
 * Déroulé d'un parcours-questionnaire : pose les questions une à une, mémorise
 * les réponses en LOCAL (rien n'est envoyé), puis affiche le résultat.
 * Réutilisable tel quel par les futurs parcours de ce format.
 */
export function ParcoursRunner({
  definition,
}: {
  readonly definition: QuestionnaireParcours;
}): ReactElement {
  const router = useRouter();
  const askContact = useAskContact();
  const large = useSeniorMode((state) => state.simpleMode);
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

  if (finished) {
    return (
      <View style={styles.screen}>
        <ParcoursResultView
          outcome={definition.evaluate(answers)}
          large={large}
          onAnalyze={() => {
            router.push('/verifier-texte');
          }}
          onAskContact={askContact}
          onEmergency={() => {
            router.push('/parcours/arnaque-en-direct');
          }}
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
        onBack={index > 0 ? () => {
          setIndex(index - 1);
        } : undefined}
        large={large}
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
