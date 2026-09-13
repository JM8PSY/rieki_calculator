import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SettingsProvider } from '../src/store/SettingsContext';
import { colors } from '../src/theme';

export default function RootLayout() {
  return (
    <SettingsProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.card },
          headerTitleStyle: { fontSize: 16, fontWeight: '700', color: colors.text },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="index" options={{ title: '転売利益計算' }} />
        <Stack.Screen name="settings" options={{ title: '手数料・送料の設定' }} />
      </Stack>
    </SettingsProvider>
  );
}
