/**
 * Domaine « Bouclier famille ».
 *
 * Point d'entrée unique du domaine : le reste de l'app importe depuis
 * `@/features/family`, jamais depuis les fichiers internes. Cela garde le
 * couplage faible et laisse le domaine évoluer librement (Phase 4 : profil
 * protégé, appairage, tableau de bord aidant).
 *
 * Principe produit rappelé : tout est local, consenti et révocable — rien
 * ne part sans un geste explicite du senior (voir VISION.md).
 */

// État local
export { useTrustedContact } from './contact.store';
export type { TrustedContact, ContactChannel } from './contact.store';
export { useSeniorMode } from './senior-mode.store';

// Messages pré-remplis vers le proche (compositeur natif)
export { buildContactUrl, buildHelpMessage, firstName } from './messages';

// Écrans et sections
export { SimpleHome } from './simple-home';
export { SimpleModeSection } from './simple-mode-section';
export { TrustedContactSection } from './trusted-contact-section';
export { AskTrustedContact } from './ask-trusted-contact';
export { FamilyPresence } from './family-presence';
export { FamilyConsentCard } from './family-consent-card';
export { FamilyShieldSection } from './family-shield-section';
export { ContactOnboarding } from './contact-onboarding';
export { FamilyShieldExplainer } from './family-shield-explainer';
