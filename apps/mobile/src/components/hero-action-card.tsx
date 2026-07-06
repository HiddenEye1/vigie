import { Ionicons } from '@expo/vector-icons';
import type { ReactElement } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { cardShadow, fonts, palette, radius, spacing, type } from '../lib/theme';

interface HeroActionCardProps {
  readonly title: string;
  readonly subtitle: string;
  readonly icon: keyof typeof Ionicons.glyphMap;
  readonly onPress: () => void;
}

/**
 * Action principale surdimensionnée de l'accueil : le geste n°1.
 * Grande carte haute, icône généreuse dans une pastille encre-marine,
 * titre 20 + sous-titre. Domine visuellement les 2 actions secondaires.
 */
export function HeroActionCard({
  title,
  subtitle,
  icon,
  onPress,
}: HeroActionCardProps): ReactElement {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${subtitle}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.iconBox}>
        <Ionicons name={icon} size={30} color={palette.ecume} />
      </View>
      <View style={styles.textBox}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="arrow-forward" size={24} color={palette.encreMarine} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    ...cardShadow,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.ecume,
    borderRadius: radius.l,
    padding: spacing.l,
    gap: spacing.l,
    minHeight: 104,
  },
  cardPressed: {
    backgroundColor: palette.surfaceLegere,
    transform: [{ scale: 0.99 }],
  },
  iconBox: {
    width: 60,
    height: 60,
    borderRadius: radius.m,
    backgroundColor: palette.encreMarine,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBox: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 20,
    lineHeight: 27,
    color: palette.encreMarine,
  },
  subtitle: {
    ...type.bodySecondary,
  },
});
