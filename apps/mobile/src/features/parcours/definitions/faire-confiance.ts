import type {
  OrientationAction,
  OrientationOutcome,
  OrientationParcours,
  OrientationTarget,
  ParcoursAnswers,
  ParcoursQuestion,
} from '../types';

/**
 * « Je ne sais pas si je peux faire confiance ». Parcours d'orientation pour un
 * doute vague : quelques questions, puis on redirige vers le bon réflexe. Ton
 * rassurant, jamais culpabilisant — avoir un doute EST le bon réflexe.
 */
const QUESTIONS: readonly ParcoursQuestion[] = [
  {
    id: 'situation',
    title: 'Que se passe-t-il ?',
    options: [
      { id: 'message', label: 'J’ai reçu un message', icon: 'chatbubble-ellipses-outline' },
      { id: 'lien', label: 'J’ai reçu un lien', icon: 'link-outline' },
      { id: 'code', label: 'On me demande un code', icon: 'keypad-outline' },
      { id: 'payer', label: 'On me demande de payer', icon: 'cash-outline' },
      { id: 'telephone', label: 'Je suis au téléphone avec quelqu’un', icon: 'call-outline' },
      { id: 'sais-pas', label: 'Je ne sais pas', icon: 'help-outline' },
    ],
  },
  {
    id: 'pression',
    title: 'La personne vous met-elle la pression ?',
    options: [
      { id: 'urgent', label: 'Oui, c’est urgent', icon: 'alarm-outline' },
      { id: 'insiste', label: 'Oui, elle insiste', icon: 'repeat-outline' },
      { id: 'non', label: 'Non', icon: 'checkmark-outline' },
      { id: 'sais-pas', label: 'Je ne sais pas', icon: 'help-outline' },
    ],
  },
  {
    id: 'action',
    title: 'Vous demande-t-on de faire une action sensible ?',
    options: [
      { id: 'code', label: 'Donner un code', icon: 'keypad-outline' },
      { id: 'payer', label: 'Payer ou faire un virement', icon: 'cash-outline' },
      { id: 'cliquer', label: 'Cliquer sur un lien', icon: 'link-outline' },
      { id: 'installer', label: 'Installer une application', icon: 'download-outline' },
      {
        id: 'infos',
        label: 'Donner des informations personnelles',
        icon: 'person-outline',
      },
      { id: 'rien', label: 'Rien de tout ça', icon: 'checkmark-outline' },
    ],
  },
];

const ACTIONS = {
  arnaqueEnDirect: {
    label: 'Arnaque en direct',
    icon: 'shield-half',
    target: { kind: 'parcours', id: 'arnaque-en-direct' },
  },
  donnerCode: {
    label: 'Avant de donner un code',
    icon: 'keypad',
    target: { kind: 'parcours', id: 'donner-un-code' },
  },
  payer: {
    label: 'Avant de payer',
    icon: 'cash',
    target: { kind: 'parcours', id: 'avant-de-payer' },
  },
  cliquer: {
    label: 'Avant de cliquer',
    icon: 'link',
    target: { kind: 'parcours', id: 'avant-de-cliquer' },
  },
  analyserLien: {
    label: 'Analyser le lien',
    icon: 'search',
    target: { kind: 'analyze', route: '/verifier-lien' },
  },
  analyserMessage: {
    label: 'Analyser le message',
    icon: 'document-text',
    target: { kind: 'analyze', route: '/verifier-texte' },
  },
  askContact: {
    label: 'Demander à un proche',
    icon: 'people',
    target: { kind: 'ask-contact' },
  },
} as const satisfies Record<string, OrientationAction>;

function keyOf(target: OrientationTarget): string {
  switch (target.kind) {
    case 'parcours':
      return `p:${target.id}`;
    case 'analyze':
      return `a:${target.route}`;
    case 'ask-contact':
      return 'ask';
  }
}

const MESSAGE =
  'Avoir un doute, c’est exactement le bon réflexe. Ne faites rien pour l’instant : choisissez l’étape la plus sûre ci-dessous.';

function evaluate(answers: ParcoursAnswers): OrientationOutcome {
  const situation = answers.situation;
  const pression = answers.pression;
  const action = answers.action;
  const pressed = pression === 'urgent' || pression === 'insiste';

  const candidates: OrientationAction[] = [];

  // Danger immédiat : au téléphone et sous pression → couper l'arnaque d'abord.
  if (situation === 'telephone' && pressed) {
    candidates.push(ACTIONS.arnaqueEnDirect);
  }

  if (action === 'code' || situation === 'code') {
    candidates.push(ACTIONS.donnerCode);
  }
  if (action === 'payer' || situation === 'payer') {
    candidates.push(ACTIONS.payer);
  }
  if (action === 'cliquer' || action === 'installer' || situation === 'lien') {
    candidates.push(ACTIONS.cliquer);
    candidates.push(ACTIONS.analyserLien);
  }
  if (situation === 'message' || action === 'infos') {
    candidates.push(ACTIONS.analyserMessage);
  }

  // Toujours proposer d'analyser le message et de demander à un proche.
  candidates.push(ACTIONS.analyserMessage);
  candidates.push(ACTIONS.askContact);

  // Dédoublonnage en conservant l'ordre de priorité.
  const seen = new Set<string>();
  const actions = candidates.filter((candidate) => {
    const key = keyOf(candidate.target);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });

  return { title: 'Vous avez raison de vérifier.', message: MESSAGE, actions };
}

export const faireConfiance = {
  kind: 'orientation',
  id: 'faire-confiance',
  title: 'Je ne sais pas si je peux faire confiance',
  intro:
    'Un doute, mais vous ne savez pas quoi faire ? Répondez à trois questions : Vigie vous oriente vers le bon geste.',
  icon: 'compass-outline',
  questions: QUESTIONS,
  evaluate,
} as const satisfies OrientationParcours;
