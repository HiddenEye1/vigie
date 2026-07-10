import type { AnalyzeResponse } from '@vigie/shared';
import { Platform } from 'react-native';
import { z } from 'zod';

import { CATEGORY_LABELS, VERDICT_UI } from '@/lib/verdict-ui';

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
 * Le message envoyé au proche : le VERDICT de Vigie et une question claire.
 * Ne contient JAMAIS le contenu original analysé (données potentiellement
 * personnelles ou bancaires) — uniquement ce que Vigie a produit.
 */
export function buildAdviceMessage(result: AnalyzeResponse): string {
  const ui = VERDICT_UI[result.verdict];
  const blocks = [
    `J’ai reçu un message suspect. Vigie pense que c’est : ${ui.label}.`,
    result.summary,
  ];
  if (result.category !== 'AUCUNE') {
    blocks.push(`Type d’arnaque possible : ${CATEGORY_LABELS[result.category]}.`);
  }
  blocks.push('Qu’en penses-tu ?');
  blocks.push('— Envoyé depuis Vigie');
  return blocks.join('\n\n');
}

/**
 * Message envoyé depuis l'accueil simplifié, quand le senior veut simplement
 * demander de l'aide à son proche — aucun verdict n'a encore été rendu.
 */
export function buildHelpMessage(): string {
  return [
    'Bonjour, j’ai reçu un message dont je ne suis pas sûr.',
    'Peux-tu me dire ce que tu en penses ?',
    '— Envoyé depuis Vigie',
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
