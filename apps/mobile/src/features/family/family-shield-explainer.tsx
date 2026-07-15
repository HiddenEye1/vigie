import { Ionicons } from '@expo/vector-icons';
import type { ReactElement } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { fonts, MIN_TOUCH_TARGET, palette, radius, spacing, type } from '@/lib/theme';

interface FamilyShieldExplainerProps {
  /** Lien discret « pour aller plus loin » vers le Check-up sécurité. */
  readonly onCheckup?: () => void;
}

/** Les 4 étapes du fil : du doute au conseil du proche, geste par geste. */
const STEPS = [
  'Vous avez un doute sur un message, un lien ou un appel.',
  'Vigie prépare un message clair pour votre proche.',
  'Vous le relisez, puis vous l’envoyez vous-même si vous le souhaitez.',
  'Votre proche vous donne son avis — avant que vous répondiez, cliquiez ou payiez.',
] as const;

/** Ce que le proche voit et ne voit pas : rien d'automatique, rien sans votre geste. */
const PRIVACY_POINTS = [
  'Votre proche ne voit rien automatiquement.',
  'Il voit seulement ce que vous décidez de lui envoyer.',
  'Il ne reçoit jamais le message d’origine ni vos informations.',
  'Vous pouvez modifier ou retirer ce proche à tout moment.',
] as const;

/**
 * Fiche « Comment fonctionne le Bouclier famille ? ». Explique en langage simple
 * ce que le Bouclier famille fait et ne fait pas. Purement informative,
 * rassurante et non anxiogène : jamais l'idée d'une surveillance ni d'une alerte
 * automatique (VISION §3). Distingue le présent (100 % local) du futur (option
 * réseau, uniquement avec consentement explicite).
 */
export function FamilyShieldExplainer({
  onCheckup,
}: FamilyShieldExplainerProps = {}): ReactElement {
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.body}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Comment fonctionne le Bouclier famille ?</Text>
      <Text style={styles.intro}>
        Le Bouclier famille vous permet de demander l’avis d’un proche de confiance quand un message
        vous inquiète. Vous gardez la main à chaque étape.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Comment ça se passe</Text>
        {STEPS.map((step, index) => (
          <View key={step} style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>{String(index + 1)}</Text>
            </View>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Votre proche ne voit rien sans vous</Text>
        {PRIVACY_POINTS.map((point) => (
          <View key={point} style={styles.bullet}>
            <Ionicons name="checkmark-circle" size={22} color={palette.texteFeuVert} />
            <Text style={styles.bulletText}>{point}</Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Aujourd’hui et demain</Text>
        <Text style={styles.paragraph}>Aujourd’hui, tout reste sur ce téléphone.</Text>
        <Text style={styles.paragraph}>
          Plus tard, une option pourra prévenir un proche à distance — uniquement si vous l’activez
          vous-même.
        </Text>
      </View>

      {onCheckup !== undefined ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Faire le point sur votre protection"
          onPress={onCheckup}
          style={({ pressed }) => [styles.checkupLink, pressed && styles.checkupLinkPressed]}
        >
          <Ionicons name="shield-checkmark-outline" size={20} color={palette.laiton} />
          <Text style={styles.checkupLinkText}>
            Pour aller plus loin : faites le point sur votre protection
          </Text>
          <Ionicons name="chevron-forward" size={18} color={palette.texteMuet} />
        </Pressable>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.nuit,
  },
  body: {
    padding: spacing.l,
    gap: spacing.l,
    paddingBottom: spacing.xl,
  },
  title: {
    ...type.screenTitle,
  },
  intro: {
    ...type.body,
    color: palette.texteDoux,
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
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
  },
  stepNumber: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    backgroundColor: palette.laitonPale,
    borderWidth: 1,
    borderColor: palette.laitonFilet,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    ...type.body,
    fontFamily: fonts.textSemiBold,
    color: palette.laiton,
  },
  stepText: {
    flex: 1,
    ...type.body,
  },
  bullet: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
  },
  bulletText: {
    flex: 1,
    ...type.body,
  },
  paragraph: {
    ...type.body,
    color: palette.texteDoux,
  },
  checkupLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
    minHeight: MIN_TOUCH_TARGET,
    paddingHorizontal: spacing.l,
    borderRadius: radius.l,
    backgroundColor: palette.ardoiseHaute,
    borderWidth: 1,
    borderColor: palette.laitonFilet,
  },
  checkupLinkPressed: {
    backgroundColor: palette.ardoiseElevee,
  },
  checkupLinkText: {
    flex: 1,
    ...type.bodySecondary,
    fontFamily: fonts.textSemiBold,
    color: palette.texteClair,
  },
});
