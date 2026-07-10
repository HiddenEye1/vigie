import { Stack, useLocalSearchParams } from 'expo-router';
import type { ReactElement } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { getParcours, ParcoursRunner } from '@/features/parcours';
import { palette, spacing, type } from '@/lib/theme';

/** Déroule un parcours proactif identifié par son id (route /parcours/[id]). */
export default function ParcoursScreen(): ReactElement {
  const { id } = useLocalSearchParams<{ id: string }>();
  const parcours = getParcours(id);

  if (parcours === undefined) {
    return (
      <View style={styles.missing}>
        <Stack.Screen options={{ title: 'Parcours' }} />
        <Text style={styles.missingText}>Ce parcours n’est pas disponible.</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: parcours.title }} />
      <ParcoursRunner definition={parcours} />
    </>
  );
}

const styles = StyleSheet.create({
  missing: {
    flex: 1,
    backgroundColor: palette.nuit,
    padding: spacing.l,
  },
  missingText: {
    ...type.body,
  },
});
