import type { VerdictLevel } from '@vigie/shared';

import type { AnalyzeInput } from '../provider.js';
import type { PostProcessRule } from './types.js';
import { isBelow } from './verdict-severity.js';

/**
 * Filet défensif fondé sur les SIGNAUX DE CONTENU du message. C'est le début du
 * « cerveau » anti-fraude de Vigie : repérer les procédés transverses des
 * escrocs même quand la personne ne se méfie pas encore.
 *
 * Deux familles de signaux :
 *  - HARM : une demande nuisible (code, virement, carte, identifiants, coupons)
 *    ou un scénario de fraude caractéristique (faux proche, faux support…).
 *    Ces tournures sont rarement légitimes dans un message.
 *  - PRESSURE : des amplificateurs (urgence, menace, émotion, « compte bloqué »…)
 *    qui, seuls, peuvent apparaître dans un message normal.
 *
 * Escalade — ce sont les CROISEMENTS qui sont dangereux :
 *  - ARNAQUE_PROBABLE si 2 signaux HARM, ou 1 HARM + au moins 1 PRESSURE ;
 *  - SUSPECT si 1 HARM seul, ou au moins 2 PRESSURE ;
 *  - sinon on ne touche à rien (un mot isolé ne suffit pas).
 * On ne RÉTROGRADE jamais.
 *
 * Anti-faux-positifs : les demandes exigent une sollicitation dirigée
 * (« communiquez-nous le code »), donc un message de PRÉVENTION (« ne
 * communiquez jamais ce code ») ne compte pas comme une demande ; et si le
 * message ressemble à un conseil de sécurité sans aucune demande nuisible, on
 * s'abstient totalement.
 */

interface ContentSignal {
  readonly id: string;
  readonly pattern: RegExp;
}

/** Demandes nuisibles ou scénarios de fraude caractéristiques. */
const HARM_SIGNALS: readonly ContentSignal[] = [
  {
    id: 'demande-code',
    // Sollicitation DIRIGÉE (« -moi / -nous ») : « ne communiquez jamais ce
    // code » (prévention) ne matche donc pas.
    pattern:
      /(donnez|communiquez|transmettez|envoyez)[- ](moi|nous)[^.]{0,40}code|quel est le code (recu|reçu|de validation)|besoin (du|de votre) code (recu|reçu|de validation)/,
  },
  {
    id: 'demande-virement',
    pattern:
      /(faites|faire|fais|effectuer|effectuez|besoin d'une?)[^.]{0,20}virement|virement (urgent|immediat|immédiat)|envoyez[^.]{0,20}virement/,
  },
  {
    id: 'demande-carte',
    pattern:
      /(numero|numéro|coordonnees|coordonnées) de (votre |la )?carte (bancaire|de credit|de crédit)|(donnez|communiquez|saisissez|entrez)[^.]{0,30}carte bancaire|cryptogramme|3 chiffres au dos/,
  },
  {
    id: 'demande-identifiants',
    // Exige un verbe de sollicitation : « votre banque ne vous DEMANDERA jamais
    // votre mot de passe » (prévention) ne doit pas compter comme une demande.
    pattern:
      /(donnez|communiquez|saisissez|entrez|confirmez|envoyez|tapez)[^.]{0,30}(mot de passe|identifiant|code d'acces|code d'accès)/,
  },
  {
    id: 'demande-crypto-coupon',
    pattern:
      /\b(pcs|transcash|neosurf|paysafecard)\b|cartes? cadeaux?|payer en (bitcoin|crypto|cryptomonnaie)|acheter des? (bitcoin|crypto)/,
  },
  {
    id: 'ne-prevenez-personne',
    pattern:
      /ne (le |la |les )?dites? (a|à) personne|n'en parlez (a|à) personne|ne prevenez personne|ne prévenez personne|gardez (cela|ca|ça|ceci) (secret|pour vous)|surtout ne dis rien|reste discret/,
  },
  {
    id: 'faux-proche',
    pattern:
      /(nouveau numero|nouveau numéro|change de numero|changé de numéro|changer de numero)[^.]{0,60}(maman|papa|c'est moi)|(maman|papa|c'est moi)[^.]{0,60}(nouveau numero|nouveau numéro|change de numero|changé de numéro)|telephone (est )?casse|téléphone (est )?cassé/,
  },
  {
    id: 'faux-support',
    pattern:
      /(microsoft|apple|windows)[^.]{0,40}(virus|infect|support|securite|sécurité)|ordinateur est infecte|ordinateur est infecté|support technique[^.]{0,30}(appelez|installez|telecharg|télécharg)|installez (anydesk|teamviewer)/,
  },
  {
    id: 'investissement-garanti',
    pattern:
      /(rendement|gains?|benefices?|bénéfices?|profits?) (garantis?|assures?|assurés?|sans risque)|(investissement|placement)[^.]{0,30}(garanti|sans risque|double|x ?2)|trop belle pour (etre|être) vraie/,
  },
];

/** Amplificateurs : peuvent exister isolément dans un message légitime. */
const PRESSURE_SIGNALS: readonly ContentSignal[] = [
  {
    id: 'urgence',
    pattern:
      /\b(urgent|urgence|immediat|immédiat|tout de suite|au plus vite|sans tarder|sans delai|sans délai|depechez|dépêchez|rapidement|derniere (chance|rappel|avertissement)|dernière (chance|rappel|avertissement)|expire|avant (ce soir|demain|\d+ ?h))/,
  },
  {
    id: 'menace',
    pattern:
      /(poursuites?|plainte|huissier|saisie|procedure judiciaire|procédure judiciaire|sanction|vous risquez|serez (poursuivi|sanctionne|sanctionné))/,
  },
  {
    id: 'pression-emotionnelle',
    pattern:
      /(en (danger|difficulte|difficulté|detresse|détresse)|aide[- ]moi|j'ai besoin de toi|au secours|s'il te plait|s'il te plaît|je compte sur toi|ne m'abandonne)/,
  },
  {
    id: 'demande-argent',
    // Le verbe d'envoi doit viser de l'argent (« envoyez-nous le numéro » ne
    // compte pas). « payer/régler des frais » et « besoin d'argent » suffisent.
    pattern:
      /(envoyer|envoyez|envoie|virer|virez|prete[rz]?|prête[rz]?|avance[rz]?)[- ]?(moi|nous)?[^.]{0,20}(argent|€|euros?|somme)|besoin d'argent|besoin de \d+ ?(€|euros?)|payer (les |des )?frais|regler (les |des )?frais|régler (les |des )?frais|payer une (avance|caution)/,
  },
  {
    id: 'compte-bloque',
    pattern:
      /compte (est )?(bloque|bloqué|suspendu|limite|limité|desactive|désactivé)|acces (bloque|suspendu)|accès (bloqué|suspendu)|carte (bloquee|bloquée|suspendue)/,
  },
  {
    id: 'colis-bloque',
    pattern:
      /colis[^.]{0,40}(bloque|bloqué|en attente|frais|douane)|(frais|taxe) de (livraison|douane|dedouanement|dédouanement)/,
  },
  {
    id: 'remboursement',
    pattern:
      /remboursement (en attente|disponible)|vous avez droit (a|à) un remboursement|rembours(ement|er)[^.]{0,40}(impots|impôts|caf|ameli|urssaf)/,
  },
  {
    id: 'faux-conseiller',
    pattern:
      /(votre )?conseiller bancaire|service (anti[- ]?fraude|securite|sécurité)[^.]{0,20}(banque|bancaire)|departement fraude|département fraude/,
  },
];

/**
 * Conseil de sécurité légitime (message de prévention). Sert d'exclusion :
 * s'il matche et qu'AUCUNE demande nuisible n'est présente, on s'abstient.
 */
const SECURITY_ADVICE =
  /ne (communiquez|donnez|partagez|transmettez|saisissez|divulguez|repondez|répondez|cliquez) (jamais|pas)|ne (vous )?demand(e|era|erons|ez)? jamais|ne (le |la |les )?communiquez (a|à) personne|il s'agit (probablement )?d'une (arnaque|tentative)|c'est une arnaque|mefiez[- ]vous|méfiez[- ]vous|signalez.{0,15}33700/;

export const contentSignalsRule: PostProcessRule = {
  name: 'content-signals',
  apply(current, { input }) {
    const text = analyzedText(input);
    if (text.length === 0) {
      return null;
    }

    const harm = HARM_SIGNALS.filter((signal) => signal.pattern.test(text));
    const pressure = PRESSURE_SIGNALS.filter((signal) => signal.pattern.test(text));

    // Message de prévention sans aucune demande nuisible : on n'alarme pas.
    if (harm.length === 0 && SECURITY_ADVICE.test(text)) {
      return null;
    }

    const target = escalate(harm.length, pressure.length);
    if (target === null || !isBelow(current.verdict, target)) {
      return null;
    }

    const labels = [...harm, ...pressure].map((signal) => signal.id);
    return {
      patch: {
        verdict: target,
        category: current.category === 'AUCUNE' ? 'AUTRE' : current.category,
        reasons: [...current.reasons, reasonFor(target)],
      },
      reason: `signaux de contenu (${labels.join(', ')}) : verdict relevé de ${current.verdict} à ${target}`,
    };
  },
};

/** Ce sont les croisements qui font remonter fortement le verdict. */
function escalate(harm: number, pressure: number): VerdictLevel | null {
  if (harm >= 2 || (harm >= 1 && pressure >= 1)) {
    return 'ARNAQUE_PROBABLE';
  }
  if (harm >= 1 || pressure >= 2) {
    return 'SUSPECT';
  }
  return null;
}

function reasonFor(target: VerdictLevel): string {
  return target === 'ARNAQUE_PROBABLE'
    ? 'Ce message cumule plusieurs procédés typiques des arnaques : ne donnez rien et ne faites rien dans la précipitation.'
    : 'Ce message contient un procédé souvent utilisé par les escrocs : par prudence, ne communiquez aucune information et vérifiez par un autre moyen.';
}

/**
 * Texte en langage naturel à analyser, apostrophes normalisées et minuscules.
 * Pour une URL, ce sont les mots de la page (titre + description) ; l'adresse
 * elle-même est du ressort de la règle url-signals. Une image n'a pas d'OCR ici.
 */
function analyzedText(input: AnalyzeInput): string {
  const raw =
    input.kind === 'text'
      ? input.content
      : input.kind === 'url'
        ? [input.urlSignals.pageTitle ?? '', input.urlSignals.metaDescription ?? ''].join(' ')
        : '';
  return raw.toLowerCase().replaceAll('’', "'");
}
