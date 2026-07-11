import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import type { ReactElement } from 'react';
import { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';

import { CaptureTextPanel, getTextRecognizer } from '@/features/capture';
import { useRequest } from '@/lib/use-request';

import { ErrorView } from '../components/error-view';
import { PrimaryButton } from '../components/primary-button';
import { VerifyModeSwitcher } from '../components/verify-mode-switcher';
import { WaitingView } from '../components/waiting-view';
import type { ApiErrorInfo, ImageUpload } from '../lib/api';
import { analyzeImage, toApiError } from '../lib/api';
import { getDeviceId } from '../lib/device-id';
import { compressForUpload } from '../lib/image';
import { palette, radius, spacing, type } from '../lib/theme';
import { useHistory } from '../store/history';

/** Échec de préparation de l'image (compression) — même affichage qu'une erreur d'API. */
const PREP_ERROR_FROM_SHARE: ApiErrorInfo = {
  message: 'Cette image n’a pas pu être préparée. Choisissez-la depuis votre galerie.',
  kind: 'invalid_request',
};
const PREP_ERROR_FROM_GALLERY: ApiErrorInfo = {
  message: 'Cette image n’a pas pu être préparée. Essayez avec une autre capture.',
  kind: 'invalid_request',
};

/** Vérification d'une capture d'écran (F2) : galerie → compression → analyse. */
export default function VerifyImageScreen(): ReactElement {
  const router = useRouter();
  const { imageUri, imageWidth } = useLocalSearchParams<{
    imageUri?: string;
    imageWidth?: string;
  }>();
  const addToHistory = useHistory((state) => state.add);
  const [image, setImage] = useState<ImageUpload | null>(null);
  const [prepError, setPrepError] = useState<ApiErrorInfo | null>(null);
  const [textMode, setTextMode] = useState(false);
  // Voie « capture → texte » : proposée seulement quand un OCR est disponible.
  // Aujourd'hui indisponible (Expo Go, pas de dépendance native) → masquée.
  const ocrAvailable = getTextRecognizer().available;

  const { state, run, reset } = useRequest(
    async (chosen: ImageUpload) => {
      const deviceId = await getDeviceId();
      const result = await analyzeImage(chosen, deviceId);
      return addToHistory({ kind: 'image', excerpt: 'Capture d’écran vérifiée', result });
    },
    {
      mapError: toApiError,
      onSuccess: (entry) => {
        router.replace(`/verdict/${entry.id}`);
      },
    },
  );

  // Image reçue via le partage entrant (F10) : compression puis aperçu direct.
  useEffect(() => {
    if (!imageUri) {
      return;
    }
    void (async () => {
      try {
        setImage(await compressForUpload(imageUri, Number(imageWidth ?? '0')));
      } catch {
        setPrepError(PREP_ERROR_FROM_SHARE);
      }
    })();
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
      setImage(await compressForUpload(asset.uri, asset.width));
      setPrepError(null);
    } catch {
      setPrepError(PREP_ERROR_FROM_GALLERY);
    }
  };

  const backToChoosing = (): void => {
    reset();
    setImage(null);
    setPrepError(null);
    setTextMode(false);
  };

  if (state.status === 'loading' || state.status === 'success') {
    return <WaitingView />;
  }

  const shownError = state.status === 'error' ? state.error : prepError;
  if (shownError) {
    return (
      <ErrorView
        message={shownError.message}
        kind={shownError.kind}
        onRetry={backToChoosing}
        retryLabel="Choisir une capture"
      />
    );
  }

  if (image && textMode) {
    return <CaptureTextPanel image={image} />;
  }

  if (image) {
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
        <VerifyModeSwitcher active="capture" />
        <Text style={styles.instructions}>Voici la capture qui sera analysée :</Text>
        <Image
          source={{ uri: image.uri }}
          style={styles.preview}
          resizeMode="contain"
          accessibilityLabel="Aperçu de la capture d’écran choisie"
        />
        <View style={styles.buttons}>
          <PrimaryButton
            label="Vérifier cette capture"
            icon="search"
            onPress={() => {
              void run(image);
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
          {ocrAvailable ? (
            <PrimaryButton
              label="Lire le texte de la capture"
              icon="text"
              variant="secondary"
              onPress={() => {
                setTextMode(true);
              }}
            />
          ) : null}
        </View>
        <Text style={styles.privacyNote}>
          L’image est analysée puis aussitôt oubliée : elle n’est jamais conservée sur nos serveurs.
        </Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <VerifyModeSwitcher active="capture" />
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
    backgroundColor: palette.nuit,
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
    borderWidth: 1,
    borderColor: palette.bordureDouce,
    backgroundColor: palette.ardoise,
  },
  buttons: {
    gap: spacing.m,
  },
  hint: {
    ...type.bodySecondary,
  },
  privacyNote: {
    ...type.label,
    color: palette.texteMuet,
    textAlign: 'center',
  },
});
