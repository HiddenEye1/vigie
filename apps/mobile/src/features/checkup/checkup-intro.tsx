import type { ReactElement } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { palette, type } from '../../lib/theme';

/**
 * Accroche rassurante en tête du bilan. On pose d'emblée que ce n'est pas un
 * test, que rien n'est jugé, et que tout reste sur le téléphone.
 */
export function CheckupIntro(): ReactElement {
  return (
    <View style={styles.wrap}>
      <Text style={styles.text}>
        Faisons le point sur votre protection, tranquillement. Ce n’est pas un test : Vigie regarde
        seulement ce qui est déjà en place, et ce que vous pouvez renforcer. Rien n’est envoyé, tout
        reste sur ce téléphone.
      </Text>
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
