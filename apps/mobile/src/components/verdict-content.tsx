import type { AnalyzeResponse } from '@vigie/shared';
import type { ReactElement } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, ReduceMotion } from 'react-native-reanimated';

import { fonts, palette, radius, spacing, type } from '../lib/theme';
import { CATEGORY_LABELS, VERDICT_DISCLAIMER, VERDICT_UI } from '../lib/verdict-ui';
import { VerdictBeacon } from './verdict-beacon';

interface VerdictContentProps {
  readonly result: AnalyzeResponse;
}

/** Cascade discrète : 60 ms de décalage par bloc, translation 8 px (§ signature move). */
function cascade(index: number): ReturnType<typeof FadeInDown.duration> {
  return FadeInDown.duration(350)
    .delay(200 + index * 60)
    .withInitialValues({ opacity: 0, transform: [{ translateY: 8 }] })
    .reduceMotion(ReduceMotion.System);
}

/**
 * Contenu du verdict, dans l'ordre imposé par le §4.2 :
 * feu du phare → phrase-résumé → « Pourquoi » → « Que faire maintenant »
 * → catégorie → mention obligatoire. Hiérarchie descendante, pas des cartes
 * de poids égal. Jamais de pourcentage de confiance.
 */
export function VerdictContent({ result }: VerdictContentProps): ReactElement {
  const ui = VERDICT_UI[result.verdict];
  return (
    <View>
      <VerdictBeacon verdict={result.verdict} />

      <Animated.View entering={cascade(0)}>
        <Text style={[styles.verdictLabel, { color: ui.text }]}>{ui.label}</Text>
        <Text style={styles.summary}>{result.summary}</Text>
      </Animated.View>

      <Animated.View entering={cascade(1)} style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionTick, { backgroundColor: ui.fill }]} />
          <Text style={styles.sectionTitle}>Pourquoi ?</Text>
        </View>
        {result.reasons.map((reason, index) => (
          <View key={index} style={styles.reasonRow}>
            <View style={[styles.reasonDot, { backgroundColor: ui.fill }]} />
            <Text style={styles.itemText}>{reason}</Text>
          </View>
        ))}
      </Animated.View>

      <Animated.View entering={cascade(2)} style={styles.actionCard}>
        <Text style={styles.sectionTitle}>Que faire maintenant ?</Text>
        {result.actions.map((action, index) => (
          <View key={index} style={styles.actionRow}>
            <View style={styles.actionNumber}>
              <Text style={styles.actionNumberText}>{index + 1}</Text>
            </View>
            <Text style={styles.itemText}>{action}</Text>
          </View>
        ))}
      </Animated.View>

      <Animated.View entering={cascade(3)}>
        {result.category !== 'AUCUNE' ? (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{CATEGORY_LABELS[result.category]}</Text>
          </View>
        ) : null}
        <Text style={styles.disclaimer}>{VERDICT_DISCLAIMER}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  verdictLabel: {
    ...type.verdict,
    fontSize: 24,
    textAlign: 'center',
    marginTop: spacing.m,
  },
  summary: {
    ...type.body,
    color: palette.texteDoux,
    textAlign: 'center',
    marginTop: spacing.s,
    paddingHorizontal: spacing.m,
  },
  section: {
    marginTop: spacing.xl,
    gap: spacing.m,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
  },
  sectionTick: {
    width: 4,
    height: 18,
    borderRadius: 2,
  },
  sectionTitle: {
    ...type.sectionTitle,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.m,
  },
  reasonDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 10,
  },
  actionCard: {
    marginTop: spacing.xl,
    gap: spacing.m,
    backgroundColor: palette.ardoise,
    borderWidth: 1,
    borderColor: palette.bordureDouce,
    borderRadius: radius.l,
    padding: spacing.l,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.m,
  },
  actionNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.4,
    borderColor: palette.laiton,
    backgroundColor: palette.laitonPale,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  actionNumberText: {
    fontFamily: fonts.textBold,
    fontSize: 14,
    lineHeight: 18,
    color: palette.laiton,
  },
  itemText: {
    ...type.body,
    flex: 1,
  },
  categoryBadge: {
    alignSelf: 'center',
    backgroundColor: palette.ardoiseElevee,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.s,
    marginTop: spacing.xl,
  },
  categoryText: {
    ...type.label,
    color: palette.texteDoux,
  },
  disclaimer: {
    ...type.bodySecondary,
    color: palette.texteMuet,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
