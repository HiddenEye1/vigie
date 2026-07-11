import { Ionicons } from '@expo/vector-icons';
import type { ReactElement } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { fonts, palette, radius, spacing, type } from '@/lib/theme';

import { ChoiceButton } from './choice-button';
import type { OrientationOutcome, OrientationTarget } from './types';

interface OrientationResultViewProps {
  readonly outcome: OrientationOutcome;
  readonly onAction: (target: OrientationTarget) => void;
  readonly onRestart: () => void;
  readonly large?: boolean;
}

/**
 * Résultat d'un aiguillage : un message rassurant (« vous avez raison de
 * vérifier »), puis l'étape la plus sûre mise en avant et les autres options.
 * Jamais culpabilisant : l'utilisateur fait bien d'avoir un doute.
 */
export function OrientationResultView({
  outcome,
  onAction,
  onRestart,
  large = false,
}: OrientationResultViewProps): ReactElement {
  const [first, ...rest] = outcome.actions;

  return (
    <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
      <View style={styles.badge}>
        <Ionicons name="shield-checkmark" size={18} color={palette.laiton} />
        <Text style={styles.badgeLabel}>Vous faites bien de vérifier</Text>
      </View>

      <Text style={[styles.title, large && styles.titleLarge]}>{outcome.title}</Text>
      <Text style={[styles.message, large && styles.textLarge]}>{outcome.message}</Text>

      <View style={styles.actions}>
        {first !== undefined ? (
          <PrimaryButton label={first.label} icon={first.icon} onPress={() => { onAction(first.target); }} />
        ) : null}
        {rest.map((action) => (
          <ChoiceButton
            key={action.label}
            label={action.label}
            icon={action.icon}
            large={large}
            onPress={() => { onAction(action.target); }}
          />
        ))}
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
    backgroundColor: palette.laitonPale,
    borderWidth: 1,
    borderColor: palette.laitonFilet,
  },
  badgeLabel: {
    ...type.label,
    color: palette.laiton,
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
  message: {
    ...type.body,
  },
  textLarge: {
    fontSize: 20,
    lineHeight: 29,
  },
  actions: {
    gap: spacing.m,
    marginTop: spacing.s,
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
