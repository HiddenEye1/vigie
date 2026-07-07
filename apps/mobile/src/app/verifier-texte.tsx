import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams, useRouter } from 'expo-router';
import type { ReactElement } from 'react';
import { useState } from 'react';
import { Keyboard, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { ErrorView } from '../components/error-view';
import { PrimaryButton } from '../components/primary-button';
import { VerifyModeSwitcher } from '../components/verify-mode-switcher';
import { WaitingView } from '../components/waiting-view';
import type { ApiFailureKind } from '../lib/api';
import { analyzeText, ApiFailure } from '../lib/api';
import { getDeviceId } from '../lib/device-id';
import { palette, radius, spacing, type } from '../lib/theme';
import { useHistory } from '../store/history';

type ScreenState =
  | { step: 'editing' }
  | { step: 'loading' }
  | { step: 'error'; message: string; kind: ApiFailureKind };

/** Saisie / collage du message suspect, écran d'attente, puis verdict. */
export default function VerifyTextScreen(): ReactElement {
  const router = useRouter();
  // Texte éventuellement reçu via la feuille de partage du système (F10).
  const { partage } = useLocalSearchParams<{ partage?: string }>();
  const addToHistory = useHistory((state) => state.add);
  const [content, setContent] = useState(partage ?? '');
  const [state, setState] = useState<ScreenState>({ step: 'editing' });

  const pasteFromClipboard = async (): Promise<void> => {
    const text = await Clipboard.getStringAsync();
    if (text) {
      setContent(text);
    }
  };

  const submit = async (): Promise<void> => {
    const trimmed = content.trim();
    if (trimmed.length === 0) {
      return;
    }
    Keyboard.dismiss();
    setState({ step: 'loading' });
    try {
      const deviceId = await getDeviceId();
      const result = await analyzeText(trimmed, deviceId);
      const entry = addToHistory({ kind: 'text', excerpt: trimmed, result });
      router.replace(`/verdict/${entry.id}`);
    } catch (error) {
      const message =
        error instanceof ApiFailure
          ? error.userMessage
          : 'Une erreur inattendue est survenue. Merci de réessayer.';
      const kind = error instanceof ApiFailure ? error.kind : 'unknown';
      setState({ step: 'error', message, kind });
    }
  };

  if (state.step === 'loading') {
    return <WaitingView />;
  }

  if (state.step === 'error') {
    return (
      <ErrorView
        message={state.message}
        kind={state.kind}
        onRetry={() => {
          setState({ step: 'editing' });
        }}
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
          onPress={() => {
            void submit();
          }}
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
