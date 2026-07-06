import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { ReactElement } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LighthouseLogo } from '../../components/lighthouse-logo';
import { formatRelativeDate } from '../../lib/relative-date';
import { cardShadow, MIN_TOUCH_TARGET, palette, radius, spacing, type } from '../../lib/theme';
import { VERDICT_UI } from '../../lib/verdict-ui';
import type { HistoryEntry } from '../../store/history';
import { useHistory } from '../../store/history';

/** Historique local (§8.2) : liste, ré-affichage du verdict, purge totale. */
export default function HistoryScreen(): ReactElement {
  const router = useRouter();
  const entries = useHistory((state) => state.entries);
  const clear = useHistory((state) => state.clear);

  const confirmClear = (): void => {
    Alert.alert(
      'Tout effacer ?',
      'Toutes vos vérifications seront supprimées de ce téléphone. Cette action est définitive.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Tout effacer',
          style: 'destructive',
          onPress: () => {
            clear();
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Historique</Text>
        {entries.length > 0 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Tout effacer"
            onPress={confirmClear}
            style={styles.clearButton}
          >
            <Ionicons name="trash-outline" size={18} color={palette.texteFeuRouge} />
            <Text style={styles.clearLabel}>Tout effacer</Text>
          </Pressable>
        ) : null}
      </View>

      {entries.length === 0 ? (
        <View style={styles.empty}>
          <LighthouseLogo size={72} />
          <Text style={styles.emptyText}>
            Aucune analyse pour l’instant. Au moindre doute, vérifiez ici.
          </Text>
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <HistoryRow
              entry={item}
              onPress={() => {
                router.push(`/verdict/${item.id}`);
              }}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

function HistoryRow({
  entry,
  onPress,
}: {
  readonly entry: HistoryEntry;
  readonly onPress: () => void;
}): ReactElement {
  const ui = VERDICT_UI[entry.verdict];
  const relativeDate = formatRelativeDate(entry.date);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Vérification ${relativeDate}, résultat : ${ui.label}`}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <View style={[styles.dot, { backgroundColor: ui.fill }]} />
      <View style={styles.rowContent}>
        <Text style={styles.rowDate}>{relativeDate}</Text>
        <Text style={styles.rowExcerpt} numberOfLines={2}>
          {entry.excerpt}
        </Text>
        <Text style={[styles.rowVerdict, { color: ui.text }]}>{ui.label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={22} color={palette.texteSecondaire} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.brume,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.l,
  },
  title: {
    ...type.screenTitle,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: 44,
    paddingHorizontal: spacing.s,
  },
  clearLabel: {
    ...type.label,
    color: palette.texteFeuRouge,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.l,
  },
  emptyText: {
    ...type.body,
    color: palette.texteSecondaire,
    textAlign: 'center',
    maxWidth: 280,
  },
  list: {
    paddingHorizontal: spacing.l,
    paddingBottom: spacing.xl,
    gap: spacing.m,
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
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  rowContent: {
    flex: 1,
    gap: 2,
  },
  rowDate: {
    ...type.label,
  },
  rowExcerpt: {
    ...type.body,
  },
  rowVerdict: {
    ...type.label,
  },
});
