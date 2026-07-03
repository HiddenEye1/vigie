import officialDomainsFile from '../data/official-domains.json' with { type: 'json' };

const OFFICIAL_DOMAINS: readonly string[] = officialDomainsFile.domains.map((d) => d.toLowerCase());

/** true si le hostname est un domaine officiel de la liste locale, ou un de ses sous-domaines. */
export function isOfficialDomain(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/\.$/, '');
  return OFFICIAL_DOMAINS.some((domain) => host === domain || host.endsWith(`.${domain}`));
}
