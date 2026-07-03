import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import type { ReactElement } from 'react';

import { colors, fontSize } from '../lib/theme';

export default function RootLayout(): ReactElement {
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
        <Stack.Screen name="verifier-texte" options={{ title: 'Vérifier un message' }} />
        <Stack.Screen name="verdict/[id]" options={{ title: 'Résultat' }} />
      </Stack>
    </>
  );
}
