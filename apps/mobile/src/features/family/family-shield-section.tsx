import type { ReactElement } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { palette, spacing, type } from '@/lib/theme';

import { AdviceRequestList } from './advice-request-list';
import { FamilyConsentCard } from './family-consent-card';
import { SimpleModeSection } from './simple-mode-section';
import { TrustedContactSection } from './trusted-contact-section';

/**
 * Section « Bouclier famille » des Réglages : regroupe les briques LOCALES du
 * fil familial — le proche de confiance, ce que « veiller » veut dire, et le
 * mode simplifié. Tout est local, consenti et révocable ; aucune donnée ne
 * quitte le téléphone (VISION §3). La veille à distance (réseau) est présentée
 * à part, comme un « bientôt ».
 */
interface FamilyShieldSectionProps {
  /** Lance l'assistant guidé de configuration du proche (câblé par l'écran). */
  readonly onConfigureContact?: () => void;
  /** Ouvre la fiche « Comment fonctionne le Bouclier famille ? » (câblé par l'écran). */
  readonly onExplain?: () => void;
}

export function FamilyShieldSection({
  onConfigureContact,
  onExplain,
}: FamilyShieldSectionProps = {}): ReactElement {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title}>Bouclier famille</Text>
        <Text style={styles.intro}>
          Un proche de confiance, choisi par vous, à qui demander un avis en un geste — sans que
          rien ne quitte ce téléphone.
        </Text>
      </View>
      {onExplain ? (
        <PrimaryButton
          label="Comment ça marche ?"
          icon="help-circle"
          variant="secondary"
          onPress={onExplain}
        />
      ) : null}
      <TrustedContactSection {...(onConfigureContact ? { onConfigure: onConfigureContact } : {})} />
      <AdviceRequestList />
      <FamilyConsentCard />
      <SimpleModeSection />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.l,
  },
  header: {
    gap: spacing.s,
  },
  title: {
    ...type.groupTitle,
  },
  intro: {
    ...type.body,
    color: palette.texteDoux,
  },
});
