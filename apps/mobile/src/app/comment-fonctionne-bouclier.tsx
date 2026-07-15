import { useRouter } from 'expo-router';
import type { ReactElement } from 'react';

import { FamilyShieldExplainer } from '@/features/family';

/**
 * Écran « Comment fonctionne le Bouclier famille ? ». Mince wrapper de route :
 * l'en-tête (titre + retour) vient du Stack, le contenu de FamilyShieldExplainer
 * (testé en isolation). Propose en bas un lien discret vers le Check-up sécurité.
 */
export default function BouclierFamilleExplainScreen(): ReactElement {
  const router = useRouter();
  return (
    <FamilyShieldExplainer
      onCheckup={() => {
        router.push('/checkup');
      }}
    />
  );
}
