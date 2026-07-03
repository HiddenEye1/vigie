import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { ReactElement } from 'react';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '../components/primary-button';
import { markOnboardingSeen } from '../lib/onboarding';
import { colors, fontSize, spacing } from '../lib/theme';

interface Slide {
  readonly icon: 'shield-checkmark' | 'chatbox-ellipses' | 'lock-closed';
  readonly title: string;
  readonly text: string;
}

/** Onboarding en 3 écrans maximum (F9) : promesse → fonctionnement → confidentialité. */
const SLIDES: readonly [Slide, Slide, Slide] = [
  {
    icon: 'shield-checkmark',
    title: 'Un doute ? Vérifiez.',
    text: 'SMS étrange, e-mail pressant, annonce trop belle ? Vigie vous dit en quelques secondes si cela ressemble à une arnaque connue, avec des mots simples.',
  },
  {
    icon: 'chatbox-ellipses',
    title: 'Comment ça marche',
    text: 'Collez un message, choisissez une capture d’écran ou un lien. Vigie analyse les signaux d’alerte et vous donne un avis clair, avec les bons gestes à suivre.',
  },
  {
    icon: 'lock-closed',
    title: 'Vos données restent à vous',
    text: 'Pas de compte, pas d’inscription. Les contenus analysés ne sont jamais conservés, et votre historique reste uniquement sur ce téléphone.',
  },
];

export default function OnboardingScreen(): ReactElement {
  const router = useRouter();
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
        <View style={styles.content}>
          <View style={styles.iconCircle}>
            <Ionicons name={slide.icon} size={56} color={colors.onAccent} />
          </View>
          <Text style={styles.title}>{slide.title}</Text>
          <Text style={styles.text}>{slide.text}</Text>
        </View>

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
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    padding: spacing.l,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.l,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  text: {
    fontSize: fontSize.subtitle,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 30,
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
    backgroundColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.accent,
  },
});
