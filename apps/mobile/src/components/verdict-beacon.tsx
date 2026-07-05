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

import { VERDICT_UI } from '../lib/verdict-ui';

const HALO_SIZE = 172;
const BEACON_SIZE = 96;
/** Halo à 8 % d'opacité (suffixe alpha hexadécimal). */
const HALO_ALPHA = '14';

interface VerdictBeaconProps {
  readonly verdict: VerdictLevel;
}

/**
 * « Le feu du phare » — signature visuelle de Vigie (§ signature move).
 * À l'arrivée du verdict, un halo circulaire s'allume doucement derrière la
 * pastille (450 ms), puis respire très lentement (cycle 4 s, scale 1→1.03).
 * Avec « réduire les animations » activé, le système remplace tout par un fondu.
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
          withTiming(1.03, {
            duration: 2000,
            easing: Easing.inOut(Easing.quad),
            reduceMotion: ReduceMotion.System,
          }),
          withTiming(1, {
            duration: 2000,
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

  const haloStyle = useAnimatedStyle(() => ({
    opacity: ignition.value,
    transform: [{ scale: (0.9 + 0.1 * ignition.value) * breath.value }],
  }));

  const beaconStyle = useAnimatedStyle(() => ({
    opacity: ignition.value,
    transform: [{ scale: 0.9 + 0.1 * ignition.value }],
  }));

  return (
    <View style={styles.container}>
      <Animated.View
        style={[styles.halo, { backgroundColor: `${ui.halo}${HALO_ALPHA}` }, haloStyle]}
      />
      <Animated.View
        style={[styles.beacon, { backgroundColor: ui.fill }, beaconStyle]}
        accessibilityRole="image"
        accessibilityLabel={`Résultat : ${ui.label}`}
      >
        <Ionicons name={ui.icon} size={46} color={ui.onFill} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: HALO_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  halo: {
    position: 'absolute',
    width: HALO_SIZE,
    height: HALO_SIZE,
    borderRadius: HALO_SIZE / 2,
  },
  beacon: {
    width: BEACON_SIZE,
    height: BEACON_SIZE,
    borderRadius: BEACON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
