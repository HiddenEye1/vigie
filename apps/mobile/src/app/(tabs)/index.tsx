import { useRouter } from 'expo-router';
import type { ReactElement } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActionCard } from '../../components/action-card';
import { LighthouseLogo } from '../../components/lighthouse-logo';
import { palette, spacing, type } from '../../lib/theme';

/** Écran d'accueil : le phare veille, trois vérifications en 2 taps maximum (§3). */
export default function HomeScreen(): ReactElement {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <LighthouseLogo size={92} />
          <Text style={styles.title}>Vigie</Text>
          <Text style={styles.subtitle}>
            Un doute sur un message ? Vérifiez-le avant de cliquer.
          </Text>
        </View>

        <View style={styles.actions}>
          <ActionCard
            title="Vérifier un message"
            subtitle="SMS, e-mail, annonce…"
            icon="chatbox-ellipses-outline"
            onPress={() => {
              router.push('/verifier-texte');
            }}
          />
          <ActionCard
            title="Vérifier une capture d’écran"
            subtitle="Une photo de votre écran"
            icon="images-outline"
            onPress={() => {
              router.push('/verifier-capture');
            }}
          />
          <ActionCard
            title="Vérifier un lien"
            subtitle="Une adresse de site web"
            icon="link-outline"
            onPress={() => {
              router.push('/verifier-lien');
            }}
          />
        </View>

        <Text style={styles.reassurance}>
          Gratuit. Sans inscription. Vos messages ne sont pas conservés.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.brume,
  },
  container: {
    flexGrow: 1,
    padding: spacing.l,
    paddingBottom: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
    gap: spacing.s,
  },
  title: {
    ...type.screenTitle,
    fontSize: 34,
    lineHeight: 46,
  },
  subtitle: {
    ...type.body,
    color: palette.texteSecondaire,
    textAlign: 'center',
    paddingHorizontal: spacing.l,
  },
  actions: {
    gap: spacing.m,
  },
  reassurance: {
    ...type.label,
    textAlign: 'center',
    marginTop: 'auto',
    paddingTop: spacing.xl,
  },
});
