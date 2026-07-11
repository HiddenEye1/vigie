import { Ionicons } from '@expo/vector-icons';
import type { ReactElement } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { MIN_TOUCH_TARGET, palette, radius, spacing, type } from '../lib/theme';

interface PrimaryButtonProps {
  readonly label: string;
  readonly onPress: () => void;
  readonly icon?: keyof typeof Ionicons.glyphMap | undefined;
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
          color={
            disabled ? palette.texteMuet : isPrimary ? palette.surFeuSombre : palette.laiton
          }
          style={styles.icon}
        />
      ) : null}
      <Text
        style={[
          styles.label,
          isPrimary ? styles.labelPrimary : styles.labelSecondary,
          disabled && styles.labelDisabled,
        ]}
      >
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
    backgroundColor: palette.laiton,
  },
  primaryPressed: {
    backgroundColor: palette.laitonClair,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: palette.laiton,
  },
  secondaryPressed: {
    backgroundColor: palette.laitonPale,
  },
  pressedScale: {
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    backgroundColor: palette.ardoiseElevee,
    borderColor: 'transparent',
  },
  icon: {
    marginRight: spacing.s,
  },
  label: {
    ...type.button,
    textAlign: 'center',
  },
  labelPrimary: {
    color: palette.surFeuSombre,
  },
  labelSecondary: {
    color: palette.laiton,
  },
  labelDisabled: {
    color: palette.texteMuet,
  },
});
