import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { ReactElement } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LighthouseLogo } from '../../components/lighthouse-logo';
import { formatRelativeDate } from '../../lib/relative-date';
import { fonts, MIN_TOUCH_TARGET, palette, spacing, type } from '../../lib/theme';
import { VERDICT_UI } from '../../lib/verdict-ui';
import type { HistoryEntry } from '../../store/history';
import { useHistory } from '../../store/history';

/** Historique local (§8.2) : le journal de veille, ré-affichage du verdict, purge. */
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
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>Journal de veille</Text>
          {entries.length > 0 ? (
            <Text style={styles.subtitle}>
              {entries.length} vérification{entries.length > 1 ? 's' : ''} sur ce téléphone
            </Text>
          ) : null}
        </View>
        {entries.length > 0 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Tout effacer"
            onPress={confirmClear}
            style={styles.clearButton}
          >
            <Ionicons name="trash-outline" size={18} color={palette.texteFeuRouge} />
            <Text style={styles.clearLabel}>Effacer</Text>
          </Pressable>
        ) : null}
      </View>

      {entries.length === 0 ? (
        <View style={styles.empty}>
          <LighthouseLogo size={72} stroke={palette.texteDoux} lantern={palette.laiton} />
          <Text style={styles.emptyText}>
            Aucune analyse pour l’instant. Au moindre doute, vérifiez ici.
          </Text>
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <HistoryRow
              entry={item}
              first={index === 0}
              last={index === entries.length - 1}
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
  first,
  last,
  onPress,
}: {
  readonly entry: HistoryEntry;
  readonly first: boolean;
  readonly last: boolean;
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
      <View style={styles.rail}>
        <View style={[styles.spine, first && styles.spineHidden]} />
        <View style={styles.dotWrap}>
          <View style={[styles.halo, { backgroundColor: ui.fill }]} />
          <View style={[styles.core, { backgroundColor: ui.fill }]} />
        </View>
        <View style={[styles.spine, styles.spineGrow, last && styles.spineHidden]} />
      </View>

      <View style={styles.rowContent}>
        <Text style={styles.rowDate}>{relativeDate}</Text>
        <Text style={styles.rowExcerpt} numberOfLines={2}>
          {entry.excerpt}
        </Text>
        <Text style={[styles.rowVerdict, { color: ui.text }]}>{ui.label}</Text>
      </View>

      <Ionicons name="chevron-forward" size={20} color={palette.texteMuet} />
    </Pressable>
  );
}

const RAIL_WIDTH = 30;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.nuit,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.l,
    paddingTop: spacing.m,
    paddingBottom: spacing.l,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...type.screenTitle,
  },
  subtitle: {
    ...type.bodySecondary,
    color: palette.texteMuet,
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
    color: palette.texteDoux,
    textAlign: 'center',
    maxWidth: 280,
  },
  list: {
    paddingHorizontal: spacing.l,
    paddingBottom: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing.m,
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
    height: 16,
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
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  halo: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    opacity: 0.24,
  },
  core: {
    width: 11,
    height: 11,
    borderRadius: 5.5,
  },
  rowContent: {
    flex: 1,
    paddingTop: spacing.s,
    paddingBottom: spacing.l,
    gap: 3,
    minHeight: MIN_TOUCH_TARGET,
  },
  rowDate: {
    fontFamily: fonts.textSemiBold,
    fontSize: 12,
    color: palette.texteMuet,
  },
  rowExcerpt: {
    ...type.body,
    fontSize: 15,
    lineHeight: 21,
  },
  rowVerdict: {
    ...type.label,
  },
});
