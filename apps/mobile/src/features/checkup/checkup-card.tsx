import { Ionicons } from '@expo/vector-icons';
import type { ReactElement } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '../../components/primary-button';
import { fonts, palette, radius, spacing, type } from '../../lib/theme';

import type { CheckupItemView } from './checkup.derive';
import type { CheckupItemId, CheckupMode, CheckupState } from './checkup.items';

type IconName = keyof typeof Ionicons.glyphMap;

interface BadgeInfo {
  readonly label: string;
  readonly color: string;
  readonly icon: IconName;
}

/** Badges volontairement non alarmants — pas de rouge, pas d'ambre « alerte ». */
const BADGE: Record<CheckupState, BadgeInfo> = {
  'in-place': { label: 'En place', color: palette.texteFeuVert, icon: 'checkmark-circle' },
  'to-reinforce': { label: 'À renforcer', color: palette.laiton, icon: 'ellipse-outline' },
  'to-discover': { label: 'À découvrir', color: palette.texteDoux, icon: 'add-circle-outline' },
};

interface CheckupCardProps {
  readonly view: CheckupItemView;
  readonly large?: boolean;
  readonly onNavigate: (route: string) => void;
  readonly onConfirm: (id: CheckupItemId) => void;
  readonly onUnconfirm: (id: CheckupItemId) => void;
  /** Partage d'un rappel via la feuille système (items avec `shareLabel`). */
  readonly onShare?: (id: CheckupItemId) => void;
  /** Mode de bilan : « moi » (défaut) ou « proche » (formulations aidant). */
  readonly mode?: CheckupMode;
}

/**
 * Une carte d'item du bilan : question, état (badge), conseil rassurant, et une
 * action concrète — apprendre le réflexe (parcours existant), configurer le
 * proche, ou marquer « c'est fait ». Rien n'est envoyé.
 */
export function CheckupCard({
  view,
  large = false,
  onNavigate,
  onConfirm,
  onUnconfirm,
  onShare,
  mode = 'moi',
}: CheckupCardProps): ReactElement {
  const { def, state } = view;
  const badge = BADGE[state];
  const inPlace = state === 'in-place';

  // Résolution selon le mode : en « proche », on prend les formulations aidant,
  // et l'item auto devient déclaratif (pas de « configurer », mais un « voir comment »).
  const proche = mode === 'proche' ? def.proche : undefined;
  const title = proche?.title ?? def.title;
  const advice = proche?.advice ?? def.advice;
  const confirmLabel = proche?.confirmLabel ?? def.confirmLabel;
  const learnRoute = mode === 'proche' ? (proche?.learnRoute ?? def.learnRoute) : def.learnRoute;
  const configureRoute = mode === 'moi' ? def.configureRoute : undefined;
  const shareLabel = def.shareLabel;
  // La confirmation passe en secondaire dès qu'une action primaire existe.
  const hasPrimaryAction = learnRoute !== undefined || shareLabel !== undefined;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconBox}>
          <Ionicons name={def.icon} size={22} color={palette.laiton} />
        </View>
        <View style={styles.badge}>
          <Ionicons name={badge.icon} size={16} color={badge.color} />
          <Text style={[styles.badgeLabel, { color: badge.color }]}>{badge.label}</Text>
        </View>
      </View>

      <Text style={[styles.title, large && styles.titleLarge]}>{title}</Text>
      <Text style={[styles.advice, large && styles.adviceLarge]}>
        {inPlace ? advice.inPlace : advice.pending}
      </Text>

      {!inPlace && configureRoute !== undefined ? (
        <PrimaryButton
          label="Configurer mon proche"
          icon="person-add"
          onPress={() => {
            onNavigate(configureRoute);
          }}
        />
      ) : null}

      {!inPlace && learnRoute !== undefined ? (
        <PrimaryButton
          label="Voir comment"
          icon="arrow-forward"
          onPress={() => {
            onNavigate(learnRoute);
          }}
        />
      ) : null}

      {!inPlace && shareLabel !== undefined ? (
        <PrimaryButton
          label={shareLabel}
          icon="share-social"
          onPress={() => {
            onShare?.(def.id);
          }}
        />
      ) : null}

      {!inPlace && confirmLabel !== undefined ? (
        <PrimaryButton
          label={confirmLabel}
          icon="checkmark"
          variant={hasPrimaryAction ? 'secondary' : 'primary'}
          onPress={() => {
            onConfirm(def.id);
          }}
        />
      ) : null}

      {inPlace && def.source === 'declared' ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Revenir sur cette protection"
          hitSlop={8}
          style={styles.revert}
          onPress={() => {
            onUnconfirm(def.id);
          }}
        >
          <Text style={styles.revertLabel}>Revenir dessus</Text>
        </Pressable>
      ) : null}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  badgeLabel: {
    ...type.label,
  },
  title: {
    ...type.body,
    fontFamily: fonts.textSemiBold,
  },
  titleLarge: {
    fontSize: 21,
    lineHeight: 30,
  },
  advice: {
    ...type.bodySecondary,
  },
  adviceLarge: {
    ...type.body,
    color: palette.texteDoux,
  },
  revert: {
    alignSelf: 'flex-start',
    minHeight: 40,
    justifyContent: 'center',
  },
  revertLabel: {
    ...type.bodySecondary,
    fontFamily: fonts.textSemiBold,
    color: palette.texteDoux,
  },
});
