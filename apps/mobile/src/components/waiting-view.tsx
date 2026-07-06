import type { ReactElement } from 'react';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { palette, spacing, type } from '../lib/theme';
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
const SWEEP_SIZE = 220;
/** Laiton à ~10 % d'opacité pour le faisceau. */
const BEAM_ALPHA = '1A';

/** Le faisceau du phare : un cône de lumière laiton qui balaye lentement. */
function LighthouseSweep(): ReactElement {
  const angle = useSharedValue(0);

  useEffect(() => {
    angle.value = withRepeat(
      withTiming(360, { duration: 7000, easing: Easing.linear, reduceMotion: ReduceMotion.System }),
      -1,
      false,
      undefined,
      ReduceMotion.System,
    );
  }, [angle]);

  const sweepStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${String(angle.value)}deg` }],
  }));

  return (
    <View style={styles.sweepContainer}>
      <Animated.View style={[styles.sweep, sweepStyle]}>
        <Svg width={SWEEP_SIZE} height={SWEEP_SIZE} viewBox="0 0 220 220">
          {/* Cône d'environ 40°, pointe au centre, vers le haut. */}
          <Path d="M110 110 L72 8 A110 110 0 0 1 148 8 Z" fill={`${palette.laiton}${BEAM_ALPHA}`} />
        </Svg>
      </Animated.View>
      <LighthouseLogo size={84} />
    </View>
  );
}

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
      <LighthouseSweep />
      <Text style={styles.title}>Analyse en cours</Text>
      <Text style={styles.message}>{WAITING_MESSAGES[index]}</Text>
      <Text style={styles.hint}>Cela prend quelques secondes.</Text>
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
  sweepContainer: {
    width: SWEEP_SIZE,
    height: SWEEP_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.s,
  },
  sweep: {
    position: 'absolute',
    width: SWEEP_SIZE,
    height: SWEEP_SIZE,
  },
  title: {
    ...type.screenTitle,
    fontSize: 24,
    lineHeight: 34,
  },
  message: {
    ...type.body,
    color: palette.texteSecondaire,
    textAlign: 'center',
  },
  hint: {
    ...type.label,
  },
});
