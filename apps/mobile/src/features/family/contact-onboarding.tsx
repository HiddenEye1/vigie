import { Ionicons } from '@expo/vector-icons';
import type { ReactElement } from 'react';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { palette, radius, spacing, type } from '@/lib/theme';

import type { ContactChannel } from './contact.store';
import { useTrustedContact } from './contact.store';
import { FamilyConsentCard } from './family-consent-card';
import { detectChannel, firstName } from './messages';

interface ContactOnboardingProps {
  /** Appelé après l'enregistrement du proche. */
  readonly onDone: () => void;
  /** Appelé si le senior quitte le parcours à la première étape. */
  readonly onCancel: () => void;
}

const TOTAL_STEPS = 4;

/**
 * Assistant guidé de première configuration d'un proche de confiance
 * (Bouclier famille, Lot 2). Quatre étapes calmes, un seul geste par écran :
 * explication → saisie → transparence → confirmation.
 *
 * 100 % LOCAL : à la confirmation, on enregistre le proche sur ce téléphone
 * (AsyncStorage via le store). Aucun appel réseau, aucune notification, le
 * proche n'est jamais prévenu automatiquement. Rien n'est promis d'autre.
 */
export function ContactOnboarding({ onDone, onCancel }: ContactOnboardingProps): ReactElement {
  const save = useTrustedContact((state) => state.save);
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [value, setValue] = useState('');

  const channel = detectChannel(value);
  const canContinueSaisie = name.trim().length > 0 && channel !== null;
  const prenom = firstName(name);

  const goBack = (): void => {
    if (step === 0) {
      onCancel();
      return;
    }
    setStep((current) => current - 1);
  };

  const confirm = (): void => {
    if (channel === null) {
      return;
    }
    save({ name: name.trim(), channel, value: value.trim() });
    onDone();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={step === 0 ? 'Annuler' : 'Retour'}
          hitSlop={12}
          onPress={goBack}
          style={styles.back}
        >
          <Ionicons name="chevron-back" size={24} color={palette.laiton} />
          <Text style={styles.backLabel}>{step === 0 ? 'Annuler' : 'Retour'}</Text>
        </Pressable>
        <Text style={styles.stepLabel}>
          Étape {String(step + 1)} sur {String(TOTAL_STEPS)}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        {step === 0 ? <StepIntro /> : null}
        {step === 1 ? (
          <StepSaisie
            name={name}
            value={value}
            channel={channel}
            onName={setName}
            onValue={setValue}
          />
        ) : null}
        {step === 2 ? <StepTransparence /> : null}
        {step === 3 ? <StepConfirmation prenom={prenom} /> : null}
      </ScrollView>

      <View style={styles.footer}>
        {step === 0 ? (
          <PrimaryButton
            label="Continuer"
            icon="arrow-forward"
            onPress={() => {
              setStep(1);
            }}
          />
        ) : null}
        {step === 1 ? (
          <PrimaryButton
            label="Continuer"
            icon="arrow-forward"
            disabled={!canContinueSaisie}
            onPress={() => {
              setStep(2);
            }}
          />
        ) : null}
        {step === 2 ? (
          <PrimaryButton
            label="Continuer"
            icon="arrow-forward"
            onPress={() => {
              setStep(3);
            }}
          />
        ) : null}
        {step === 3 ? (
          <PrimaryButton label={`Enregistrer ${prenom}`} icon="checkmark" onPress={confirm} />
        ) : null}
      </View>
    </View>
  );
}

/** Étape 1 — à quoi sert un proche de confiance, sans jargon ni pression. */
function StepIntro(): ReactElement {
  return (
    <View style={styles.step}>
      <View style={styles.iconCircle}>
        <Ionicons name="people" size={32} color={palette.laiton} />
      </View>
      <Text style={styles.title}>Choisissez une personne de confiance</Text>
      <Text style={styles.paragraph}>
        Un proche de confiance, c’est une personne — votre fils, votre fille, un ami — à qui vous
        pourrez demander un avis en un geste quand un message vous inquiète.
      </Text>
      <Text style={styles.paragraph}>
        C’est vous qui décidez quand lui demander. Il n’est jamais prévenu automatiquement.
      </Text>
    </View>
  );
}

interface StepSaisieProps {
  readonly name: string;
  readonly value: string;
  readonly channel: ContactChannel | null;
  readonly onName: (value: string) => void;
  readonly onValue: (value: string) => void;
}

/** Étape 2 — saisie simple : prénom puis numéro ou e-mail (canal auto-détecté). */
function StepSaisie({ name, value, channel, onName, onValue }: StepSaisieProps): ReactElement {
  const showHint = value.trim().length > 0 && channel === null;
  return (
    <View style={styles.step}>
      <Text style={styles.title}>Qui est votre proche ?</Text>
      <Text style={styles.paragraph}>
        Son prénom, puis son numéro de téléphone ou son adresse e-mail.
      </Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={onName}
        placeholder="Son prénom (ex. Marie)"
        placeholderTextColor={palette.texteMuet}
        accessibilityLabel="Prénom du proche de confiance"
        autoCorrect={false}
      />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onValue}
        placeholder="Son numéro ou son e-mail"
        placeholderTextColor={palette.texteMuet}
        accessibilityLabel="Numéro de téléphone ou adresse e-mail du proche"
        autoCapitalize="none"
        autoCorrect={false}
        inputMode="text"
      />
      {showHint ? (
        <Text style={styles.hint}>Entrez un numéro de téléphone ou une adresse e-mail valides.</Text>
      ) : null}
    </View>
  );
}

/** Étape 3 — transparence : réutilise la carte des quatre engagements. */
function StepTransparence(): ReactElement {
  return (
    <View style={styles.step}>
      <Text style={styles.title}>Ce proche ne voit rien automatiquement</Text>
      <FamilyConsentCard />
    </View>
  );
}

/** Étape 4 — confirmation rassurante, sans promesse de veille à distance. */
function StepConfirmation({ prenom }: { readonly prenom: string }): ReactElement {
  return (
    <View style={styles.step}>
      <View style={styles.iconCircle}>
        <Ionicons name="checkmark-circle" size={32} color={palette.texteFeuVert} />
      </View>
      <Text style={styles.title}>C’est prêt</Text>
      <Text style={styles.paragraph}>
        {prenom} pourra être contacté si vous choisissez de lui demander de l’aide.
      </Text>
      <Text style={styles.paragraph}>
        Vous pourrez le modifier ou le retirer à tout moment dans les Réglages.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.nuit,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  backLabel: {
    ...type.button,
    color: palette.laiton,
  },
  stepLabel: {
    ...type.label,
    color: palette.texteMuet,
  },
  body: {
    padding: spacing.l,
    gap: spacing.l,
    paddingBottom: spacing.xl,
  },
  step: {
    gap: spacing.m,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    backgroundColor: palette.laitonPale,
    borderWidth: 1,
    borderColor: palette.laitonFilet,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...type.screenTitle,
  },
  paragraph: {
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
  hint: {
    ...type.bodySecondary,
    color: palette.texteFeuAmbre,
  },
  footer: {
    paddingHorizontal: spacing.l,
    paddingTop: spacing.m,
  },
});
