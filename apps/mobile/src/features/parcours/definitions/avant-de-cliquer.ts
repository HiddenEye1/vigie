import { scoreAnswers } from '../engine';
import type {
  ParcoursAnswers,
  ParcoursDefinition,
  ParcoursLevel,
  ParcoursOutcome,
  ParcoursQuestion,
} from '../types';

/**
 * « Avant de cliquer ». Aide avant d'ouvrir un lien, même sans savoir ce qu'est
 * l'hameçonnage. Message central : ne cliquez pas le lien reçu, ouvrez vous-même
 * l'appli ou tapez l'adresse du site officiel.
 *
 * DÉCISIF (→ DANGER) : un lien qui demande un code reçu par SMS, et un
 * téléchargement d'application demandé par un « conseiller » ou un « support ».
 * Les autres signaux se cumulent ; un lien raccourci seul, ou d'un inconnu seul,
 * reste PRUDENCE (pas panique).
 */
const QUESTIONS: readonly ParcoursQuestion[] = [
  {
    id: 'qui',
    title: 'De qui vient ce lien, ou de qui prétend-il venir ?',
    options: [
      {
        id: 'organisme',
        label: 'Ma banque, une administration, un livreur',
        weight: 2,
        icon: 'business-outline',
      },
      { id: 'inconnu', label: 'Un expéditeur que je ne connais pas', weight: 2, icon: 'help-outline' },
      {
        id: 'proche-nouveau',
        label: 'Un proche, mais depuis un nouveau numéro',
        weight: 3,
        icon: 'phone-portrait-outline',
      },
      {
        id: 'proche',
        label: 'Un proche habituel, numéro connu',
        weight: 1,
        icon: 'people-outline',
      },
      {
        id: 'moi',
        label: 'Personne — je vais moi-même sur le site officiel',
        weight: 0,
        icon: 'shield-checkmark-outline',
      },
    ],
  },
  {
    id: 'demande',
    title: 'Que faut-il faire en cliquant ?',
    options: [
      {
        id: 'code',
        label: 'Donner un code reçu par SMS',
        weight: 0,
        decisive: true,
        icon: 'keypad-outline',
      },
      { id: 'carte', label: 'Saisir ma carte bancaire', weight: 3, icon: 'card-outline' },
      {
        id: 'connexion',
        label: 'Me connecter (identifiant, mot de passe)',
        weight: 2,
        icon: 'log-in-outline',
      },
      { id: 'paiement', label: 'Payer quelque chose', weight: 2, icon: 'cash-outline' },
      {
        id: 'lecture',
        label: 'Juste consulter une information',
        weight: 0,
        icon: 'document-text-outline',
      },
    ],
  },
  {
    id: 'telecharger',
    title: 'Vous demande-t-on d’installer une application ?',
    options: [
      {
        id: 'oui-conseiller',
        label: 'Oui, un conseiller ou un support me le demande',
        weight: 0,
        decisive: true,
        icon: 'download-outline',
      },
      { id: 'oui', label: 'Oui, pour une autre raison', weight: 2, icon: 'download-outline' },
      { id: 'non', label: 'Non', weight: 0, icon: 'checkmark-outline' },
    ],
  },
  {
    id: 'appel',
    title: 'Êtes-vous au téléphone avec quelqu’un qui vous guide vers ce lien ?',
    options: [
      { id: 'oui', label: 'Oui, en ce moment', weight: 3, icon: 'call-outline' },
      { id: 'non', label: 'Non', weight: 0, icon: 'checkmark-outline' },
    ],
  },
  {
    id: 'urgence',
    title: 'Le message met-il la pression, ou menace-t-il ?',
    options: [
      { id: 'oui', label: 'Oui, on me presse', weight: 2, icon: 'alarm-outline' },
      { id: 'non', label: 'Non', weight: 0, icon: 'time-outline' },
    ],
  },
  {
    id: 'lien-bizarre',
    title: 'L’adresse du lien est-elle raccourcie ou étrange ?',
    options: [
      { id: 'oui', label: 'Oui', weight: 2, icon: 'link-outline' },
      { id: 'sais-pas', label: 'Je ne sais pas', weight: 1, icon: 'help-outline' },
      { id: 'non', label: 'Non, elle paraît normale', weight: 0, icon: 'checkmark-outline' },
    ],
  },
  {
    id: 'qr',
    title: 'Est-ce un QR code trouvé sur une affiche, un parking, un courrier… ?',
    options: [
      { id: 'oui', label: 'Oui', weight: 1, icon: 'qr-code-outline' },
      { id: 'non', label: 'Non', weight: 0, icon: 'checkmark-outline' },
    ],
  },
];

const OUTCOMES: Record<ParcoursLevel, ParcoursOutcome> = {
  DANGER: {
    level: 'DANGER',
    title: 'Ne cliquez pas sur ce lien.',
    message:
      'Un lien reçu peut mener à une fausse page qui imite un vrai site pour voler vos informations. Un vrai conseiller ne vous demandera jamais de cliquer pour vous connecter, payer ou installer une application « de sécurité ».',
    doNot:
      'Ne cliquez pas, ne vous connectez pas, ne payez pas et n’installez aucune application depuis ce lien.',
    doInstead:
      'Ouvrez plutôt l’application officielle, ou tapez vous-même l’adresse du site. En cas de doute sur votre banque, appelez-la au numéro au dos de votre carte.',
  },
  PRUDENCE: {
    level: 'PRUDENCE',
    title: 'Ne cliquez pas tout de suite.',
    message:
      'Ce lien mérite la prudence. On ne voit pas toujours où mène un lien avant d’avoir cliqué.',
    doNot: 'N’entrez aucun identifiant, code ni coordonnée bancaire après avoir suivi ce lien.',
    doInstead:
      'Plutôt que de cliquer, ouvrez vous-même l’application ou tapez l’adresse officielle du site. Vous pouvez aussi demander l’avis d’un proche.',
  },
  OK: {
    level: 'OK',
    title: 'Rien d’alarmant — gardez le bon réflexe.',
    message:
      'Ce lien ne présente pas de signal d’alerte évident. Un lien peut malgré tout cacher une fausse page.',
    doNot:
      'Ne saisissez jamais vos identifiants ou votre carte sur une page ouverte depuis un message, même si elle paraît normale.',
    doInstead:
      'Au moindre doute, n’utilisez pas le lien : ouvrez vous-même l’application ou tapez l’adresse du site officiel.',
  },
};

function evaluate(answers: ParcoursAnswers): ParcoursOutcome {
  const { score, decisive } = scoreAnswers(QUESTIONS, answers);
  const level: ParcoursLevel = decisive || score >= 4 ? 'DANGER' : score >= 2 ? 'PRUDENCE' : 'OK';
  return OUTCOMES[level];
}

export const avantDeCliquer = {
  kind: 'questionnaire',
  id: 'avant-de-cliquer',
  title: 'Avant de cliquer',
  intro:
    'Répondez à quelques questions simples avant d’ouvrir un lien. Rien n’est envoyé : Vigie vous aide juste à décider.',
  icon: 'link-outline',
  questions: QUESTIONS,
  evaluate,
  analyze: { label: 'Analyser le lien', route: '/verifier-lien' },
} as const satisfies ParcoursDefinition;
