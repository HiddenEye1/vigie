import type { AIVerdict } from './provider.js';

/**
 * Fixtures du MockProvider qui ne dépendent pas d'un mot-clé : analyse d'URL
 * et rotation déterministe. Le corpus de scénarios par mot-clé vit dans
 * `mock-scenarios.ts`.
 *
 * Tous les verdicts sont au format étendu (risk_level, score, senior_summary,
 * do_not) pour que l'app affiche exactement ce qu'elle affichera en réel.
 */

/** Fixtures dédiées à l'analyse d'URL (mode mock). */
export const MOCK_URL_OFFICIAL: AIVerdict = {
  verdict: 'PLUTOT_SUR',
  confidence: 0.85,
  category: 'AUCUNE',
  summary: 'Ce lien pointe vers un site officiel connu.',
  reasons: [
    'Le domaine figure dans la liste des sites officiels français.',
    'La connexion est chiffrée (HTTPS).',
  ],
  actions: [
    'Vérifiez toujours que l’adresse affichée dans votre navigateur est bien la même.',
    'En cas de doute sur un paiement, contactez directement votre banque.',
  ],
  risk_level: 'LOW',
  score: 8,
  senior_summary: 'Ce lien mène bien à un site officiel. Vous pouvez continuer, en restant attentif.',
  do_not: 'Ne saisissez jamais vos identifiants sur une page ouverte depuis un message.',
};

export const MOCK_URL_YOUNG_DOMAIN: AIVerdict = {
  verdict: 'ARNAQUE_PROBABLE',
  confidence: 0.9,
  category: 'FAUX_SITE_ECOMMERCE',
  summary: 'Ce site a été créé très récemment, ce qui est typique des faux sites.',
  reasons: [
    'Le domaine a été enregistré il y a moins d’un mois.',
    'Les escrocs créent des sites jetables qui disparaissent en quelques semaines.',
  ],
  actions: [
    'N’achetez rien et ne saisissez aucune coordonnée bancaire sur ce site.',
    'Signalez l’adresse sur cybermalveillance.gouv.fr.',
  ],
  risk_level: 'CRITICAL',
  score: 93,
  senior_summary: 'Ce site vient d’être créé. N’achetez rien et n’entrez pas votre carte.',
  do_not: 'N’entrez jamais vos coordonnées bancaires sur ce site.',
};

export const MOCK_URL_NO_HTTPS: AIVerdict = {
  verdict: 'SUSPECT',
  confidence: 0.7,
  category: 'AUTRE',
  summary: 'Ce site n’utilise pas de connexion sécurisée : soyez prudent.',
  reasons: [
    'La connexion n’est pas chiffrée (pas de HTTPS).',
    'Aucun site sérieux ne demande des informations personnelles sans connexion sécurisée.',
  ],
  actions: [
    'Ne saisissez aucune information personnelle ou bancaire sur ce site.',
    'Cherchez le site officiel de l’organisme via votre moteur de recherche.',
  ],
  risk_level: 'MEDIUM',
  score: 64,
  senior_summary: 'Cette page n’est pas sécurisée. N’y entrez aucune information.',
  do_not: 'Ne saisissez aucune information personnelle sur une page non sécurisée.',
};

/**
 * Verdicts de rotation (contenu sans mot-clé reconnu) : l'index est choisi de
 * façon déterministe à partir du contenu, pour couvrir les 4 états de l'UI.
 */
export const MOCK_ROTATION: readonly [AIVerdict, AIVerdict, AIVerdict, AIVerdict] = [
  {
    verdict: 'ARNAQUE_PROBABLE',
    confidence: 0.9,
    category: 'SMISHING_AUTRE',
    summary: 'Ce message cumule plusieurs signaux typiques des SMS frauduleux.',
    reasons: [
      'Le message crée une urgence artificielle.',
      'Il contient un lien raccourci impossible à vérifier.',
    ],
    actions: ['Ne cliquez pas sur le lien.', 'Transférez le SMS au 33700.'],
    risk_level: 'CRITICAL',
    score: 92,
    senior_summary: 'Ce message a tout d’une arnaque. Ne cliquez sur rien et ne répondez pas.',
    do_not: 'Ne cliquez sur aucun lien et ne communiquez aucune information.',
  },
  {
    verdict: 'SUSPECT',
    confidence: 0.65,
    category: 'AUTRE',
    summary: 'Plusieurs éléments de ce message sont inhabituels : restez prudent.',
    reasons: [
      'L’expéditeur n’est pas clairement identifiable.',
      'Le message vous pousse à agir rapidement.',
    ],
    actions: [
      'Ne répondez pas et ne cliquez sur aucun lien.',
      'Contactez l’organisme concerné par ses canaux officiels pour vérifier.',
    ],
    risk_level: 'MEDIUM',
    score: 63,
    senior_summary:
      'Ce message est douteux. Ne répondez pas et demandez à un proche si vous hésitez.',
    do_not: 'Ne communiquez aucun code ni aucune information bancaire.',
  },
  {
    verdict: 'PLUTOT_SUR',
    confidence: 0.82,
    category: 'AUCUNE',
    summary: 'Ce message ne présente aucun des signaux d’arnaque habituels.',
    reasons: [
      'Aucune demande d’argent, de code ou de donnée personnelle.',
      'Pas de lien suspect ni de pression à agir vite.',
    ],
    actions: [
      'Restez attentif : un vrai contact peut être imité.',
      'En cas de doute sur un paiement, contactez directement votre banque.',
    ],
    risk_level: 'LOW',
    score: 10,
    senior_summary:
      'Rien d’inquiétant dans ce message. Restez tout de même prudent si on vous demande de l’argent.',
    do_not: 'Ne donnez jamais un code reçu par SMS, même si le message paraît normal.',
  },
  {
    verdict: 'INDETERMINE',
    confidence: 0.3,
    category: 'AUCUNE',
    summary: 'Ce contenu est trop court ou trop vague pour que je puisse me prononcer.',
    reasons: ['Le message ne contient pas assez d’éléments pour une analyse fiable.'],
    actions: [
      'Envoyez le message complet, avec le numéro ou l’adresse de l’expéditeur si possible.',
      'En cas de doute, ne cliquez sur aucun lien.',
    ],
    risk_level: 'MEDIUM',
    score: 50,
    senior_summary:
      'Je ne peux pas me prononcer. Par sécurité, ne faites rien et demandez à un proche.',
    do_not: 'Ne transmettez aucune information personnelle ou bancaire tant que vous n’êtes pas sûr.',
  },
];
