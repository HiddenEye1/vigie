import { Ionicons } from '@expo/vector-icons';
import type { AnalyzeResponse } from '@vigie/shared';
import type { ReactElement } from 'react';
import { forwardRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

import { fonts, palette, radius, spacing, type } from '../lib/theme';
import { CATEGORY_LABELS, VERDICT_UI } from '../lib/verdict-ui';
import { LighthouseLogo } from './lighthouse-logo';

interface ShareCardProps {
  readonly result: AnalyzeResponse;
}

const GLOW = 200;
const CORE = 96;

/**
 * Carte-image partageable (F7, §8.4) : identité « Gardien » complète — logo phare,
 * feu du phare à la couleur du verdict, résumé, pied « Vérifié avec Vigie ».
 * JAMAIS le contenu original analysé (risque de données personnelles).
 * Rendue hors écran puis capturée avec react-native-view-shot.
 */
export const ShareCard = forwardRef<View, ShareCardProps>(function ShareCard(
  { result },
  ref,
): ReactElement {
  const ui = VERDICT_UI[result.verdict];
  return (
    <View ref={ref} collapsable={false} style={styles.card}>
      <View style={styles.header}>
        <LighthouseLogo size={32} stroke={palette.texteClair} lantern={palette.laiton} />
        <Text style={styles.appName}>Vigie</Text>
        <View style={styles.flex} />
        <View style={styles.veillePill}>
          <View style={styles.veilleDot} />
          <Text style={styles.veilleText}>en veille</Text>
        </View>
      </View>

      <View style={styles.beacon}>
        <Svg width={GLOW} height={GLOW} style={styles.glow}>
          <Defs>
            <RadialGradient id="shareFeu" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={ui.halo} stopOpacity={0.6} />
              <Stop offset="42%" stopColor={ui.halo} stopOpacity={0.22} />
              <Stop offset="100%" stopColor={ui.halo} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx={GLOW / 2} cy={GLOW / 2} r={GLOW / 2} fill="url(#shareFeu)" />
          <Circle
            cx={GLOW / 2}
            cy={GLOW / 2}
            r={CORE / 2 + 14}
            stroke={ui.halo}
            strokeOpacity={0.55}
            strokeWidth={1.5}
            fill="none"
          />
        </Svg>
        <View style={[styles.core, { backgroundColor: ui.fill }]}>
          <Ionicons name={ui.icon} size={46} color={ui.onFill} />
        </View>
      </View>

      <Text style={[styles.verdictLabel, { color: ui.text }]}>{ui.label}</Text>

      {result.category !== 'AUCUNE' ? (
        <Text style={styles.category}>{CATEGORY_LABELS[result.category]}</Text>
      ) : null}

      <Text style={styles.summary}>{result.summary}</Text>

      <View style={styles.divider} />

      <View style={styles.footer}>
        <Ionicons name="shield-checkmark" size={18} color={palette.laiton} />
        <View style={styles.flex}>
          <Text style={styles.footerBrand}>Vérifié avec Vigie</Text>
          <Text style={styles.footerTag}>
            L’appli gratuite qui aide à repérer les arnaques.
          </Text>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    width: 360,
    backgroundColor: palette.nuit,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: palette.bordureDouce,
    padding: spacing.xl,
    gap: spacing.m,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
    alignSelf: 'stretch',
  },
  flex: {
    flex: 1,
  },
  appName: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: palette.texteClair,
  },
  veillePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: 5,
    paddingHorizontal: spacing.m,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: palette.bordure,
  },
  veilleDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: palette.feuVert,
  },
  veilleText: {
    fontFamily: fonts.textSemiBold,
    fontSize: 11,
    color: palette.texteDoux,
  },
  beacon: {
    width: GLOW,
    height: GLOW,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.s,
  },
  glow: {
    position: 'absolute',
  },
  core: {
    width: CORE,
    height: CORE,
    borderRadius: CORE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verdictLabel: {
    ...type.verdict,
    fontSize: 22,
    textAlign: 'center',
  },
  category: {
    ...type.label,
    color: palette.texteDoux,
    backgroundColor: palette.ardoiseElevee,
    borderRadius: radius.pill,
    overflow: 'hidden',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.xs,
  },
  summary: {
    ...type.body,
    color: palette.texteClair,
    textAlign: 'center',
    paddingHorizontal: spacing.s,
  },
  divider: {
    alignSelf: 'stretch',
    height: 1,
    backgroundColor: palette.bordureDouce,
    marginTop: spacing.s,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
    alignSelf: 'stretch',
  },
  footerBrand: {
    fontFamily: fonts.textSemiBold,
    fontSize: 14,
    color: palette.laiton,
  },
  footerTag: {
    ...type.label,
    color: palette.texteMuet,
  },
});
