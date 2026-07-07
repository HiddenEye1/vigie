import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { ReactElement } from 'react';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AmbientRadar } from '../components/ambient-radar';
import { LighthouseLogo } from '../components/lighthouse-logo';
import { PrimaryButton } from '../components/primary-button';
import { markOnboardingSeen } from '../lib/onboarding';
import { palette, spacing, type } from '../lib/theme';

interface Slide {
  readonly icon: 'lighthouse' | 'chatbox-ellipses-outline' | 'lock-closed-outline';
  readonly title: string;
  readonly text: string;
}

/**
 * Onboarding en 3 écrans (F9) : promesse → fonctionnement → confidentialité.
 * Le seul moment « storytelling » de l'app : le radar tourne et le laiton brille.
 */
const SLIDES: readonly [Slide, Slide, Slide] = [
  {
    icon: 'lighthouse',
    title: 'Un doute ? Vérifiez.',
    text: 'SMS étrange, e-mail pressant, annonce trop belle ? Vigie vous dit en quelques secondes si cela ressemble à une arnaque connue, avec des mots simples.',
  },
  {
    icon: 'chatbox-ellipses-outline',
    title: 'Comment ça marche',
    text: 'Collez un message, choisissez une capture d’écran ou un lien. Vigie analyse les signaux d’alerte et vous donne un avis clair, avec les bons gestes à suivre.',
  },
  {
    icon: 'lock-closed-outline',
    title: 'Vos données restent à vous',
    text: 'Pas de compte, pas d’inscription. Les contenus analysés ne sont jamais conservés, et votre historique reste uniquement sur ce téléphone.',
  },
];

export default function OnboardingScreen(): ReactElement {
  const router = useRouter();
  const { height } = useWindowDimensions();
  // Sur les petits écrans (type iPhone SE), le médaillon rétrécit pour laisser
  // toute la place au titre et au texte sans rogner.
  const heroSize = height < 720 ? 216 : 300;
  const [index, setIndex] = useState<0 | 1 | 2>(0);
  const slide = SLIDES[index];
  const isLast = index === SLIDES.length - 1;

  const next = (): void => {
    if (!isLast) {
      setIndex((current) => (current + 1) as 0 | 1 | 2);
      return;
    }
    void (async () => {
      await markOnboardingSeen();
      router.replace('/');
    })();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.hero, { width: heroSize, height: heroSize }]}>
            <View style={styles.radar} pointerEvents="none">
              <AmbientRadar size={heroSize} />
            </View>
            <View style={styles.medallion}>
              {slide.icon === 'lighthouse' ? (
                <LighthouseLogo size={84} stroke={palette.texteClair} lantern={palette.laiton} />
              ) : (
                <Ionicons name={slide.icon} size={60} color={palette.laiton} />
              )}
            </View>
          </View>
          <Text style={styles.title}>{slide.title}</Text>
          <Text style={styles.text}>{slide.text}</Text>
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.dots} accessibilityLabel={`Étape ${String(index + 1)} sur 3`}>
            {SLIDES.map((_, dotIndex) => (
              <View
                key={dotIndex}
                style={[styles.dot, dotIndex === index ? styles.dotActive : null]}
              />
            ))}
          </View>
          <PrimaryButton
            label={isLast ? 'Commencer' : 'Continuer'}
            icon={isLast ? 'checkmark' : 'arrow-forward'}
            onPress={next}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.nuit,
  },
  container: {
    flex: 1,
    padding: spacing.l,
  },
  scroll: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.l,
    paddingBottom: spacing.l,
  },
  hero: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  radar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medallion: {
    width: 148,
    height: 148,
    borderRadius: 74,
    backgroundColor: palette.ardoiseHaute,
    borderWidth: 1.5,
    borderColor: palette.laiton,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...type.screenTitle,
    fontSize: 30,
    lineHeight: 42,
    textAlign: 'center',
  },
  text: {
    ...type.body,
    color: palette.texteDoux,
    textAlign: 'center',
    paddingHorizontal: spacing.m,
  },
  footer: {
    gap: spacing.l,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.s,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: palette.bordure,
  },
  dotActive: {
    backgroundColor: palette.laiton,
    width: 22,
  },
});
