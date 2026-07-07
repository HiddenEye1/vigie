import type { ReactElement } from 'react';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { palette, spacing, type } from '../lib/theme';
import { AmbientRadar } from './ambient-radar';
import { LighthouseLogo } from './lighthouse-logo';

/** Messages rotatifs rassurants pendant l'analyse (§10). */
export const WAITING_MESSAGES = [
  'Lecture du message…',
  'Analyse des signaux d’urgence…',
  'Vérification des liens et des numéros…',
  'Comparaison avec les arnaques connues en France…',
  'Préparation d’une réponse claire…',
] as const;

const ROTATION_MS = 2_500;
const RADAR_SIZE = 260;

/**
 * Écran d'attente (§10) : le poste de veille scrute. Le radar ambiant balaye
 * derrière le phare, pendant que des messages rassurants défilent. Le radar se
 * fige si l'utilisateur a réduit les animations (géré par AmbientRadar).
 */
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
      <View style={styles.radar}>
        <AmbientRadar size={RADAR_SIZE} />
        <View style={styles.lighthouse} pointerEvents="none">
          <LighthouseLogo size={68} stroke={palette.texteClair} lantern={palette.laiton} />
        </View>
      </View>

      <Text style={styles.title}>Analyse en cours</Text>
      <Text style={styles.message}>{WAITING_MESSAGES[index]}</Text>
      <Text style={styles.hint}>Cela prend quelques secondes.</Text>
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
  radar: {
    width: RADAR_SIZE,
    height: RADAR_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.l,
  },
  lighthouse: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...type.screenTitle,
    fontSize: 24,
    lineHeight: 34,
  },
  message: {
    ...type.body,
    color: palette.texteDoux,
    textAlign: 'center',
  },
  hint: {
    ...type.label,
    color: palette.texteMuet,
  },
});
