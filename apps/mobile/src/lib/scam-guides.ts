import type { ScamCategory } from '@vigie/shared';
import { scamCategorySchema } from '@vigie/shared';
import { z } from 'zod';

import ameliImpots from '../../content/scams/ameli-impots.json';
import arnaqueEmploi from '../../content/scams/arnaque-emploi.json';
import arnaqueSentimentale from '../../content/scams/arnaque-sentimentale.json';
import critairAntai from '../../content/scams/critair-antai.json';
import fauxConseillerBancaire from '../../content/scams/faux-conseiller-bancaire.json';
import fauxPlacements from '../../content/scams/faux-placements.json';
import fauxSiteEcommerce from '../../content/scams/faux-site-ecommerce.json';
import fauxSupportTechnique from '../../content/scams/faux-support-technique.json';
import fraudeCpf from '../../content/scams/fraude-cpf.json';
import fraudePresidentProche from '../../content/scams/fraude-president-proche.json';
import phishingColis from '../../content/scams/phishing-colis.json';
import qrCodesPieges from '../../content/scams/qr-codes-pieges.json';
import sextorsion from '../../content/scams/sextorsion.json';
import smishingGenerique from '../../content/scams/smishing-generique.json';
import vintedLeboncoin from '../../content/scams/vinted-leboncoin.json';

/** Fiche pédagogique (§4.1 écran 5) : c'est quoi / la reconnaître / que faire / exemple. */
export const scamGuideSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  icon: z.string().min(1),
  categories: z.array(scamCategorySchema),
  what: z.string().min(30),
  signs: z.array(z.string().min(10)).min(3),
  actions: z.array(z.string().min(10)).min(3),
  example: z.string().min(40),
});
export type ScamGuide = z.infer<typeof scamGuideSchema>;

const RAW_GUIDES: unknown[] = [
  fauxConseillerBancaire,
  phishingColis,
  ameliImpots,
  critairAntai,
  fraudeCpf,
  vintedLeboncoin,
  fauxSiteEcommerce,
  fauxPlacements,
  fauxSupportTechnique,
  arnaqueSentimentale,
  sextorsion,
  arnaqueEmploi,
  fraudePresidentProche,
  qrCodesPieges,
  smishingGenerique,
];

/** Les 15 fiches, validées au chargement : une fiche malformée doit casser les tests, pas l'app. */
export const SCAM_GUIDES: readonly ScamGuide[] = RAW_GUIDES.map((raw) =>
  scamGuideSchema.parse(raw),
);

export function guideById(id: string): ScamGuide | undefined {
  return SCAM_GUIDES.find((guide) => guide.id === id);
}

/** Fiche à proposer sous un verdict (§4.2 point 5) — null pour AUTRE/AUCUNE. */
export function guideForCategory(category: ScamCategory): ScamGuide | null {
  if (category === 'AUTRE' || category === 'AUCUNE') {
    return null;
  }
  return SCAM_GUIDES.find((guide) => guide.categories.includes(category)) ?? null;
}
