import type { Ionicons } from '@expo/vector-icons';

/**
 * Parcours proactif : un questionnaire local, très simple, qui aide une
 * personne à se protéger AVANT d'agir (avant de donner un code, de payer, de
 * cliquer…). Tout se joue en local, sans envoyer aucune donnée : Vigie crée un
 * réflexe, elle n'analyse pas un contenu ici.
 */

export type ParcoursLevel = 'DANGER' | 'PRUDENCE' | 'OK';

export interface ParcoursOption {
  readonly id: string;
  readonly label: string;
  /** Points de danger apportés par ce choix (cumulés entre questions). */
  readonly weight: number;
  /**
   * Si vrai, ce choix conclut à lui seul à un DANGER, quel que soit le reste
   * (ex. « on me demande de dicter le code »).
   */
  readonly decisive?: boolean;
  readonly icon?: keyof typeof Ionicons.glyphMap;
}

export interface ParcoursQuestion {
  readonly id: string;
  readonly title: string;
  /** Précision facultative sous la question (ton rassurant, non culpabilisant). */
  readonly help?: string;
  readonly options: readonly ParcoursOption[];
}

/** Ce que le parcours affiche à la fin : un verdict clair et des gestes. */
export interface ParcoursOutcome {
  readonly level: ParcoursLevel;
  readonly title: string;
  readonly message: string;
  /** L'action à NE surtout PAS faire. */
  readonly doNot: string;
  /** L'action recommandée. */
  readonly doInstead: string;
}

/** Réponses en cours : identifiant de question → identifiant d'option choisie. */
export type ParcoursAnswers = Readonly<Record<string, string>>;

interface ParcoursBase {
  readonly id: string;
  /** Titre affiché (« Avant de donner un code »). */
  readonly title: string;
  /** Une phrase d'accroche rassurante. */
  readonly intro: string;
  readonly icon: keyof typeof Ionicons.glyphMap;
}

/**
 * Parcours-questionnaire : quelques questions, un score, un verdict. Le format
 * de base (donner un code, payer…).
 */
/** Bouton « Analyser… » du résultat : libellé + écran d'analyse ciblé. */
export interface ParcoursAnalyze {
  readonly label: string;
  readonly route: '/verifier-texte' | '/verifier-lien';
}

export interface QuestionnaireParcours extends ParcoursBase {
  readonly kind: 'questionnaire';
  readonly questions: readonly ParcoursQuestion[];
  /** Calcule le résultat à partir des réponses. Logique pure, testable. */
  readonly evaluate: (answers: ParcoursAnswers) => ParcoursOutcome;
  /** Personnalise le bouton « Analyser… » (défaut : analyser le message). */
  readonly analyze?: ParcoursAnalyze;
}

/** Une situation d'urgence et les actions prioritaires qui en découlent. */
export interface EmergencySituation {
  readonly id: string;
  readonly label: string;
  readonly icon?: keyof typeof Ionicons.glyphMap;
  /** Titre de l'écran d'actions. */
  readonly heading: string;
  /** Actions prioritaires, dans l'ordre. */
  readonly actions: readonly string[];
}

/**
 * Parcours d'urgence (« Arnaque en direct ») : des consignes immédiates, puis
 * un choix de situation qui mène aux actions prioritaires. Pas de score : la
 * priorité est d'agir vite, pas de « diagnostiquer ».
 */
export interface EmergencyParcours extends ParcoursBase {
  readonly kind: 'emergency';
  /** Consignes affichées d'entrée, avant tout choix. */
  readonly immediateSteps: readonly string[];
  readonly situations: readonly EmergencySituation[];
}

export type ParcoursDefinition = QuestionnaireParcours | EmergencyParcours;
