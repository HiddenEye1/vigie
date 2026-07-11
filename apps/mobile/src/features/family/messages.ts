import type { AnalyzeResponse, VerdictLevel } from '@vigie/shared';
import { Platform } from 'react-native';
import { z } from 'zod';

import { CATEGORY_LABELS } from '@/lib/verdict-ui';

import type { ContactChannel, TrustedContact } from './contact.store';

/** Numéro français ou international, saisi souplement (espaces, points, tirets). */
const PHONE_PATTERN = /^[+0-9][0-9 .\-()]{5,}$/;

/**
 * Devine le moyen de contact à partir de ce que le senior a tapé :
 * une adresse e-mail (contient @) ou un numéro. `null` si ni l'un ni l'autre.
 */
export function detectChannel(raw: string): ContactChannel | null {
  const value = raw.trim();
  if (value.length === 0) {
    return null;
  }
  if (value.includes('@')) {
    return z.email().safeParse(value.toLowerCase()).success ? 'email' : null;
  }
  return PHONE_PATTERN.test(value) ? 'phone' : null;
}

/** Prénom du proche, pour les libellés (« Envoyer à Marie pour avis »). */
export function firstName(name: string): string {
  const trimmed = name.trim();
  const first = trimmed.split(/\s+/)[0];
  return first !== undefined && first.length > 0 ? first : trimmed;
}

/**
 * Ouverture du message, adaptée au niveau de verdict. Ton chaleureux et non
 * alarmiste, même en cas d'arnaque probable : on demande de l'aide, on ne crée
 * pas de peur. Première personne, formulations neutres en genre. `objet` vaut
 * « un message » ou « un lien » selon le contexte.
 */
const OPENING: Record<VerdictLevel, (objet: string) => string> = {
  ARNAQUE_PROBABLE: (objet) =>
    `J’ai reçu ${objet} et je crois que c’est une arnaque. Avant de faire quoi que ce soit, je préfère te demander ton avis.`,
  SUSPECT: (objet) =>
    `J’ai reçu ${objet} qui me paraît douteux. Je préfère avoir ton avis avant d’y donner suite.`,
  INDETERMINE: (objet) =>
    `J’ai reçu ${objet} et je ne sais pas trop quoi en penser. Ton avis m’aiderait.`,
  PLUTOT_SUR: (objet) =>
    `J’ai reçu ${objet}. Il a l’air normal, mais je préfère vérifier avec toi avant d’y répondre.`,
};

/**
 * Le message envoyé au proche : salutation par prénom, ouverture adaptée au
 * verdict, l'avis de Vigie (`summary`) et une question claire. Court, humain,
 * compatible SMS.
 *
 * Confidentialité (§8) : ne contient JAMAIS le contenu original analysé, ni les
 * raisons détaillées, ni les actions, ni le score / pourcentage de confiance —
 * uniquement ce que Vigie a produit pour l'utilisateur (verdict, résumé,
 * catégorie éventuelle).
 */
export function buildAdviceMessage(result: AnalyzeResponse, prenom: string): string {
  const objet = result.url_analysis !== null ? 'un lien' : 'un message';
  const blocks = [
    `Bonjour ${prenom},`,
    OPENING[result.verdict](objet),
    `Voici ce que Vigie en dit : ${result.summary}`,
  ];
  if (result.category !== 'AUCUNE') {
    blocks.push(`(Type possible : ${CATEGORY_LABELS[result.category]}.)`);
  }
  blocks.push('Qu’en penses-tu ?');
  blocks.push('— Envoyé avec Vigie');
  return blocks.join('\n\n');
}

/**
 * Message envoyé depuis l'accueil simplifié, quand le senior veut simplement
 * demander de l'aide à son proche — aucun verdict n'a encore été rendu.
 * Salutation par prénom, ton simple et rassurant.
 */
export function buildHelpMessage(prenom: string): string {
  return [
    `Bonjour ${prenom},`,
    'J’ai reçu un message qui me laisse un doute. Peux-tu y jeter un œil et me dire ce que tu en penses ?',
    '— Envoyé avec Vigie',
  ].join('\n\n');
}

/**
 * Lien qui ouvre le compositeur natif DÉJÀ adressé au proche, message pré-rempli.
 * iOS attend `&body=` après le numéro, Android `?body=`.
 */
export function buildContactUrl(
  contact: Pick<TrustedContact, 'channel' | 'value'>,
  message: string,
  os: string = Platform.OS,
): string {
  const body = encodeURIComponent(message);
  if (contact.channel === 'email') {
    const subject = encodeURIComponent('Un message suspect — ton avis ?');
    return `mailto:${contact.value.trim()}?subject=${subject}&body=${body}`;
  }
  const number = contact.value.replace(/[\s.\-()]/g, '');
  const separator = os === 'ios' ? '&' : '?';
  return `sms:${number}${separator}body=${body}`;
}
