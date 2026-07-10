import { Ionicons } from '@expo/vector-icons';
import type { ReactElement } from 'react';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { useSeniorMode } from '@/features/family';
import { fonts, palette, radius, spacing, type } from '@/lib/theme';

import { ChoiceButton } from './choice-button';
import type { EmergencyParcours, EmergencySituation } from './types';
import { useAskContact } from './use-ask-contact';

const HELP_MESSAGE = [
  'Je pense être victime d’une arnaque en ce moment.',
  'Peux-tu m’aider tout de suite ?',
  '— Envoyé depuis Vigie',
].join('\n\n');

/**
 * Déroulé du parcours d'urgence : d'abord les consignes qui coupent l'arnaque
 * (toujours visibles), puis un choix de situation qui mène aux actions
 * prioritaires. Peu de texte, gros boutons, pensé pour une personne paniquée.
 */
export function EmergencyRunner({
  definition,
}: {
  readonly definition: EmergencyParcours;
}): ReactElement {
  const [situation, setSituation] = useState<EmergencySituation | null>(null);
  const large = useSeniorMode((state) => state.simpleMode);
  const askContact = useAskContact(HELP_MESSAGE);

  if (situation !== null) {
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.body}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Revenir aux consignes"
          onPress={() => {
            setSituation(null);
          }}
          hitSlop={8}
          style={styles.back}
        >
          <Ionicons name="chevron-back" size={20} color={palette.texteDoux} />
          <Text style={styles.backLabel}>Retour</Text>
        </Pressable>

        <Text style={[styles.heading, large && styles.headingLarge]}>{situation.heading}</Text>
        <Text style={styles.actionsLead}>À faire, dans cet ordre :</Text>

        <View style={styles.steps}>
          {situation.actions.map((action, position) => (
            <View key={action} style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{position + 1}</Text>
              </View>
              <Text style={[styles.stepText, large && styles.textLarge]}>{action}</Text>
            </View>
          ))}
        </View>

        <PrimaryButton label="Prévenir un proche" icon="people" onPress={askContact} />
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.body}>
      <View style={styles.urgentCard}>
        <View style={styles.urgentHead}>
          <Ionicons name="hand-left" size={22} color={palette.feuRouge} />
          <Text style={styles.urgentTitle}>Faites ceci tout de suite</Text>
        </View>
        <View style={styles.immediate}>
          {definition.immediateSteps.map((step) => (
            <View key={step} style={styles.immediateRow}>
              <Ionicons name="ellipse" size={7} color={palette.feuRouge} style={styles.dot} />
              <Text style={[styles.immediateText, large && styles.textLarge]}>{step}</Text>
            </View>
          ))}
        </View>
      </View>

      <Text style={[styles.pickTitle, large && styles.headingLarge]}>Que s’est-il passé ?</Text>
      <View style={styles.situations}>
        {definition.situations.map((item) => (
          <ChoiceButton
            key={item.id}
            label={item.label}
            icon={item.icon}
            large={large}
            onPress={() => {
              setSituation(item);
            }}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.nuit,
  },
  body: {
    padding: spacing.l,
    gap: spacing.m,
    paddingBottom: spacing.xl,
  },
  urgentCard: {
    backgroundColor: palette.ardoise,
    borderRadius: radius.l,
    borderLeftWidth: 4,
    borderLeftColor: palette.feuRouge,
    padding: spacing.l,
    gap: spacing.m,
  },
  urgentHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
  },
  urgentTitle: {
    ...type.sectionTitle,
    color: palette.texteFeuRouge,
  },
  immediate: {
    gap: spacing.s,
  },
  immediateRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.s,
  },
  dot: {
    marginTop: 9,
  },
  immediateText: {
    flex: 1,
    ...type.body,
  },
  textLarge: {
    fontSize: 20,
    lineHeight: 29,
  },
  pickTitle: {
    ...type.sectionTitle,
    marginTop: spacing.m,
  },
  headingLarge: {
    fontSize: 30,
    lineHeight: 40,
  },
  situations: {
    gap: spacing.m,
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    minHeight: 40,
  },
  backLabel: {
    ...type.bodySecondary,
    fontFamily: fonts.textSemiBold,
  },
  heading: {
    ...type.screenTitle,
    fontSize: 26,
    lineHeight: 34,
  },
  actionsLead: {
    ...type.bodySecondary,
  },
  steps: {
    gap: spacing.m,
    marginTop: spacing.xs,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.m,
    backgroundColor: palette.ardoise,
    borderRadius: radius.l,
    padding: spacing.l,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    backgroundColor: palette.laiton,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    ...type.label,
    color: palette.surFeuSombre,
    fontFamily: fonts.displaySemiBold,
  },
  stepText: {
    flex: 1,
    ...type.body,
  },
});
