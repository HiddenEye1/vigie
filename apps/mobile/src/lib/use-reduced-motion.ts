import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/**
 * Préférence système « réduire les animations ». On s'appuie sur
 * `AccessibilityInfo` (React Native) plutôt que sur le hook de Reanimated :
 * c'est la source de vérité de l'OS, et c'est trivialement mockable en test.
 *
 * Le radar ambiant, le halo de verdict et les pulsations s'y réfèrent pour se
 * figer quand l'utilisateur préfère le calme.
 */
export function useReducedMotionPref(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    let mounted = true;
    void AccessibilityInfo.isReduceMotionEnabled()
      .then((value) => {
        if (mounted) {
          setReduced(value);
        }
      })
      .catch(() => undefined);

    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  return reduced;
}
