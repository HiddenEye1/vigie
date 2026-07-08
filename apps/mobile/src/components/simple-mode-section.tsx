import type { ReactElement } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';

import { fonts, palette, radius, spacing, type } from '../lib/theme';
import { useSettings } from '../store/settings';

/**
 * Bascule du mode simplifié (senior). Réversible à tout moment : le senior
 * comme le proche qui l'aide à configurer peuvent revenir en arrière ici.
 */
export function SimpleModeSection(): ReactElement {
  const simpleMode = useSettings((state) => state.simpleMode);
  const setSimpleMode = useSettings((state) => state.setSimpleMode);

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Mode simplifié</Text>
      <Text style={styles.cardText}>
        Un accueil épuré, en gros caractères : un seul grand bouton pour vérifier un message. Les
        autres options restent accessibles. Vous pouvez revenir à l’affichage normal quand vous
        voulez.
      </Text>
      <View style={styles.row}>
        <Text style={styles.rowLabel}>Activer le mode simplifié</Text>
        <Switch
          value={simpleMode}
          onValueChange={setSimpleMode}
          accessibilityLabel="Activer le mode simplifié"
          accessibilityHint="Affiche un accueil épuré, en gros caractères."
          trackColor={{ false: palette.bordure, true: palette.laiton }}
          thumbColor={simpleMode ? palette.surFeuClair : palette.texteDoux}
          ios_backgroundColor={palette.bordure}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.ardoise,
    borderWidth: 1,
    borderColor: palette.bordureDouce,
    borderRadius: radius.l,
    padding: spacing.l,
    gap: spacing.m,
  },
  cardTitle: {
    ...type.sectionTitle,
  },
  cardText: {
    ...type.body,
    color: palette.texteDoux,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.m,
  },
  rowLabel: {
    flex: 1,
    ...type.body,
    fontFamily: fonts.textSemiBold,
  },
});
