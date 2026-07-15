import type { Href } from 'expo-router';
import { useRouter } from 'expo-router';
import type { ReactElement } from 'react';
import { useEffect } from 'react';
import { ScrollView, Share, StyleSheet, Text, View } from 'react-native';

import {
  buildMoneyReminderMessage,
  CheckupCard,
  CheckupIntro,
  CheckupSummary,
  deriveCheckup,
  useCheckup,
} from '@/features/checkup';
import type { CheckupItemId } from '@/features/checkup';
import { useSeniorMode, useTrustedContact } from '@/features/family';
import { palette, spacing, type } from '@/lib/theme';

/**
 * Écran « Check-up sécurité » (Lot 1).
 *
 * Un bilan de protection, pas un test : intro rassurante, bandeau « votre
 * bouclier », puis les 4 items essentiels. 100 % local — aucune donnée envoyée,
 * aucun pourcentage, aucun score. L'item « proche » lit le Bouclier famille.
 */
export default function CheckupScreen(): ReactElement {
  const router = useRouter();
  const hasContact = useTrustedContact((state) => state.contact !== null);
  const confirmed = useCheckup((state) => state.confirmed);
  const confirm = useCheckup((state) => state.confirm);
  const unconfirm = useCheckup((state) => state.unconfirm);
  const markReviewed = useCheckup((state) => state.markReviewed);
  const large = useSeniorMode((state) => state.simpleMode);

  // Dater ce passage sur le bilan, pour le rappel doux local (jamais une notification).
  useEffect(() => {
    markReviewed();
  }, [markReviewed]);

  const { items, inPlaceCount, total, level } = deriveCheckup({ confirmed, hasContact });

  // Partage d'un rappel générique via la feuille système. N'enregistre rien et
  // ne coche PAS l'item : Vigie ne sait pas si le message est envoyé ou lu.
  const shareReminder = (id: CheckupItemId): void => {
    if (id === 'proches-argent') {
      void Share.share({ message: buildMoneyReminderMessage() });
    }
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.body}
      showsVerticalScrollIndicator={false}
    >
      <CheckupIntro />
      <CheckupSummary inPlaceCount={inPlaceCount} total={total} level={level} large={large} />

      <View style={styles.list}>
        {items.map((view) => (
          <CheckupCard
            key={view.def.id}
            view={view}
            large={large}
            onNavigate={(route) => {
              router.push(route as Href);
            }}
            onConfirm={confirm}
            onUnconfirm={unconfirm}
            onShare={shareReminder}
          />
        ))}
      </View>

      <Text style={styles.footer}>
        Vous pourrez refaire ce point quand vous voulez. Ce bilan reflète ce que vous nous indiquez ;
        il ne vérifie pas votre téléphone.
      </Text>
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
  list: {
    gap: spacing.m,
  },
  footer: {
    ...type.bodySecondary,
    color: palette.texteMuet,
    textAlign: 'center',
  },
});
