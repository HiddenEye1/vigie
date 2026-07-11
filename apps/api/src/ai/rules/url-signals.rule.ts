import type { VerdictLevel } from '@vigie/shared';

import type { UrlSignals } from '../../url/url-analyzer.js';
import { registrableDomain } from '../../url/url-analyzer.js';
import type { PostProcessRule } from './types.js';
import { isBelow } from './verdict-severity.js';

/**
 * Filet défensif fondé sur les SIGNAUX TECHNIQUES d'une URL (§8.3), déjà
 * collectés dans `urlSignals`. On additionne des points par signal, puis on
 * relève le verdict — jamais on ne le rétrograde. Un seul signal faible ne
 * suffit pas à alarmer fortement : il faut cumuler.
 *
 * Prudence anti-faux-positifs :
 *  - un domaine officiel connu est laissé tel quel (sortie immédiate) ;
 *  - un signal isolé mène au plus à SUSPECT, jamais à ARNAQUE_PROBABLE ;
 *  - les mots sensibles / liens raccourcis / adresses confuses pèsent peu : ils
 *    ne comptent qu'en combinaison.
 *
 * Le croisement avec les signaux de CONTENU (urgence, argent, code) viendra au
 * Lot 5 ; ici on ne raisonne que sur l'adresse elle-même.
 */

const YOUNG_DOMAIN_DAYS = 30;
const VERY_YOUNG_DOMAIN_DAYS = 7;

/** À partir de ce total, le lien est traité comme une arnaque probable. */
const ARNAQUE_SCORE = 4;
/** À partir de ce total, le lien devient suspect. */
const SUSPECT_SCORE = 2;

/** Raccourcisseurs d'URL courants : masquent la vraie destination. */
const SHORTENER_DOMAINS = new Set([
  'bit.ly',
  'tinyurl.com',
  'cutt.ly',
  't.co',
  'ow.ly',
  'is.gd',
  'buff.ly',
  'rebrand.ly',
  'rb.gy',
  'shorturl.at',
  'lnkd.in',
  'goo.gl',
]);

/** Mots sensibles fréquents dans les URLs d'hameçonnage. */
const SENSITIVE_TOKENS = [
  'login',
  'verify',
  'secure',
  'paiement',
  'payment',
  'colis',
  'livraison',
  'banque',
  'impots',
  'ameli',
  'paypal',
  'remboursement',
];

/** Marques usurpées et leurs domaines enregistrables légitimes. */
const KNOWN_BRANDS: readonly { readonly token: string; readonly legit: readonly string[] }[] = [
  { token: 'paypal', legit: ['paypal.com', 'paypal.fr'] },
  { token: 'ameli', legit: ['ameli.fr'] },
  { token: 'impots', legit: ['impots.gouv.fr'] },
  { token: 'laposte', legit: ['laposte.fr', 'laposte.net'] },
  { token: 'colissimo', legit: ['laposte.fr', 'colissimo.fr'] },
  { token: 'chronopost', legit: ['chronopost.fr'] },
  { token: 'amazon', legit: ['amazon.fr', 'amazon.com'] },
  { token: 'microsoft', legit: ['microsoft.com', 'live.com'] },
  { token: 'apple', legit: ['apple.com', 'icloud.com'] },
  { token: 'netflix', legit: ['netflix.com'] },
  { token: 'orange', legit: ['orange.fr'] },
  { token: 'sfr', legit: ['sfr.fr'] },
  { token: 'edf', legit: ['edf.fr'] },
];

interface UrlScore {
  readonly score: number;
  readonly labels: readonly string[];
}

function scoreUrlSignals(signals: UrlSignals): UrlScore {
  const labels: string[] = [];
  let score = 0;
  const add = (points: number, label: string): void => {
    score += points;
    labels.push(label);
  };

  const host = safeHostname(signals.finalUrl);
  const registrable = host ? registrableDomain(host) : null;
  const haystack = signals.finalUrl.toLowerCase();

  if (!signals.https) {
    add(2, 'sans HTTPS');
  }
  if (signals.domainAgeDays !== null && signals.domainAgeDays < VERY_YOUNG_DOMAIN_DAYS) {
    add(3, 'domaine créé il y a moins d’une semaine');
  } else if (signals.domainAgeDays !== null && signals.domainAgeDays < YOUNG_DOMAIN_DAYS) {
    add(2, 'domaine récent');
  }
  if (signals.redirects >= 3) {
    add(1, 'redirections multiples');
  }
  if (host && isShortener(host, registrable)) {
    add(1, 'lien raccourci');
  }
  if (isConfusingDomain(host, registrable)) {
    add(1, 'adresse longue ou confuse');
  }
  if (hasSensitiveToken(haystack)) {
    add(1, 'mots sensibles dans l’adresse');
  }
  if (registrable && isBrandImpersonation(host, registrable)) {
    add(2, 'imitation d’une marque connue');
  }

  return { score, labels };
}

export const urlSignalsRule: PostProcessRule = {
  name: 'url-signals',
  apply(current, { input }) {
    if (input.kind !== 'url') {
      return null;
    }
    // Un site officiel connu n'est jamais relevé (garde-fou anti-faux-positif).
    if (input.urlSignals.isOfficialDomain) {
      return null;
    }

    const { score, labels } = scoreUrlSignals(input.urlSignals);
    const target: VerdictLevel | null =
      score >= ARNAQUE_SCORE ? 'ARNAQUE_PROBABLE' : score >= SUSPECT_SCORE ? 'SUSPECT' : null;

    if (target === null || !isBelow(current.verdict, target)) {
      return null;
    }

    return {
      patch: {
        verdict: target,
        category: current.category === 'AUCUNE' ? 'AUTRE' : current.category,
        reasons: [...current.reasons, reasonFor(target)],
      },
      reason: `signaux d'URL (${labels.join(', ')}) : verdict relevé de ${current.verdict} à ${target}`,
    };
  },
};

function reasonFor(target: VerdictLevel): string {
  return target === 'ARNAQUE_PROBABLE'
    ? 'L’adresse de ce lien réunit plusieurs caractéristiques des faux sites : ne vous y connectez pas.'
    : 'L’adresse de ce lien a quelque chose d’inhabituel : par prudence, ne saisissez aucune donnée personnelle.';
}

function safeHostname(rawUrl: string): string {
  try {
    return new URL(rawUrl).hostname.toLowerCase();
  } catch {
    return '';
  }
}

function isShortener(host: string, registrable: string | null): boolean {
  return SHORTENER_DOMAINS.has(host) || (registrable !== null && SHORTENER_DOMAINS.has(registrable));
}

/** Adresse anormalement longue, très sous-domainée ou truffée de tirets. */
function isConfusingDomain(host: string, registrable: string | null): boolean {
  if (!host) {
    return false;
  }
  const dots = (host.match(/\./g) ?? []).length;
  const hyphens = (host.match(/-/g) ?? []).length;
  const registrableLength = registrable?.length ?? host.length;
  return host.length > 30 || dots >= 4 || hyphens >= 3 || registrableLength > 25;
}

function hasSensitiveToken(haystack: string): boolean {
  return SENSITIVE_TOKENS.some((token) => haystack.includes(token));
}

/**
 * Une marque connue apparaît comme label de l'hôte, mais le domaine
 * enregistrable n'est pas l'un de ses domaines légitimes (ex.
 * `paypal.com.securite.ru`). On découpe par `.` et `-` et on compare des labels
 * entiers pour éviter les faux positifs (`grapple` ne matche pas `apple`).
 */
function isBrandImpersonation(host: string, registrable: string): boolean {
  const labels = new Set(host.split(/[.-]/).filter(Boolean));
  for (const brand of KNOWN_BRANDS) {
    if (labels.has(brand.token) && !brand.legit.includes(registrable)) {
      return true;
    }
  }
  return false;
}
