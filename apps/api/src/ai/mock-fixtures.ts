import type { AIVerdict } from './provider.js';

/**
 * Verdicts réalistes servis par MockProvider (MOCK_AI=true).
 * Règles par mots-clés d'abord, puis rotation déterministe sur les 4 verdicts,
 * afin que l'UI soit testable dans tous ses états sans clé API.
 */
export interface MockRule {
  readonly pattern: RegExp;
  readonly verdict: AIVerdict;
}

export const MOCK_RULES: readonly MockRule[] = [
  {
    pattern: /colis|livraison|chronopost|colissimo|douane/i,
    verdict: {
      verdict: 'ARNAQUE_PROBABLE',
      confidence: 0.93,
      category: 'PHISHING_COLIS',
      summary: 'C’est la fausse notification de colis classique, envoyée en masse par SMS.',
      reasons: [
        'On vous réclame des frais pour débloquer un colis, ce que les vrais transporteurs ne font pas par SMS.',
        'Le lien ne pointe pas vers le site officiel du transporteur.',
        'Le message joue sur l’urgence pour vous faire cliquer sans réfléchir.',
      ],
      actions: [
        'Ne cliquez pas sur le lien.',
        'Transférez le SMS au 33700 pour le signaler.',
        'Si vous attendez vraiment un colis, vérifiez sur le site officiel du transporteur avec votre numéro de suivi.',
      ],
    },
  },
  {
    pattern: /banque|conseiller|carte bancaire|compte bloqué|virement suspect|opposition/i,
    verdict: {
      verdict: 'ARNAQUE_PROBABLE',
      confidence: 0.95,
      category: 'FAUX_CONSEILLER_BANCAIRE',
      summary: 'C’est le scénario classique du faux conseiller bancaire.',
      reasons: [
        'Votre vraie banque ne vous demande jamais vos codes ni de valider une opération par téléphone ou SMS.',
        'Le message crée un sentiment d’urgence pour vous faire agir sans vérifier.',
        'Les escrocs se font passer pour le service anti-fraude afin de gagner votre confiance.',
      ],
      actions: [
        'Ne communiquez jamais vos codes, même à un prétendu conseiller.',
        'Raccrochez et appelez le numéro au dos de votre carte bancaire.',
        'Transférez le SMS au 33700 pour le signaler.',
      ],
    },
  },
  {
    pattern: /imp[oô]ts?|amende|antai|ameli|cpam|crit'?air|france travail|caf\b/i,
    verdict: {
      verdict: 'SUSPECT',
      confidence: 0.78,
      category: 'PHISHING_ADMINISTRATION',
      summary:
        'Ce message imite une administration française, ce qui est très courant chez les escrocs.',
      reasons: [
        'Les administrations ne réclament pas de paiement par SMS avec un lien.',
        'Le lien ne se termine pas par le vrai domaine officiel en .gouv.fr.',
        'Le ton menaçant (amende, majoration) sert à vous faire agir vite.',
      ],
      actions: [
        'Ne cliquez pas sur le lien.',
        'Connectez-vous directement au site officiel de l’administration concernée pour vérifier.',
        'Signalez le message sur signal-spam.fr.',
      ],
    },
  },
  {
    pattern: /crypto|bitcoin|placement|investi|livret|rendement|trading/i,
    verdict: {
      verdict: 'ARNAQUE_PROBABLE',
      confidence: 0.9,
      category: 'INVESTISSEMENT_FRAUDULEUX',
      summary: 'Cette promesse de gains faciles ressemble fort à un faux placement.',
      reasons: [
        'Un rendement élevé garanti sans risque, cela n’existe pas.',
        'On vous presse d’investir vite pour ne pas « rater l’occasion ».',
        'Les faux conseillers en placement sont l’une des arnaques les plus coûteuses en France.',
      ],
      actions: [
        'Ne versez aucun argent.',
        'Vérifiez si le site figure sur la liste noire de l’AMF (amf-france.org).',
        'Parlez-en à votre banque avant tout virement.',
      ],
    },
  },
  {
    pattern: /vinted|leboncoin|le bon coin|remboursement acheteur|paiement s[eé]curis[eé]/i,
    verdict: {
      verdict: 'SUSPECT',
      confidence: 0.72,
      category: 'ARNAQUE_PETITES_ANNONCES',
      summary: 'Ce message ressemble aux arnaques courantes sur les sites de petites annonces.',
      reasons: [
        'On vous pousse à discuter ou payer en dehors de la plateforme officielle.',
        'Les escrocs envoient de faux liens de « paiement sécurisé » qui imitent le site.',
      ],
      actions: [
        'Restez toujours dans la messagerie et le paiement officiels de la plateforme.',
        'Ne saisissez jamais vos coordonnées bancaires sur un lien reçu par SMS ou e-mail.',
        'Signalez le profil à la plateforme.',
      ],
    },
  },
  {
    pattern: /cpf|compte formation|droits formation/i,
    verdict: {
      verdict: 'ARNAQUE_PROBABLE',
      confidence: 0.88,
      category: 'FRAUDE_CPF_AIDES',
      summary: 'Le démarchage au sujet du compte formation (CPF) est interdit : c’est une arnaque.',
      reasons: [
        'Depuis 2022, tout démarchage téléphonique ou par SMS sur le CPF est illégal.',
        'Les escrocs cherchent à vider vos droits à la formation ou à voler vos identifiants.',
      ],
      actions: [
        'Ne donnez jamais vos identifiants Mon Compte Formation.',
        'Transférez le SMS au 33700.',
        'Consultez vos droits uniquement sur moncompteformation.gouv.fr.',
      ],
    },
  },
  {
    pattern: /travail à domicile|recrutement|liker des vidéos|offre d'emploi|salaire attractif/i,
    verdict: {
      verdict: 'ARNAQUE_PROBABLE',
      confidence: 0.87,
      category: 'ARNAQUE_EMPLOI',
      summary: 'Cette offre d’emploi trop belle ressemble aux fausses offres envoyées en masse.',
      reasons: [
        'Un vrai employeur ne recrute pas par SMS ou WhatsApp sans entretien.',
        'La rémunération promise est très élevée pour des tâches très simples.',
      ],
      actions: [
        'Ne payez jamais pour obtenir un emploi et n’envoyez pas vos papiers d’identité.',
        'Signalez le message au 33700.',
      ],
    },
  },
  {
    pattern: /mon amour|ma ch[eé]rie|frais de douane.*(te|vous) rembours|militaire en mission/i,
    verdict: {
      verdict: 'ARNAQUE_PROBABLE',
      confidence: 0.86,
      category: 'ARNAQUE_SENTIMENTALE',
      summary:
        'Ce message ressemble à une arnaque sentimentale : une relation à distance qui finit par demander de l’argent.',
      reasons: [
        'Une personne jamais rencontrée physiquement demande de l’argent.',
        'Le scénario (mission à l’étranger, frais imprévus, remboursement promis) est un grand classique.',
      ],
      actions: [
        'N’envoyez jamais d’argent à une personne rencontrée uniquement en ligne.',
        'Parlez-en à un proche de confiance avant toute décision.',
      ],
    },
  },
  {
    pattern: /microsoft|apple|virus|ordinateur (est )?infect[eé]|support technique/i,
    verdict: {
      verdict: 'ARNAQUE_PROBABLE',
      confidence: 0.91,
      category: 'FAUX_SUPPORT_TECHNIQUE',
      summary: 'C’est la fausse alerte au virus typique du faux support technique.',
      reasons: [
        'Microsoft ou Apple ne vous contactent jamais pour un virus sur votre ordinateur.',
        'On cherche à vous faire appeler un numéro ou installer un logiciel de prise de contrôle.',
      ],
      actions: [
        'N’appelez pas le numéro affiché et n’installez rien.',
        'Fermez la fenêtre ou redémarrez l’appareil.',
        'En cas de doute, consultez cybermalveillance.gouv.fr.',
      ],
    },
  },
];

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
  },
];
