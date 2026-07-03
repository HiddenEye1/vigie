import { Ionicons } from '@expo/vector-icons';
import type { AnalyzeResponse } from '@vigie/shared';
import type { ReactElement } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { CATEGORY_LABELS, VERDICT_DISCLAIMER, VERDICT_UI } from '../lib/verdict-ui';
import { colors, fontSize, radius, spacing } from '../lib/theme';

interface VerdictContentProps {
  readonly result: AnalyzeResponse;
}

/**
 * Contenu du verdict, dans l'ordre imposé par le §4.2 :
 * pastille géante → phrase-résumé → « Pourquoi » → « Que faire maintenant »
 * → catégorie → mention obligatoire. Jamais de pourcentage de confiance.
 */
export function VerdictContent({ result }: VerdictContentProps): ReactElement {
  const ui = VERDICT_UI[result.verdict];
  return (
    <View>
      <View
        style={[styles.badge, { backgroundColor: ui.color }]}
        accessibilityRole="header"
        accessibilityLabel={`Résultat : ${ui.label}`}
      >
        <Ionicons name={ui.icon} size={44} color={colors.onAccent} />
        <Text style={styles.badgeLabel}>{ui.label}</Text>
      </View>

      <Text style={styles.summary}>{result.summary}</Text>

      <Text style={styles.sectionTitle}>Pourquoi ?</Text>
      {result.reasons.map((reason, index) => (
        <View key={index} style={styles.listItem}>
          <Text style={[styles.bullet, { color: ui.color }]}>•</Text>
          <Text style={styles.listText}>{reason}</Text>
        </View>
      ))}

      <Text style={styles.sectionTitle}>Que faire maintenant ?</Text>
      {result.actions.map((action, index) => (
        <View key={index} style={styles.listItem}>
          <Text style={styles.number}>{index + 1}.</Text>
          <Text style={styles.listText}>{action}</Text>
        </View>
      ))}

      {result.category !== 'AUCUNE' ? (
        <View style={styles.categoryBadge}>
          <Ionicons name="pricetag" size={18} color={colors.textSecondary} />
          <Text style={styles.categoryText}>{CATEGORY_LABELS[result.category]}</Text>
        </View>
      ) : null}

      <Text style={styles.disclaimer}>{VERDICT_DISCLAIMER}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: radius.l,
    paddingVertical: spacing.l,
    paddingHorizontal: spacing.l,
    alignItems: 'center',
    gap: spacing.s,
  },
  badgeLabel: {
    color: colors.onAccent,
    fontSize: fontSize.badge,
    fontWeight: '700',
    textAlign: 'center',
  },
  summary: {
    fontSize: fontSize.subtitle,
    color: colors.textPrimary,
    marginTop: spacing.l,
    lineHeight: 28,
  },
  sectionTitle: {
    fontSize: fontSize.body,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: spacing.l,
    marginBottom: spacing.s,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: spacing.s,
    paddingRight: spacing.m,
  },
  bullet: {
    fontSize: fontSize.body,
    fontWeight: '700',
    marginRight: spacing.s,
    lineHeight: 26,
  },
  number: {
    fontSize: fontSize.body,
    fontWeight: '700',
    color: colors.accent,
    marginRight: spacing.s,
    lineHeight: 26,
  },
  listText: {
    flex: 1,
    fontSize: fontSize.body,
    color: colors.textSecondary,
    lineHeight: 26,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: radius.s,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    marginTop: spacing.l,
    gap: spacing.s,
  },
  categoryText: {
    fontSize: fontSize.small,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  disclaimer: {
    fontSize: fontSize.small,
    color: colors.textSecondary,
    marginTop: spacing.xl,
    lineHeight: 22,
  },
});
