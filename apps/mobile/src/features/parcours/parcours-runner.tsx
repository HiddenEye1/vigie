import { useRouter } from 'expo-router';
import type { ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';

import { useSeniorMode } from '@/features/family';
import { palette } from '@/lib/theme';

import { ParcoursQuestionView } from './parcours-question';
import { ParcoursResultView } from './parcours-result';
import type { QuestionnaireParcours } from './types';
import { useAskContact } from './use-ask-contact';
import { useQuestionFlow } from './use-question-flow';

/**
 * Déroulé d'un parcours-questionnaire : pose les questions une à une (flux
 * partagé), puis affiche le résultat. Rien n'est envoyé.
 */
export function ParcoursRunner({
  definition,
}: {
  readonly definition: QuestionnaireParcours;
}): ReactElement {
  const router = useRouter();
  const askContact = useAskContact();
  const large = useSeniorMode((state) => state.simpleMode);
  const flow = useQuestionFlow(definition.questions);

  const analyze = definition.analyze ?? {
    label: 'Analyser le message reçu',
    route: '/verifier-texte' as const,
  };

  if (flow.finished) {
    return (
      <View style={styles.screen}>
        <ParcoursResultView
          outcome={definition.evaluate(flow.answers)}
          large={large}
          analyzeLabel={analyze.label}
          onAnalyze={() => {
            router.push(analyze.route);
          }}
          onAskContact={askContact}
          onEmergency={() => {
            router.push('/parcours/arnaque-en-direct');
          }}
          onRestart={flow.restart}
        />
      </View>
    );
  }

  if (flow.current === undefined) {
    return <View style={styles.screen} />;
  }

  return (
    <View style={styles.screen}>
      <ParcoursQuestionView
        question={flow.current}
        index={flow.index}
        total={flow.total}
        onAnswer={flow.answer}
        onBack={flow.back}
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
