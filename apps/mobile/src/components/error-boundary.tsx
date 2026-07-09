import type { ErrorInfo, ReactNode } from 'react';
import { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { LighthouseLogo } from '@/components/lighthouse-logo';
import { PrimaryButton } from '@/components/primary-button';
import { palette, spacing, type } from '@/lib/theme';

interface ErrorBoundaryProps {
  readonly children: ReactNode;
}

interface ErrorBoundaryState {
  readonly hasError: boolean;
}

/**
 * Garde-fou de rendu : si un écran plante, on affiche un repli « Gardien »
 * rassurant plutôt que l'écran d'erreur technique brut. On journalise le
 * message technique (jamais de contenu utilisateur) et on propose de réessayer.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    // Log volontairement minimal : message technique + pile de composants.
    // Jamais de contenu analysé ni de donnée personnelle (§ confidentialité).
    console.error('[Vigie] erreur de rendu :', error.message, info.componentStack);
  }

  private readonly reset = (): void => {
    this.setState({ hasError: false });
  };

  override render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }
    return (
      <View style={styles.container}>
        <LighthouseLogo size={72} stroke={palette.texteDoux} lantern={palette.laiton} />
        <Text style={styles.title}>Vigie a rencontré un souci</Text>
        <Text style={styles.message}>
          L’application s’est arrêtée un instant. Vos données restent en sécurité sur ce téléphone.
        </Text>
        <View style={styles.button}>
          <PrimaryButton label="Réessayer" icon="refresh" onPress={this.reset} />
        </View>
      </View>
    );
  }
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
