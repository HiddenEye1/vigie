import type { Ionicons } from '@expo/vector-icons';

import { palette } from '@/lib/theme';

import type { ParcoursLevel } from './types';

/**
 * Habillage d'un résultat de parcours : reprend les « feux » du phare
 * (rouge/ambre/vert) pour rester cohérent avec les verdicts, mais reste propre
 * au questionnaire local.
 */
export interface ParcoursLevelUi {
  readonly label: string;
  readonly fill: string;
  readonly onFill: string;
  readonly text: string;
  readonly icon: keyof typeof Ionicons.glyphMap;
}

export const PARCOURS_LEVEL_UI: Record<ParcoursLevel, ParcoursLevelUi> = {
  DANGER: {
    label: 'Risque élevé',
    fill: palette.feuRouge,
    onFill: palette.surFeuClair,
    text: palette.texteFeuRouge,
    icon: 'hand-left',
  },
  PRUDENCE: {
    label: 'Prudence',
    fill: palette.feuAmbre,
    onFill: palette.surFeuSombre,
    text: palette.texteFeuAmbre,
    icon: 'alert',
  },
  OK: {
    label: 'Cas normal',
    fill: palette.feuVert,
    onFill: palette.surFeuSombre,
    text: palette.texteFeuVert,
    icon: 'checkmark',
  },
};
