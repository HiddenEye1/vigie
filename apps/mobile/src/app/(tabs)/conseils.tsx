import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { ReactElement } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SCAM_GUIDES } from '../../lib/scam-guides';
import { colors, fontSize, MIN_TOUCH_TARGET, radius, spacing } from '../../lib/theme';

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
              <Ionicons
                name={item.icon as keyof typeof Ionicons.glyphMap}
                size={24}
                color={colors.accent}
              />
            </View>
            <Text style={styles.rowTitle}>{item.title}</Text>
            <Ionicons name="chevron-forward" size={22} color={colors.border} />
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingBottom: spacing.m,
    gap: spacing.s,
  },
  title: {
    fontSize: fontSize.title,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: fontSize.body,
    color: colors.textSecondary,
    lineHeight: 26,
  },
  list: {
    padding: spacing.l,
    gap: spacing.m,
    paddingBottom: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.m,
    padding: spacing.m,
    minHeight: MIN_TOUCH_TARGET,
    gap: spacing.m,
  },
  rowPressed: {
    backgroundColor: colors.surface,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: radius.s,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: {
    flex: 1,
    fontSize: fontSize.body,
    fontWeight: '600',
    color: colors.textPrimary,
    lineHeight: 24,
  },
});
