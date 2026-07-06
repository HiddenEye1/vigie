import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { ReactElement } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SCAM_GUIDES } from '../../lib/scam-guides';
import { cardShadow, MIN_TOUCH_TARGET, palette, radius, spacing, type } from '../../lib/theme';

/** Icône linéaire cohérente : variante -outline quand elle existe. */
function outlineIcon(icon: string): keyof typeof Ionicons.glyphMap {
  const glyphs = Ionicons.glyphMap as Record<string, number>;
  const outlined = `${icon}-outline`;
  return (outlined in glyphs ? outlined : icon) as keyof typeof Ionicons.glyphMap;
}

/** Catalogue des 15 fiches conseils (F6) — contenu embarqué, consultable hors ligne. */
export default function GuidesScreen(): ReactElement {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={SCAM_GUIDES}
        keyExtractor={(guide) => guide.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Fiches conseils</Text>
            <Text style={styles.subtitle}>
              Les 15 arnaques les plus courantes en France, et les bons gestes pour s’en protéger.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Fiche conseil : ${item.title}`}
            onPress={() => {
              router.push(`/fiche/${item.id}`);
            }}
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
          >
            <View style={styles.iconBox}>
              <Ionicons name={outlineIcon(item.icon)} size={24} color={palette.encreMarine} />
            </View>
            <Text style={styles.rowTitle}>{item.title}</Text>
            <Ionicons name="chevron-forward" size={22} color={palette.texteSecondaire} />
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.brume,
  },
  header: {
    paddingBottom: spacing.m,
    gap: spacing.s,
  },
  title: {
    ...type.screenTitle,
  },
  subtitle: {
    ...type.bodySecondary,
  },
  list: {
    padding: spacing.l,
    gap: spacing.m,
    paddingBottom: spacing.xl,
  },
  row: {
    ...cardShadow,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.ecume,
    borderRadius: radius.l,
    padding: spacing.l,
    minHeight: MIN_TOUCH_TARGET,
    gap: spacing.m,
  },
  rowPressed: {
    backgroundColor: palette.surfaceLegere,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: radius.s,
    backgroundColor: palette.surfaceLegere,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: {
    flex: 1,
    ...type.body,
    fontFamily: 'Inter_600SemiBold',
  },
});
