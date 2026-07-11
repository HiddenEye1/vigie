import type { ReactElement } from 'react';

import { FamilyShieldExplainer } from '@/features/family';

/**
 * Écran « Comment fonctionne le Bouclier famille ? ». Mince wrapper de route :
 * l'en-tête (titre + retour) vient du Stack, le contenu de FamilyShieldExplainer
 * (testé en isolation).
 */
export default function BouclierFamilleExplainScreen(): ReactElement {
  return <FamilyShieldExplainer />;
}
