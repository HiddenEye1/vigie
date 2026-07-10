import { scoreAnswers } from '../engine';
import type {
  ParcoursAnswers,
  ParcoursDefinition,
  ParcoursLevel,
  ParcoursOutcome,
  ParcoursQuestion,
} from '../types';

/**
 * « Avant de donner un code ». Le réflexe central : un code reçu par SMS ne se
 * lit, ne se dicte et ne se transfère à PERSONNE. Si quelqu'un vous le demande,
 * c'est une arnaque — même s'il se présente comme votre banque.
 *
 * Barème : « on me demande de le lire / dicter / transférer » est DÉCISIF (→
 * DANGER). Les autres réponses ajoutent des points ; le seul chemin serein est
 * « je le saisis moi-même sur un site que j'ai ouvert ».
 */
const QUESTIONS: readonly ParcoursQuestion[] = [
  {
    id: 'qui',
    title: 'Qui vous demande ce code ?',
    options: [
      { id: 'banque', label: 'Ma banque ou un conseiller', weight: 3, icon: 'card-outline' },
      { id: 'proche', label: 'Un proche, ma famille', weight: 2, icon: 'people-outline' },
      { id: 'livreur', label: 'Un livreur', weight: 3, icon: 'cube-outline' },
      {
        id: 'administration',
        label: 'Une administration (impôts, CPAM…)',
        weight: 3,
        icon: 'business-outline',
      },
      {
        id: 'site-moi',
        label: 'Personne — je me connecte moi-même',
        weight: 0,
        icon: 'phone-portrait-outline',
      },
      { id: 'autre', label: 'Je ne sais pas, ou quelqu’un d’autre', weight: 2, icon: 'help-outline' },
    ],
  },
  {
    id: 'comment',
    title: 'Que vous demande-t-on de faire avec ce code ?',
    options: [
      {
        id: 'dicter',
        label: 'Le lire ou le dicter à quelqu’un',
        weight: 0,
        decisive: true,
        icon: 'chatbubble-ellipses-outline',
      },
      {
        id: 'transferer',
        label: 'Le transférer ou le renvoyer par message',
        weight: 0,
        decisive: true,
        icon: 'arrow-redo-outline',
      },
      {
        id: 'saisir-moi',
        label: 'Le saisir moi-même sur un site que j’ai ouvert',
        weight: 0,
        icon: 'keypad-outline',
      },
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
    id: 'direct',
    title: 'Êtes-vous au téléphone avec cette personne en ce moment ?',
    options: [
      { id: 'oui', label: 'Oui, en direct', weight: 1, icon: 'call-outline' },
      { id: 'non', label: 'Non', weight: 0, icon: 'checkmark-outline' },
    ],
  },
];

const OUTCOMES: Record<ParcoursLevel, ParcoursOutcome> = {
  DANGER: {
    level: 'DANGER',
    title: 'Ne donnez pas ce code.',
    message:
      'Un vrai conseiller bancaire ne doit jamais vous demander de lui lire un code reçu par SMS. Ce code sert à valider une opération : le donner reviendrait à signer à la place de l’escroc.',
    doNot:
      'Ne lisez ce code à personne et ne le renvoyez à personne, même si on insiste ou si c’est présenté comme urgent.',
    doInstead:
      'Raccrochez ou ne répondez pas. En cas de doute sur votre banque, appelez-la vous-même au numéro inscrit au dos de votre carte.',
  },
  PRUDENCE: {
    level: 'PRUDENCE',
    title: 'Dans le doute, ne donnez pas ce code.',
    message:
      'Plusieurs éléments incitent à la prudence. Un code reçu par SMS ne se communique jamais à quelqu’un d’autre, quelle que soit la raison avancée.',
    doNot:
      'Ne communiquez ce code à personne tant que vous n’êtes pas certain de qui vous le demande et pourquoi.',
    doInstead:
      'Prenez le temps de vérifier vous-même, en contactant l’organisme concerné via son numéro officiel. Vous pouvez aussi demander l’avis d’un proche.',
  },
  OK: {
    level: 'OK',
    title: 'C’est le cas normal — gardez ce réflexe.',
    message:
      'Vous saisissez vous-même ce code sur un service que vous avez ouvert : c’est l’usage prévu. Un code ne doit jamais être communiqué à quelqu’un d’autre.',
    doNot:
      'Ne communiquez jamais ce code à une personne qui vous le demanderait, même si elle se présente comme votre banque.',
    doInstead:
      'Continuez si vous êtes bien à l’origine de l’opération. Au moindre doute, arrêtez-vous et vérifiez.',
  },
};

function evaluate(answers: ParcoursAnswers): ParcoursOutcome {
  const { score, decisive } = scoreAnswers(QUESTIONS, answers);
  const level: ParcoursLevel = decisive || score >= 4 ? 'DANGER' : score >= 2 ? 'PRUDENCE' : 'OK';
  return OUTCOMES[level];
}

export const donnerUnCode = {
  kind: 'questionnaire',
  id: 'donner-un-code',
  title: 'Avant de donner un code',
  intro:
    'Répondez à quelques questions simples. Rien n’est envoyé : Vigie vous aide juste à décider.',
  icon: 'keypad-outline',
  questions: QUESTIONS,
  evaluate,
} as const satisfies ParcoursDefinition;
