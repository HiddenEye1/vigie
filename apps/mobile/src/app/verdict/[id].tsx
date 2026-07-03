import { useLocalSearchParams, useRouter } from 'expo-router';
import type { ReactElement } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '../../components/primary-button';
import { VerdictContent } from '../../components/verdict-content';
import { colors, fontSize, spacing } from '../../lib/theme';
import { selectEntryById, useHistory } from '../../store/history';

/** Écran de verdict (§4.2) — relit l'entrée depuis l'historique local. */
export default function VerdictScreen(): ReactElement {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const entry = useHistory(selectEntryById(id));

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

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <VerdictContent result={entry.fullResult} />
      <View style={styles.actions}>
        <PrimaryButton
          label="Nouvelle vérification"
          icon="add-circle"
          onPress={() => {
            router.dismissTo('/');
          }}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: spacing.l,
    paddingBottom: spacing.xl,
  },
  actions: {
    marginTop: spacing.l,
  },
  missing: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'stretch',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.l,
  },
  missingText: {
    fontSize: fontSize.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
  },
});
