import { Ionicons } from '@expo/vector-icons';
import type { ReactElement } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { fonts, palette, radius, spacing, type } from '../../lib/theme';

import type { CheckupReminderState } from './checkup.reminder';

interface CheckupHomeCardProps {
  readonly reminder: CheckupReminderState;
  readonly inPlaceCount: number;
  readonly total: number;
  readonly onPress: () => void;
}

interface Variant {
  readonly title: string;
  readonly icon: keyof typeof Ionicons.glyphMap;
  /** Afficher la mini-jauge d'avancement (sinon, un sous-texte d'invitation). */
  readonly showGauge: boolean;
  readonly subtitle?: string;
  /** Léger renfort du liseré laiton pour la relance. */
  readonly emphasised: boolean;
}

const VARIANT: Record<CheckupReminderState, Variant> = {
  never: {
    title: 'Faites le point sur votre protection',
    icon: 'shield-outline',
    showGauge: false,
    subtitle: 'Rien n’est envoyé. Voyons ce qui est déjà en place.',
    emphasised: true,
  },
  recent: {
    title: 'Votre bouclier',
    icon: 'shield-checkmark',
    showGauge: true,
    emphasised: false,
  },
  due: {
    title: 'Envie de refaire le point ?',
    icon: 'shield-checkmark',
    showGauge: true,
    emphasised: true,
  },
};

/**
 * Carte compacte du Check-up sécurité sur l'accueil : une rangée légère qui
 * montre l'avancement (mini-jauge) ou invite à faire le point. Jamais de %, de
 * « score » ni de rouge — au tap, ouvre le bilan complet.
 */
export function CheckupHomeCard({
  reminder,
  inPlaceCount,
  total,
  onPress,
}: CheckupHomeCardProps): ReactElement {
  const variant = VARIANT[reminder];
  const noun = inPlaceCount > 1 ? 'protections en place' : 'protection en place';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Check-up sécurité"
      accessibilityHint="Faites le point sur votre protection, tranquillement."
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        variant.emphasised && styles.cardEmphasised,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.iconBox}>
        <Ionicons name={variant.icon} size={22} color={palette.laiton} />
      </View>

      <View style={styles.text}>
        <Text style={styles.title}>{variant.title}</Text>
        {variant.showGauge ? (
          <>
            <View style={styles.gauge}>
              {Array.from({ length: total }, (_, index) => index).map((index) => (
                <View
                  key={`seg-${String(index)}`}
                  style={[styles.segment, index < inPlaceCount && styles.segmentOn]}
                />
              ))}
            </View>
            <Text style={styles.count}>{`${String(inPlaceCount)} ${noun} sur ${String(total)}`}</Text>
          </>
        ) : (
          <Text style={styles.subtitle}>{variant.subtitle}</Text>
        )}
      </View>

      <Ionicons name="chevron-forward" size={20} color={palette.texteMuet} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
    backgroundColor: palette.ardoise,
    borderWidth: 1,
    borderColor: palette.bordureDouce,
    borderRadius: radius.l,
    padding: spacing.l,
  },
  cardEmphasised: {
    borderColor: palette.laitonFilet,
  },
  cardPressed: {
    backgroundColor: palette.ardoiseElevee,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: radius.s,
    backgroundColor: palette.laitonPale,
    borderWidth: 1,
    borderColor: palette.laitonFilet,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    ...type.body,
    fontFamily: fonts.textSemiBold,
  },
  subtitle: {
    ...type.bodySecondary,
  },
  gauge: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: 2,
  },
  segment: {
    width: 22,
    height: 5,
    borderRadius: radius.pill,
    backgroundColor: palette.bordure,
  },
  segmentOn: {
    backgroundColor: palette.laiton,
  },
  count: {
    ...type.bodySecondary,
    color: palette.texteDoux,
  },
});
