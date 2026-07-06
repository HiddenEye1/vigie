import { Ionicons } from '@expo/vector-icons';
import type { VerdictLevel } from '@vigie/shared';
import type { ReactElement } from 'react';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

import { palette } from '../lib/theme';
import { VERDICT_UI } from '../lib/verdict-ui';

const GLOW_SIZE = 264;
const RING_SIZE = 150;
const CORE_SIZE = 116;

interface VerdictBeaconProps {
  readonly verdict: VerdictLevel;
}

/**
 * « Le feu du phare » — le moment spectacle du verdict. À l'arrivée du
 * résultat, un grand halo lumineux s'allume à la couleur du feu (450 ms) puis
 * respire lentement (cycle 4 s). Un anneau fin cercle la pastille pleine.
 * Avec « réduire les animations », le système remplace tout par un fondu.
 */
export function VerdictBeacon({ verdict }: VerdictBeaconProps): ReactElement {
  const ui = VERDICT_UI[verdict];
  const ignition = useSharedValue(0);
  const breath = useSharedValue(1);

  useEffect(() => {
    ignition.value = withTiming(1, {
      duration: 450,
      easing: Easing.out(Easing.cubic),
      reduceMotion: ReduceMotion.System,
    });
    breath.value = withDelay(
      600,
      withRepeat(
        withSequence(
          withTiming(1.06, {
            duration: 1900,
            easing: Easing.inOut(Easing.quad),
            reduceMotion: ReduceMotion.System,
          }),
          withTiming(1, {
            duration: 1900,
            easing: Easing.inOut(Easing.quad),
            reduceMotion: ReduceMotion.System,
          }),
        ),
        -1,
        false,
        undefined,
        ReduceMotion.System,
      ),
    );
  }, [ignition, breath]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.35 + 0.65 * ignition.value,
    transform: [{ scale: (0.85 + 0.15 * ignition.value) * breath.value }],
  }));

  const coreStyle = useAnimatedStyle(() => ({
    opacity: ignition.value,
    transform: [{ scale: 0.9 + 0.1 * ignition.value }],
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.glow, glowStyle]} pointerEvents="none">
        <Svg width={GLOW_SIZE} height={GLOW_SIZE}>
          <Defs>
            <RadialGradient id="feu" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={ui.halo} stopOpacity={0.6} />
              <Stop offset="42%" stopColor={ui.halo} stopOpacity={0.24} />
              <Stop offset="100%" stopColor={ui.halo} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx={GLOW_SIZE / 2} cy={GLOW_SIZE / 2} r={GLOW_SIZE / 2} fill="url(#feu)" />
        </Svg>
      </Animated.View>

      <Svg width={RING_SIZE} height={RING_SIZE} style={styles.ring} pointerEvents="none">
        <Circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_SIZE / 2 - 2}
          stroke={ui.halo}
          strokeOpacity={0.55}
          strokeWidth={1.5}
          fill="none"
        />
      </Svg>

      <Animated.View
        style={[styles.core, { backgroundColor: ui.fill }, coreStyle]}
        accessibilityRole="image"
        accessibilityLabel={`Résultat : ${ui.label}`}
      >
        <Ionicons name={ui.icon} size={54} color={ui.onFill} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: GLOW_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: GLOW_SIZE,
    height: GLOW_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
  },
  core: {
    width: CORE_SIZE,
    height: CORE_SIZE,
    borderRadius: CORE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    // Un souffle de profondeur sous la pastille lumineuse.
    shadowColor: palette.surFeuSombre,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    shadowOpacity: 0.4,
    elevation: 8,
  },
});
