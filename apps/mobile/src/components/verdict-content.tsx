import type { AnalyzeResponse } from '@vigie/shared';
import type { ReactElement } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, ReduceMotion } from 'react-native-reanimated';

import { cardShadow, palette, radius, spacing, type } from '../lib/theme';
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
 * → catégorie → mention obligatoire. Jamais de pourcentage de confiance.
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

      <Animated.View entering={cascade(1)} style={styles.card}>
        <Text style={styles.sectionTitle}>Pourquoi ?</Text>
        {result.reasons.map((reason, index) => (
          <View key={index} style={styles.reasonRow}>
            <View style={styles.reasonDot} />
            <Text style={styles.itemText}>{reason}</Text>
          </View>
        ))}
      </Animated.View>

      <Animated.View entering={cascade(2)} style={styles.card}>
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
    textAlign: 'center',
    marginTop: spacing.s,
  },
  summary: {
    ...type.body,
    textAlign: 'center',
    marginTop: spacing.m,
    paddingHorizontal: spacing.s,
  },
  card: {
    ...cardShadow,
    backgroundColor: palette.ecume,
    borderRadius: radius.l,
    padding: spacing.l,
    marginTop: spacing.xl,
    gap: spacing.m,
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
    backgroundColor: palette.encreMarine,
    marginTop: 10,
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
    backgroundColor: palette.encreMarine,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  actionNumberText: {
    ...type.label,
    color: palette.ecume,
    lineHeight: 18,
  },
  itemText: {
    ...type.body,
    flex: 1,
  },
  categoryBadge: {
    alignSelf: 'center',
    backgroundColor: palette.surfaceLegere,
    borderRadius: radius.s,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.s,
    marginTop: spacing.xl,
  },
  categoryText: {
    ...type.label,
    color: palette.encreMarine,
  },
  disclaimer: {
    ...type.bodySecondary,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
