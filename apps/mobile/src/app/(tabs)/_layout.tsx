import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import type { ReactElement } from 'react';

import { colors } from '../../lib/theme';

export default function TabsLayout(): ReactElement {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: { fontSize: 13, fontWeight: '600' },
        tabBarStyle: { backgroundColor: colors.background, height: 64, paddingBottom: 8 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarAccessibilityLabel: 'Accueil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="shield-checkmark" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="historique"
        options={{
          title: 'Historique',
          tabBarAccessibilityLabel: 'Historique des vérifications',
          tabBarIcon: ({ color, size }) => <Ionicons name="time" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
