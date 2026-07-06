import type { ReactElement } from 'react';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { fonts, palette, radius, spacing } from '../lib/theme';
import { useReducedMotionPref } from '../lib/use-reduced-motion';

interface HeroFieldProps {
  readonly placeholder: string;
  readonly accessibilityLabel: string;
  readonly onPress: () => void;
}

/**
 * Le champ héros du poste de veille : une grande surface qui invite à déposer
 * ce qu'on a reçu. Filet de laiton en haut, curseur qui clignote — vivant,
 * prêt à saisir. Au tap, il ouvre l'écran de saisie réel.
 */
export function HeroField({ placeholder, accessibilityLabel, onPress }: HeroFieldProps): ReactElement {
  const reduced = useReducedMotionPref();
  const blink = useSharedValue(1);

  useEffect(() => {
    if (reduced) {
      return;
    }
    blink.value = withRepeat(withTiming(0, { duration: 560 }), -1, true);
    return () => {
      cancelAnimation(blink);
    };
  }, [reduced, blink]);

  const caretStyle = useAnimatedStyle(() => ({ opacity: blink.value }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [styles.field, pressed && styles.fieldPressed]}
    >
      <View style={styles.hairline} />
      <View style={styles.line}>
        <Text style={styles.placeholder}>{placeholder}</Text>
        <Animated.View style={[styles.caret, caretStyle]} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  field: {
    minHeight: 108,
    borderRadius: radius.xl,
    backgroundColor: palette.ardoiseHaute,
    borderWidth: 1,
    borderColor: palette.bordureDouce,
    padding: spacing.l,
    overflow: 'hidden',
  },
  fieldPressed: {
    backgroundColor: palette.ardoise,
  },
  hairline: {
    position: 'absolute',
    top: 0,
    left: spacing.l,
    right: spacing.l,
    height: 2,
    borderRadius: 2,
    backgroundColor: palette.laitonFilet,
  },
  line: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  placeholder: {
    fontFamily: fonts.text,
    fontSize: 16,
    lineHeight: 24,
    color: palette.texteMuet,
    flexShrink: 1,
  },
  caret: {
    width: 2,
    height: 22,
    borderRadius: 1,
    backgroundColor: palette.laiton,
  },
});
