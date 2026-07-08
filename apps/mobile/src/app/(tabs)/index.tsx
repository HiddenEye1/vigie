import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { ReactElement } from 'react';
import { useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AmbientRadar } from '../../components/ambient-radar';
import { HeroField } from '../../components/hero-field';
import { LighthouseLogo } from '../../components/lighthouse-logo';
import { LiveFeed } from '../../components/live-feed';
import { PrimaryButton } from '../../components/primary-button';
import type { SegmentedOption } from '../../components/segmented-tabs';
import { SegmentedTabs } from '../../components/segmented-tabs';
import { SimpleHome } from '../../components/simple-home';
import { VeilleBadge } from '../../components/veille-badge';
import { fonts, MIN_TOUCH_TARGET, onHeader, palette, radius, spacing, type } from '../../lib/theme';
import { buildContactUrl, buildHelpMessage, firstName } from '../../lib/trusted-contact';
import { useSettings } from '../../store/settings';
import { useTrustedContact } from '../../store/trusted-contact';

type Mode = 'texte' | 'capture' | 'lien';

interface ModeConfig extends SegmentedOption<Mode> {
  readonly route: '/verifier-texte' | '/verifier-capture' | '/verifier-lien';
  readonly cta: string;
  readonly icon: 'chatbubble-ellipses-outline' | 'image-outline' | 'link-outline';
  readonly ctaIcon: 'shield-checkmark' | 'image' | 'link';
  readonly placeholder: string;
  readonly ariaField: string;
}

/** Les trois façons de soumettre quelque chose à la veille. */
const MODES = [
  {
    key: 'texte',
    label: 'Message',
    icon: 'chatbubble-ellipses-outline',
    route: '/verifier-texte',
    cta: 'Vérifier un message',
    ctaIcon: 'shield-checkmark',
    placeholder: 'Collez le message reçu…',
    ariaField: 'Coller un message à vérifier',
  },
  {
    key: 'capture',
    label: 'Capture',
    icon: 'image-outline',
    route: '/verifier-capture',
    cta: 'Vérifier une capture',
    ctaIcon: 'image',
    placeholder: 'Choisissez une capture d’écran…',
    ariaField: 'Choisir une capture à vérifier',
  },
  {
    key: 'lien',
    label: 'Lien',
    icon: 'link-outline',
    route: '/verifier-lien',
    cta: 'Vérifier un lien',
    ctaIcon: 'link',
    placeholder: 'Collez le lien reçu…',
    ariaField: 'Coller un lien à vérifier',
  },
] as const satisfies readonly ModeConfig[];

/**
 * Accueil « poste de veille » : un radar ambiant en fond, la veille active
 * signalée, puis l'action du moment — choisir le type d'élément, le déposer
 * dans le champ héros, lancer la vérification. En bas, le fil des arnaques
 * du moment défile en direct.
 */
export default function HomeScreen(): ReactElement {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const simpleMode = useSettings((state) => state.simpleMode);
  const trustedContact = useTrustedContact((state) => state.contact);
  const [mode, setMode] = useState<Mode>('texte');
  const active = MODES.find((m) => m.key === mode) ?? MODES[0];

  /** Mode simplifié : demander directement de l'aide au proche, sans verdict. */
  const askContact = async (): Promise<void> => {
    if (!trustedContact) {
      return;
    }
    try {
      await Linking.openURL(buildContactUrl(trustedContact, buildHelpMessage()));
    } catch {
      Alert.alert(
        'Envoi impossible',
        'Aucune application de ce téléphone ne peut écrire à votre proche. Vérifiez le moyen de contact enregistré dans les réglages.',
      );
    }
  };

  if (simpleMode) {
    return (
      <SimpleHome
        contactFirstName={trustedContact ? firstName(trustedContact.name) : null}
        topInset={insets.top}
        onVerifyText={() => {
          router.push('/verifier-texte');
        }}
        onAskContact={() => {
          void askContact();
        }}
        onCapture={() => {
          router.push('/verifier-capture');
        }}
        onLink={() => {
          router.push('/verifier-lien');
        }}
        onSettings={() => {
          router.push('/parametres');
        }}
      />
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.radarLayer} pointerEvents="none">
        <AmbientRadar size={380} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.body,
          { paddingTop: insets.top + spacing.m, paddingBottom: spacing.xxl },
        ]}
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
            hitSlop={12}
            onPress={() => {
              router.push('/parametres');
            }}
            style={styles.gear}
          >
            <Ionicons name="settings-outline" size={20} color={onHeader.text} />
          </Pressable>
        </View>

        <View style={styles.hero}>
          <VeilleBadge label="en veille" />
          <Text style={styles.headline}>Un doute ?{'\n'}Vérifions-le ensemble.</Text>

          <SegmentedTabs options={MODES} value={mode} onChange={setMode} />

          <HeroField
            placeholder={active.placeholder}
            accessibilityLabel={active.ariaField}
            onPress={() => {
              router.push(active.route);
            }}
          />

          <PrimaryButton
            label={active.cta}
            icon={active.ctaIcon}
            variant="secondary"
            onPress={() => {
              router.push(active.route);
            }}
          />

          <Text style={styles.privacy}>
            Gratuit, sans inscription. Vos messages ne sont jamais conservés.
          </Text>
        </View>

        <LiveFeed />
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
    top: -80,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  body: {
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
    minWidth: MIN_TOUCH_TARGET - 12,
    minHeight: MIN_TOUCH_TARGET - 12,
    borderRadius: radius.m,
    backgroundColor: onHeader.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    paddingHorizontal: spacing.l,
    gap: spacing.l,
  },
  headline: {
    ...type.screenTitle,
    fontSize: 30,
    lineHeight: 40,
  },
  privacy: {
    ...type.label,
    color: palette.texteMuet,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});
