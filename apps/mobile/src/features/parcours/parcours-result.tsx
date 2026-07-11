import { Ionicons } from '@expo/vector-icons';
import type { ReactElement } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { fonts, palette, radius, spacing, type } from '@/lib/theme';

import { PARCOURS_LEVEL_UI } from './result-ui';
import type { ParcoursOutcome } from './types';

interface ParcoursResultViewProps {
  readonly outcome: ParcoursOutcome;
  readonly onAnalyze: () => void;
  readonly onAskContact: () => void;
  readonly onEmergency: () => void;
  readonly onRestart: () => void;
  /** Libellé du bouton d'analyse (« Analyser le message reçu » / « le lien »). */
  readonly analyzeLabel?: string;
  /** Mode senior : titre et texte agrandis. */
  readonly large?: boolean;
}

/**
 * Résultat du parcours : un verdict clair, un message simple, l'action à éviter,
 * l'action recommandée, puis les portes de sortie utiles (analyser le message,
 * demander à un proche, réagir en urgence). Ton direct et rassurant, jamais
 * culpabilisant.
 */
export function ParcoursResultView({
  outcome,
  onAnalyze,
  onAskContact,
  onEmergency,
  onRestart,
  analyzeLabel = 'Analyser le message reçu',
  large = false,
}: ParcoursResultViewProps): ReactElement {
  const ui = PARCOURS_LEVEL_UI[outcome.level];

  return (
    <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
      <View style={[styles.badge, { backgroundColor: ui.fill }]}>
        <Ionicons name={ui.icon} size={18} color={ui.onFill} />
        <Text style={[styles.badgeLabel, { color: ui.onFill }]}>{ui.label}</Text>
      </View>

      <Text style={[styles.title, large && styles.titleLarge, { color: ui.text }]}>
        {outcome.title}
      </Text>
      <Text style={[styles.message, large && styles.textLarge]}>{outcome.message}</Text>

      <View style={styles.doNotCard}>
        <View style={styles.cardHead}>
          <Ionicons name="hand-left" size={20} color={palette.feuRouge} />
          <Text style={[styles.cardTitle, { color: palette.texteFeuRouge }]}>
            À ne surtout pas faire
          </Text>
        </View>
        <Text style={[styles.cardBody, large && styles.textLarge]}>{outcome.doNot}</Text>
      </View>

      <View style={styles.doCard}>
        <View style={styles.cardHead}>
          <Ionicons name="checkmark-circle" size={20} color={palette.laiton} />
          <Text style={[styles.cardTitle, { color: palette.texteClair }]}>
            Ce que vous pouvez faire
          </Text>
        </View>
        <Text style={[styles.cardBody, large && styles.textLarge]}>{outcome.doInstead}</Text>
      </View>

      <View style={styles.actions}>
        <PrimaryButton label={analyzeLabel} icon="document-text" onPress={onAnalyze} />
        <PrimaryButton
          label="Demander à un proche"
          icon="people"
          variant="secondary"
          onPress={onAskContact}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Je suis en train de me faire arnaquer"
          onPress={onEmergency}
          style={({ pressed }) => [styles.emergency, pressed && styles.emergencyPressed]}
        >
          <Ionicons name="alert-circle" size={22} color={palette.feuRouge} />
          <Text style={styles.emergencyLabel}>Je suis en train de me faire arnaquer</Text>
        </Pressable>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Recommencer le parcours"
        onPress={onRestart}
        hitSlop={8}
        style={styles.restart}
      >
        <Ionicons name="refresh" size={18} color={palette.texteDoux} />
        <Text style={styles.restartLabel}>Recommencer</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: {
    padding: spacing.l,
    gap: spacing.m,
    paddingBottom: spacing.xl,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.s,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: radius.pill,
  },
  badgeLabel: {
    ...type.label,
  },
  title: {
    ...type.screenTitle,
    fontSize: 26,
    lineHeight: 34,
  },
  titleLarge: {
    fontSize: 30,
    lineHeight: 40,
  },
  textLarge: {
    fontSize: 20,
    lineHeight: 29,
  },
  message: {
    ...type.body,
  },
  doNotCard: {
    backgroundColor: palette.ardoise,
    borderRadius: radius.l,
    borderLeftWidth: 4,
    borderLeftColor: palette.feuRouge,
    padding: spacing.l,
    gap: spacing.s,
    marginTop: spacing.s,
  },
  doCard: {
    backgroundColor: palette.ardoise,
    borderRadius: radius.l,
    borderLeftWidth: 4,
    borderLeftColor: palette.laiton,
    padding: spacing.l,
    gap: spacing.s,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
  },
  cardTitle: {
    ...type.sectionTitle,
    fontSize: 17,
  },
  cardBody: {
    ...type.body,
  },
  actions: {
    gap: spacing.m,
    marginTop: spacing.m,
  },
  emergency: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.s,
    minHeight: 56,
    borderRadius: radius.m,
    borderWidth: 1.5,
    borderColor: palette.feuRouge,
    backgroundColor: 'transparent',
    paddingHorizontal: spacing.l,
  },
  emergencyPressed: {
    backgroundColor: 'rgba(229, 86, 74, 0.12)',
  },
  emergencyLabel: {
    ...type.button,
    color: palette.texteFeuRouge,
    textAlign: 'center',
    flexShrink: 1,
  },
  restart: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.s,
    marginTop: spacing.s,
    minHeight: 44,
  },
  restartLabel: {
    ...type.bodySecondary,
    fontFamily: fonts.textSemiBold,
  },
});
