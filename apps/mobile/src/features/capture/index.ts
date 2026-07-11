/**
 * Domaine « Capture ». Point d'entrée unique : le reste de l'app importe depuis
 * `@/features/capture`. Prépare la pipeline OCR (capture → texte → analyse) avec
 * un fournisseur branchable plus tard, sans dépendance native (Option D).
 */
export type { TextRecognizer, TextRecognitionResult } from './text-recognizer';
export {
  getTextRecognizer,
  unavailableRecognizer,
  OcrUnavailableError,
} from './text-recognizer';
export { CaptureTextPanel } from './capture-text-panel';
