import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'vigie.onboarding_done';

/** L'onboarding (3 écrans, F9) n'est affiché qu'une seule fois. */
export async function hasSeenOnboarding(): Promise<boolean> {
  return (await AsyncStorage.getItem(STORAGE_KEY)) === 'true';
}

export async function markOnboardingSeen(): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, 'true');
}
