import { Alert } from 'react-native';

/**
 * Réaction d'urgence commune aux parcours (« Je suis en train de me faire
 * arnaquer »). Version simple en attendant le parcours dédié « Arnaque en
 * direct » : des gestes concrets, dans le bon ordre, sans jargon.
 */
export const EMERGENCY_STEPS = [
  'Arrêtez tout de suite : raccrochez ou ne répondez plus.',
  'Ne donnez aucun code, aucun mot de passe, aucun numéro de carte.',
  'Appelez votre banque au numéro inscrit au dos de votre carte pour faire opposition si besoin.',
  'Signalez au 33700 (SMS) ou sur cybermalveillance.gouv.fr.',
  'Parlez-en à un proche de confiance.',
] as const;

export function showEmergencySteps(): void {
  Alert.alert(
    'Réagissez tout de suite',
    EMERGENCY_STEPS.map((step, index) => `${String(index + 1)}. ${step}`).join('\n\n'),
    [{ text: 'J’ai compris' }],
  );
}
