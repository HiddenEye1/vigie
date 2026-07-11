import { Ionicons } from '@expo/vector-icons';
import type { ReactElement } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { fonts, palette, radius, spacing, type } from '@/lib/theme';

interface FamilyPresenceProps {
  /** Prénom du proche de confiance, ou `null` si aucun n'est enregistré. */
  readonly firstName: string | null;
}

/**
 * Présence bienveillante locale (Bouclier famille). Quand un proche de confiance
 * est enregistré, on rappelle calmement « [prénom] veille avec vous » — une
 * présence choisie, pas une surveillance (VISION §3).
 *
 * 100 % LOCAL et informatif : rien n'est envoyé, le proche n'est PAS notifié et
 * ne voit rien automatiquement. La sous-ligne le dit explicitement, pour ne
 * jamais laisser croire à une alerte à distance (qui n'existe pas à ce stade).
 * Absent tant qu'aucun proche n'est enregistré.
 */
export function FamilyPresence({ firstName }: FamilyPresenceProps): ReactElement | null {
  if (firstName === null || firstName.length === 0) {
    return null;
  }
  return (
    <View
      style={styles.row}
      accessible
      accessibilityRole="text"
      accessibilityLabel={`${firstName} veille avec vous. Vous décidez de ce que vous lui montrez ; rien n’est envoyé automatiquement.`}
    >
      <View style={styles.icon}>
        <Ionicons name="shield-checkmark-outline" size={22} color={palette.laiton} />
      </View>
      <View style={styles.textColumn}>
        <Text style={styles.line}>{firstName} veille avec vous.</Text>
        <Text style={styles.subline}>Vous décidez de ce que vous lui montrez.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
    marginHorizontal: spacing.l,
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
    borderRadius: radius.l,
    backgroundColor: palette.laitonPale,
    borderWidth: 1,
    borderColor: palette.laitonFilet,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: radius.s,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textColumn: {
    flex: 1,
    gap: 2,
  },
  line: {
    ...type.body,
    fontFamily: fonts.textSemiBold,
  },
  subline: {
    ...type.bodySecondary,
  },
});
