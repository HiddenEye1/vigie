/* eslint-disable no-undef */
// Mock officiel d'AsyncStorage (stockage en mémoire pour les tests).
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// Le runtime « winter » d'Expo installe des globals PARESSEUX (fetch,
// __ExpoImportMetaRegistry…) dont le `require` différé est refusé par
// Jest 30 (`isInsideTestCode`) s'il se déclenche entre deux phases.
// On matérialise ici tous les getters paresseux, pendant la phase de setup
// où `require` est encore autorisé.
for (const [name, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(globalThis))) {
  if (typeof descriptor.get === 'function') {
    try {
      void globalThis[name];
    } catch {
      // Un getter qui échoue ici échouerait de toute façon plus tard :
      // les tests injectent leurs propres dépendances (fetch, etc.).
    }
  }
}
