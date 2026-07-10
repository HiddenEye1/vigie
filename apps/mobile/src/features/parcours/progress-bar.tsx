import type { ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';

import { palette, radius } from '@/lib/theme';

import { progressFraction } from './progress';

interface ProgressBarProps {
  readonly current: number;
  readonly total: number;
}

/**
 * Barre de progression fine, sans dépendance : la portion remplie utilise flex
 * pour éviter tout calcul de largeur. Purement visuelle (le libellé « X sur Y »
 * reste porté par la question).
 */
export function ProgressBar({ current, total }: ProgressBarProps): ReactElement {
  const filled = Math.round(progressFraction(current, total) * 1000);
  return (
    <View
      style={styles.track}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: total, now: current }}
    >
      <View style={[styles.fill, { flex: filled }]} />
      <View style={{ flex: 1000 - filled }} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: palette.bordureDouce,
    overflow: 'hidden',
  },
  fill: {
    backgroundColor: palette.laiton,
    borderRadius: radius.pill,
  },
});
