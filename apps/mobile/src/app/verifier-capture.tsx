import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import type { ReactElement } from 'react';
import { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ErrorView } from '../components/error-view';
import { PrimaryButton } from '../components/primary-button';
import { WaitingView } from '../components/waiting-view';
import type { ImageUpload } from '../lib/api';
import { analyzeImage, ApiFailure } from '../lib/api';
import { getDeviceId } from '../lib/device-id';
import { compressForUpload } from '../lib/image';
import { palette, radius, spacing, type } from '../lib/theme';
import { useHistory } from '../store/history';

type ScreenState =
  | { step: 'choosing' }
  | { step: 'preview'; image: ImageUpload }
  | { step: 'loading' }
  | { step: 'error'; message: string };

/** Vérification d'une capture d'écran (F2) : galerie → compression → analyse. */
export default function VerifyImageScreen(): ReactElement {
  const router = useRouter();
  const { imageUri, imageWidth } = useLocalSearchParams<{
    imageUri?: string;
    imageWidth?: string;
  }>();
  const addToHistory = useHistory((state) => state.add);
  const [state, setState] = useState<ScreenState>({ step: 'choosing' });

  // Image reçue via le partage entrant (F10) : compression puis aperçu direct.
  useEffect(() => {
    if (imageUri) {
      void (async () => {
        try {
          const image = await compressForUpload(imageUri, Number(imageWidth ?? '0'));
          setState({ step: 'preview', image });
        } catch {
          setState({
            step: 'error',
            message: 'Cette image n’a pas pu être préparée. Choisissez-la depuis votre galerie.',
          });
        }
      })();
    }
  }, [imageUri, imageWidth]);

  const pickFromGallery = async (): Promise<void> => {
    // Sélecteur système : seule la photo choisie est accessible (§15).
    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1,
    });
    const asset = picked.assets?.[0];
    if (picked.canceled || !asset) {
      return;
    }
    try {
      const image = await compressForUpload(asset.uri, asset.width);
      setState({ step: 'preview', image });
    } catch {
      setState({
        step: 'error',
        message: 'Cette image n’a pas pu être préparée. Essayez avec une autre capture.',
      });
    }
  };

  const submit = async (image: ImageUpload): Promise<void> => {
    setState({ step: 'loading' });
    try {
      const deviceId = await getDeviceId();
      const result = await analyzeImage(image, deviceId);
      const entry = addToHistory({ kind: 'image', excerpt: 'Capture d’écran vérifiée', result });
      router.replace(`/verdict/${entry.id}`);
    } catch (error) {
      const message =
        error instanceof ApiFailure
          ? error.userMessage
          : 'Une erreur inattendue est survenue. Merci de réessayer.';
      setState({ step: 'error', message });
    }
  };

  if (state.step === 'loading') {
    return <WaitingView />;
  }

  if (state.step === 'error') {
    return (
      <ErrorView
        message={state.message}
        onRetry={() => {
          setState({ step: 'choosing' });
        }}
        retryLabel="Choisir une capture"
      />
    );
  }

  if (state.step === 'preview') {
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
        <Text style={styles.instructions}>Voici la capture qui sera analysée :</Text>
        <Image
          source={{ uri: state.image.uri }}
          style={styles.preview}
          resizeMode="contain"
          accessibilityLabel="Aperçu de la capture d’écran choisie"
        />
        <View style={styles.buttons}>
          <PrimaryButton
            label="Vérifier cette capture"
            icon="search"
            onPress={() => {
              void submit(state.image);
            }}
          />
          <PrimaryButton
            label="Choisir une autre image"
            icon="images"
            variant="secondary"
            onPress={() => {
              void pickFromGallery();
            }}
          />
        </View>
        <Text style={styles.privacyNote}>
          L’image est analysée puis aussitôt oubliée : elle n’est jamais conservée sur nos serveurs.
        </Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <Text style={styles.instructions}>
        Choisissez la capture d’écran du message qui vous inquiète : SMS, e-mail, annonce ou
        conversation.
      </Text>
      <View style={styles.buttons}>
        <PrimaryButton
          label="Choisir dans ma galerie"
          icon="images"
          onPress={() => {
            void pickFromGallery();
          }}
        />
      </View>
      <Text style={styles.hint}>
        Astuce : pour capturer un écran, appuyez en même temps sur le bouton d’allumage et le bouton
        baisse de volume.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.brume,
  },
  container: {
    padding: spacing.l,
    gap: spacing.l,
  },
  instructions: {
    ...type.body,
  },
  preview: {
    width: '100%',
    height: 320,
    borderRadius: radius.l,
    backgroundColor: palette.surfaceLegere,
  },
  buttons: {
    gap: spacing.m,
  },
  hint: {
    ...type.bodySecondary,
  },
  privacyNote: {
    ...type.label,
    textAlign: 'center',
  },
});
