import { useCheckup } from './checkup.store';

describe('useCheckup (store local)', () => {
  beforeEach(() => {
    useCheckup.getState().reset();
  });

  it('démarre sans aucune confirmation ni date de bilan', () => {
    expect(useCheckup.getState().confirmed).toEqual({});
    expect(useCheckup.getState().lastReviewedAt).toBeNull();
  });

  it('markReviewed pose une date ISO valide', () => {
    useCheckup.getState().markReviewed();
    const date = useCheckup.getState().lastReviewedAt;
    expect(date).not.toBeNull();
    expect(Number.isNaN(Date.parse(date ?? ''))).toBe(false);
  });

  it('confirme un item déclaratif', () => {
    useCheckup.getState().confirm('code-sms');
    expect(useCheckup.getState().confirmed['code-sms']).toBe(true);
  });

  it('retire une confirmation sans supprimer la clé', () => {
    useCheckup.getState().confirm('numeros-officiels');
    useCheckup.getState().unconfirm('numeros-officiels');
    expect(useCheckup.getState().confirmed['numeros-officiels']).toBe(false);
  });

  it('conserve les autres confirmations quand on en retire une', () => {
    useCheckup.getState().confirm('code-sms');
    useCheckup.getState().confirm('appel-urgent');
    useCheckup.getState().unconfirm('code-sms');
    expect(useCheckup.getState().confirmed['appel-urgent']).toBe(true);
  });

  it('remet tout à zéro avec reset (confirmations + date)', () => {
    useCheckup.getState().confirm('code-sms');
    useCheckup.getState().markReviewed();
    useCheckup.getState().reset();
    expect(useCheckup.getState().confirmed).toEqual({});
    expect(useCheckup.getState().lastReviewedAt).toBeNull();
  });

  it('persiste sous la clé locale vigie.security-checkup', () => {
    expect(useCheckup.persist.getOptions().name).toBe('vigie.security-checkup');
  });
});
