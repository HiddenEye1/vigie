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
import { analyzeText, toApiError } from '../lib/api';
import { getDeviceId } from '../lib/device-id';
import { palette, radius, spacing, type } from '../lib/theme';
import { useHistory } from '../store/history';

/** Saisie / collage du message suspect, écran d'attente, puis verdict. */
export default function VerifyTextScreen(): ReactElement {
  const router = useRouter();
  // Texte éventuellement reçu via la feuille de partage du système (F10).
  const { partage } = useLocalSearchParams<{ partage?: string }>();
  const addToHistory = useHistory((state) => state.add);
  const [content, setContent] = useState(partage ?? '');

  const { state, run, reset } = useRequest(
    async () => {
      const trimmed = content.trim();
      const deviceId = await getDeviceId();
      const result = await analyzeText(trimmed, deviceId);
      return addToHistory({ kind: 'text', excerpt: trimmed, result });
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
      setContent(text);
    }
  };

  const submit = (): void => {
    if (content.trim().length === 0) {
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
        retryLabel="Revenir au message"
      />
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <VerifyModeSwitcher active="texte" />

      <Text style={styles.instructions}>
        Collez le message qui vous inquiète : SMS, e-mail, annonce ou conversation.
      </Text>

      <TextInput
        style={styles.input}
        multiline
        value={content}
        onChangeText={setContent}
        placeholder="Exemple : « Votre colis est en attente, réglez 1,99 € pour le recevoir… »"
        placeholderTextColor={palette.texteMuet}
        textAlignVertical="top"
        accessibilityLabel="Message à vérifier"
        autoCorrect={false}
      />

      <View style={styles.buttons}>
        <PrimaryButton
          label="Coller le message copié"
          icon="clipboard"
          variant="secondary"
          onPress={() => {
            void pasteFromClipboard();
          }}
        />
        <PrimaryButton
          label="Vérifier maintenant"
          icon="search"
          disabled={content.trim().length === 0}
          onPress={submit}
        />
      </View>

      <Text style={styles.privacyNote}>
        Votre message est analysé puis aussitôt oublié : il n’est jamais conservé sur nos serveurs.
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
    minHeight: 160,
    borderWidth: 1,
    borderColor: palette.bordureDouce,
    borderRadius: radius.l,
    padding: spacing.l,
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
