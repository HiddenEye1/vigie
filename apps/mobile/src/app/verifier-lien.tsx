import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams, useRouter } from 'expo-router';
import type { ReactElement } from 'react';
import { useState } from 'react';
import { Keyboard, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { useRequest } from '@/lib/use-request';

import { ErrorView } from '../components/error-view';
import { PrimaryButton } from '../components/primary-button';
import { VerifyModeSwitcher } from '../components/verify-mode-switcher';
import { WaitingView } from '../components/waiting-view';
import { analyzeUrl, toApiError } from '../lib/api';
import { getDeviceId } from '../lib/device-id';
import { palette, radius, spacing, type } from '../lib/theme';
import { useHistory } from '../store/history';

/** Vérification d'un lien (F3) : saisie/collage → attente → verdict. */
export default function VerifyUrlScreen(): ReactElement {
  const router = useRouter();
  const { partage } = useLocalSearchParams<{ partage?: string }>();
  const addToHistory = useHistory((state) => state.add);
  const [url, setUrl] = useState(partage ?? '');

  const { state, run, reset } = useRequest(
    async () => {
      const trimmed = url.trim();
      const deviceId = await getDeviceId();
      const result = await analyzeUrl(trimmed, deviceId);
      return addToHistory({ kind: 'url', excerpt: trimmed, result });
    },
    {
      mapError: toApiError,
      onSuccess: (entry) => {
        router.replace(`/verdict/${entry.id}`);
      },
    },
  );

  const pasteFromClipboard = async (): Promise<void> => {
    const text = await Clipboard.getStringAsync();
    if (text) {
      setUrl(text.trim());
    }
  };

  const submit = (): void => {
    if (url.trim().length === 0) {
      return;
    }
    Keyboard.dismiss();
    void run();
  };

  if (state.status === 'loading' || state.status === 'success') {
    return <WaitingView />;
  }

  if (state.status === 'error') {
    return (
      <ErrorView
        message={state.error.message}
        kind={state.error.kind}
        onRetry={reset}
        retryLabel="Revenir au lien"
      />
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <VerifyModeSwitcher active="lien" />

      <Text style={styles.instructions}>
        Collez l’adresse du site qui vous semble douteuse. Vigie la vérifie sans jamais l’ouvrir sur
        votre téléphone.
      </Text>

      <TextInput
        style={styles.input}
        value={url}
        onChangeText={setUrl}
        placeholder="Exemple : chrono-livraison-fr.com"
        placeholderTextColor={palette.texteMuet}
        accessibilityLabel="Lien à vérifier"
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
        inputMode="url"
      />

      <View style={styles.buttons}>
        <PrimaryButton
          label="Coller le lien copié"
          icon="clipboard"
          variant="secondary"
          onPress={() => {
            void pasteFromClipboard();
          }}
        />
        <PrimaryButton
          label="Vérifier ce lien"
          icon="search"
          disabled={url.trim().length === 0}
          onPress={submit}
        />
      </View>

      <Text style={styles.privacyNote}>
        Ne cliquez pas sur un lien douteux : copiez-le et laissez Vigie l’examiner à votre place.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.nuit,
  },
  container: {
    padding: spacing.l,
    gap: spacing.l,
  },
  instructions: {
    ...type.body,
  },
  input: {
    minHeight: 56,
    borderWidth: 1,
    borderColor: palette.bordureDouce,
    borderRadius: radius.m,
    paddingHorizontal: spacing.l,
    ...type.body,
    backgroundColor: palette.ardoiseHaute,
  },
  buttons: {
    gap: spacing.m,
  },
  privacyNote: {
    ...type.label,
    color: palette.texteMuet,
    textAlign: 'center',
  },
});
