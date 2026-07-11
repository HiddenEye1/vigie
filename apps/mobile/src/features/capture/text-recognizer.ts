/**
 * Abstraction de reconnaissance de texte (OCR) sur une image.
 *
 * Aujourd'hui, aucun OCR natif n'est branché (compatibilité Expo Go, pas de
 * dépendance native). `getTextRecognizer()` renvoie donc un fournisseur
 * INDISPONIBLE. Quand un OCR natif sera ajouté (ML Kit / Vision, au dev build),
 * il suffira de le faire renvoyer ici — le reste du code ne change pas.
 */

/** Résultat d'une reconnaissance de texte. `confidence` réservé pour plus tard. */
export interface TextRecognitionResult {
  readonly text: string;
  readonly confidence?: number;
}

/** Fournisseur d'OCR : signale sa disponibilité et extrait le texte d'une image. */
export interface TextRecognizer {
  /** L'OCR est-il utilisable sur ce build ? (faux tant qu'aucun natif n'est branché) */
  readonly available: boolean;
  recognize(image: { readonly uri: string }): Promise<TextRecognitionResult>;
}

/** Levée quand on tente une reconnaissance alors qu'aucun OCR n'est disponible. */
export class OcrUnavailableError extends Error {
  constructor() {
    super('La reconnaissance de texte n’est pas disponible sur cette version.');
    this.name = 'OcrUnavailableError';
  }
}

/** Fournisseur par défaut : aucun OCR. Toute reconnaissance échoue explicitement. */
export const unavailableRecognizer: TextRecognizer = {
  available: false,
  recognize(): Promise<TextRecognitionResult> {
    return Promise.reject(new OcrUnavailableError());
  },
};

/**
 * Point de bascule UNIQUE. Aujourd'hui : l'indisponible. Plus tard : le
 * recognizer natif si le build le fournit.
 */
export function getTextRecognizer(): TextRecognizer {
  return unavailableRecognizer;
}
