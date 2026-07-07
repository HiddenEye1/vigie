import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import type { ReactElement } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '../../components/primary-button';
import { guideById } from '../../lib/scam-guides';
import { palette, radius, spacing, type } from '../../lib/theme';

/** Détail d'une fiche conseil (F6) : c'est quoi / la reconnaître / que faire / exemple. */
export default function GuideDetailScreen(): ReactElement {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const guide = guideById(id);

  if (!guide) {
    return (
      <View style={styles.missing}>
        <Text style={styles.missingText}>Cette fiche n’existe pas.</Text>
        <PrimaryButton
          label="Voir toutes les fiches"
          onPress={() => {
            router.dismissTo('/conseils');
          }}
        />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Fiche conseil' }} />
      <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <View style={styles.iconBox}>
            <Ionicons
              name={guide.icon as keyof typeof Ionicons.glyphMap}
              size={30}
              color={palette.laiton}
            />
          </View>
          <Text style={styles.title}>{guide.title}</Text>
        </View>

        <Text style={styles.sectionTitle}>C’est quoi ?</Text>
        <Text style={styles.paragraph}>{guide.what}</Text>

        <Text style={styles.sectionTitle}>Comment la reconnaître</Text>
        {guide.signs.map((sign, index) => (
          <View key={index} style={styles.listItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.listText}>{sign}</Text>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Que faire</Text>
        {guide.actions.map((action, index) => (
          <View key={index} style={styles.listItem}>
            <Text style={styles.number}>{index + 1}.</Text>
            <Text style={styles.listText}>{action}</Text>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Un exemple réel</Text>
        <View style={styles.exampleBox}>
          <Text style={styles.exampleText}>{guide.example}</Text>
        </View>

        <View style={styles.footerButton}>
          <PrimaryButton
            label="Vérifier un message maintenant"
            icon="search"
            onPress={() => {
              router.dismissTo('/');
            }}
          />
        </View>
      </ScrollView>
    </>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: radius.m,
    backgroundColor: palette.laitonPale,
    borderWidth: 1,
    borderColor: palette.laitonFilet,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    ...type.screenTitle,
    fontSize: 24,
    lineHeight: 34,
  },
  sectionTitle: {
    ...type.sectionTitle,
    marginTop: spacing.xl,
    marginBottom: spacing.s,
  },
  paragraph: {
    ...type.body,
    color: palette.texteSecondaire,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: spacing.s,
    paddingRight: spacing.m,
  },
  bullet: {
    ...type.body,
    fontFamily: 'Inter_700Bold',
    color: palette.laiton,
    marginRight: spacing.s,
  },
  number: {
    ...type.body,
    fontFamily: 'Inter_700Bold',
    color: palette.laiton,
    marginRight: spacing.s,
  },
  listText: {
    flex: 1,
    ...type.body,
    color: palette.texteSecondaire,
  },
  exampleBox: {
    backgroundColor: palette.laitonPale,
    borderRadius: radius.m,
    padding: spacing.l,
    borderLeftWidth: 3,
    borderLeftColor: palette.laiton,
  },
  exampleText: {
    ...type.body,
    color: palette.texteClair,
    fontStyle: 'italic',
  },
  footerButton: {
    marginTop: spacing.xl,
  },
  missing: {
    flex: 1,
    backgroundColor: palette.nuit,
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
