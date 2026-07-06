import { Ionicons } from '@expo/vector-icons';
import type { ReactElement } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { cardShadow, fonts, palette, radius, spacing } from '../lib/theme';

interface CompactActionCardProps {
  readonly title: string;
  readonly icon: keyof typeof Ionicons.glyphMap;
  readonly onPress: () => void;
}

/**
 * Action secondaire de l'accueil : posée par deux, côte à côte, sous la carte
 * principale. Icône en haut, titre en bas — subordonnée à l'action n°1.
 */
export function CompactActionCard({ title, icon, onPress }: CompactActionCardProps): ReactElement {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.iconBox}>
        <Ionicons name={icon} size={24} color={palette.encreMarine} />
      </View>
      <Text style={styles.title}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    ...cardShadow,
    flex: 1,
    backgroundColor: palette.ecume,
    borderRadius: radius.l,
    padding: spacing.l,
    gap: spacing.m,
    minHeight: 108,
    justifyContent: 'space-between',
  },
  cardPressed: {
    backgroundColor: palette.surfaceLegere,
    transform: [{ scale: 0.98 }],
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: radius.s,
    backgroundColor: palette.surfaceLegere,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: fonts.textSemiBold,
    fontSize: 16,
    lineHeight: 21,
    color: palette.encreMarine,
  },
});
