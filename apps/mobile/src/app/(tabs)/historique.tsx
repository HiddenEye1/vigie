import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { ReactElement } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, fontSize, MIN_TOUCH_TARGET, radius, spacing } from '../../lib/theme';
import { VERDICT_UI } from '../../lib/verdict-ui';
import type { HistoryEntry } from '../../store/history';
import { useHistory } from '../../store/history';

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

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
            <Ionicons name="trash" size={18} color={colors.verdictDanger} />
            <Text style={styles.clearLabel}>Tout effacer</Text>
          </Pressable>
        ) : null}
      </View>

      {entries.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="time" size={48} color={colors.border} />
          <Text style={styles.emptyText}>
            Aucune vérification pour le moment. Vos analyses resteront uniquement sur ce téléphone.
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
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Vérification du ${dateFormatter.format(new Date(entry.date))}, résultat : ${ui.label}`}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <View style={[styles.dot, { backgroundColor: ui.fill }]} />
      <View style={styles.rowContent}>
        <Text style={styles.rowDate}>{dateFormatter.format(new Date(entry.date))}</Text>
        <Text style={styles.rowExcerpt} numberOfLines={2}>
          {entry.excerpt}
        </Text>
        <Text style={[styles.rowVerdict, { color: ui.text }]}>{ui.label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={22} color={colors.border} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.l,
  },
  title: {
    fontSize: fontSize.title,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: 44,
    paddingHorizontal: spacing.s,
  },
  clearLabel: {
    fontSize: fontSize.small,
    color: colors.verdictDanger,
    fontWeight: '600',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.m,
  },
  emptyText: {
    fontSize: fontSize.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
  },
  list: {
    paddingHorizontal: spacing.l,
    paddingBottom: spacing.xl,
    gap: spacing.m,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.m,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.m,
    minHeight: MIN_TOUCH_TARGET,
    gap: spacing.m,
  },
  rowPressed: {
    backgroundColor: colors.surface,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  rowContent: {
    flex: 1,
    gap: spacing.xs,
  },
  rowDate: {
    fontSize: fontSize.small,
    color: colors.textSecondary,
  },
  rowExcerpt: {
    fontSize: fontSize.body,
    color: colors.textPrimary,
    lineHeight: 24,
  },
  rowVerdict: {
    fontSize: fontSize.small,
    fontWeight: '700',
  },
});
