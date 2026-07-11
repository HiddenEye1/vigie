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

/** Nombre maximal de liens proposés à l'analyse depuis un mail. */
export const MAX_DETECTED_LINKS = 5;

// Liens à schéma explicite http(s):// — on privilégie la précision (v1) : on
// s'arrête aux espaces et aux délimiteurs courants (guillemets, chevrons,
// parenthèses/crochets fermants).
const LINK_PATTERN = /\bhttps?:\/\/[^\s<>"'`)\]]+/gi;
// Ponctuation collée en fin de lien, à retirer (« …voir https://x.fr. »).
const TRAILING_PUNCTUATION = /[.,;:!?)\]}»"'…]+$/;

/**
 * Extrait les liens VISIBLES (http/https) d'un texte collé, pour proposer une
 * analyse technique via le flux d'URL existant. 100 % LOCAL, aucun réseau.
 *
 * Dédup (insensible à la casse), ponctuation de fin retirée, plafonné. Ne
 * détecte pas les domaines nus sans schéma, ni les liens masqués derrière un
 * texte d'affichage si l'URL n'apparaît pas dans le texte collé.
 */
export function extractLinks(text: string, max: number = MAX_DETECTED_LINKS): string[] {
  const found = text.match(LINK_PATTERN) ?? [];
  const seen = new Set<string>();
  const links: string[] = [];
  for (const raw of found) {
    const url = raw.replace(TRAILING_PUNCTUATION, '');
    if (url.length === 0) {
      continue;
    }
    const key = url.toLowerCase();
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    links.push(url);
    if (links.length >= max) {
      break;
    }
  }
  return links;
}
