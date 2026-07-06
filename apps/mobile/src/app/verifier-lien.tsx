import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams, useRouter } from 'expo-router';
import type { ReactElement } from 'react';
import { useState } from 'react';
import { Keyboard, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { ErrorView } from '../components/error-view';
import { PrimaryButton } from '../components/primary-button';
import { WaitingView } from '../components/waiting-view';
import { analyzeUrl, ApiFailure } from '../lib/api';
import { getDeviceId } from '../lib/device-id';
import { palette, radius, spacing, type } from '../lib/theme';
import { useHistory } from '../store/history';

type ScreenState = { step: 'editing' } | { step: 'loading' } | { step: 'error'; message: string };

/** Vérification d'un lien (F3) : saisie/collage → attente → verdict. */
export default function VerifyUrlScreen(): ReactElement {
  const router = useRouter();
  const { partage } = useLocalSearchParams<{ partage?: string }>();
  const addToHistory = useHistory((state) => state.add);
  const [url, setUrl] = useState(partage ?? '');
  const [state, setState] = useState<ScreenState>({ step: 'editing' });

  const pasteFromClipboard = async (): Promise<void> => {
    const text = await Clipboard.getStringAsync();
    if (text) {
      setUrl(text.trim());
    }
  };

  const submit = async (): Promise<void> => {
    const trimmed = url.trim();
    if (trimmed.length === 0) {
      return;
    }
    Keyboard.dismiss();
    setState({ step: 'loading' });
    try {
      const deviceId = await getDeviceId();
      const result = await analyzeUrl(trimmed, deviceId);
      const entry = addToHistory({ kind: 'url', excerpt: trimmed, result });
      router.replace(`/verdict/${entry.id}`);
    } catch (error) {
      const message =
        error instanceof ApiFailure
          ? error.userMessage
          : 'Une erreur inattendue est survenue. Merci de réessayer.';
      setState({ step: 'error', message });
    }
  };

  if (state.step === 'loading') {
    return <WaitingView />;
  }

  if (state.step === 'error') {
    return (
      <ErrorView
        message={state.message}
        onRetry={() => {
          setState({ step: 'editing' });
        }}
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
      <Text style={styles.instructions}>
        Collez l’adresse du site qui vous semble douteuse. Vigie la vérifie sans jamais l’ouvrir sur
        votre téléphone.
      </Text>

      <TextInput
        style={styles.input}
        value={url}
        onChangeText={setUrl}
        placeholder="Exemple : chrono-livraison-fr.com"
        placeholderTextColor={palette.texteSecondaire}
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
          onPress={() => {
            void submit();
          }}
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
    backgroundColor: palette.brume,
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
    borderWidth: 1.5,
    borderColor: palette.bordure,
    borderRadius: radius.m,
    paddingHorizontal: spacing.l,
    ...type.body,
    backgroundColor: palette.ecume,
  },
  buttons: {
    gap: spacing.m,
  },
  privacyNote: {
    ...type.label,
    textAlign: 'center',
  },
});
