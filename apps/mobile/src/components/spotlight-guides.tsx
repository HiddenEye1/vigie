import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { ReactElement } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { SCAM_GUIDES } from '../lib/scam-guides';
import { cardShadow, fonts, palette, radius, spacing, type } from '../lib/theme';

/** Icône linéaire cohérente : variante -outline quand elle existe. */
function outlineIcon(icon: string): keyof typeof Ionicons.glyphMap {
  const glyphs = Ionicons.glyphMap as Record<string, number>;
  const outlined = `${icon}-outline`;
  return (outlined in glyphs ? outlined : icon) as keyof typeof Ionicons.glyphMap;
}

/**
 * Sélection « du jour », déterministe : tourne au fil des jours pour donner
 * un sentiment de fraîcheur, sans dépendre d'un réseau.
 */
function spotlightOfTheDay(count: number): typeof SCAM_GUIDES {
  const dayIndex = Math.floor(Date.now() / 86_400_000);
  const start = dayIndex % SCAM_GUIDES.length;
  return Array.from(
    { length: count },
    (_, i) => SCAM_GUIDES[(start + i) % SCAM_GUIDES.length],
  ) as unknown as typeof SCAM_GUIDES;
}

/**
 * Bande « Arnaques du moment » : carrousel horizontal de vignettes de fiches.
 * Remplit le bas de l'accueil avec du contenu à explorer, et enseigne en continu.
 */
export function SpotlightGuides(): ReactElement {
  const router = useRouter();
  const guides = spotlightOfTheDay(6);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Arnaques du moment</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.carousel}
      >
        {guides.map((guide) => (
          <Pressable
            key={guide.id}
            accessibilityRole="button"
            accessibilityLabel={`Fiche conseil : ${guide.title}`}
            onPress={() => {
              router.push(`/fiche/${guide.id}`);
            }}
            style={({ pressed }) => [styles.vignette, pressed && styles.vignettePressed]}
          >
            <View style={styles.iconBox}>
              <Ionicons name={outlineIcon(guide.icon)} size={22} color={palette.encreMarine} />
            </View>
            <Text style={styles.vignetteTitle} numberOfLines={3}>
              {guide.title}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const VIGNETTE_WIDTH = 148;

const styles = StyleSheet.create({
  section: {
    gap: spacing.m,
  },
  sectionTitle: {
    ...type.sectionTitle,
    paddingHorizontal: spacing.l,
  },
  carousel: {
    paddingHorizontal: spacing.l,
    gap: spacing.m,
  },
  vignette: {
    ...cardShadow,
    width: VIGNETTE_WIDTH,
    backgroundColor: palette.ecume,
    borderRadius: radius.l,
    padding: spacing.l,
    gap: spacing.m,
    minHeight: 132,
  },
  vignettePressed: {
    backgroundColor: palette.surfaceLegere,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: radius.s,
    backgroundColor: palette.laitonPale,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vignetteTitle: {
    fontFamily: fonts.textSemiBold,
    fontSize: 15,
    lineHeight: 20,
    color: palette.encreMarine,
  },
});
