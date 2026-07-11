import type { EmergencyParcours } from '../types';

/**
 * « Arnaque en direct ». Pour quelqu'un déjà en train de se faire manipuler, ou
 * qui pense avoir fait une erreur. Ce n'est PAS un questionnaire : on affiche
 * d'abord les consignes qui coupent l'arnaque, puis on aide à agir selon ce qui
 * s'est passé. Ton calme, très peu de texte, jamais culpabilisant.
 */

const IMMEDIATE_STEPS: readonly string[] = [
  'Raccrochez si vous êtes au téléphone.',
  'Ne donnez aucun code.',
  'Ne payez rien.',
  'Ne cliquez sur aucun lien.',
  'Ne téléchargez aucune application.',
  'Ne laissez personne prendre le contrôle de votre téléphone ou de votre ordinateur.',
  'Contactez un proche ou votre banque depuis un numéro officiel.',
];

export const arnaqueEnDirect = {
  kind: 'emergency',
  id: 'arnaque-en-direct',
  title: 'Arnaque en direct',
  intro: 'Vous pensez être en train de vous faire arnaquer ? Voici quoi faire, tout de suite.',
  icon: 'shield-half-outline',
  immediateSteps: IMMEDIATE_STEPS,
  situations: [
    {
      id: 'au-telephone',
      label: 'Je suis au téléphone avec la personne',
      icon: 'call-outline',
      heading: 'Vous êtes au téléphone',
      actions: [
        'Raccrochez maintenant. Vous n’avez pas à vous justifier.',
        'Ne rappelez pas ce numéro.',
        'Si vous avez communiqué des informations, appelez votre banque au numéro au dos de votre carte.',
        'Prévenez un proche de confiance.',
      ],
    },
    {
      id: 'donne-code',
      label: 'J’ai donné un code',
      icon: 'keypad-outline',
      heading: 'Vous avez donné un code',
      actions: [
        'Appelez votre banque au numéro inscrit au dos de votre carte.',
        'Demandez à bloquer l’opération et à faire opposition si besoin.',
        'Changez le mot de passe du compte concerné.',
        'Gardez les messages reçus comme preuve.',
        'Signalez le SMS au 33700.',
      ],
    },
    {
      id: 'envoye-argent',
      label: 'J’ai envoyé de l’argent',
      icon: 'cash-outline',
      heading: 'Vous avez envoyé de l’argent',
      actions: [
        'Appelez votre banque tout de suite pour tenter de bloquer ou rappeler le paiement.',
        'Faites opposition si vous avez utilisé votre carte.',
        'Gardez toutes les preuves (messages, reçus, références).',
        'Portez plainte et signalez les faits.',
        'Prévenez un proche de confiance.',
      ],
    },
    {
      id: 'clique-lien',
      label: 'J’ai cliqué sur un lien',
      icon: 'link-outline',
      heading: 'Vous avez cliqué sur un lien',
      actions: [
        'Ne saisissez rien sur la page et fermez-la.',
        'Si vous avez entré un identifiant, changez ce mot de passe.',
        'Surveillez vos comptes les jours suivants.',
        'Signalez le message au 33700 ou sur signal-spam.fr.',
      ],
    },
    {
      id: 'installe-app',
      label: 'J’ai installé une application',
      icon: 'download-outline',
      heading: 'Vous avez installé une application',
      actions: [
        'Coupez internet : activez le mode avion.',
        'Désinstallez l’application tout de suite.',
        'Ne laissez personne prendre le contrôle de l’appareil.',
        'Redémarrez l’appareil, puis faites-le vérifier par un proche.',
        'Changez vos mots de passe importants depuis un autre appareil.',
      ],
    },
    {
      id: 'donne-banque',
      label: 'J’ai donné mes informations bancaires',
      icon: 'card-outline',
      heading: 'Vous avez donné vos informations bancaires',
      actions: [
        'Appelez votre banque au numéro au dos de votre carte.',
        'Faites opposition sur la carte.',
        'Surveillez vos opérations et contestez tout prélèvement inconnu.',
        'Gardez les preuves et portez plainte.',
      ],
    },
    {
      id: 'je-ne-sais-pas',
      label: 'Je ne sais pas quoi faire',
      icon: 'help-outline',
      heading: 'On avance ensemble, calmement',
      actions: [
        'Arrêtez tout contact : ne répondez plus, ne payez rien, ne donnez rien.',
        'Appelez un proche de confiance pour en parler.',
        'En cas de doute sur votre banque, appelez-la au numéro officiel.',
        'Vous pouvez être aidé et signaler sur cybermalveillance.gouv.fr.',
      ],
    },
  ],
} as const satisfies EmergencyParcours;
