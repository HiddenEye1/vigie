import { SCAM_GUIDES, guideById, guideForCategory, scamGuideSchema } from './scam-guides';

describe('fiches conseils (F6, §8.5)', () => {
  it('les 15 fiches sont présentes', () => {
    expect(SCAM_GUIDES).toHaveLength(15);
  });

  it('chaque fiche est conforme au schéma (contenu rédigé, pas de placeholder)', () => {
    for (const guide of SCAM_GUIDES) {
      expect(scamGuideSchema.safeParse(guide).success).toBe(true);
      expect(guide.what.toLowerCase()).not.toContain('lorem');
      expect(guide.what.toLowerCase()).not.toContain('todo');
    }
  });

  it('les identifiants sont uniques', () => {
    const ids = SCAM_GUIDES.map((guide) => guide.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('couvre les 15 sujets imposés par le cahier des charges', () => {
    const ids = new Set(SCAM_GUIDES.map((guide) => guide.id));
    for (const expected of [
      'faux-conseiller-bancaire',
      'phishing-colis',
      'critair-antai',
      'ameli-impots',
      'fraude-cpf',
      'vinted-leboncoin',
      'arnaque-sentimentale',
      'faux-support-technique',
      'faux-placements',
      'sextorsion',
      'arnaque-emploi',
      'faux-site-ecommerce',
      'fraude-president-proche',
      'qr-codes-pieges',
      'smishing-generique',
    ]) {
      expect(ids.has(expected)).toBe(true);
    }
  });

  it('guideById retrouve une fiche', () => {
    expect(guideById('phishing-colis')?.title).toContain('colis');
    expect(guideById('inexistante')).toBeUndefined();
  });

  it('chaque catégorie d’arnaque du verdict mène à une fiche pertinente', () => {
    expect(guideForCategory('FAUX_CONSEILLER_BANCAIRE')?.id).toBe('faux-conseiller-bancaire');
    expect(guideForCategory('PHISHING_COLIS')?.id).toBe('phishing-colis');
    expect(guideForCategory('PHISHING_ADMINISTRATION')?.id).toBe('ameli-impots');
    expect(guideForCategory('ARNAQUE_PETITES_ANNONCES')?.id).toBe('vinted-leboncoin');
    expect(guideForCategory('ARNAQUE_SENTIMENTALE')?.id).toBe('arnaque-sentimentale');
    expect(guideForCategory('FAUX_SUPPORT_TECHNIQUE')?.id).toBe('faux-support-technique');
    expect(guideForCategory('INVESTISSEMENT_FRAUDULEUX')?.id).toBe('faux-placements');
    expect(guideForCategory('FAUX_SITE_ECOMMERCE')?.id).toBe('faux-site-ecommerce');
    expect(guideForCategory('CHANTAGE_SEXTORSION')?.id).toBe('sextorsion');
    expect(guideForCategory('ARNAQUE_EMPLOI')?.id).toBe('arnaque-emploi');
    expect(guideForCategory('FRAUDE_CPF_AIDES')?.id).toBe('fraude-cpf');
    expect(guideForCategory('SMISHING_AUTRE')?.id).toBe('smishing-generique');
  });

  it('AUTRE et AUCUNE ne proposent pas de fiche', () => {
    expect(guideForCategory('AUTRE')).toBeNull();
    expect(guideForCategory('AUCUNE')).toBeNull();
  });
});
