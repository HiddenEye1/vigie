import { Ionicons } from '@expo/vector-icons';
import type { ReactElement } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { formatRelativeDate } from '@/lib/relative-date';
import { fonts, palette, radius, spacing, type } from '@/lib/theme';
import { VERDICT_UI } from '@/lib/verdict-ui';

import type { AdviceRequestEntry } from './advice-requests.store';
import { useAdviceRequests } from './advice-requests.store';

/** Contexte lisible d'une demande, sans jamais le contenu original. */
function situationLabel(entry: AdviceRequestEntry): string {
  if (entry.situation === 'aide') {
    return 'Demande d’aide';
  }
  const context = entry.situation === 'lien' ? 'Lien vérifié' : 'Message vérifié';
  return entry.verdict ? `${context} — ${VERDICT_UI[entry.verdict].label}` : context;
}

/**
 * « Vos demandes récentes » (Bouclier famille). Trace LOCALE des demandes d'avis,
 * avec un libellé prudent : « Avis demandé à … » — jamais « envoyé » ni « reçu »,
 * car Vigie ne peut pas le vérifier. Masquée tant qu'il n'y a aucune demande.
 */
export function AdviceRequestList(): ReactElement | null {
  const entries = useAdviceRequests((state) => state.entries);
  const clear = useAdviceRequests((state) => state.clear);

  if (entries.length === 0) {
    return null;
  }

  const confirmClear = (): void => {
    Alert.alert(
      'Effacer ces demandes ?',
      'La liste de vos demandes d’avis sera effacée de ce téléphone. Vos proches ne sont pas concernés.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Effacer',
          style: 'destructive',
          onPress: () => {
            clear();
          },
        },
      ],
    );
  };

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Vos demandes récentes</Text>
      <Text style={styles.note}>
        Vigie ne peut pas savoir si le message a été envoyé ou lu. Cette liste reste sur ce
        téléphone.
      </Text>

      <View style={styles.list}>
        {entries.map((entry) => (
          <View key={entry.id} style={styles.row}>
            <View style={styles.icon}>
              <Ionicons name="paper-plane-outline" size={20} color={palette.laiton} />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Avis demandé à {entry.contactFirstName}</Text>
              <Text style={styles.rowMeta}>
                {formatRelativeDate(entry.date)} · {situationLabel(entry)}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <PrimaryButton
        label="Effacer ces demandes"
        icon="trash"
        variant="secondary"
        onPress={confirmClear}
      />
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
  cardTitle: {
    ...type.sectionTitle,
  },
  note: {
    ...type.bodySecondary,
    color: palette.texteMuet,
  },
  list: {
    gap: spacing.s,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
    backgroundColor: palette.ardoiseHaute,
    borderWidth: 1,
    borderColor: palette.bordureDouce,
    borderRadius: radius.m,
    padding: spacing.m,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: radius.s,
    backgroundColor: palette.laitonPale,
    borderWidth: 1,
    borderColor: palette.laitonFilet,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    ...type.body,
    fontFamily: fonts.textSemiBold,
  },
  rowMeta: {
    ...type.bodySecondary,
    color: palette.texteDoux,
  },
});
