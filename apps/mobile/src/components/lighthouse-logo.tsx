import type { ReactElement } from 'react';
import Svg, { Path } from 'react-native-svg';

import { palette } from '../lib/theme';

interface LighthouseLogoProps {
  readonly size?: number;
  /** Couleur du trait (tour, toit, sol). */
  readonly stroke?: string;
  /** Couleur de la lanterne et de ses rayons — le laiton du phare. */
  readonly lantern?: string;
}

/**
 * Le phare de Vigie — logo maison, minimaliste : tour au trait encre-marine,
 * lanterne laiton qui veille. Dessiné en SVG, aucune dépendance d'image.
 */
export function LighthouseLogo({
  size = 96,
  stroke = palette.encreMarine,
  lantern = palette.laiton,
}: LighthouseLogoProps): ReactElement {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      accessibilityLabel="Le phare de Vigie"
    >
      {/* Sol */}
      <Path d="M14 58H50" stroke={stroke} strokeWidth={3} strokeLinecap="round" />
      {/* Tour effilée */}
      <Path d="M24.5 58L27.5 26" stroke={stroke} strokeWidth={3} strokeLinecap="round" />
      <Path d="M39.5 58L36.5 26" stroke={stroke} strokeWidth={3} strokeLinecap="round" />
      {/* Bandes de la tour */}
      <Path d="M26 47H38" stroke={stroke} strokeWidth={2.5} strokeLinecap="round" />
      <Path d="M26.9 37H37.1" stroke={stroke} strokeWidth={2.5} strokeLinecap="round" />
      {/* Galerie */}
      <Path d="M24 26H40" stroke={stroke} strokeWidth={3} strokeLinecap="round" />
      {/* Lanterne — le laiton qui veille (rectangle arrondi tracé en Path) */}
      <Path
        d="M29.25 17.5h5.5a1.5 1.5 0 0 1 1.5 1.5v5.5a1.5 1.5 0 0 1-1.5 1.5h-5.5a1.5 1.5 0 0 1-1.5-1.5V19a1.5 1.5 0 0 1 1.5-1.5Z"
        fill={lantern}
      />
      {/* Toit */}
      <Path
        d="M26.5 17L32 10.5L37.5 17"
        stroke={stroke}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Rayons du feu */}
      <Path d="M22 21.5L15.5 18.5" stroke={lantern} strokeWidth={3} strokeLinecap="round" />
      <Path d="M42 21.5L48.5 18.5" stroke={lantern} strokeWidth={3} strokeLinecap="round" />
    </Svg>
  );
}
