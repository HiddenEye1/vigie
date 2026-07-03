import type { ReactElement } from 'react';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { colors, fontSize, spacing } from '../lib/theme';

/** Messages rotatifs rassurants pendant l'analyse (§10). */
export const WAITING_MESSAGES = [
  'Lecture du message…',
  'Analyse des signaux d’urgence…',
  'Vérification des liens et des numéros…',
  'Comparaison avec les arnaques connues en France…',
  'Préparation d’une réponse claire…',
] as const;

const ROTATION_MS = 2_500;

export function WaitingView(): ReactElement {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % WAITING_MESSAGES.length);
    }, ROTATION_MS);
    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <View style={styles.container} accessibilityLiveRegion="polite">
      <ActivityIndicator size="large" color={colors.accent} />
      <Text style={styles.title}>Analyse en cours</Text>
      <Text style={styles.message}>{WAITING_MESSAGES[index]}</Text>
      <Text style={styles.hint}>Cela prend quelques secondes.</Text>
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
  title: {
    fontSize: fontSize.title,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  message: {
    fontSize: fontSize.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  hint: {
    fontSize: fontSize.small,
    color: colors.textSecondary,
  },
});
