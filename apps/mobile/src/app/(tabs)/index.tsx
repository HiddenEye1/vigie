import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { ReactElement } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '../../components/primary-button';
import { colors, fontSize, radius, spacing } from '../../lib/theme';

/** Écran d'accueil : une seule action principale, en 2 taps maximum (§3). */
export default function HomeScreen(): ReactElement {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Ionicons name="shield-checkmark" size={40} color={colors.onAccent} />
          </View>
          <Text style={styles.title}>Vigie</Text>
          <Text style={styles.subtitle}>
            Un doute sur un message ? Vérifiez-le avant de cliquer.
          </Text>
        </View>

        <View style={styles.actions}>
          <PrimaryButton
            label="Vérifier un message"
            icon="chatbox-ellipses"
            onPress={() => {
              router.push('/verifier-texte');
            }}
          />
        </View>

        <View style={styles.reassurance}>
          <Text style={styles.reassuranceText}>
            Gratuit. Sans inscription. Vos messages ne sont pas conservés.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    padding: spacing.l,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: spacing.xl,
    gap: spacing.m,
  },
  logoCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: fontSize.subtitle,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 28,
    paddingHorizontal: spacing.m,
  },
  actions: {
    gap: spacing.m,
  },
  reassurance: {
    backgroundColor: colors.surface,
    borderRadius: radius.m,
    padding: spacing.m,
    marginBottom: spacing.m,
  },
  reassuranceText: {
    fontSize: fontSize.small,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
