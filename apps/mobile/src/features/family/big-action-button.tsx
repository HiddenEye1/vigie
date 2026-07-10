import { Ionicons } from '@expo/vector-icons';
import type { ReactElement } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { palette, radius, simple, spacing } from '@/lib/theme';

interface BigActionButtonProps {
  readonly label: string;
  readonly icon: keyof typeof Ionicons.glyphMap;
  readonly onPress: () => void;
  /** Aplat laiton (le geste dominant) ou contour laiton (l'autre grand geste). */
  readonly variant?: 'primary' | 'secondary';
  /** Phrase lue par VoiceOver / TalkBack après le libellé. */
  readonly hint: string;
}

/**
 * Grand bouton du mode simplifié : cible tactile très généreuse, libellé en
 * grande taille, icône lisible. Pensé pour être atteint sans viser, et annoncé
 * clairement par VoiceOver / TalkBack.
 */
export function BigActionButton({
  label,
  icon,
  onPress,
  variant = 'primary',
  hint,
}: BigActionButtonProps): ReactElement {
  const isPrimary = variant === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={hint}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        isPrimary ? styles.primary : styles.secondary,
        pressed && (isPrimary ? styles.primaryPressed : styles.secondaryPressed),
      ]}
    >
      <Ionicons
        name={icon}
        size={simple.icone}
        color={isPrimary ? palette.surFeuSombre : palette.laiton}
      />
      <Text style={[styles.label, isPrimary ? styles.labelPrimary : styles.labelSecondary]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: simple.cible,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.l,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.m,
  },
  primary: {
    backgroundColor: palette.laiton,
  },
  primaryPressed: {
    backgroundColor: palette.laitonClair,
  },
  secondary: {
    backgroundColor: palette.ardoise,
    borderWidth: 2,
    borderColor: palette.laiton,
  },
  secondaryPressed: {
    backgroundColor: palette.ardoiseElevee,
  },
  label: {
    ...simple.bouton,
    flexShrink: 1,
    textAlign: 'center',
  },
  labelPrimary: {
    color: palette.surFeuSombre,
  },
  labelSecondary: {
    color: palette.laiton,
  },
});
