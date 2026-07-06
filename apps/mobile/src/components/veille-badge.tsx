import type { ReactElement } from 'react';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { fonts, palette, radius, spacing, veille } from '../lib/theme';
import { useReducedMotionPref } from '../lib/use-reduced-motion';

interface VeilleBadgeProps {
  /** Libellé du badge (« en veille », « en direct »…). */
  readonly label: string;
}

/**
 * Pastille « en veille » : un point vert qui bat doucement dans un contour
 * discret. Signale, sans mots, que le poste surveille en continu.
 */
export function VeilleBadge({ label }: VeilleBadgeProps): ReactElement {
  const reduced = useReducedMotionPref();
  const beat = useSharedValue(reduced ? 1 : 0);

  useEffect(() => {
    if (reduced) {
      return;
    }
    beat.value = withRepeat(
      withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
    return () => {
      cancelAnimation(beat);
    };
  }, [reduced, beat]);

  const dotStyle = useAnimatedStyle(() => ({
    opacity: 0.55 + 0.45 * beat.value,
    transform: [{ scale: 0.85 + 0.25 * beat.value }],
  }));

  return (
    <View style={styles.pill}>
      <View style={styles.halo}>
        <Animated.View style={[styles.dot, dotStyle]} />
      </View>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: spacing.m,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: palette.bordure,
    backgroundColor: palette.ardoiseHaute,
  },
  halo: {
    width: 10,
    height: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: veille.pointVeille,
  },
  label: {
    fontFamily: fonts.textSemiBold,
    fontSize: 12,
    letterSpacing: 0.3,
    color: palette.texteDoux,
  },
});
