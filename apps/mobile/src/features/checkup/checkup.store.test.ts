import { useCheckup } from './checkup.store';

describe('useCheckup (store local)', () => {
  beforeEach(() => {
    useCheckup.getState().reset();
  });

  it('démarre sans aucune confirmation ni date de bilan', () => {
    expect(useCheckup.getState().confirmed).toEqual({});
    expect(useCheckup.getState().confirmedForProche).toEqual({});
    expect(useCheckup.getState().lastReviewedAt).toBeNull();
  });

  it('gère un bilan « proche » indépendant du bilan « moi »', () => {
    useCheckup.getState().confirm('code-sms');
    useCheckup.getState().confirmForProche('appel-urgent');
    // Chaque jeu ne voit que ses propres confirmations.
    expect(useCheckup.getState().confirmed).toEqual({ 'code-sms': true });
    expect(useCheckup.getState().confirmedForProche).toEqual({ 'appel-urgent': true });
    useCheckup.getState().unconfirmForProche('appel-urgent');
    expect(useCheckup.getState().confirmedForProche['appel-urgent']).toBe(false);
    // Le bilan « moi » n'a pas bougé.
    expect(useCheckup.getState().confirmed['code-sms']).toBe(true);
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

  it('remet tout à zéro avec reset (les deux bilans + date)', () => {
    useCheckup.getState().confirm('code-sms');
    useCheckup.getState().confirmForProche('appel-urgent');
    useCheckup.getState().markReviewed();
    useCheckup.getState().reset();
    expect(useCheckup.getState().confirmed).toEqual({});
    expect(useCheckup.getState().confirmedForProche).toEqual({});
    expect(useCheckup.getState().lastReviewedAt).toBeNull();
  });

  it('persiste sous la clé locale vigie.security-checkup', () => {
    expect(useCheckup.persist.getOptions().name).toBe('vigie.security-checkup');
  });
});
