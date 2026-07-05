import { Ionicons } from '@expo/vector-icons';
import type { ReactElement } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { MIN_TOUCH_TARGET, palette, radius, spacing, type } from '../lib/theme';

interface PrimaryButtonProps {
  readonly label: string;
  readonly onPress: () => void;
  readonly icon?: keyof typeof Ionicons.glyphMap;
  readonly variant?: 'primary' | 'secondary';
  readonly disabled?: boolean;
}

/**
 * Bouton Vigie : encre-marine (l'interactif du phare), cible ≥ 48 pt,
 * micro-feedback sobre à la pression (scale 0.98).
 */
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
        pressed && styles.pressedScale,
        disabled && styles.disabled,
      ]}
    >
      {icon ? (
        <Ionicons
          name={icon}
          size={22}
          color={isPrimary ? palette.ecume : palette.encreMarine}
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
    backgroundColor: palette.encreMarine,
  },
  primaryPressed: {
    backgroundColor: palette.encreMarinePressee,
  },
  secondary: {
    backgroundColor: palette.ecume,
    borderWidth: 1.5,
    borderColor: palette.encreMarine,
  },
  secondaryPressed: {
    backgroundColor: palette.surfaceLegere,
  },
  pressedScale: {
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.45,
  },
  icon: {
    marginRight: spacing.s,
  },
  label: {
    ...type.button,
    textAlign: 'center',
  },
  labelPrimary: {
    color: palette.ecume,
  },
  labelSecondary: {
    color: palette.encreMarine,
  },
});
