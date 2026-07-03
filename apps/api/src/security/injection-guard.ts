/**
 * Détection d'injection de prompt dans le contenu analysé (§7 point 9).
 *
 * Défense en profondeur : le prompt système demande déjà au modèle de traiter
 * le contenu comme une donnée, mais ce garde-fou s'exécute côté serveur,
 * indépendamment du fournisseur d'IA. Si le contenu contient des instructions
 * adressées à l'IA, le verdict ne peut JAMAIS être PLUTOT_SUR.
 */

interface InjectionPattern {
  readonly pattern: RegExp;
  readonly label: string;
}

const INJECTION_PATTERNS: readonly InjectionPattern[] = [
  {
    pattern:
      /(ignore|ignorez?|oublie[sz]?)\s+(toutes?\s+)?(tes|vos|les|ces)\s+(instructions|r[eè]gles|consignes|directives)/i,
    label: 'demande d’ignorer les règles',
  },
  {
    pattern:
      /(disregard|ignore|forget)\s+(all\s+)?(previous|above|prior|your)\s+(instructions|rules|guidelines)/i,
    label: 'demande d’ignorer les règles (anglais)',
  },
  {
    pattern: /nouvelles?\s+instructions?\s*:/i,
    label: 'tentative de nouvelles instructions',
  },
  {
    pattern:
      /(r[eé]ponds?|dis|dites|indique[sz]?|affirme[sz]?|confirme[sz]?)\s+que\s+(ce\s+(message|contenu|sms|mail|e-mail)\s+)?(est\s+)?(s[uû]r|fiable|l[eé]gitime|sans\s+danger|inoffensif)/i,
    label: 'demande de déclarer le contenu sûr',
  },
  {
    pattern:
      /(respond|reply|say|answer)\s+(that\s+)?((this|it|the)\s+)?(message\s+|content\s+)?(is\s+)?(safe|legitimate|harmless)/i,
    label: 'demande de déclarer le contenu sûr (anglais)',
  },
  {
    pattern:
      /(classe[sz]?|classifie[sz]?|marque[sz]?|mark|classify)\s+(ce|le|this|it)\s*(message|contenu|content)?\s+(comme|as)/i,
    label: 'demande de classification imposée',
  },
  {
    pattern: /PLUTOT_SUR|AUCUN\s+SIGNAL\s+D['’]ARNAQUE\s+D[EÉ]TECT[EÉ]/,
    label: 'verdict imposé dans le contenu',
  },
  {
    pattern: /system\s*prompt|prompt\s*syst[eè]me/i,
    label: 'référence au prompt système',
  },
  {
    pattern:
      /(tu es|vous [eê]tes|you are)\s+((une?|an?)\s+)?(ia|ai|intelligence artificielle|assistant|mod[eè]le de langage|llm|chatbot)\b/i,
    label: 'contenu adressé à une IA',
  },
  {
    pattern: /en tant qu['’](ia|assistant|mod[eè]le)/i,
    label: 'contenu adressé à une IA',
  },
  {
    pattern: /\b(jailbreak|mode\s+dan|dan\s+mode|developer\s+mode)\b/i,
    label: 'tentative de contournement connue',
  },
  {
    pattern: /(note|message)\s+(pour|à destination de)\s+l['’]?(ia|assistant|analyseur|robot)/i,
    label: 'note adressée à l’outil d’analyse',
  },
];

/**
 * Retourne les libellés des signaux d'injection détectés (vide si aucun).
 */
export function detectInjectionSignals(content: string): string[] {
  const labels = new Set<string>();
  for (const { pattern, label } of INJECTION_PATTERNS) {
    if (pattern.test(content)) {
      labels.add(label);
    }
  }
  return [...labels];
}
