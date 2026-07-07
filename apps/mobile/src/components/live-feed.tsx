import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { ReactElement } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SCAM_GUIDES } from '../lib/scam-guides';
import { fonts, palette, spacing } from '../lib/theme';
import { VeilleBadge } from './veille-badge';

/** Niveau de menace affiché (couleur du feu) + repère temporel « en direct ». */
const PULSE = [
  { feu: palette.feuRouge, when: 'à l’instant' },
  { feu: palette.feuAmbre, when: 'il y a 12 min' },
  { feu: palette.feuRouge, when: 'il y a 40 min' },
  { feu: palette.feuAmbre, when: 'il y a 2 h' },
  { feu: palette.feuVert, when: 'ce matin' },
] as const;

/**
 * Sélection « du moment », déterministe : tourne au fil des jours pour donner
 * un sentiment de fraîcheur sans dépendre d'un réseau.
 */
function feedOfTheDay(count: number): typeof SCAM_GUIDES {
  const dayIndex = Math.floor(Date.now() / 86_400_000);
  const start = dayIndex % SCAM_GUIDES.length;
  return Array.from(
    { length: count },
    (_, i) => SCAM_GUIDES[(start + i) % SCAM_GUIDES.length],
  ) as unknown as typeof SCAM_GUIDES;
}

/**
 * Le fil « Arnaques du moment » : un journal vertical qui défile dans le temps.
 * Une échine relie les entrées, chacune marquée d'un feu coloré et d'un repère
 * temporel. Ça respire la veille en direct, et ça enseigne au passage.
 */
export function LiveFeed(): ReactElement {
  const router = useRouter();
  const guides = feedOfTheDay(PULSE.length);

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Arnaques du moment</Text>
        <VeilleBadge label="en direct" />
      </View>

      <View>
        {guides.map((guide, index) => {
          const pulse = PULSE[index] ?? PULSE[0];
          const first = index === 0;
          const last = index === guides.length - 1;
          return (
            <Pressable
              key={guide.id}
              accessibilityRole="button"
              accessibilityLabel={`Arnaque du moment : ${guide.title}, ${pulse.when}`}
              onPress={() => {
                router.push(`/fiche/${guide.id}`);
              }}
              style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            >
              <View style={styles.rail}>
                <View style={[styles.spine, first && styles.spineHidden]} />
                <View style={styles.dotWrap}>
                  <View style={[styles.halo, { backgroundColor: pulse.feu }]} />
                  <View style={[styles.core, { backgroundColor: pulse.feu }]} />
                </View>
                <View style={[styles.spine, styles.spineGrow, last && styles.spineHidden]} />
              </View>

              <View style={styles.content}>
                <Text style={styles.when}>{pulse.when}</Text>
                <Text style={styles.title} numberOfLines={2}>
                  {guide.title}
                </Text>
              </View>

              <Ionicons name="chevron-forward" size={18} color={palette.texteMuet} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const RAIL_WIDTH = 28;

const styles = StyleSheet.create({
  section: {
    gap: spacing.m,
    paddingHorizontal: spacing.l,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 19,
    lineHeight: 28,
    color: palette.texteClair,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing.m,
    minHeight: 60,
  },
  rowPressed: {
    opacity: 0.6,
  },
  rail: {
    width: RAIL_WIDTH,
    alignItems: 'center',
  },
  spine: {
    width: 2,
    height: 14,
    backgroundColor: palette.bordure,
  },
  spineGrow: {
    flex: 1,
    height: undefined,
  },
  spineHidden: {
    backgroundColor: 'transparent',
  },
  dotWrap: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  halo: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    opacity: 0.26,
  },
  core: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
  },
  content: {
    flex: 1,
    paddingTop: spacing.s,
    paddingBottom: spacing.m,
    gap: 2,
  },
  when: {
    fontFamily: fonts.textSemiBold,
    fontSize: 12,
    color: palette.texteMuet,
  },
  title: {
    fontFamily: fonts.textMedium,
    fontSize: 15,
    lineHeight: 20,
    color: palette.texteClair,
  },
});
