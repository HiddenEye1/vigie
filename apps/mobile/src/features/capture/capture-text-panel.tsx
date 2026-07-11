import { useRouter } from 'expo-router';
import type { ReactElement } from 'react';
import { useEffect, useState } from 'react';
import { Keyboard, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { ErrorView } from '@/components/error-view';
import { PrimaryButton } from '@/components/primary-button';
import { VerifyModeSwitcher } from '@/components/verify-mode-switcher';
import { WaitingView } from '@/components/waiting-view';
import type { ImageUpload } from '@/lib/api';
import { analyzeText, toApiError } from '@/lib/api';
import { getDeviceId } from '@/lib/device-id';
import { extractLinks } from '@/lib/email';
import { useRequest } from '@/lib/use-request';
import { palette, radius, spacing, type } from '@/lib/theme';
import { useHistory } from '@/store/history';

import type { TextRecognizer } from './text-recognizer';
import { getTextRecognizer } from './text-recognizer';

interface CaptureTextPanelProps {
  readonly image: ImageUpload;
  /** Injectable pour les tests ; par défaut le fournisseur OCR courant. */
  readonly recognizer?: TextRecognizer;
}

/**
 * Voie « capture → texte » (préparation OCR, Option D). Extrait le texte de la
 * capture via le `TextRecognizer` fourni, le rend ÉDITABLE (l'utilisateur relit
 * et corrige avant analyse), détecte les liens, puis envoie le texte au moteur
 * existant (`analyzeText`, kind « text »). Aucun changement serveur/prompt.
 *
 * Tant qu'aucun OCR n'est branché (`recognizer.available === false`), ce panneau
 * n'est PAS proposé par l'écran Capture — mais la pipeline est prête à s'allumer
 * dès qu'un recognizer natif sera ajouté.
 */
export function CaptureTextPanel({
  image,
  recognizer = getTextRecognizer(),
}: CaptureTextPanelProps): ReactElement {
  const router = useRouter();
  const addToHistory = useHistory((state) => state.add);
  const [text, setText] = useState('');
  const [recognizing, setRecognizing] = useState(recognizer.available);

  useEffect(() => {
    if (!recognizer.available) {
      return;
    }
    const alive = { current: true };
    void (async () => {
      try {
        const result = await recognizer.recognize({ uri: image.uri });
        if (alive.current) {
          setText(result.text);
        }
      } catch {
        // OCR indisponible ou en échec : on laisse l'utilisateur saisir/corriger.
      } finally {
        if (alive.current) {
          setRecognizing(false);
        }
      }
    })();
    return () => {
      alive.current = false;
    };
  }, [recognizer, image.uri]);

  const links = extractLinks(text);

  const { state, run, reset } = useRequest(
    async () => {
      const trimmed = text.trim();
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

  const submit = (): void => {
    if (text.trim().length === 0) {
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
        retryLabel="Revenir au texte"
      />
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <VerifyModeSwitcher active="capture" />

      {recognizing ? (
        <Text style={styles.status}>Lecture du texte de la capture…</Text>
      ) : !recognizer.available ? (
        <Text style={styles.status}>
          L’extraction automatique du texte arrivera prochainement. En attendant, vous pouvez saisir
          le texte visible sur la capture.
        </Text>
      ) : (
        <Text style={styles.status}>Relisez et corrigez le texte si besoin, puis vérifiez-le.</Text>
      )}

      <TextInput
        style={styles.textarea}
        multiline
        value={text}
        onChangeText={setText}
        placeholder="Le texte de la capture apparaîtra ici…"
        placeholderTextColor={palette.texteMuet}
        textAlignVertical="top"
        accessibilityLabel="Texte de la capture"
        autoCorrect={false}
      />

      {links.length > 0 ? (
        <View style={styles.linksCard}>
          <Text style={styles.linksTitle}>Liens détectés</Text>
          {links.map((link) => (
            <View key={link} style={styles.linkRow}>
              <Text style={styles.linkUrl} numberOfLines={1}>
                {link}
              </Text>
              <PrimaryButton
                label="Analyser ce lien"
                icon="link"
                variant="secondary"
                onPress={() => {
                  router.push({ pathname: '/verifier-lien', params: { partage: link } });
                }}
              />
            </View>
          ))}
        </View>
      ) : null}

      <PrimaryButton
        label="Vérifier ce texte"
        icon="search"
        disabled={text.trim().length === 0}
        onPress={submit}
      />

      <Text style={styles.privacyNote}>
        Le texte est analysé puis aussitôt oublié : il n’est jamais conservé sur nos serveurs.
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
  status: {
    ...type.body,
    color: palette.texteDoux,
  },
  textarea: {
    minHeight: 160,
    borderWidth: 1,
    borderColor: palette.bordureDouce,
    borderRadius: radius.l,
    padding: spacing.l,
    ...type.body,
    backgroundColor: palette.ardoiseHaute,
  },
  linksCard: {
    backgroundColor: palette.ardoise,
    borderWidth: 1,
    borderColor: palette.bordureDouce,
    borderRadius: radius.l,
    padding: spacing.l,
    gap: spacing.m,
  },
  linksTitle: {
    ...type.sectionTitle,
  },
  linkRow: {
    gap: spacing.s,
  },
  linkUrl: {
    ...type.bodySecondary,
    color: palette.texteDoux,
  },
  privacyNote: {
    ...type.label,
    color: palette.texteMuet,
    textAlign: 'center',
  },
});
