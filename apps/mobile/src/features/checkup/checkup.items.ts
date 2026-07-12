import type { Ionicons } from '@expo/vector-icons';

/**
 * Définition statique du « Check-up sécurité » — Lot 1.
 *
 * Un bilan de protection, PAS un test de danger : on regarde ce qui est déjà en
 * place et ce qu'on peut renforcer, sans jamais alarmer ni culpabiliser. Tout
 * est local ; rien n'est envoyé. Aucun pourcentage, aucun score affiché.
 */

type IconName = keyof typeof Ionicons.glyphMap;

export type CheckupItemId = 'proche' | 'code-sms' | 'appel-urgent' | 'numeros-officiels';

/** D'où vient l'état d'un item : déduit automatiquement, ou déclaré par l'utilisateur. */
export type CheckupItemSource = 'auto' | 'declared';

/** État affiché d'un item. Jamais alarmant, jamais rouge. */
export type CheckupState = 'in-place' | 'to-reinforce' | 'to-discover';

export interface CheckupItemDef {
  readonly id: CheckupItemId;
  /** La question, formulée simplement. */
  readonly title: string;
  readonly icon: IconName;
  /** `auto` = dérivé d'un autre état local ; `declared` = confirmé par l'utilisateur. */
  readonly source: CheckupItemSource;
  /** État affiché tant que la protection n'est pas en place. */
  readonly pendingState: Exclude<CheckupState, 'in-place'>;
  /** Conseils rassurants selon l'état. */
  readonly advice: {
    readonly inPlace: string;
    readonly pending: string;
  };
  /** Parcours existant à ouvrir pour apprendre le réflexe (items déclaratifs). */
  readonly learnRoute?: string;
  /** Route de configuration proposée quand la protection n'est pas en place (item auto). */
  readonly configureRoute?: string;
  /** Libellé du bouton « je l'ai fait » (items déclaratifs uniquement). */
  readonly confirmLabel?: string;
}

/**
 * Les 4 items essentiels du Lot 1. L'item « proche » est le seul dérivé
 * automatiquement (il lit le Bouclier famille) ; les trois autres sont
 * déclaratifs — Vigie ne peut pas les vérifier, et l'assume (voir écran).
 */
export const CHECKUP_ITEMS: readonly CheckupItemDef[] = [
  {
    id: 'proche',
    title: 'Ai-je un proche de confiance à qui demander un avis ?',
    icon: 'people-outline',
    source: 'auto',
    pendingState: 'to-discover',
    advice: {
      inPlace:
        'Votre proche de confiance est enregistré. En cas de doute, vous pouvez lui demander un avis en un geste — sans surveillance.',
      pending:
        'Un proche de confiance, c’est quelqu’un à qui demander un avis en cas de doute. Vous choisissez qui, et vous pouvez le retirer quand vous voulez.',
    },
    configureRoute: '/family-onboarding',
  },
  {
    id: 'code-sms',
    title: 'Est-ce que je sais quoi faire avant de donner un code reçu par SMS ?',
    icon: 'keypad-outline',
    source: 'declared',
    pendingState: 'to-reinforce',
    advice: {
      inPlace:
        'Bon réflexe. Un code reçu par SMS ne se donne jamais, même à quelqu’un qui dit être votre banque.',
      pending:
        'Voyons ensemble le bon réflexe : un code reçu par SMS ne se partage jamais, ni par téléphone, ni par message.',
    },
    learnRoute: '/parcours/donner-un-code',
    confirmLabel: 'Je sais le faire',
  },
  {
    id: 'appel-urgent',
    title: 'Est-ce que je sais réagir à un appel « banque » urgent ?',
    icon: 'call-outline',
    source: 'declared',
    pendingState: 'to-reinforce',
    advice: {
      inPlace:
        'Bon réflexe. Face à un appel qui presse, on raccroche et on rappelle sa banque au numéro connu, au dos de la carte.',
      pending:
        'Un vrai conseiller ne vous pressera jamais. Voyons quoi faire si un appel « banque » vous met la pression.',
    },
    learnRoute: '/parcours/arnaque-en-direct',
    confirmLabel: 'Je sais réagir',
  },
  {
    id: 'numeros-officiels',
    title: 'Les vrais numéros de ma banque et de mon assurance sont-ils enregistrés ?',
    icon: 'bookmark-outline',
    source: 'declared',
    pendingState: 'to-reinforce',
    advice: {
      inPlace:
        'Parfait. Avoir les bons numéros enregistrés évite de rappeler un faux numéro reçu par message.',
      pending:
        'Enregistrez les vrais numéros (au dos de la carte, sur vos contrats). En cas de doute, vous rappelez le bon interlocuteur, jamais un numéro reçu par SMS.',
    },
    confirmLabel: 'C’est fait',
  },
] as const;

/** Niveaux doux du bilan — jamais un chiffre sur 100, jamais le mot « score ». */
export type CheckupLevel = 'premiers-pas' | 'en-bonne-voie' | 'bien-protege' | 'bouclier-complet';

export interface CheckupLevelInfo {
  readonly id: CheckupLevel;
  readonly label: string;
  readonly line: string;
}

export const CHECKUP_LEVELS: Record<CheckupLevel, CheckupLevelInfo> = {
  'premiers-pas': {
    id: 'premiers-pas',
    label: 'Premiers pas',
    line: 'C’est déjà bien d’être ici. Avançons pas à pas.',
  },
  'en-bonne-voie': {
    id: 'en-bonne-voie',
    label: 'En bonne voie',
    line: 'Vous avez déjà de bons réflexes.',
  },
  'bien-protege': {
    id: 'bien-protege',
    label: 'Bien protégé',
    line: 'Votre bouclier est solide.',
  },
  'bouclier-complet': {
    id: 'bouclier-complet',
    label: 'Bouclier complet',
    line: 'Tout est en place. Bravo.',
  },
};
