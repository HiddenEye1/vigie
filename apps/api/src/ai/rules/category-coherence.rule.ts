import type { ScamCategory, VerdictLevel } from '@vigie/shared';

import type { AnalyzeInput } from '../provider.js';
import type { PostProcessRule } from './types.js';
import { VERDICT_SEVERITY } from './verdict-severity.js';

/**
 * Plancher de verdict par catégorie DÉFINITIONNELLEMENT frauduleuse : si le
 * modèle a rangé le message dans l'une de ces catégories, un verdict rassurant
 * (ou seulement indéterminé) est incohérent. AUTRE et AUCUNE sont volontairement
 * absentes (catégories neutres) pour ne pas surclasser des messages légitimes.
 */
const CATEGORY_VERDICT_FLOOR: Partial<Record<ScamCategory, VerdictLevel>> = {
  // Fraudes à fort préjudice financier ou manipulation directe.
  FAUX_CONSEILLER_BANCAIRE: 'ARNAQUE_PROBABLE',
  FAUX_SUPPORT_TECHNIQUE: 'ARNAQUE_PROBABLE',
  INVESTISSEMENT_FRAUDULEUX: 'ARNAQUE_PROBABLE',
  FRAUDE_CPF_AIDES: 'ARNAQUE_PROBABLE',
  CHANTAGE_SEXTORSION: 'ARNAQUE_PROBABLE',
  // Autres arnaques nommées : au minimum « suspect », jamais rassurant.
  PHISHING_COLIS: 'SUSPECT',
  PHISHING_ADMINISTRATION: 'SUSPECT',
  ARNAQUE_PETITES_ANNONCES: 'SUSPECT',
  ARNAQUE_SENTIMENTALE: 'SUSPECT',
  FAUX_SITE_ECOMMERCE: 'SUSPECT',
  ARNAQUE_EMPLOI: 'SUSPECT',
  SMISHING_AUTRE: 'SUSPECT',
};

const COHERENCE_REASON =
  'Ce message correspond à un type d’arnaque connu : par prudence, il ne peut pas être présenté comme sûr.';

/**
 * Exception « OTP isolé ». Un SMS qui se contente de LIVRER un code (« votre code
 * de validation est … ») peut être un vrai code à usage unique déclenché par
 * l'utilisateur lui-même : c'est AMBIGU, pas « arnaque probable ». Le danger d'un
 * code SMS vient de la DEMANDE de le transmettre (« communiquez-nous le code »),
 * ou d'un signal corroborant (lien, appel, paiement, conseiller, menace).
 *
 * Donc, si le modèle classe un tel message en FAUX_CONSEILLER_BANCAIRE, on ne
 * remonte que jusqu'à SUSPECT (au lieu du plancher ARNAQUE_PROBABLE) QUAND le
 * message livre un code SANS demande de transmission NI signal corroborant. La
 * vraie demande de code, elle, reste au plancher ARNAQUE_PROBABLE.
 */

/** Le message livre un code / OTP (formulations de délivrance, pas de demande). */
const OTP_DELIVERY =
  /code (de |d')?(validation|confirmation|securite|sécurité|verification|vérification|activation|acces|accès|connexion)|votre code (est|de|:)|code (est )?:? ?\d|mot de passe (a usage )?unique|\botp\b/;

/** Demande EXPLICITE de transmettre le code ⇒ reste ARNAQUE_PROBABLE. */
const CODE_SOLICITATION =
  /(donnez|communiquez|transmettez|envoyez|envoie|lisez|dites|confirmez|saisissez|tapez|rentrez|entrez|renvoyez)[- ]?(moi|nous)?[^.]{0,40}code|quel est (le |votre )?code|besoin (du|de votre|de ce) code|code[^.]{0,20}(par retour|en repons|en répons)/;

/**
 * Autres signaux corroborants ⇒ reste ARNAQUE_PROBABLE. L'expiration propre à
 * l'OTP (« expire dans N minutes ») n'en fait PAS partie : c'est le gabarit
 * normal d'un vrai code, pas une pression d'escroc.
 */
const OTP_CORROBORATION =
  /https?:\/\/|www\.|\bappelez\b|rappelez|composez le|conseiller|service (client|fraude|anti[- ]?fraude|securite|sécurité)|support technique|prelevement|prélèvement|virement|payer|paiement|carte bancaire|\bsinon\b/;

/**
 * Vrai si le message se limite à livrer un code, sans demande de transmission ni
 * signal corroborant. Texte normalisé comme dans content-signals (minuscules,
 * apostrophes typographiques ramenées à l'apostrophe droite).
 */
function isIsolatedOtp(input: AnalyzeInput): boolean {
  const raw =
    input.kind === 'text'
      ? input.content
      : input.kind === 'url'
        ? [input.urlSignals.pageTitle ?? '', input.urlSignals.metaDescription ?? ''].join(' ')
        : '';
  const text = raw.toLowerCase().replaceAll('’', "'");
  return (
    text.length > 0 &&
    OTP_DELIVERY.test(text) &&
    !CODE_SOLICITATION.test(text) &&
    !OTP_CORROBORATION.test(text)
  );
}

/**
 * Cohérence catégorie ↔ verdict. Filet DÉFENSIF : si le modèle a assigné une
 * catégorie clairement frauduleuse mais rendu un verdict trop rassurant, on
 * relève le verdict jusqu'au plancher de la catégorie. On ne RÉTROGRADE jamais.
 *
 * Garde-fou anti-faux-positifs : quand la confiance est faible (< 0.5), on ne
 * dépasse pas SUSPECT — on refuse de présenter une catégorie dangereuse comme
 * sûre, sans pour autant sur-affirmer « arnaque probable » sur une
 * classification incertaine (cohérent avec la dégradation de confiance §4.2).
 *
 * Doit s'exécuter APRÈS l'anti-injection et AVANT extended-fields, pour que les
 * champs étendus soient recalculés à partir du verdict relevé.
 */
export const categoryCoherenceRule: PostProcessRule = {
  name: 'category-coherence',
  apply(current, { input }) {
    const floor = CATEGORY_VERDICT_FLOOR[current.category];
    if (floor === undefined) {
      return null;
    }

    // Sur une classification peu sûre, on plafonne le relèvement à SUSPECT.
    let target: VerdictLevel =
      current.confidence < 0.5 && VERDICT_SEVERITY[floor] > VERDICT_SEVERITY.SUSPECT
        ? 'SUSPECT'
        : floor;

    // Exception « OTP isolé » : un simple code livré, sans demande de
    // transmission ni signal corroborant, ne justifie pas ARNAQUE_PROBABLE.
    if (
      current.category === 'FAUX_CONSEILLER_BANCAIRE' &&
      VERDICT_SEVERITY[target] > VERDICT_SEVERITY.SUSPECT &&
      isIsolatedOtp(input)
    ) {
      target = 'SUSPECT';
    }

    if (VERDICT_SEVERITY[current.verdict] >= VERDICT_SEVERITY[target]) {
      return null;
    }

    return {
      patch: { verdict: target, reasons: [...current.reasons, COHERENCE_REASON] },
      reason: `catégorie ${current.category} : verdict relevé de ${current.verdict} à ${target}`,
    };
  },
};
