import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import type { ReactElement } from 'react';
import type { ColorValue } from 'react-native';

import { fonts, palette } from '../../lib/theme';

/** Icône d'onglet : trait linéaire au repos, encre-marine pleine quand actif. */
function tabIcon(
  outline: keyof typeof Ionicons.glyphMap,
  filled: keyof typeof Ionicons.glyphMap,
): ({
  color,
  size,
  focused,
}: {
  color: ColorValue;
  size: number;
  focused: boolean;
}) => ReactElement {
  return function TabIcon({ color, size, focused }): ReactElement {
    return <Ionicons name={focused ? filled : outline} size={size} color={color} />;
  };
}

export default function TabsLayout(): ReactElement {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: palette.laiton,
        tabBarInactiveTintColor: palette.texteMuet,
        tabBarLabelStyle: { fontFamily: fonts.textSemiBold, fontSize: 12 },
        tabBarStyle: {
          backgroundColor: palette.nuitProfonde,
          borderTopColor: palette.bordure,
          height: 64,
          paddingBottom: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarAccessibilityLabel: 'Accueil',
          tabBarIcon: tabIcon('home-outline', 'home'),
        }}
      />
      <Tabs.Screen
        name="historique"
        options={{
          title: 'Historique',
          tabBarAccessibilityLabel: 'Historique des vérifications',
          tabBarIcon: tabIcon('time-outline', 'time'),
        }}
      />
      <Tabs.Screen
        name="conseils"
        options={{
          title: 'Conseils',
          tabBarAccessibilityLabel: 'Fiches conseils sur les arnaques',
          tabBarIcon: tabIcon('book-outline', 'book'),
        }}
      />
      <Tabs.Screen
        name="parametres"
        options={{
          title: 'Réglages',
          tabBarAccessibilityLabel: 'Paramètres de l’application',
          tabBarIcon: tabIcon('settings-outline', 'settings'),
        }}
      />
    </Tabs>
  );
}
