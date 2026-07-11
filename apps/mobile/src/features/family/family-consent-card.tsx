import { Ionicons } from '@expo/vector-icons';
import type { ReactElement } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { palette, radius, spacing, type } from '@/lib/theme';

/**
 * Les quatre engagements de la veille consentie (VISION §3, ligne rouge).
 * Formulés côté senior, au présent, rassurants et concrets.
 */
const COMMITMENTS = [
  'Votre proche ne voit rien automatiquement.',
  'Rien ne part sans votre geste.',
  'Tout reste sur ce téléphone.',
  'Vous pouvez arrêter à tout moment.',
] as const;

/**
 * Carte « Une veille, pas une surveillance ». Pose la ligne rouge du Bouclier
 * famille en langage simple : le proche est un renfort que le senior choisit,
 * jamais un œil braqué sur lui. Statique et purement informative.
 */
export function FamilyConsentCard(): ReactElement {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Une veille, pas une surveillance</Text>
      <Text style={styles.intro}>
        Demander l’avis d’un proche, c’est un renfort que vous choisissez — jamais une surveillance.
      </Text>
      <View style={styles.list}>
        {COMMITMENTS.map((line) => (
          <View key={line} style={styles.item}>
            <Ionicons name="checkmark-circle" size={22} color={palette.texteFeuVert} />
            <Text style={styles.itemText}>{line}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.ardoise,
    borderWidth: 1,
    borderColor: palette.bordureDouce,
    borderRadius: radius.l,
    padding: spacing.l,
    gap: spacing.m,
  },
  title: {
    ...type.sectionTitle,
  },
  intro: {
    ...type.body,
    color: palette.texteDoux,
  },
  list: {
    gap: spacing.s,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
  },
  itemText: {
    flex: 1,
    ...type.body,
  },
});
