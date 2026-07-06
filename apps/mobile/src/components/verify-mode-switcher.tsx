import { useRouter } from 'expo-router';
import type { ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing } from '../lib/theme';
import type { VerifyMode } from '../lib/verify-modes';
import { VERIFY_MODES } from '../lib/verify-modes';
import { SegmentedTabs } from './segmented-tabs';

interface VerifyModeSwitcherProps {
  readonly active: VerifyMode;
}

/**
 * Les onglets Message / Capture / Lien, repris sur chaque écran de saisie.
 * Sélectionner un autre mode remplace l'écran courant (pas d'empilement),
 * pour retrouver exactement la grammaire de l'accueil.
 */
export function VerifyModeSwitcher({ active }: VerifyModeSwitcherProps): ReactElement {
  const router = useRouter();
  return (
    <View style={styles.wrap}>
      <SegmentedTabs
        options={VERIFY_MODES}
        value={active}
        onChange={(key) => {
          if (key === active) {
            return;
          }
          const target = VERIFY_MODES.find((mode) => mode.key === key);
          if (target) {
            router.replace(target.route);
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.s,
  },
});
