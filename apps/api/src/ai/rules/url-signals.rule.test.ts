import { describe, expect, it } from 'vitest';

import type { UrlSignals } from '../../url/url-analyzer.js';
import type { AIVerdict, AnalyzeInput } from '../provider.js';
import { runPostProcessRules } from './index.js';
import type { RuleContext, RuleOutcome } from './types.js';
import { urlSignalsRule } from './url-signals.rule.js';
import { makeInput, makeVerdict } from './test-helpers.js';

function signals(overrides: Partial<UrlSignals> = {}): UrlSignals {
  return {
    finalUrl: 'https://boutique-exemple.fr/',
    https: true,
    redirects: 0,
    domainAgeDays: 800,
    isOfficialDomain: false,
    pageTitle: null,
    metaDescription: null,
    fetchFailed: false,
    ...overrides,
  };
}

function urlInput(overrides: Partial<UrlSignals> = {}): AnalyzeInput {
  const urlSignals = signals(overrides);
  return { kind: 'url', content: urlSignals.finalUrl, urlSignals };
}

/** Applique la règle isolée avec un verdict de départ rassurant par défaut. */
function apply(overrides: Partial<UrlSignals>, verdict: Partial<AIVerdict> = {}): RuleOutcome | null {
  const input = urlInput(overrides);
  const context: RuleContext = { input, original: makeVerdict(verdict) };
  return urlSignalsRule.apply(makeVerdict(verdict), context);
}

describe('urlSignalsRule — signaux isolés', () => {
  it('http seul → suspect (pas critique)', () => {
    expect(apply({ https: false })?.patch.verdict).toBe('SUSPECT');
  });

  it('domaine récent seul → suspect', () => {
    expect(apply({ domainAgeDays: 12 })?.patch.verdict).toBe('SUSPECT');
  });

  it('domaine créé il y a quelques jours seul → suspect, pas arnaque', () => {
    expect(apply({ domainAgeDays: 2 })?.patch.verdict).toBe('SUSPECT');
  });

  it('lien raccourci seul → prudence, pas d’escalade', () => {
    expect(apply({ finalUrl: 'https://bit.ly/xyz' })).toBeNull();
  });

  it('mot sensible seul sur un domaine normal → pas d’escalade', () => {
    expect(apply({ finalUrl: 'https://boutique-exemple.fr/login' })).toBeNull();
  });
});

describe('urlSignalsRule — combinaisons', () => {
  it('http + domaine récent → arnaque probable', () => {
    expect(apply({ https: false, domainAgeDays: 10 })?.patch.verdict).toBe('ARNAQUE_PROBABLE');
  });

  it('imitation de marque + mot sensible → suspect', () => {
    const outcome = apply({ finalUrl: 'https://paypal.com.securite-verify.ru/login' });
    expect(outcome?.patch.verdict).toBe('SUSPECT');
  });

  it('imitation de marque + mot sensible + http → arnaque probable', () => {
    const outcome = apply({ https: false, finalUrl: 'http://paypal.com.securite-verify.ru/login' });
    expect(outcome?.patch.verdict).toBe('ARNAQUE_PROBABLE');
    expect(outcome?.patch.reasons?.some((r) => r.includes('faux sites'))).toBe(true);
  });

  it('donne une catégorie AUTRE quand elle était AUCUNE', () => {
    const outcome = apply({ https: false, domainAgeDays: 10 }, { category: 'AUCUNE' });
    expect(outcome?.patch.category).toBe('AUTRE');
  });
});

describe('urlSignalsRule — anti-faux-positifs et non-régression', () => {
  it('ne touche jamais un domaine officiel, même avec d’autres signaux', () => {
    expect(apply({ isOfficialDomain: true, https: false, domainAgeDays: 3 })).toBeNull();
  });

  it('laisse un site légitime bien établi inchangé', () => {
    expect(apply({ finalUrl: 'https://www.exemple-connu.fr/', domainAgeDays: 3000 })).toBeNull();
  });

  it('ne rétrograde jamais un verdict déjà plus alarmant', () => {
    const outcome = apply(
      { https: false, domainAgeDays: 2 },
      { verdict: 'ARNAQUE_PROBABLE', confidence: 0.95, category: 'FAUX_SITE_ECOMMERCE' },
    );
    expect(outcome).toBeNull();
  });

  it('ignore les entrées qui ne sont pas des URLs', () => {
    const input = makeInput('Un simple message texte, pas de lien.');
    const context: RuleContext = { input, original: makeVerdict() };
    expect(urlSignalsRule.apply(makeVerdict(), context)).toBeNull();
  });
});

describe('urlSignalsRule — cohérence avec les champs étendus', () => {
  it('recalcule risk_level et score après un relèvement (chaîne complète)', () => {
    const input = urlInput({ https: false, domainAgeDays: 5 });
    const provided: AIVerdict = {
      ...makeVerdict({ verdict: 'PLUTOT_SUR', confidence: 0.6, category: 'AUCUNE' }),
      risk_level: 'LOW',
      score: 8,
    };
    const { verdict } = runPostProcessRules(provided, input);
    expect(verdict.verdict).toBe('ARNAQUE_PROBABLE');
    expect(verdict.risk_level).not.toBe('LOW');
    expect(verdict.score).toBeGreaterThanOrEqual(70);
  });
});
