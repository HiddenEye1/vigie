import { Ionicons } from '@expo/vector-icons';
import type { AnalyzeResponse } from '@vigie/shared';
import type { ReactElement } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, ReduceMotion } from 'react-native-reanimated';

import { fonts, palette, radius, spacing, type } from '../lib/theme';
import { CATEGORY_LABELS, RISK_LEVEL_UI, VERDICT_DISCLAIMER, VERDICT_UI } from '../lib/verdict-ui';
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
 * Contenu du verdict, hiérarchisé pour le grand public et les seniors :
 * feu → niveau de risque → résumé simple → à ne surtout pas faire →
 * explications → conseils. Les blocs du format étendu (risk_level, score,
 * senior_summary, do_not) sont affichés s'ils sont présents ; sinon l'écran
 * retombe proprement sur l'ancien contenu. Jamais de pourcentage de confiance.
 */
export function VerdictContent({ result }: VerdictContentProps): ReactElement {
  const ui = VERDICT_UI[result.verdict];
  const risk = result.risk_level ? RISK_LEVEL_UI[result.risk_level] : null;

  return (
    <View>
      <VerdictBeacon verdict={result.verdict} />

      <Animated.View entering={cascade(0)}>
        <Text style={[styles.verdictLabel, { color: ui.text }]}>{ui.label}</Text>
      </Animated.View>

      {risk ? (
        <Animated.View entering={cascade(1)} style={styles.riskCard}>
          <View style={styles.riskHeader}>
            <View style={[styles.riskBadge, { backgroundColor: risk.fill }]}>
              <Text style={[styles.riskBadgeText, { color: risk.onFill }]}>
                Risque {risk.label}
              </Text>
            </View>
            {result.score !== undefined ? (
              <Text style={styles.scoreText}>{result.score} / 100</Text>
            ) : null}
          </View>
          {result.score !== undefined ? (
            <View
              style={styles.gaugeTrack}
              accessibilityLabel={`Score de risque : ${String(result.score)} sur 100`}
            >
              <View style={[styles.gaugeFill, { flex: result.score, backgroundColor: risk.fill }]} />
              <View style={{ flex: 100 - result.score }} />
            </View>
          ) : null}
        </Animated.View>
      ) : null}

      {result.senior_summary ? (
        <Animated.View entering={cascade(2)} style={styles.simpleCard}>
          <View style={styles.simpleHeader}>
            <Ionicons name="chatbubble-ellipses" size={20} color={palette.laiton} />
            <Text style={styles.simpleTitle}>Résumé simple</Text>
          </View>
          <Text style={styles.simpleText}>{result.senior_summary}</Text>
        </Animated.View>
      ) : null}

      {result.do_not ? (
        <Animated.View entering={cascade(3)} style={styles.dontCard}>
          <View style={styles.simpleHeader}>
            <Ionicons name="hand-left" size={22} color={palette.feuRouge} />
            <Text style={styles.dontTitle}>À ne surtout pas faire</Text>
          </View>
          <Text style={styles.dontText}>{result.do_not}</Text>
        </Animated.View>
      ) : null}

      <Animated.View entering={cascade(4)} style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionTick, { backgroundColor: ui.fill }]} />
          <Text style={styles.sectionTitle}>Pourquoi ?</Text>
        </View>
        <Text style={styles.explainLead}>{result.summary}</Text>
        {result.reasons.map((reason, index) => (
          <View key={index} style={styles.reasonRow}>
            <View style={[styles.reasonDot, { backgroundColor: ui.fill }]} />
            <Text style={styles.itemText}>{reason}</Text>
          </View>
        ))}
      </Animated.View>

      <Animated.View entering={cascade(5)} style={styles.actionCard}>
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

      <Animated.View entering={cascade(6)}>
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
  riskCard: {
    marginTop: spacing.l,
    gap: spacing.m,
    backgroundColor: palette.ardoise,
    borderWidth: 1,
    borderColor: palette.bordureDouce,
    borderRadius: radius.l,
    padding: spacing.l,
  },
  riskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.m,
  },
  riskBadge: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.xs,
  },
  riskBadgeText: {
    fontFamily: fonts.textBold,
    fontSize: 15,
  },
  scoreText: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: palette.texteClair,
  },
  gaugeTrack: {
    flexDirection: 'row',
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    backgroundColor: palette.ardoiseElevee,
  },
  gaugeFill: {
    borderRadius: 5,
  },
  simpleCard: {
    marginTop: spacing.l,
    gap: spacing.s,
    backgroundColor: palette.ardoise,
    borderWidth: 1,
    borderColor: palette.bordureDouce,
    borderRadius: radius.l,
    padding: spacing.l,
  },
  simpleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
  },
  simpleTitle: {
    ...type.sectionTitle,
  },
  simpleText: {
    ...type.body,
    fontSize: 18,
    lineHeight: 27,
    color: palette.texteClair,
  },
  dontCard: {
    marginTop: spacing.l,
    gap: spacing.s,
    backgroundColor: palette.ardoise,
    borderRadius: radius.l,
    borderLeftWidth: 4,
    borderLeftColor: palette.feuRouge,
    padding: spacing.l,
  },
  dontTitle: {
    ...type.sectionTitle,
    color: palette.texteFeuRouge,
  },
  dontText: {
    ...type.body,
    fontSize: 18,
    lineHeight: 27,
    color: palette.texteClair,
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
  explainLead: {
    ...type.body,
    color: palette.texteDoux,
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
