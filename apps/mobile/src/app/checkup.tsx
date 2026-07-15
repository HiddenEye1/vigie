import type { Href } from 'expo-router';
import { useRouter } from 'expo-router';
import type { ReactElement } from 'react';
import { useEffect, useState } from 'react';
import { ScrollView, Share, StyleSheet, Text, View } from 'react-native';

import type { SegmentedOption } from '@/components/segmented-tabs';
import { SegmentedTabs } from '@/components/segmented-tabs';
import {
  buildMoneyReminderMessage,
  CheckupCard,
  CheckupIntro,
  CheckupSummary,
  deriveCheckup,
  useCheckup,
} from '@/features/checkup';
import type { CheckupItemId, CheckupMode } from '@/features/checkup';
import { useSeniorMode, useTrustedContact } from '@/features/family';
import { palette, spacing, type } from '@/lib/theme';

/**
 * Écran « Check-up sécurité ».
 *
 * Un bilan de protection, pas un test : intro rassurante, bandeau « votre
 * bouclier », puis les 5 items essentiels. 100 % local — aucune donnée envoyée,
 * aucun pourcentage, aucun score.
 *
 * En mode normal, un sélecteur « Pour moi » / « Pour un proche » permet à un
 * aidant de faire un bilan *estimé* d'un proche, dans un état séparé. En mode
 * senior simplifié, les onglets sont masqués : on garde uniquement « Pour moi ».
 */
const TABS: readonly SegmentedOption<CheckupMode>[] = [
  { key: 'moi', label: 'Pour moi', icon: 'person-outline' },
  { key: 'proche', label: 'Pour un proche', icon: 'people-outline' },
];

export default function CheckupScreen(): ReactElement {
  const router = useRouter();
  const hasContact = useTrustedContact((state) => state.contact !== null);
  const large = useSeniorMode((state) => state.simpleMode);

  const confirmedMoi = useCheckup((state) => state.confirmed);
  const confirmedProche = useCheckup((state) => state.confirmedForProche);
  const confirmMoi = useCheckup((state) => state.confirm);
  const unconfirmMoi = useCheckup((state) => state.unconfirm);
  const confirmProche = useCheckup((state) => state.confirmForProche);
  const unconfirmProche = useCheckup((state) => state.unconfirmForProche);
  const markReviewed = useCheckup((state) => state.markReviewed);

  const [tab, setTab] = useState<CheckupMode>('moi');
  // En mode senior, on force « Pour moi » et on masque les onglets.
  const mode: CheckupMode = large ? 'moi' : tab;

  // Dater ce passage sur le bilan, pour le rappel doux local (jamais une notification).
  useEffect(() => {
    markReviewed();
  }, [markReviewed]);

  const confirmed = mode === 'proche' ? confirmedProche : confirmedMoi;
  const onConfirm = mode === 'proche' ? confirmProche : confirmMoi;
  const onUnconfirm = mode === 'proche' ? unconfirmProche : unconfirmMoi;

  const { items, inPlaceCount, total, level } = deriveCheckup({ confirmed, hasContact, mode });

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
      {large ? null : <SegmentedTabs options={TABS} value={tab} onChange={setTab} />}

      <CheckupIntro mode={mode} />
      <CheckupSummary inPlaceCount={inPlaceCount} total={total} level={level} large={large} />

      <View style={styles.list}>
        {items.map((view) => (
          <CheckupCard
            key={view.def.id}
            view={view}
            mode={mode}
            large={large}
            onNavigate={(route) => {
              router.push(route as Href);
            }}
            onConfirm={onConfirm}
            onUnconfirm={onUnconfirm}
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
