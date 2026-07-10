import { describe, expect, it } from 'vitest';

import type { AIVerdict } from '../provider.js';
import { contentSignalsRule } from './content-signals.rule.js';
import { runPostProcessRules } from './index.js';
import type { RuleContext, RuleOutcome } from './types.js';
import { makeInput, makeVerdict } from './test-helpers.js';

function apply(text: string, verdict: Partial<AIVerdict> = {}): RuleOutcome | null {
  const input = makeInput(text);
  const context: RuleContext = { input, original: makeVerdict(verdict) };
  return contentSignalsRule.apply(makeVerdict(verdict), context);
}

describe('contentSignalsRule — un signal HARM isolé → suspect (jamais critique)', () => {
  it.each([
    ['demande de code', 'Bonjour, communiquez-nous le code reçu par SMS.'],
    ['demande de virement', 'Merci de faire un virement sur ce compte.'],
    ['demande de carte', 'Donnez votre carte bancaire pour confirmer.'],
    ['demande d’identifiants', 'Confirmez votre mot de passe pour continuer.'],
    ['coupon PCS', 'Achetez une carte PCS et envoyez-nous le numéro.'],
    ['faux proche', 'Maman c’est moi, j’ai changé de numéro.'],
    ['faux support', 'Microsoft a détecté un virus sur votre ordinateur.'],
    ['investissement garanti', 'Un placement avec rendement garanti sans risque.'],
  ])('%s seul → SUSPECT', (_label, text) => {
    expect(apply(text)?.patch.verdict).toBe('SUSPECT');
  });
});

describe('contentSignalsRule — un amplificateur isolé ne suffit pas', () => {
  it.each([
    ['urgence', 'Répondez, c’est urgent.'],
    ['compte bloqué', 'Votre compte est bloqué.'],
    ['colis', 'Votre colis est en attente de frais de douane.'],
  ])('%s seul → aucune escalade', (_label, text) => {
    expect(apply(text)).toBeNull();
  });

  it('deux amplificateurs → SUSPECT', () => {
    expect(apply('Votre compte est bloqué, agissez rapidement.')?.patch.verdict).toBe('SUSPECT');
  });
});

describe('contentSignalsRule — croisements dangereux → ARNAQUE_PROBABLE', () => {
  it.each([
    ['urgence + code', 'Urgent : communiquez-nous le code reçu par SMS.'],
    [
      'faux proche + argent',
      'Maman c’est moi, j’ai changé de numéro, j’ai besoin d’argent vite.',
    ],
    ['ne prévenez personne + argent', 'Envoyez-moi de l’argent et ne prévenez personne.'],
    [
      'support + urgence',
      'Support technique Microsoft : votre ordinateur est infecté, appelez immédiatement.',
    ],
    [
      'investissement + urgence',
      'Investissement à rendement garanti, dernière chance aujourd’hui !',
    ],
    ['deux demandes', 'Communiquez-nous le code et confirmez votre mot de passe.'],
  ])('%s → ARNAQUE_PROBABLE', (_label, text) => {
    const outcome = apply(text);
    expect(outcome?.patch.verdict).toBe('ARNAQUE_PROBABLE');
  });

  it('remplace une catégorie AUCUNE par AUTRE en cas de relèvement', () => {
    const outcome = apply('Urgent : communiquez-nous le code reçu.', { category: 'AUCUNE' });
    expect(outcome?.patch.category).toBe('AUTRE');
  });
});

describe('contentSignalsRule — anti-faux-positifs', () => {
  it('ne surclasse pas un message de prévention (« ne communiquez jamais ce code »)', () => {
    expect(apply('Ne communiquez jamais ce code, même à votre banque.')).toBeNull();
  });

  it('ne surclasse pas un rappel de sécurité de la banque', () => {
    expect(apply('Votre banque ne vous demandera jamais votre code par téléphone.')).toBeNull();
  });

  it('ne surclasse pas une mise en garde explicite', () => {
    expect(
      apply('Attention, c’est une arnaque : ne cliquez jamais et signalez-le au 33700.'),
    ).toBeNull();
  });

  it('laisse un message anodin inchangé', () => {
    expect(apply('Coucou, tu es libre demain pour un café ?')).toBeNull();
  });

  it('ne confond pas un remboursement entre amis avec une demande frauduleuse', () => {
    expect(apply('Je te rembourse les 20 euros demain, pas de souci.')).toBeNull();
  });

  it('ne rétrograde jamais un verdict déjà plus alarmant', () => {
    const outcome = apply('Urgent : communiquez-nous le code reçu.', {
      verdict: 'ARNAQUE_PROBABLE',
      confidence: 0.95,
      category: 'FAUX_CONSEILLER_BANCAIRE',
    });
    expect(outcome).toBeNull();
  });
});

describe('contentSignalsRule — cohérence avec les champs étendus', () => {
  it('recalcule risk_level et score après un relèvement (chaîne complète)', () => {
    const provided: AIVerdict = {
      ...makeVerdict({ verdict: 'PLUTOT_SUR', confidence: 0.85, category: 'AUCUNE' }),
      risk_level: 'LOW',
      score: 9,
    };
    const { verdict } = runPostProcessRules(
      provided,
      makeInput('Urgent : communiquez-nous le code reçu par SMS pour débloquer votre compte.'),
    );
    expect(verdict.verdict).toBe('ARNAQUE_PROBABLE');
    expect(verdict.risk_level).not.toBe('LOW');
    expect(verdict.score).toBeGreaterThanOrEqual(70);
  });
});
