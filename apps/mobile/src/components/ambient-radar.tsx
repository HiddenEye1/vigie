import type { ReactElement } from 'react';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, Path, RadialGradient, Stop } from 'react-native-svg';

import { palette, veille } from '../lib/theme';
import { useReducedMotionPref } from '../lib/use-reduced-motion';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface AmbientRadarProps {
  /** Diamètre du radar en points. */
  readonly size?: number;
}

/**
 * Le radar ambiant du poste de veille : des anneaux fixes, une impulsion qui
 * s'élargit doucement, et un balayage lent qui tourne. Purement décoratif —
 * posé en fond, non interactif, et figé si l'utilisateur réduit les animations.
 */
export function AmbientRadar({ size = 340 }: AmbientRadarProps): ReactElement {
  const reduced = useReducedMotionPref();
  const c = size / 2;
  const maxR = c - 4;
  const minR = maxR * 0.24;

  const pulse = useSharedValue(reduced ? 0.5 : 0);
  const spin = useSharedValue(0);

  useEffect(() => {
    if (reduced) {
      return;
    }
    pulse.value = withRepeat(
      withTiming(1, { duration: veille.pulseMs, easing: Easing.out(Easing.ease) }),
      -1,
      false,
    );
    spin.value = withRepeat(
      withTiming(1, { duration: veille.balayageMs, easing: Easing.linear }),
      -1,
      false,
    );
    return () => {
      cancelAnimation(pulse);
      cancelAnimation(spin);
    };
  }, [reduced, pulse, spin]);

  const pulseProps = useAnimatedProps(() => ({
    r: minR + (maxR - minR) * pulse.value,
    opacity: 0.32 * (1 - pulse.value),
  }));

  const sweepStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${(spin.value * 360).toFixed(3)}deg` }],
  }));

  // Secteur du balayage (~50°), pointant vers la droite avant rotation.
  const a0 = (-25 * Math.PI) / 180;
  const a1 = (25 * Math.PI) / 180;
  const pt = (x: number, y: number): string => `${x.toFixed(2)} ${y.toFixed(2)}`;
  const r = maxR.toFixed(2);
  const wedge = [
    `M ${pt(c, c)}`,
    `L ${pt(c + maxR * Math.cos(a0), c + maxR * Math.sin(a0))}`,
    `A ${r} ${r} 0 0 1 ${pt(c + maxR * Math.cos(a1), c + maxR * Math.sin(a1))} Z`,
  ].join(' ');

  return (
    <View pointerEvents="none" style={[styles.wrap, { width: size, height: size }]}>
      <Animated.View style={[StyleSheet.absoluteFill, sweepStyle]}>
        <Svg width={size} height={size}>
          <Defs>
            <RadialGradient id="sweep" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={palette.laiton} stopOpacity={0.22} />
              <Stop offset="100%" stopColor={palette.laiton} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Path d={wedge} fill="url(#sweep)" />
        </Svg>
      </Animated.View>

      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle cx={c} cy={c} r={maxR * 0.42} stroke={veille.radarAnneau} strokeWidth={1} fill="none" />
        <Circle cx={c} cy={c} r={maxR * 0.68} stroke={veille.radarAnneau} strokeWidth={1} fill="none" />
        <Circle cx={c} cy={c} r={maxR} stroke={veille.radarAnneau} strokeWidth={1} fill="none" />
        <AnimatedCircle
          cx={c}
          cy={c}
          animatedProps={pulseProps}
          stroke={palette.laiton}
          strokeWidth={1.2}
          fill="none"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
