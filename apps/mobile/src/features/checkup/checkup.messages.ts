/**
 * Messages partageables du Check-up sécurité.
 *
 * Confidentialité (§8) : ces textes sont volontairement GÉNÉRIQUES — aucun
 * contenu analysé, aucun verdict, aucun score, aucune donnée personnelle, aucun
 * destinataire. Ils sont partagés par l'utilisateur via la feuille système
 * (jamais envoyés automatiquement, jamais tracés).
 */

/**
 * Rappel à partager avec ses proches (item « proches-argent ») : on n'envoie
 * jamais d'argent à un nouveau numéro. Signature identique aux autres messages
 * Vigie.
 */
export function buildMoneyReminderMessage(): string {
  return [
    'Bonjour, un petit rappel de prudence : on n’envoie jamais d’argent à un nouveau numéro, ni à quelqu’un qui dit avoir changé de numéro — même si le message a l’air de venir d’un proche. Au moindre doute, on s’appelle.',
    '— Envoyé avec Vigie',
  ].join('\n\n');
}
