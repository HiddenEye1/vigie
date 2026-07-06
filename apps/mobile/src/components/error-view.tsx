import { Ionicons } from '@expo/vector-icons';
import type { ReactElement } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { ApiFailureKind } from '../lib/api';
import { palette, spacing, type } from '../lib/theme';
import { PrimaryButton } from './primary-button';

interface ErrorViewProps {
  readonly message: string;
  readonly onRetry: () => void;
  readonly retryLabel?: string;
  /** Nature de l'échec : adapte l'icône et le titre. */
  readonly kind?: ApiFailureKind;
}

/**
 * Icône sobre + titre disant CE QUI s'est passé (jamais « une erreur est
 * survenue », jamais d'excuse). Le message, lui, dit QUOI FAIRE. L'icône est
 * neutre : les feux de couleur sont réservés aux verdicts.
 */
const PRESET: Record<ApiFailureKind, { icon: keyof typeof Ionicons.glyphMap; title: string }> = {
  network: { icon: 'cloud-offline-outline', title: 'Pas de connexion' },
  service_unavailable: { icon: 'construct-outline', title: 'Service indisponible pour l’instant' },
  rate_limited: { icon: 'hourglass-outline', title: 'Limite d’analyses atteinte' },
  invalid_request: { icon: 'document-text-outline', title: 'Demande non prise en compte' },
  unknown: { icon: 'help-buoy-outline', title: 'La vérification n’a pas abouti' },
};

/** État d'erreur : ce qui s'est passé (titre + icône) et quoi faire (message + réessai). */
export function ErrorView({
  message,
  onRetry,
  retryLabel = 'Réessayer',
  kind = 'unknown',
}: ErrorViewProps): ReactElement {
  const preset = PRESET[kind];
  return (
    <View style={styles.container} accessibilityLiveRegion="assertive">
      <View style={styles.iconCircle}>
        <Ionicons name={preset.icon} size={40} color={palette.texteDoux} />
      </View>
      <Text style={styles.title}>{preset.title}</Text>
      <Text style={styles.message}>{message}</Text>
      <View style={styles.button}>
        <PrimaryButton label={retryLabel} onPress={onRetry} icon="refresh" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.nuit,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.m,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: palette.ardoiseHaute,
    borderWidth: 1,
    borderColor: palette.bordure,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...type.screenTitle,
    fontSize: 24,
    lineHeight: 34,
    textAlign: 'center',
  },
  message: {
    ...type.body,
    color: palette.texteDoux,
    textAlign: 'center',
  },
  button: {
    alignSelf: 'stretch',
    marginTop: spacing.m,
  },
});
