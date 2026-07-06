import { Ionicons } from '@expo/vector-icons';
import type { ReactElement } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { palette, spacing, type } from '../lib/theme';
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
        <Ionicons name="cloud-offline-outline" size={40} color={palette.texteSecondaire} />
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
    backgroundColor: palette.brume,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.m,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: palette.surfaceLegere,
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
    color: palette.texteSecondaire,
    textAlign: 'center',
  },
  button: {
    alignSelf: 'stretch',
    marginTop: spacing.m,
  },
});
