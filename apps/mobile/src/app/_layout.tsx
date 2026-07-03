import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import type { ReactElement } from 'react';
import { useEffect } from 'react';

import { hasSeenOnboarding } from '../lib/onboarding';
import { useIncomingShare } from '../lib/share-intent';
import { colors, fontSize } from '../lib/theme';

export default function RootLayout(): ReactElement {
  const router = useRouter();
  const { hasShareIntent, shareIntent, resetShareIntent } = useIncomingShare();

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

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.accent,
          headerTitleStyle: {
            color: colors.textPrimary,
            fontSize: fontSize.subtitle,
            fontWeight: '700',
          },
          headerBackButtonDisplayMode: 'minimal',
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="verifier-texte" options={{ title: 'Vérifier un message' }} />
        <Stack.Screen name="verifier-lien" options={{ title: 'Vérifier un lien' }} />
        <Stack.Screen name="verifier-capture" options={{ title: 'Vérifier une capture' }} />
        <Stack.Screen name="verdict/[id]" options={{ title: 'Résultat' }} />
        <Stack.Screen name="fiche/[id]" options={{ title: 'Fiche conseil' }} />
      </Stack>
    </>
  );
}
