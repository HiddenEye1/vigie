import type { AIVerdict } from './provider.js';

/**
 * Un scénario de fraude reconnaissable par mot-clé, avec le verdict complet
 * que Vigie rendrait. Sert au MockProvider (MOCK_AI=true) : il donne des
 * verdicts réalistes, au format étendu, sans aucun appel réseau.
 *
 * Ton : clair, humain, rassurant, sans jargon. Vouvoiement partout — c'est la
 * voix de l'app, et le tutoiement peut être ressenti comme infantilisant.
 */
export interface MockScenario {
  readonly id: string;
  readonly pattern: RegExp;
  readonly verdict: AIVerdict;
}

/**
 * ORDRE SIGNIFICATIF : du plus spécifique au plus générique. Le premier motif
 * qui correspond gagne. Ne déplacez pas un scénario sans vérifier les tests.
 */
export const MOCK_SCENARIOS: readonly MockScenario[] = [
  {
    id: 'demande-code-sms',
    // Exige un « donnez-moi / communiquez-nous » : « ne communiquez jamais ce
    // code » est au contraire un message légitime, il ne doit pas matcher.
    pattern: /(donnez|communiquez|transmettez|envoyez)[- ](moi|nous)[^.]{0,40}code|quel est le code (re[çc]u|de validation)/i,
    verdict: {
      verdict: 'ARNAQUE_PROBABLE',
      confidence: 0.95,
      category: 'FAUX_CONSEILLER_BANCAIRE',
      summary:
        'On vous demande le code reçu par SMS : c’est exactement ce que fait un escroc pour valider une opération à votre place.',
      reasons: [
        'Aucune banque, aucun conseiller, aucun service client ne demande le code reçu par SMS.',
        'Ce code sert à valider un paiement ou une connexion : le donner, c’est signer à la place de l’escroc.',
        'On vous met la pression pour vous empêcher de réfléchir.',
      ],
      actions: [
        'Ne donnez ce code à personne.',
        'Raccrochez et appelez le numéro au dos de votre carte bancaire.',
        'Prévenez votre banque qu’on a tenté de vous soutirer un code.',
      ],
      risk_level: 'CRITICAL',
      score: 98,
      senior_summary:
        'Ne donnez ce code à personne, même à quelqu’un qui dit être votre banque.',
      do_not: 'Ne communiquez jamais un code reçu par SMS, à qui que ce soit.',
    },
  },
  {
    id: 'faux-proche-urgence',
    pattern:
      /(nouveau num[ée]ro|chang[ée] de num[ée]ro)[^.]{0,60}(maman|papa|c’?est moi|c'?est moi)|(maman|papa|c’?est moi|c'?est moi)[^.]{0,60}(nouveau num[ée]ro|chang[ée] de num[ée]ro)|t[ée]l[ée]phone (est )?cass[ée]/i,
    verdict: {
      verdict: 'ARNAQUE_PROBABLE',
      confidence: 0.92,
      category: 'SMISHING_AUTRE',
      summary:
        'Quelqu’un se fait passer pour votre enfant depuis un nouveau numéro : c’est l’arnaque au faux proche.',
      reasons: [
        'Un proche qui change de numéro ne vous demande pas de l’argent dans la foulée.',
        'Le message installe l’urgence pour vous empêcher de vérifier.',
        'Ce même message est envoyé à des milliers de parents en même temps.',
      ],
      actions: [
        'N’envoyez aucun argent.',
        'Appelez votre proche sur son ancien numéro pour vérifier.',
        'Signalez le message au 33700.',
      ],
      risk_level: 'CRITICAL',
      score: 95,
      senior_summary:
        'Ce n’est probablement pas votre enfant. Appelez-le sur son ancien numéro avant de faire quoi que ce soit.',
      do_not: 'N’envoyez jamais d’argent à un nouveau numéro qui dit être un proche.',
    },
  },
  {
    id: 'virement-urgent',
    pattern:
      /virement urgent|faire un virement[^.]{0,30}(urgent|tout de suite|imm[ée]diatement)|besoin que (tu|vous)[^.]{0,40}virement/i,
    verdict: {
      verdict: 'ARNAQUE_PROBABLE',
      confidence: 0.9,
      category: 'SMISHING_AUTRE',
      summary:
        'On vous presse de faire un virement immédiat : l’urgence est l’outil principal des escrocs.',
      reasons: [
        'Une demande de virement urgente et inattendue est presque toujours une fraude.',
        'La panique vous empêche de prendre le temps de vérifier.',
        'Un virement parti est très difficile à récupérer.',
      ],
      actions: [
        'Ne faites aucun virement.',
        'Rappelez la personne ou l’organisme sur un numéro que vous connaissez déjà.',
        'Parlez-en à un proche avant toute décision.',
      ],
      risk_level: 'CRITICAL',
      score: 94,
      senior_summary:
        'Ne faites aucun virement dans l’urgence. Prenez le temps d’appeler pour vérifier.',
      do_not:
        'Ne faites jamais un virement demandé en urgence, même si le message semble venir d’un proche.',
    },
  },
  {
    id: 'faux-remboursement',
    pattern:
      /rembours(ement|er)[^.]{0,60}(imp[ôo]ts|caf|ameli|s[ée]curit[ée] sociale|edf|urssaf|mutuelle)|vous avez droit [àa] un remboursement/i,
    verdict: {
      verdict: 'ARNAQUE_PROBABLE',
      confidence: 0.9,
      category: 'PHISHING_ADMINISTRATION',
      summary:
        'Un remboursement inattendu à réclamer par un lien : c’est un piège classique pour voler vos coordonnées bancaires.',
      reasons: [
        'Les administrations remboursent automatiquement : elles ne demandent jamais vos coordonnées par SMS.',
        'Le lien imite un site officiel, mais ce n’en est pas un.',
        'La promesse d’argent fait baisser la vigilance.',
      ],
      actions: [
        'Ne cliquez pas sur le lien.',
        'Connectez-vous directement au site officiel pour vérifier.',
        'Signalez le message sur signal-spam.fr.',
      ],
      risk_level: 'HIGH',
      score: 90,
      senior_summary:
        'Personne ne vous doit d’argent par SMS. Ne cliquez pas et n’entrez jamais votre numéro de carte.',
      do_not: 'N’entrez jamais vos coordonnées bancaires pour recevoir un remboursement.',
    },
  },
  {
    id: 'faux-conseiller-bancaire',
    pattern: /banque|conseiller|carte bancaire|compte bloqu[ée]|virement suspect|opposition/i,
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
      risk_level: 'CRITICAL',
      score: 97,
      senior_summary:
        'Votre banque ne vous appellera jamais pour vos codes. Raccrochez, puis appelez le numéro au dos de votre carte.',
      do_not:
        'Ne communiquez jamais vos codes, même à quelqu’un qui dit être votre conseiller.',
    },
  },
  {
    id: 'faux-colis',
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
      risk_level: 'HIGH',
      score: 92,
      senior_summary:
        'Un vrai transporteur ne réclame pas d’argent par SMS. Ne cliquez pas sur le lien.',
      do_not: 'Ne payez aucun frais de livraison réclamé par SMS.',
    },
  },
  {
    id: 'fraude-cpf',
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
      risk_level: 'HIGH',
      score: 89,
      senior_summary:
        'Le démarchage sur le compte formation est interdit par la loi. C’est une arnaque.',
      do_not: 'Ne donnez jamais vos identifiants Mon Compte Formation.',
    },
  },
  {
    id: 'fausse-administration',
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
      risk_level: 'MEDIUM',
      score: 67,
      senior_summary:
        'Ce message imite une administration. Ne cliquez pas : allez vous-même sur le site officiel.',
      do_not: 'Ne payez jamais une amende ou une taxe via un lien reçu par SMS.',
    },
  },
  {
    id: 'faux-support-technique',
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
      risk_level: 'CRITICAL',
      score: 93,
      senior_summary:
        'Microsoft et Apple ne vous appellent jamais. N’installez rien et n’appelez pas le numéro affiché.',
      do_not:
        'N’installez aucun logiciel et ne laissez personne prendre le contrôle de votre ordinateur.',
    },
  },
  {
    id: 'investissement-frauduleux',
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
      risk_level: 'HIGH',
      score: 91,
      senior_summary: 'Un gain garanti sans risque, ça n’existe pas. Ne versez pas d’argent.',
      do_not:
        'Ne versez jamais d’argent sur un placement proposé par message ou par téléphone.',
    },
  },
  {
    id: 'arnaque-petites-annonces',
    pattern: /vinted|leboncoin|le bon coin|marketplace|remboursement acheteur/i,
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
      risk_level: 'MEDIUM',
      score: 65,
      senior_summary:
        'Restez sur le site officiel. Ne payez jamais en dehors de la plateforme.',
      do_not: 'Ne saisissez jamais votre carte bancaire sur un lien reçu par message.',
    },
  },
  {
    id: 'faux-paiement',
    pattern:
      /(lien|page) de paiement|paiement s[ée]curis[ée]|r[ée]gler (des |les )?frais|frais de (dossier|traitement)/i,
    verdict: {
      verdict: 'ARNAQUE_PROBABLE',
      confidence: 0.88,
      category: 'SMISHING_AUTRE',
      summary:
        'On vous envoie un lien pour « régler des frais » : c’est une fausse page de paiement, faite pour capter votre carte.',
      reasons: [
        'Une vraie facture ne se règle jamais via un lien reçu par SMS.',
        'La page imite un site connu, mais l’adresse n’est pas la bonne.',
        'Les montants demandés sont petits pour ne pas éveiller les soupçons.',
      ],
      actions: [
        'Ne cliquez pas sur le lien.',
        'Vérifiez directement sur le site officiel de l’organisme.',
        'Transférez le message au 33700.',
      ],
      risk_level: 'HIGH',
      score: 90,
      senior_summary: 'N’entrez jamais votre carte sur une page ouverte depuis un SMS.',
      do_not: 'Ne payez jamais des « frais » réclamés par message.',
    },
  },
  {
    id: 'arnaque-emploi',
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
      risk_level: 'HIGH',
      score: 88,
      senior_summary:
        'Un vrai employeur ne recrute pas par SMS et ne demande jamais d’argent.',
      do_not: 'Ne payez jamais pour obtenir un emploi et n’envoyez pas vos papiers d’identité.',
    },
  },
  {
    id: 'arnaque-sentimentale',
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
      risk_level: 'HIGH',
      score: 87,
      senior_summary:
        'Une personne jamais rencontrée qui demande de l’argent, c’est une arnaque. Parlez-en à un proche.',
      do_not: 'N’envoyez jamais d’argent à quelqu’un rencontré uniquement sur internet.',
    },
  },
  {
    id: 'qr-code-frauduleux',
    pattern: /qr[- ]?code/i,
    verdict: {
      verdict: 'SUSPECT',
      confidence: 0.75,
      category: 'AUTRE',
      summary:
        'Un QR code peut cacher n’importe quelle adresse : c’est devenu un moyen courant de piéger les gens.',
      reasons: [
        'On ne voit pas où mène un QR code avant de l’avoir scanné.',
        'De faux QR codes sont collés sur les parcmètres, les bornes et jusque dans des courriers.',
        'La page qui s’ouvre imite souvent un site officiel.',
      ],
      actions: [
        'Ne scannez pas ce QR code si vous ne savez pas d’où il vient.',
        'Tapez vous-même l’adresse du site officiel dans votre navigateur.',
        'En cas de doute, demandez à un proche.',
      ],
      risk_level: 'MEDIUM',
      score: 62,
      senior_summary: 'Ne scannez pas un QR code dont vous ne connaissez pas l’origine.',
      do_not: 'N’entrez jamais votre carte bancaire sur une page ouverte depuis un QR code.',
    },
  },
  {
    id: 'lien-suspect',
    pattern: /bit\.ly|tinyurl|cutt\.ly|t\.co\/|lien raccourci|cliquez (ici|sur ce lien)/i,
    verdict: {
      verdict: 'SUSPECT',
      confidence: 0.7,
      category: 'SMISHING_AUTRE',
      summary:
        'Ce message pousse à cliquer sur un lien qu’on ne peut pas vérifier : c’est un signal d’alerte.',
      reasons: [
        'Un lien raccourci cache la véritable adresse du site.',
        'Un message légitime n’a pas besoin de vous presser de cliquer.',
        'Un simple clic peut suffire à installer un logiciel espion.',
      ],
      actions: [
        'Ne cliquez pas sur le lien.',
        'Allez sur le site officiel en tapant vous-même l’adresse.',
        'Transférez le message au 33700.',
      ],
      risk_level: 'MEDIUM',
      score: 66,
      senior_summary: 'Ne cliquez pas. Si c’est important, l’organisme vous contactera autrement.',
      do_not: 'Ne cliquez jamais sur un lien raccourci reçu par message.',
    },
  },
  {
    id: 'numero-inconnu-insistant',
    pattern: /num[ée]ro inconnu|rappelez[- ](nous|ce num[ée]ro)|appel en absence|appels r[ée]p[ée]t[ée]s/i,
    verdict: {
      verdict: 'SUSPECT',
      confidence: 0.68,
      category: 'AUTRE',
      summary:
        'Un numéro inconnu qui insiste ou vous fait rappeler : c’est souvent un appel surtaxé ou un démarchage frauduleux.',
      reasons: [
        'Les escrocs font sonner une seule fois pour que vous rappeliez.',
        'Le rappel peut être facturé très cher.',
        'Un organisme sérieux vous laisse un message et un moyen de vérifier.',
      ],
      actions: [
        'Ne rappelez pas ce numéro.',
        'Bloquez-le dans votre téléphone.',
        'Signalez le numéro au 33700.',
      ],
      risk_level: 'MEDIUM',
      score: 60,
      senior_summary: 'Ne rappelez pas un numéro inconnu qui a laissé sonner une seule fois.',
      do_not: 'Ne rappelez jamais un numéro inconnu qui insiste.',
    },
  },
];
