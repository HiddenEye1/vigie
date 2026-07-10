import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { ReactElement } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { PARCOURS, UPCOMING_PARCOURS } from '@/features/parcours';
import { fonts, MIN_TOUCH_TARGET, palette, radius, spacing, type } from '@/lib/theme';

/**
 * Liste des parcours proactifs — les réflexes à avoir AVANT d'agir. Les
 * parcours disponibles sont ouvrables ; les prochains sont annoncés pour
 * montrer la direction, sans faire semblant d'être prêts.
 */
export default function ParcoursIndexScreen(): ReactElement {
  const router = useRouter();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.body}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.intro}>
        Un doute avant d’agir ? Ces parcours vous guident pas à pas, en quelques questions simples.
        Rien n’est envoyé.
      </Text>

      <View style={styles.list}>
        {PARCOURS.map((parcours) => (
          <Pressable
            key={parcours.id}
            accessibilityRole="button"
            accessibilityLabel={parcours.title}
            onPress={() => {
              router.push(`/parcours/${parcours.id}`);
            }}
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
          >
            <View style={styles.iconBox}>
              <Ionicons name={parcours.icon} size={22} color={palette.laiton} />
            </View>
            <Text style={styles.rowTitle}>{parcours.title}</Text>
            <Ionicons name="chevron-forward" size={20} color={palette.texteMuet} />
          </Pressable>
        ))}
      </View>

      <Text style={styles.soonTitle}>Bientôt disponibles</Text>
      <View style={styles.list}>
        {UPCOMING_PARCOURS.map((title) => (
          <View key={title} style={[styles.row, styles.rowSoon]}>
            <View style={[styles.iconBox, styles.iconBoxSoon]}>
              <Ionicons name="time-outline" size={20} color={palette.texteMuet} />
            </View>
            <Text style={[styles.rowTitle, styles.rowTitleSoon]}>{title}</Text>
          </View>
        ))}
      </View>
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
    gap: spacing.m,
    paddingBottom: spacing.xl,
  },
  intro: {
    ...type.body,
    color: palette.texteDoux,
  },
  list: {
    gap: spacing.m,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: MIN_TOUCH_TARGET,
    backgroundColor: palette.ardoise,
    borderWidth: 1,
    borderColor: palette.bordureDouce,
    borderRadius: radius.l,
    padding: spacing.l,
    gap: spacing.m,
  },
  rowPressed: {
    backgroundColor: palette.ardoiseElevee,
    borderColor: palette.laitonFilet,
  },
  rowSoon: {
    backgroundColor: palette.ardoiseHaute,
    borderColor: palette.bordureDouce,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: radius.s,
    backgroundColor: palette.laitonPale,
    borderWidth: 1,
    borderColor: palette.laitonFilet,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxSoon: {
    backgroundColor: palette.ardoiseElevee,
    borderColor: palette.bordureDouce,
  },
  rowTitle: {
    flex: 1,
    ...type.body,
    fontFamily: fonts.textSemiBold,
  },
  rowTitleSoon: {
    color: palette.texteMuet,
  },
  soonTitle: {
    ...type.label,
    marginTop: spacing.m,
  },
});
