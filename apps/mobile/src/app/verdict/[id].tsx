import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import type { ReactElement } from 'react';
import { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { captureRef } from 'react-native-view-shot';

import { AskTrustedContact, useTrustedContact } from '@/features/family';

import { PrimaryButton } from '../../components/primary-button';
import { ShareCard } from '../../components/share-card';
import { VerdictContent } from '../../components/verdict-content';
import { sendShareEvent } from '../../lib/api';
import { getDeviceId } from '../../lib/device-id';
import { guideForCategory } from '../../lib/scam-guides';
import { fonts, MIN_TOUCH_TARGET, palette, radius, spacing, type } from '../../lib/theme';
import { selectEntryById, useHistory } from '../../store/history';

/** Écran de verdict (§4.2) — relit l'entrée depuis l'historique local. */
export default function VerdictScreen(): ReactElement {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const entry = useHistory(selectEntryById(id));
  const trustedContact = useTrustedContact((state) => state.contact);
  const shareCardRef = useRef<View>(null);
  const [renderShareCard, setRenderShareCard] = useState(false);
  const [sharing, setSharing] = useState(false);

  if (!entry) {
    return (
      <View style={styles.missing}>
        <Text style={styles.missingText}>
          Ce résultat n’est plus disponible dans votre historique.
        </Text>
        <PrimaryButton
          label="Revenir à l’accueil"
          onPress={() => {
            router.dismissTo('/');
          }}
        />
      </View>
    );
  }

  const guide = guideForCategory(entry.category);
  const finalUrl = entry.fullResult.url_analysis?.final_url;

  const shareVerdict = async (): Promise<void> => {
    setSharing(true);
    setRenderShareCard(true);
    try {
      // Laisse un cycle de rendu à la carte hors écran avant la capture.
      await new Promise((resolve) => setTimeout(resolve, 150));
      const uri = await captureRef(shareCardRef, { format: 'png', quality: 1 });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: 'Partager ce verdict',
        });
        // Télémétrie anonyme (§12), sans bloquer l'utilisateur.
        void getDeviceId().then((deviceId) => sendShareEvent(deviceId));
      }
    } catch {
      // Partage annulé ou impossible : rien à faire, l'écran reste inchangé.
    } finally {
      setRenderShareCard(false);
      setSharing(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <VerdictContent result={entry.fullResult} />

      {finalUrl ? (
        <Text style={styles.urlInfo} numberOfLines={2}>
          Adresse vérifiée : {finalUrl}
        </Text>
      ) : null}

      {guide ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Lire la fiche conseil : ${guide.title}`}
          onPress={() => {
            router.push(`/fiche/${guide.id}`);
          }}
          style={({ pressed }) => [styles.guideLink, pressed && styles.guideLinkPressed]}
        >
          <Ionicons name="book-outline" size={22} color={palette.laiton} />
          <Text style={styles.guideLinkText}>En savoir plus : {guide.title}</Text>
          <Ionicons name="chevron-forward" size={20} color={palette.texteDoux} />
        </Pressable>
      ) : null}

      <View style={styles.actions}>
        <AskTrustedContact result={entry.fullResult} />
        <PrimaryButton
          label={sharing ? 'Préparation du partage…' : 'Partager ce verdict'}
          icon="share-social"
          variant={trustedContact ? 'secondary' : 'primary'}
          disabled={sharing}
          onPress={() => {
            void shareVerdict();
          }}
        />
        <PrimaryButton
          label="Nouvelle vérification"
          icon="add-circle"
          variant="secondary"
          onPress={() => {
            router.dismissTo('/');
          }}
        />
      </View>

      {renderShareCard ? (
        <View style={styles.offscreen} pointerEvents="none">
          <ShareCard ref={shareCardRef} result={entry.fullResult} />
        </View>
      ) : null}
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
    paddingBottom: spacing.xl,
  },
  urlInfo: {
    ...type.label,
    color: palette.texteMuet,
    marginTop: spacing.m,
    textAlign: 'center',
  },
  guideLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
    marginTop: spacing.xl,
    backgroundColor: palette.ardoise,
    borderWidth: 1,
    borderColor: palette.bordureDouce,
    borderRadius: radius.m,
    padding: spacing.l,
    minHeight: MIN_TOUCH_TARGET,
  },
  guideLinkPressed: {
    backgroundColor: palette.ardoiseElevee,
  },
  guideLinkText: {
    flex: 1,
    ...type.body,
    fontFamily: fonts.textSemiBold,
  },
  actions: {
    marginTop: spacing.xl,
    gap: spacing.m,
  },
  offscreen: {
    position: 'absolute',
    left: -1000,
    top: 0,
  },
  missing: {
    flex: 1,
    backgroundColor: palette.nuit,
    alignItems: 'stretch',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.l,
  },
  missingText: {
    ...type.body,
    color: palette.texteDoux,
    textAlign: 'center',
  },
});
