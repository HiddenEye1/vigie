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

  it('en mode « proche », l’item auto devient déclaratif (ignore hasContact)', () => {
    // Un contact existe, mais en mode proche l'item 1 ne se déduit PAS du Bouclier famille.
    expect(deriveItemState(proche, { confirmed: {}, hasContact: true, mode: 'proche' })).toBe(
      'to-discover',
    );
    expect(
      deriveItemState(proche, { confirmed: { proche: true }, hasContact: false, mode: 'proche' }),
    ).toBe('in-place');
  });
});

describe('levelFor (niveaux doux)', () => {
  it('renvoie les bons niveaux aux bornes pour 5 items', () => {
    expect(levelFor(0, 5)).toBe('premiers-pas');
    expect(levelFor(2, 5)).toBe('premiers-pas');
    expect(levelFor(3, 5)).toBe('en-bonne-voie');
    expect(levelFor(4, 5)).toBe('bien-protege');
    expect(levelFor(5, 5)).toBe('bouclier-complet');
  });
});

describe('CHECKUP_ITEMS', () => {
  it('contient l’item « proches-argent » avec partage et confirmation', () => {
    const item = CHECKUP_ITEMS.find((entry) => entry.id === 'proches-argent');
    expect(item).toBeDefined();
    expect(item?.shareLabel).toBe('Leur envoyer un rappel');
    expect(item?.confirmLabel).toBe('Mes proches le savent');
  });
});

describe('deriveCheckup', () => {
  it('totalise les 5 protections essentielles', () => {
    const result = deriveCheckup({ confirmed: {}, hasContact: false });
    expect(result.total).toBe(5);
  });

  it('compte les protections en place et calcule le niveau', () => {
    const result = deriveCheckup({
      confirmed: { 'code-sms': true, 'appel-urgent': true },
      hasContact: true,
    });
    expect(result.inPlaceCount).toBe(3);
    expect(result.level).toBe('en-bonne-voie');
  });

  it('tout en place → bouclier complet', () => {
    const result = deriveCheckup({
      confirmed: {
        'code-sms': true,
        'appel-urgent': true,
        'numeros-officiels': true,
        'proches-argent': true,
      },
      hasContact: true,
    });
    expect(result.inPlaceCount).toBe(5);
    expect(result.level).toBe('bouclier-complet');
  });

  it('rien en place → premiers pas', () => {
    const result = deriveCheckup({ confirmed: {}, hasContact: false });
    expect(result.inPlaceCount).toBe(0);
    expect(result.level).toBe('premiers-pas');
  });

  it('mode « proche » : un contact enregistré ne compte pas sans confirmation', () => {
    const result = deriveCheckup({ confirmed: {}, hasContact: true, mode: 'proche' });
    expect(result.inPlaceCount).toBe(0);
    expect(result.total).toBe(5);
  });
});
