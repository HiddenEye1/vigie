import { ANALYZE_CONTENT_MAX_LENGTH } from '@vigie/shared';

/** Champs saisis d'un mail collé. Seul le corps est requis (collage partiel OK). */
export interface EmailFields {
  readonly from?: string;
  readonly subject?: string;
  readonly body: string;
}

/** Texte prêt pour l'analyse + indicateur de troncature (mail trop long). */
export interface ComposedEmail {
  readonly text: string;
  readonly truncated: boolean;
}

/**
 * Compose un mail collé en un texte étiqueté pour l'analyse (« De : … », « Objet :
 * … », puis le corps). N'inclut que les champs fournis, chacun nettoyé.
 *
 * Le résultat est destiné à `analyzeText` (kind « text ») : on ne change ni le
 * contrat, ni le prompt, ni le moteur. Les étiquettes sont ajoutées par l'app ;
 * les valeurs restent des DONNÉES à analyser, jamais des instructions.
 *
 * Au-delà de `maxLength` (= limite serveur), on tronque et on lève `truncated`,
 * pour que l'écran puisse prévenir l'utilisateur.
 */
export function composeEmailForAnalysis(
  fields: EmailFields,
  maxLength: number = ANALYZE_CONTENT_MAX_LENGTH,
): ComposedEmail {
  const header: string[] = [];
  const from = fields.from?.trim();
  const subject = fields.subject?.trim();
  const body = fields.body.trim();

  if (from) {
    header.push(`De : ${from}`);
  }
  if (subject) {
    header.push(`Objet : ${subject}`);
  }

  const full = header.length > 0 ? `${header.join('\n')}\n\n${body}` : body;

  if (full.length <= maxLength) {
    return { text: full, truncated: false };
  }
  return { text: full.slice(0, maxLength), truncated: true };
}
