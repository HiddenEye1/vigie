import { Ionicons } from '@expo/vector-icons';
import type { ReactElement, ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { fonts, MIN_TOUCH_TARGET, onHeader, palette, radius, spacing } from '../lib/theme';
import { LighthouseLogo } from './lighthouse-logo';

interface AnchorHeaderProps {
  readonly title: string;
  /** Ligne d'état / sous-titre sous le titre (le « poste de garde qui veille »). */
  readonly status?: string;
  /** Affiche une flèche retour à gauche au lieu du phare. */
  readonly onBack?: () => void;
  /** Affiche le phare à gauche (accueil et écrans principaux). */
  readonly showLighthouse?: boolean;
  /** Affiche l'engrenage réglages à droite. */
  readonly onSettings?: () => void;
  /** Contenu additionnel ancré dans l'en-tête (ex. compteur). */
  readonly children?: ReactNode;
}

/**
 * En-tête pleine largeur encre-marine à coins bas arrondis (24) : la signature
 * structurelle de Vigie. Il ancre le haut de chaque écran principal et laisse
 * le laiton du phare briller sur fond foncé.
 */
export function AnchorHeader({
  title,
  status,
  onBack,
  showLighthouse = false,
  onSettings,
  children,
}: AnchorHeaderProps): ReactElement {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.header, { paddingTop: insets.top + spacing.m }]}>
      <View style={styles.row}>
        <View style={styles.leading}>
          {onBack ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Retour"
              onPress={onBack}
              hitSlop={12}
              style={styles.iconButton}
            >
              <Ionicons name="chevron-back" size={26} color={onHeader.text} />
            </Pressable>
          ) : null}
          {showLighthouse ? <LighthouseLogo size={38} lantern={palette.laiton} stroke={onHeader.text} /> : null}
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        </View>
        {onSettings ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Réglages"
            onPress={onSettings}
            hitSlop={12}
            style={styles.iconButton}
          >
            <Ionicons name="settings-outline" size={22} color={onHeader.text} />
          </Pressable>
        ) : null}
      </View>

      {status ? <Text style={styles.status}>{status}</Text> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: palette.encreMarine,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
    paddingHorizontal: spacing.l,
    paddingBottom: spacing.l,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  leading: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
  },
  title: {
    flexShrink: 1,
    fontFamily: fonts.display,
    fontSize: 26,
    lineHeight: 34,
    color: onHeader.text,
  },
  status: {
    fontFamily: fonts.textMedium,
    fontSize: 15,
    lineHeight: 22,
    color: onHeader.textMuted,
    marginTop: spacing.s,
  },
  iconButton: {
    minWidth: MIN_TOUCH_TARGET - 8,
    minHeight: MIN_TOUCH_TARGET - 8,
    borderRadius: radius.m,
    backgroundColor: onHeader.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
