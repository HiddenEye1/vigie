import { Ionicons } from '@expo/vector-icons';
import type { AnalyzeResponse } from '@vigie/shared';
import type { ReactElement } from 'react';
import { forwardRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { CATEGORY_LABELS, VERDICT_UI } from '../lib/verdict-ui';
import { fonts, palette, radius, spacing, type } from '../lib/theme';
import { LighthouseLogo } from './lighthouse-logo';

interface ShareCardProps {
  readonly result: AnalyzeResponse;
}

/**
 * Carte-image partageable (F7, §8.4) : logo, pastille, catégorie, résumé —
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
        <LighthouseLogo size={34} />
        <Text style={styles.appName}>Vigie</Text>
      </View>

      <View style={[styles.badge, { backgroundColor: ui.fill }]}>
        <Ionicons name={ui.icon} size={30} color={ui.onFill} />
        <Text style={[styles.badgeLabel, { color: ui.onFill }]}>{ui.label}</Text>
      </View>

      {result.category !== 'AUCUNE' ? (
        <Text style={styles.category}>{CATEGORY_LABELS[result.category]}</Text>
      ) : null}

      <Text style={styles.summary}>{result.summary}</Text>

      <Text style={styles.footer}>
        Vérifié avec Vigie, l’application gratuite qui aide à repérer les arnaques.
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    width: 360,
    backgroundColor: palette.ecume,
    borderRadius: radius.l,
    padding: spacing.l,
    gap: spacing.m,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
  },
  appName: {
    ...type.sectionTitle,
    fontFamily: fonts.display,
    fontSize: 21,
  },
  badge: {
    borderRadius: radius.m,
    padding: spacing.l,
    alignItems: 'center',
    gap: spacing.s,
  },
  badgeLabel: {
    ...type.verdict,
    fontSize: 18,
    lineHeight: 26,
    textAlign: 'center',
  },
  category: {
    alignSelf: 'flex-start',
    ...type.label,
    color: palette.encreMarine,
    backgroundColor: palette.surfaceLegere,
    borderRadius: radius.s,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.xs,
  },
  summary: {
    ...type.body,
  },
  footer: {
    ...type.label,
  },
});
