import type {
  CheckupItemDef,
  CheckupItemId,
  CheckupLevel,
  CheckupMode,
  CheckupState,
} from './checkup.items';
import { CHECKUP_ITEMS } from './checkup.items';

/**
 * Dérivation pure de l'état du bilan — aucune I/O, entièrement testable.
 * L'item « proche » se lit sur le Bouclier famille (`hasContact`) ; les items
 * déclaratifs se lisent sur les confirmations locales de l'utilisateur.
 */

export interface CheckupInput {
  /** Items déclaratifs confirmés « en place » par l'utilisateur (depuis le store). */
  readonly confirmed: Partial<Record<CheckupItemId, boolean>>;
  /** Un proche de confiance est-il enregistré ? (dérivé du store famille). */
  readonly hasContact: boolean;
  /**
   * `moi` (défaut) : l'item auto lit le Bouclier famille. `proche` : bilan
   * *estimé* par un aidant, où TOUS les items sont déclaratifs.
   */
  readonly mode?: CheckupMode;
}

export interface CheckupItemView {
  readonly def: CheckupItemDef;
  readonly state: CheckupState;
}

export interface CheckupResult {
  readonly items: readonly CheckupItemView[];
  /** Nombre de protections « en place ». On compte des protections, pas un score. */
  readonly inPlaceCount: number;
  readonly total: number;
  readonly level: CheckupLevel;
}

export function deriveItemState(def: CheckupItemDef, input: CheckupInput): CheckupState {
  const mode = input.mode ?? 'moi';
  // En mode « proche », même l'item auto devient déclaratif : ce téléphone n'est
  // pas celui du senior, on ne peut donc pas le déduire du Bouclier famille.
  const isAuto = def.source === 'auto' && mode === 'moi';
  const done = isAuto ? input.hasContact : input.confirmed[def.id] === true;
  return done ? 'in-place' : def.pendingState;
}

/**
 * Niveau doux à partir du nombre de protections en place. Exprimé en fractions
 * du total pour rester juste quand des items s'ajouteront (lots suivants).
 */
export function levelFor(inPlaceCount: number, total: number): CheckupLevel {
  if (inPlaceCount >= total) {
    return 'bouclier-complet';
  }
  if (inPlaceCount >= total - 1) {
    return 'bien-protege';
  }
  if (inPlaceCount >= Math.ceil(total / 2)) {
    return 'en-bonne-voie';
  }
  return 'premiers-pas';
}

export function deriveCheckup(input: CheckupInput): CheckupResult {
  const items = CHECKUP_ITEMS.map((def) => ({ def, state: deriveItemState(def, input) }));
  const total = items.length;
  const inPlaceCount = items.filter((item) => item.state === 'in-place').length;
  return { items, inPlaceCount, total, level: levelFor(inPlaceCount, total) };
}
