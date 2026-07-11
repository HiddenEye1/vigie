import { useRouter } from 'expo-router';
import type { ReactElement } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ContactOnboarding } from '@/features/family';
import { palette } from '@/lib/theme';

/**
 * Écran plein écran de première configuration d'un proche (Bouclier famille).
 * Mince wrapper de route : le safe-area ici, toute la logique dans
 * ContactOnboarding (testé en isolation). Retour ou fin → on referme l'écran.
 */
export default function FamilyOnboardingScreen(): ReactElement {
  const router = useRouter();
  const close = (): void => {
    router.back();
  };
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ContactOnboarding onDone={close} onCancel={close} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: palette.nuit,
  },
});
