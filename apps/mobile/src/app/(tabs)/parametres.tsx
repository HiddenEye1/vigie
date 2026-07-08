import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Linking } from 'react-native';
import type { ReactElement } from 'react';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';

import { PrimaryButton } from '../../components/primary-button';
import { SimpleModeSection } from '../../components/simple-mode-section';
import { TrustedContactSection } from '../../components/trusted-contact-section';
import { apiBaseUrl, ApiFailure, joinWaitlist } from '../../lib/api';
import { getDeviceId } from '../../lib/device-id';
import { colors, fonts, palette, radius, spacing, type } from '../../lib/theme';
import { useHistory } from '../../store/history';

type WaitlistState =
  { step: 'idle' } | { step: 'sending' } | { step: 'done' } | { step: 'error'; message: string };

/** Paramètres (§4.1 écran 6) : confidentialité, suppression, waitlist, version. */
export default function SettingsScreen(): ReactElement {
  const clearHistory = useHistory((state) => state.clear);
  const [email, setEmail] = useState('');
  const [waitlist, setWaitlist] = useState<WaitlistState>({ step: 'idle' });

  const emailIsValid = z.email().safeParse(email.trim().toLowerCase()).success;

  const submitWaitlist = async (): Promise<void> => {
    setWaitlist({ step: 'sending' });
    try {
      const deviceId = await getDeviceId();
      await joinWaitlist(email.trim().toLowerCase(), deviceId);
      setWaitlist({ step: 'done' });
    } catch (error) {
      const message =
        error instanceof ApiFailure
          ? error.userMessage
          : 'Une erreur inattendue est survenue. Merci de réessayer.';
      setWaitlist({ step: 'error', message });
    }
  };

  const confirmDeleteAll = (): void => {
    Alert.alert(
      'Supprimer toutes mes données ?',
      'Votre historique, votre identifiant anonyme et vos préférences seront effacés de ce téléphone. Cette action est définitive.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Tout supprimer',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              clearHistory();
              await AsyncStorage.clear();
              Alert.alert(
                'Données supprimées',
                'Toutes vos données locales ont été effacées. L’écran de bienvenue s’affichera au prochain démarrage.',
              );
            })();
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Réglages</Text>

        <SimpleModeSection />

        <TrustedContactSection />

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Bouclier famille — bientôt</Text>
          <Text style={styles.cardText}>
            Bientôt, Vigie pourra prévenir un proche de confiance lorsqu’une personne que vous
            protégez reçoit un message dangereux. Laissez votre e-mail pour être averti du
            lancement.
          </Text>
          {waitlist.step === 'done' ? (
            <Text style={styles.successText}>
              Merci ! Vous serez parmi les premiers informés du lancement.
            </Text>
          ) : (
            <>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={(value) => {
                  setEmail(value);
                  if (waitlist.step === 'error') {
                    setWaitlist({ step: 'idle' });
                  }
                }}
                placeholder="votre.email@exemple.fr"
                placeholderTextColor={colors.textSecondary}
                accessibilityLabel="Votre adresse e-mail pour la liste d’attente"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                inputMode="email"
              />
              {waitlist.step === 'error' ? (
                <Text style={styles.errorText}>{waitlist.message}</Text>
              ) : null}
              <PrimaryButton
                label={
                  waitlist.step === 'sending' ? 'Inscription en cours…' : 'Être averti du lancement'
                }
                icon="mail"
                disabled={!emailIsValid || waitlist.step === 'sending'}
                onPress={() => {
                  void submitWaitlist();
                }}
              />
            </>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Vos données</Text>
          <Text style={styles.cardText}>
            Vigie ne demande aucun compte. Les contenus analysés ne sont jamais conservés sur nos
            serveurs, et votre historique reste uniquement sur ce téléphone.
          </Text>
          <PrimaryButton
            label="Lire la politique de confidentialité"
            icon="document-text"
            variant="secondary"
            onPress={() => {
              void Linking.openURL(`${apiBaseUrl()}/privacy`);
            }}
          />
          <PrimaryButton
            label="Supprimer toutes mes données"
            icon="trash"
            variant="secondary"
            onPress={confirmDeleteAll}
          />
        </View>

        <Text style={styles.version}>
          Vigie — version {Constants.expoConfig?.version ?? 'inconnue'}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.nuit,
  },
  container: {
    padding: spacing.l,
    gap: spacing.l,
    paddingTop: spacing.m,
    paddingBottom: spacing.xl,
  },
  title: {
    ...type.screenTitle,
  },
  card: {
    backgroundColor: palette.ardoise,
    borderWidth: 1,
    borderColor: palette.bordureDouce,
    borderRadius: radius.l,
    padding: spacing.l,
    gap: spacing.m,
  },
  cardTitle: {
    ...type.sectionTitle,
  },
  cardText: {
    ...type.body,
    color: palette.texteDoux,
  },
  input: {
    minHeight: 56,
    borderWidth: 1.5,
    borderColor: palette.bordure,
    borderRadius: radius.m,
    paddingHorizontal: spacing.l,
    ...type.body,
    backgroundColor: palette.ardoiseHaute,
  },
  successText: {
    ...type.body,
    fontFamily: fonts.textSemiBold,
    color: palette.texteFeuVert,
  },
  errorText: {
    ...type.bodySecondary,
    color: palette.texteFeuRouge,
  },
  version: {
    ...type.label,
    color: palette.texteMuet,
    textAlign: 'center',
  },
});
