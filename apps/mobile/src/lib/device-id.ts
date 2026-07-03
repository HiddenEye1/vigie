import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

const STORAGE_KEY = 'vigie.device_id';

let cached: string | null = null;

/**
 * UUID anonyme généré à la première utilisation — seul identifiant de
 * l'application (§9.1). Aucune donnée nominative.
 */
export async function getDeviceId(): Promise<string> {
  if (cached) {
    return cached;
  }
  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  if (stored) {
    cached = stored;
    return stored;
  }
  const generated = Crypto.randomUUID();
  await AsyncStorage.setItem(STORAGE_KEY, generated);
  cached = generated;
  return generated;
}
