import type { ReactElement } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { palette, type } from '../../lib/theme';

import type { CheckupMode } from './checkup.items';

interface CheckupIntroProps {
  readonly mode?: CheckupMode;
}

const TEXT: Record<CheckupMode, string> = {
  moi:
    'Faisons le point sur votre protection, tranquillement. Ce n’est pas un test : Vigie regarde seulement ce qui est déjà en place, et ce que vous pouvez renforcer. Rien n’est envoyé, tout reste sur ce téléphone.',
  proche:
    'Ce bilan est une estimation pour vous aider à accompagner un proche. Rien n’est partagé, tout reste sur ce téléphone.',
};

/**
 * Accroche rassurante en tête du bilan. On pose d'emblée que ce n'est pas un
 * test, que rien n'est jugé, et que tout reste sur le téléphone. Le mode
 * « proche » précise qu'il s'agit d'une estimation par un aidant.
 */
export function CheckupIntro({ mode = 'moi' }: CheckupIntroProps): ReactElement {
  return (
    <View style={styles.wrap}>
      <Text style={styles.text}>{TEXT[mode]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: type.body.lineHeight,
  },
  text: {
    ...type.body,
    color: palette.texteDoux,
  },
});
