/**
 * Messages d'erreur de l'API, en français simple, réutilisables tels quels
 * dans l'interface de l'application (§6 du cahier des charges).
 */
export const API_MESSAGES = {
  invalidRequest:
    'Votre demande n’a pas pu être traitée. Vérifiez le contenu envoyé, puis réessayez.',
  urlBlocked:
    'Cette adresse ne peut pas être vérifiée : elle ne correspond pas à une adresse de site web publique et valide.',
  imageInvalid:
    'Ce fichier n’est pas une image prise en charge. Envoyez une capture d’écran au format JPEG, PNG ou WebP.',
  imageTooLarge: 'Cette image est trop lourde. La taille maximale est de 8 Mo.',
  serviceUnavailable:
    'Ce service est momentanément indisponible. Merci de réessayer un peu plus tard.',
  rateLimited:
    'Vous avez atteint le nombre maximal de vérifications pour le moment. Merci de réessayer un peu plus tard.',
  aiUnavailable:
    'Le service d’analyse est momentanément indisponible. Merci de réessayer dans quelques instants.',
  notFound: 'Cette page n’existe pas.',
} as const;
