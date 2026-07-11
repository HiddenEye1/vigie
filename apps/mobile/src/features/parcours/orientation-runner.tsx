import { useRouter } from 'expo-router';
import type { ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';

import { useSeniorMode } from '@/features/family';
import { palette } from '@/lib/theme';

import { OrientationResultView } from './orientation-result';
import { ParcoursQuestionView } from './parcours-question';
import type { OrientationParcours, OrientationTarget } from './types';
import { useAskContact } from './use-ask-contact';
import { useQuestionFlow } from './use-question-flow';

/**
 * Déroulé d'un parcours d'orientation : quelques questions d'aiguillage (flux
 * partagé), puis un résultat qui redirige vers le bon réflexe. Les actions
 * exécutent une navigation locale ou ouvrent le compositeur vers un proche.
 */
export function OrientationRunner({
  definition,
}: {
  readonly definition: OrientationParcours;
}): ReactElement {
  const router = useRouter();
  const askContact = useAskContact();
  const large = useSeniorMode((state) => state.simpleMode);
  const flow = useQuestionFlow(definition.questions);

  const runAction = (target: OrientationTarget): void => {
    switch (target.kind) {
      case 'parcours':
        router.push(`/parcours/${target.id}`);
        return;
      case 'analyze':
        router.push(target.route);
        return;
      case 'ask-contact':
        askContact();
        return;
    }
  };

  if (flow.finished) {
    return (
      <View style={styles.screen}>
        <OrientationResultView
          outcome={definition.evaluate(flow.answers)}
          large={large}
          onAction={runAction}
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
