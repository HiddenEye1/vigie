import { Ionicons } from '@expo/vector-icons';
import type { ReactElement } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { fonts, palette, radius, spacing } from '../lib/theme';

export interface SegmentedOption<K extends string> {
  readonly key: K;
  readonly label: string;
  readonly icon: keyof typeof Ionicons.glyphMap;
}

interface SegmentedTabsProps<K extends string> {
  readonly options: readonly SegmentedOption<K>[];
  readonly value: K;
  readonly onChange: (key: K) => void;
}

/**
 * Sélecteur segmenté du poste de veille : Message / Capture / Lien.
 * La pilule active glisse sur une piste ardoise ; l'onglet actif prend
 * le trait laiton, les autres restent en retrait.
 */
export function SegmentedTabs<K extends string>({
  options,
  value,
  onChange,
}: SegmentedTabsProps<K>): ReactElement {
  return (
    <View style={styles.track}>
      {options.map((option) => {
        const active = option.key === value;
        return (
          <Pressable
            key={option.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={option.label}
            onPress={() => {
              onChange(option.key);
            }}
            style={[styles.segment, active && styles.segmentActive]}
          >
            <Ionicons
              name={option.icon}
              size={18}
              color={active ? palette.laiton : palette.texteMuet}
            />
            <Text style={[styles.label, active && styles.labelActive]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: radius.pill,
    backgroundColor: palette.ardoiseHaute,
    borderWidth: 1,
    borderColor: palette.bordureDouce,
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: 10,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  segmentActive: {
    backgroundColor: palette.ardoiseElevee,
    borderColor: palette.laitonFilet,
  },
  label: {
    fontFamily: fonts.textSemiBold,
    fontSize: 14,
    color: palette.texteMuet,
  },
  labelActive: {
    color: palette.texteClair,
  },
});
