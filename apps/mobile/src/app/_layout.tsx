import {
  BricolageGrotesque_600SemiBold,
  BricolageGrotesque_700Bold,
} from '@expo-google-fonts/bricolage-grotesque';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import type { ReactElement } from 'react';
import { useEffect } from 'react';

import { ErrorBoundary } from '../components/error-boundary';
import { hasSeenOnboarding } from '../lib/onboarding';
import { useIncomingShare } from '../lib/share-intent';
import { colors, fonts, fontSize } from '../lib/theme';

// Le splash reste affiché tant que les polices du phare ne sont pas prêtes.
void SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function RootLayout(): ReactElement | null {
  const router = useRouter();
  const { hasShareIntent, shareIntent, resetShareIntent } = useIncomingShare();
  const [fontsLoaded] = useFonts({
    BricolageGrotesque_600SemiBold,
    BricolageGrotesque_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      void SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [fontsLoaded]);

  // Onboarding affiché une seule fois (F9).
  useEffect(() => {
    void (async () => {
      if (!(await hasSeenOnboarding())) {
        router.replace('/onboarding');
      }
    })();
  }, [router]);

  // Partage entrant (F10) : texte, lien ou image envoyés vers Vigie.
  useEffect(() => {
    if (!hasShareIntent || !shareIntent) {
      return;
    }
    const image = shareIntent.files?.find((file) => file.mimeType.startsWith('image/'));
    if (image) {
      router.push({
        pathname: '/verifier-capture',
        params: { imageUri: image.path, imageWidth: String(image.width ?? 0) },
      });
    } else if (shareIntent.webUrl) {
      router.push({ pathname: '/verifier-lien', params: { partage: shareIntent.webUrl } });
    } else if (shareIntent.text) {
      router.push({ pathname: '/verifier-texte', params: { partage: shareIntent.text } });
    }
    resetShareIntent();
  }, [hasShareIntent, shareIntent, resetShareIntent, router]);

  if (!fontsLoaded) {
    return null; // le splash reste visible pendant le chargement des polices
  }

  return (
    <ErrorBoundary>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.accent,
          headerTitleStyle: {
            color: colors.textPrimary,
            fontSize: fontSize.subtitle,
            fontFamily: fonts.displaySemiBold,
          },
          headerBackButtonDisplayMode: 'minimal',
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="family-onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="comment-fonctionne-bouclier" options={{ title: 'Bouclier famille' }} />
        <Stack.Screen name="verifier-texte" options={{ title: 'Vérifier un message' }} />
        <Stack.Screen name="verifier-lien" options={{ title: 'Vérifier un lien' }} />
        <Stack.Screen name="verifier-mail" options={{ title: 'Vérifier un mail' }} />
        <Stack.Screen name="verifier-capture" options={{ title: 'Vérifier une capture' }} />
        <Stack.Screen name="verdict/[id]" options={{ title: 'Résultat' }} />
        <Stack.Screen name="fiche/[id]" options={{ title: 'Fiche conseil' }} />
        <Stack.Screen name="parcours/index" options={{ title: 'Se protéger avant d’agir' }} />
        <Stack.Screen name="parcours/[id]" options={{ title: 'Parcours' }} />
      </Stack>
    </ErrorBoundary>
  );
}
