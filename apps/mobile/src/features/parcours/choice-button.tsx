import { Ionicons } from '@expo/vector-icons';
import type { ReactElement } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { fonts, MIN_TOUCH_TARGET, palette, radius, spacing, type } from '@/lib/theme';

interface ChoiceButtonProps {
  readonly label: string;
  readonly onPress: () => void;
  readonly icon?: keyof typeof Ionicons.glyphMap | undefined;
  /** Mode senior : cible tactile et texte nettement agrandis. */
  readonly large?: boolean;
}

/**
 * Grand bouton de choix, cohérent partout dans les parcours (réponses de
 * questionnaire ET situations d'urgence). Cible tactile généreuse, libellé
 * lisible, icône optionnelle. En mode senior, tout grandit encore.
 */
export function ChoiceButton({ label, onPress, icon, large = false }: ChoiceButtonProps): ReactElement {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        large && styles.baseLarge,
        pressed && styles.pressed,
      ]}
    >
      {icon !== undefined ? (
        <View style={[styles.iconBox, large && styles.iconBoxLarge]}>
          <Ionicons name={icon} size={large ? 26 : 22} color={palette.laiton} />
        </View>
      ) : null}
      <Text style={[styles.label, large && styles.labelLarge]}>{label}</Text>
      <Ionicons name="chevron-forward" size={large ? 24 : 20} color={palette.texteMuet} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: MIN_TOUCH_TARGET + 8,
    backgroundColor: palette.ardoise,
    borderWidth: 1,
    borderColor: palette.bordureDouce,
    borderRadius: radius.l,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    gap: spacing.m,
  },
  baseLarge: {
    minHeight: 84,
    paddingVertical: spacing.l,
  },
  pressed: {
    backgroundColor: palette.ardoiseElevee,
    borderColor: palette.laitonFilet,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: radius.s,
    backgroundColor: palette.laitonPale,
    borderWidth: 1,
    borderColor: palette.laitonFilet,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxLarge: {
    width: 48,
    height: 48,
  },
  label: {
    flex: 1,
    ...type.body,
    fontFamily: fonts.textSemiBold,
  },
  labelLarge: {
    fontSize: 20,
    lineHeight: 28,
  },
});
