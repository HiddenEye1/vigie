import { Ionicons } from '@expo/vector-icons';
import type { ReactElement } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, fontSize, MIN_TOUCH_TARGET, radius, spacing } from '../lib/theme';

interface PrimaryButtonProps {
  readonly label: string;
  readonly onPress: () => void;
  readonly icon?: keyof typeof Ionicons.glyphMap;
  readonly variant?: 'primary' | 'secondary';
  readonly disabled?: boolean;
}

/** Bouton principal : gros, contrasté, cible tactile ≥ 44 pt, label d'accessibilité. */
export function PrimaryButton({
  label,
  onPress,
  icon,
  variant = 'primary',
  disabled = false,
}: PrimaryButtonProps): ReactElement {
  const isPrimary = variant === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        isPrimary ? styles.primary : styles.secondary,
        pressed && (isPrimary ? styles.primaryPressed : styles.secondaryPressed),
        disabled && styles.disabled,
      ]}
    >
      {icon ? (
        <Ionicons
          name={icon}
          size={24}
          color={isPrimary ? colors.onAccent : colors.accent}
          style={styles.icon}
        />
      ) : null}
      <Text style={[styles.label, isPrimary ? styles.labelPrimary : styles.labelSecondary]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: MIN_TOUCH_TARGET,
    borderRadius: radius.m,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: colors.accent,
  },
  primaryPressed: {
    backgroundColor: colors.accentPressed,
  },
  secondary: {
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  secondaryPressed: {
    backgroundColor: colors.surface,
  },
  disabled: {
    opacity: 0.5,
  },
  icon: {
    marginRight: spacing.s,
  },
  label: {
    fontSize: fontSize.button,
    fontWeight: '600',
    textAlign: 'center',
  },
  labelPrimary: {
    color: colors.onAccent,
  },
  labelSecondary: {
    color: colors.accent,
  },
});
