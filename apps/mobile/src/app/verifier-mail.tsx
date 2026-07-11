import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
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
import { composeEmailForAnalysis, extractLinks } from '../lib/email';
import { palette, radius, spacing, type } from '../lib/theme';
import { useHistory } from '../store/history';

/**
 * Analyse d'un mail collé (expéditeur, objet, contenu). Les champs sont composés
 * en un texte étiqueté puis envoyés au moteur existant (kind « text ») : aucun
 * changement de contrat, de prompt ni de moteur. Collage manuel uniquement —
 * aucune connexion à une boîte mail, aucune permission.
 */
export default function VerifyMailScreen(): ReactElement {
  const router = useRouter();
  const addToHistory = useHistory((state) => state.add);
  const [from, setFrom] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const composed = composeEmailForAnalysis({ from, subject, body });
  const links = extractLinks(body);

  const { state, run, reset } = useRequest(
    async () => {
      const deviceId = await getDeviceId();
      const result = await analyzeText(composed.text, deviceId);
      return addToHistory({ kind: 'text', excerpt: composed.text, result });
    },
    {
      mapError: toApiError,
      onSuccess: (entry) => {
        router.replace(`/verdict/${entry.id}`);
      },
    },
  );

  const pasteBody = async (): Promise<void> => {
    const text = await Clipboard.getStringAsync();
    if (text) {
      setBody(text);
    }
  };

  const submit = (): void => {
    if (body.trim().length === 0) {
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
        retryLabel="Revenir au mail"
      />
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <VerifyModeSwitcher active="mail" />

      <Text style={styles.instructions}>
        Collez le mail reçu. L’expéditeur et l’objet aident, mais le contenu suffit.
      </Text>

      <View style={styles.field}>
        <Text style={styles.label}>Expéditeur (facultatif)</Text>
        <TextInput
          style={styles.input}
          value={from}
          onChangeText={setFrom}
          placeholder="ex. service-client@banque.fr"
          placeholderTextColor={palette.texteMuet}
          accessibilityLabel="Expéditeur du mail"
          autoCapitalize="none"
          autoCorrect={false}
          inputMode="text"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Objet (facultatif)</Text>
        <TextInput
          style={styles.input}
          value={subject}
          onChangeText={setSubject}
          placeholder="ex. Votre compte va être suspendu"
          placeholderTextColor={palette.texteMuet}
          accessibilityLabel="Objet du mail"
          autoCorrect={false}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Contenu du mail</Text>
        <TextInput
          style={styles.textarea}
          multiline
          value={body}
          onChangeText={setBody}
          placeholder="Collez ici le corps du mail…"
          placeholderTextColor={palette.texteMuet}
          textAlignVertical="top"
          accessibilityLabel="Contenu du mail"
          autoCorrect={false}
        />
      </View>

      {composed.truncated ? (
        <Text style={styles.warning}>
          Le mail est très long. Vigie analyse les 10 000 premiers caractères.
        </Text>
      ) : null}

      {links.length > 0 ? (
        <View style={styles.linksCard}>
          <Text style={styles.linksTitle}>Liens détectés dans ce mail</Text>
          <Text style={styles.linksNote}>
            Un lien vous inquiète ? Analysez-le à part (adresse réelle, âge du site…).
          </Text>
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

      <View style={styles.buttons}>
        <PrimaryButton
          label="Coller le mail copié"
          icon="clipboard"
          variant="secondary"
          onPress={() => {
            void pasteBody();
          }}
        />
        <PrimaryButton
          label="Vérifier ce mail"
          icon="search"
          disabled={body.trim().length === 0}
          onPress={submit}
        />
      </View>

      <Text style={styles.privacyNote}>
        Vigie analyse le contenu, l’expéditeur affiché, l’objet et les liens visibles. Elle ne
        vérifie pas l’authenticité technique du mail. Le mail est analysé puis aussitôt oublié : il
        n’est jamais conservé sur nos serveurs.
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
  field: {
    gap: spacing.s,
  },
  label: {
    ...type.label,
    color: palette.texteDoux,
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
  textarea: {
    minHeight: 160,
    borderWidth: 1,
    borderColor: palette.bordureDouce,
    borderRadius: radius.l,
    padding: spacing.l,
    ...type.body,
    backgroundColor: palette.ardoiseHaute,
  },
  warning: {
    ...type.bodySecondary,
    color: palette.texteFeuAmbre,
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
  linksNote: {
    ...type.bodySecondary,
    color: palette.texteMuet,
  },
  linkRow: {
    gap: spacing.s,
  },
  linkUrl: {
    ...type.bodySecondary,
    color: palette.texteDoux,
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
