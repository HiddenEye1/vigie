import { Ionicons } from '@expo/vector-icons';
import type { ReactElement } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { fonts, palette, radius, spacing, type } from '../../lib/theme';

import type { CheckupLevel } from './checkup.items';
import { CHECKUP_LEVELS } from './checkup.items';

interface CheckupSummaryProps {
  readonly inPlaceCount: number;
  readonly total: number;
  readonly level: CheckupLevel;
  readonly large?: boolean;
}

/**
 * Bandeau « votre bouclier » : un bouclier qui se remplit + un décompte de
 * protections en place. Jamais un pourcentage, jamais un chiffre sur 100,
 * jamais le mot « score » — on compte des protections, et on rassure.
 */
export function CheckupSummary({
  inPlaceCount,
  total,
  level,
  large = false,
}: CheckupSummaryProps): ReactElement {
  const info = CHECKUP_LEVELS[level];
  const noun = inPlaceCount > 1 ? 'protections en place' : 'protection en place';
  const segments = Array.from({ length: total }, (_, index) => index);

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <Ionicons name="shield-checkmark" size={28} color={palette.laiton} />
        <View style={styles.headText}>
          <Text style={[styles.level, large && styles.levelLarge]}>{info.label}</Text>
          <Text style={styles.line}>{info.line}</Text>
        </View>
      </View>

      <View style={styles.segments} accessibilityRole="progressbar">
        {segments.map((index) => (
          <View
            key={`segment-${String(index)}`}
            style={[styles.segment, index < inPlaceCount && styles.segmentOn]}
          />
        ))}
      </View>

      <Text style={styles.count}>{`${String(inPlaceCount)} ${noun} sur ${String(total)}`}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.ardoiseHaute,
    borderWidth: 1,
    borderColor: palette.laitonFilet,
    borderRadius: radius.l,
    padding: spacing.l,
    gap: spacing.m,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
  },
  headText: {
    flex: 1,
    gap: spacing.xs,
  },
  level: {
    ...type.sectionTitle,
  },
  levelLarge: {
    fontSize: 24,
    lineHeight: 32,
  },
  line: {
    ...type.bodySecondary,
  },
  segments: {
    flexDirection: 'row',
    gap: spacing.s,
  },
  segment: {
    flex: 1,
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: palette.bordure,
  },
  segmentOn: {
    backgroundColor: palette.laiton,
  },
  count: {
    ...type.body,
    fontFamily: fonts.textSemiBold,
  },
});
