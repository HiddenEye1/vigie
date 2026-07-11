import { Ionicons } from '@expo/vector-icons';
import type { ReactElement } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AmbientRadar } from '@/components/ambient-radar';
import { LighthouseLogo } from '@/components/lighthouse-logo';
import { fonts, MIN_TOUCH_TARGET, onHeader, palette, radius, simple, spacing } from '@/lib/theme';

import { BigActionButton } from './big-action-button';
import { FamilyPresence } from './family-presence';

interface SimpleHomeProps {
  /** Prénom du proche de confiance, ou `null` si aucun n'est enregistré. */
  readonly contactFirstName: string | null;
  readonly topInset?: number;
  readonly onVerifyText: () => void;
  readonly onAskContact: () => void;
  readonly onCapture: () => void;
  readonly onLink: () => void;
  readonly onSettings: () => void;
}

/**
 * Accueil « mode simplifié » : un seul geste dominant — vérifier un message —
 * et, si un proche est enregistré, un second grand geste pour lui demander.
 * Les autres options restent accessibles, mais discrètes. Typo agrandie,
 * contrastes renforcés, cibles très grandes (VISION : ne jamais infantiliser).
 */
export function SimpleHome({
  contactFirstName,
  topInset = 0,
  onVerifyText,
  onAskContact,
  onCapture,
  onLink,
  onSettings,
}: SimpleHomeProps): ReactElement {
  return (
    <View style={styles.screen}>
      <View style={styles.radarLayer} pointerEvents="none">
        <AmbientRadar size={340} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.body, { paddingTop: topInset + spacing.m }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <View style={styles.brand}>
            <LighthouseLogo size={34} lantern={palette.laiton} stroke={onHeader.text} />
            <Text style={styles.wordmark}>Vigie</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Réglages"
            accessibilityHint="Ouvre les réglages, où vous pouvez quitter le mode simplifié."
            hitSlop={12}
            onPress={onSettings}
            style={styles.gear}
          >
            <Ionicons name="settings-outline" size={22} color={onHeader.text} />
          </Pressable>
        </View>

        <View style={styles.hero}>
          <Text style={styles.title}>Un doute ?</Text>
          <Text style={styles.subtitle}>Vigie regarde le message avec vous.</Text>
        </View>

        <FamilyPresence firstName={contactFirstName} />

        <View style={styles.actions}>
          <BigActionButton
            label="Vérifier un message"
            icon="chatbubble-ellipses"
            hint="Ouvre l’écran pour coller le message que vous avez reçu."
            onPress={onVerifyText}
          />
          {contactFirstName !== null ? (
            <BigActionButton
              label={`Demander à ${contactFirstName}`}
              icon="paper-plane"
              variant="secondary"
              hint={`Écrit un message à ${contactFirstName} pour lui demander son avis.`}
              onPress={onAskContact}
            />
          ) : null}
        </View>

        <View style={styles.discreet}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Vérifier une capture d’écran"
            onPress={onCapture}
            style={styles.discreetItem}
          >
            <Ionicons name="image-outline" size={20} color={palette.texteDoux} />
            <Text style={styles.discreetLabel}>Une capture d’écran</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Vérifier un lien"
            onPress={onLink}
            style={styles.discreetItem}
          >
            <Ionicons name="link-outline" size={20} color={palette.texteDoux} />
            <Text style={styles.discreetLabel}>Un lien</Text>
          </Pressable>
        </View>

        <Text style={styles.privacy}>Gratuit. Vos messages ne sont jamais conservés.</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.nuit,
  },
  radarLayer: {
    position: 'absolute',
    top: -60,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  body: {
    paddingBottom: spacing.xxl,
    gap: spacing.xl,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.l,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
  },
  wordmark: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: palette.texteClair,
  },
  gear: {
    minWidth: MIN_TOUCH_TARGET - 8,
    minHeight: MIN_TOUCH_TARGET - 8,
    borderRadius: radius.m,
    backgroundColor: onHeader.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    paddingHorizontal: spacing.l,
    gap: spacing.s,
  },
  title: {
    ...simple.titre,
  },
  subtitle: {
    ...simple.sousTitre,
  },
  actions: {
    paddingHorizontal: spacing.l,
    gap: spacing.l,
  },
  discreet: {
    paddingHorizontal: spacing.l,
    gap: spacing.s,
  },
  discreetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
    minHeight: MIN_TOUCH_TARGET,
    paddingHorizontal: spacing.m,
    borderRadius: radius.m,
    backgroundColor: palette.ardoiseHaute,
    borderWidth: 1,
    borderColor: palette.bordureDouce,
  },
  discreetLabel: {
    ...simple.lienDiscret,
  },
  privacy: {
    fontFamily: fonts.text,
    fontSize: 15,
    lineHeight: 22,
    color: palette.texteMuet,
    textAlign: 'center',
    paddingHorizontal: spacing.l,
  },
});
