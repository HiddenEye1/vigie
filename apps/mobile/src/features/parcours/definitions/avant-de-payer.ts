import { scoreAnswers } from '../engine';
import type {
  ParcoursAnswers,
  ParcoursDefinition,
  ParcoursLevel,
  ParcoursOutcome,
  ParcoursQuestion,
} from '../types';

/**
 * « Avant de payer ». Deuxième parcours le plus critique : aider à décider avant
 * d'envoyer de l'argent ou de valider un paiement.
 *
 * Signaux DÉCISIFS (→ DANGER seul) : payer par coupon (PCS/Transcash/carte
 * cadeau), et « mettre son argent à l'abri sur un autre compte » (faux
 * conseiller). Les autres signaux (crypto, virement vers un compte inconnu,
 * proche depuis un nouveau numéro, support technique, acompte à un inconnu,
 * remboursement promis, urgence, secret) se cumulent : un seul n'alarme pas,
 * leur croisement fait remonter à DANGER. Le chemin serein reste « je paie
 * moi-même, par un moyen habituel, sans pression ».
 */
const QUESTIONS: readonly ParcoursQuestion[] = [
  {
    id: 'qui',
    title: 'Qui vous demande de payer, et pourquoi ?',
    options: [
      {
        id: 'inconnu-acompte',
        label: 'Un vendeur/particulier, pour un acompte (logement, vente, livraison)',
        weight: 3,
        icon: 'home-outline',
      },
      {
        id: 'inconnu',
        label: 'Une personne ou un vendeur que je ne connais pas',
        weight: 2,
        icon: 'person-outline',
      },
      {
        id: 'conseiller',
        label: 'Ma banque ou un conseiller',
        weight: 2,
        icon: 'card-outline',
      },
      {
        id: 'support',
        label: 'Un support technique (Microsoft, Apple…)',
        weight: 3,
        icon: 'desktop-outline',
      },
      { id: 'proche', label: 'Un proche ou ma famille', weight: 1, icon: 'people-outline' },
      {
        id: 'moi',
        label: 'Personne — j’achète moi-même sur un site que je connais',
        weight: 0,
        icon: 'storefront-outline',
      },
    ],
  },
  {
    id: 'moyen',
    title: 'Comment vous demande-t-on de payer ?',
    options: [
      {
        id: 'coupon',
        label: 'Coupon PCS, Transcash ou carte cadeau',
        weight: 0,
        decisive: true,
        icon: 'pricetag-outline',
      },
      { id: 'crypto', label: 'En crypto (bitcoin…)', weight: 3, icon: 'logo-bitcoin' },
      {
        id: 'virement-inconnu',
        label: 'Virement vers un compte que je ne connais pas',
        weight: 3,
        icon: 'swap-horizontal-outline',
      },
      {
        id: 'carte-lien',
        label: 'Par carte, via un lien qu’on m’a envoyé',
        weight: 2,
        icon: 'link-outline',
      },
      {
        id: 'connu',
        label: 'Vers quelqu’un ou un site que je connais bien',
        weight: 0,
        icon: 'shield-checkmark-outline',
      },
    ],
  },
  {
    id: 'deplacer',
    title: 'Vous demande-t-on de mettre votre argent « à l’abri » sur un autre compte ?',
    options: [
      { id: 'oui', label: 'Oui', weight: 0, decisive: true, icon: 'alert-outline' },
      { id: 'non', label: 'Non', weight: 0, icon: 'checkmark-outline' },
    ],
  },
  {
    id: 'remboursement',
    title: 'Vous promet-on d’être remboursé après avoir payé ?',
    options: [
      { id: 'oui', label: 'Oui, on me dit que je serai remboursé', weight: 2, icon: 'cash-outline' },
      { id: 'non', label: 'Non', weight: 0, icon: 'checkmark-outline' },
    ],
  },
  {
    id: 'urgence',
    title: 'Vous met-on la pression, ou dit-on que c’est urgent ?',
    options: [
      { id: 'oui', label: 'Oui, on me presse', weight: 2, icon: 'alarm-outline' },
      { id: 'non', label: 'Non, je prends mon temps', weight: 0, icon: 'time-outline' },
    ],
  },
  {
    id: 'secret',
    title: 'Vous a-t-on dit de ne prévenir personne ?',
    options: [
      { id: 'oui', label: 'Oui', weight: 2, icon: 'eye-off-outline' },
      { id: 'non', label: 'Non', weight: 0, icon: 'checkmark-outline' },
    ],
  },
  {
    id: 'nouveau-numero',
    title: 'Est-ce un proche qui vous écrit depuis un nouveau numéro ?',
    options: [
      { id: 'oui', label: 'Oui', weight: 3, icon: 'phone-portrait-outline' },
      { id: 'non', label: 'Non', weight: 0, icon: 'checkmark-outline' },
    ],
  },
];

const OUTCOMES: Record<ParcoursLevel, ParcoursOutcome> = {
  DANGER: {
    level: 'DANGER',
    title: 'Ne payez pas maintenant.',
    message:
      'Une arnaque utilise souvent l’urgence pour vous pousser à envoyer de l’argent. Un vrai organisme ne vous demandera jamais de payer par coupon, en crypto, ni de déplacer votre argent « pour le protéger ».',
    doNot:
      'N’envoyez aucun argent, ne communiquez pas votre carte et n’achetez aucun coupon, tant que vous n’avez pas vérifié par vous-même.',
    doInstead:
      'Prenez le temps. Contactez l’organisme ou la personne via un numéro officiel que vous connaissez déjà, et demandez l’avis d’un proche avant de payer.',
  },
  PRUDENCE: {
    level: 'PRUDENCE',
    title: 'Attendez avant de payer.',
    message:
      'Plusieurs éléments incitent à la prudence. Rien ne presse : un paiement fait dans l’urgence est très difficile à récupérer.',
    doNot: 'Ne payez pas tant que vous n’êtes pas certain de qui reçoit l’argent et pourquoi.',
    doInstead:
      'Vérifiez par vous-même (site officiel, numéro connu) et parlez-en à un proche. Ne payez qu’une fois rassuré.',
  },
  OK: {
    level: 'OK',
    title: 'Rien d’alarmant — gardez ce réflexe.',
    message:
      'Vous payez vous-même, par un moyen habituel, sans pression ni promesse de remboursement. C’est le cas normal.',
    doNot:
      'Ne changez jamais de moyen de paiement à la demande de quelqu’un, et ne payez jamais par coupon ou en crypto pour un achat ordinaire.',
    doInstead:
      'Vous pouvez continuer si vous êtes bien à l’origine du paiement. Au moindre doute, arrêtez-vous et vérifiez.',
  },
};

function evaluate(answers: ParcoursAnswers): ParcoursOutcome {
  const { score, decisive } = scoreAnswers(QUESTIONS, answers);
  const level: ParcoursLevel = decisive || score >= 4 ? 'DANGER' : score >= 2 ? 'PRUDENCE' : 'OK';
  return OUTCOMES[level];
}

export const avantDePayer = {
  id: 'avant-de-payer',
  title: 'Avant de payer',
  intro:
    'Répondez à quelques questions simples avant d’envoyer de l’argent. Rien n’est envoyé : Vigie vous aide juste à décider.',
  icon: 'cash-outline',
  questions: QUESTIONS,
  evaluate,
} as const satisfies ParcoursDefinition;
