import { deriveCheckup, deriveItemState, levelFor } from './checkup.derive';
import { CHECKUP_ITEMS } from './checkup.items';

const proche = CHECKUP_ITEMS.find((item) => item.id === 'proche');
const codeSms = CHECKUP_ITEMS.find((item) => item.id === 'code-sms');
if (proche === undefined || codeSms === undefined) {
  throw new Error('Items de référence introuvables');
}

describe('deriveItemState', () => {
  it('l’item « proche » (auto) est en place quand un contact existe', () => {
    expect(deriveItemState(proche, { confirmed: {}, hasContact: true })).toBe('in-place');
  });

  it('l’item « proche » sans contact est « à découvrir »', () => {
    expect(deriveItemState(proche, { confirmed: {}, hasContact: false })).toBe('to-discover');
  });

  it('un item déclaratif confirmé est en place', () => {
    expect(deriveItemState(codeSms, { confirmed: { 'code-sms': true }, hasContact: false })).toBe(
      'in-place',
    );
  });

  it('un item déclaratif non confirmé (ou remis à false) est « à renforcer »', () => {
    expect(deriveItemState(codeSms, { confirmed: {}, hasContact: false })).toBe('to-reinforce');
    expect(deriveItemState(codeSms, { confirmed: { 'code-sms': false }, hasContact: false })).toBe(
      'to-reinforce',
    );
  });
});

describe('levelFor (niveaux doux)', () => {
  it('renvoie les bons niveaux aux bornes pour 4 items', () => {
    expect(levelFor(0, 4)).toBe('premiers-pas');
    expect(levelFor(1, 4)).toBe('premiers-pas');
    expect(levelFor(2, 4)).toBe('en-bonne-voie');
    expect(levelFor(3, 4)).toBe('bien-protege');
    expect(levelFor(4, 4)).toBe('bouclier-complet');
  });
});

describe('deriveCheckup', () => {
  it('compte les protections en place et calcule le niveau', () => {
    const result = deriveCheckup({
      confirmed: { 'code-sms': true, 'appel-urgent': true },
      hasContact: true,
    });
    expect(result.total).toBe(4);
    expect(result.inPlaceCount).toBe(3);
    expect(result.level).toBe('bien-protege');
  });

  it('tout en place → bouclier complet', () => {
    const result = deriveCheckup({
      confirmed: { 'code-sms': true, 'appel-urgent': true, 'numeros-officiels': true },
      hasContact: true,
    });
    expect(result.inPlaceCount).toBe(4);
    expect(result.level).toBe('bouclier-complet');
  });

  it('rien en place → premiers pas', () => {
    const result = deriveCheckup({ confirmed: {}, hasContact: false });
    expect(result.inPlaceCount).toBe(0);
    expect(result.level).toBe('premiers-pas');
  });
});
