import { useRouter } from 'expo-router';
import type { ReactElement } from 'react';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AnchorHeader } from '../../components/anchor-header';
import { CompactActionCard } from '../../components/compact-action-card';
import { HeroActionCard } from '../../components/hero-action-card';
import { SpotlightGuides } from '../../components/spotlight-guides';
import { palette, spacing, type } from '../../lib/theme';

/** Phrases d'état de veille, dans l'en-tête — le poste de garde qui veille. */
const STATUS_LINES = [
  'Prêt à vérifier.',
  'Un doute ? Je veille.',
  'Toujours à vos côtés.',
] as const;

const STATUS_ROTATION_MS = 5_000;

/**
 * Accueil : un poste de garde qui veille. Lecture en Z, ancrée en haut —
 * en-tête vivant → action principale → duo secondaire → contenu à explorer.
 */
export default function HomeScreen(): ReactElement {
  const router = useRouter();
  const [statusIndex, setStatusIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStatusIndex((current) => (current + 1) % STATUS_LINES.length);
    }, STATUS_ROTATION_MS);
    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <View style={styles.screen}>
      <AnchorHeader
        title="Vigie"
        status={STATUS_LINES[statusIndex] ?? STATUS_LINES[0]}
        showLighthouse
        onSettings={() => {
          router.push('/parametres');
        }}
      />

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.inset}>
          <HeroActionCard
            title="Vérifier un message"
            subtitle="Collez un SMS, un e-mail, un message reçu"
            icon="chatbox-ellipses"
            onPress={() => {
              router.push('/verifier-texte');
            }}
          />
        </View>

        <View style={styles.duo}>
          <CompactActionCard
            title="Une capture d’écran"
            icon="image-outline"
            onPress={() => {
              router.push('/verifier-capture');
            }}
          />
          <CompactActionCard
            title="Un lien"
            icon="link-outline"
            onPress={() => {
              router.push('/verifier-lien');
            }}
          />
        </View>

        <SpotlightGuides />

        <Text style={styles.privacy}>
          Gratuit, sans inscription. Vos messages ne sont jamais conservés.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.brume,
  },
  body: {
    paddingTop: spacing.l,
    paddingBottom: spacing.xl,
    gap: spacing.xl,
  },
  inset: {
    paddingHorizontal: spacing.l,
  },
  duo: {
    flexDirection: 'row',
    gap: spacing.m,
    paddingHorizontal: spacing.l,
  },
  privacy: {
    ...type.label,
    textAlign: 'center',
    paddingHorizontal: spacing.l,
  },
});
