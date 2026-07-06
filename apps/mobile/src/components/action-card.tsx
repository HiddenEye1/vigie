import { Ionicons } from '@expo/vector-icons';
import type { ReactElement } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { cardShadow, palette, radius, spacing, type } from '../lib/theme';

interface ActionCardProps {
  readonly title: string;
  readonly subtitle: string;
  readonly icon: keyof typeof Ionicons.glyphMap;
  readonly onPress: () => void;
}

/**
 * Grande carte tactile de l'accueil : icône + titre + sous-titre d'exemple.
 * Pleine largeur, hauteur minimale 72, micro-feedback sobre à la pression.
 */
export function ActionCard({ title, subtitle, icon, onPress }: ActionCardProps): ReactElement {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${subtitle}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.iconBox}>
        <Ionicons name={icon} size={26} color={palette.encreMarine} />
      </View>
      <View style={styles.textBox}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={22} color={palette.texteSecondaire} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    ...cardShadow,
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.ecume,
    borderRadius: radius.l,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    gap: spacing.m,
  },
  cardPressed: {
    backgroundColor: palette.surfaceLegere,
    transform: [{ scale: 0.98 }],
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: radius.s,
    backgroundColor: palette.surfaceLegere,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBox: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...type.sectionTitle,
  },
  subtitle: {
    ...type.bodySecondary,
  },
});
