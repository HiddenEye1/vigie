/**
 * Messages d'erreur de l'API, en français simple, réutilisables tels quels
 * dans l'interface de l'application (§6 du cahier des charges).
 */
export const API_MESSAGES = {
  invalidRequest:
    'Votre demande n’a pas pu être traitée. Vérifiez le contenu envoyé, puis réessayez.',
  kindNotAvailableYet:
    'Ce type de vérification n’est pas encore disponible. Pour le moment, seule la vérification d’un texte est possible.',
  rateLimited:
    'Vous avez atteint le nombre maximal de vérifications pour le moment. Merci de réessayer un peu plus tard.',
  aiUnavailable:
    'Le service d’analyse est momentanément indisponible. Merci de réessayer dans quelques instants.',
  notFound: 'Cette page n’existe pas.',
} as const;
