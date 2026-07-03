import { Ionicons } from '@expo/vector-icons';
import type { ReactElement } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fontSize, radius, spacing } from '../lib/theme';
import { PrimaryButton } from './primary-button';

interface ErrorViewProps {
  readonly message: string;
  readonly onRetry: () => void;
  readonly retryLabel?: string;
}

/** État d'erreur : message français clair + action de réessai (exigence qualité). */
export function ErrorView({
  message,
  onRetry,
  retryLabel = 'Réessayer',
}: ErrorViewProps): ReactElement {
  return (
    <View style={styles.container} accessibilityLiveRegion="assertive">
      <View style={styles.iconCircle}>
        <Ionicons name="cloud-offline" size={40} color={colors.textSecondary} />
      </View>
      <Text style={styles.title}>Un problème est survenu</Text>
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
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.m,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: radius.l,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: fontSize.title,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  message: {
    fontSize: fontSize.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
  },
  button: {
    alignSelf: 'stretch',
    marginTop: spacing.m,
  },
});
