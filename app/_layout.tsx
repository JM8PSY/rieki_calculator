import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { FlowProvider } from '../src/store/FlowContext';
import { SettingsProvider } from '../src/store/SettingsContext';
import { colors } from '../src/theme';

export default function RootLayout() {
  return (
    <SettingsProvider>
      <FlowProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.card },
            headerTitleStyle: { fontSize: 16, fontWeight: '700', color: colors.text },
            headerShadowVisible: false,
            headerBackTitle: '戻る',
            contentStyle: { backgroundColor: colors.bg },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="index" options={{ title: '転売利益計算' }} />
          <Stack.Screen name="expenses" options={{ title: 'その他経費' }} />
          <Stack.Screen name="materials" options={{ title: '発送資材' }} />
          <Stack.Screen name="platform" options={{ title: '販路を選ぶ' }} />
          <Stack.Screen name="shipping" options={{ title: '発送方法' }} />
          <Stack.Screen name="goal" options={{ title: '価格・目標利益' }} />
          <Stack.Screen name="result" options={{ title: '計算結果' }} />
          <Stack.Screen name="settings" options={{ title: '手数料・送料の設定' }} />
        </Stack>
      </FlowProvider>
    </SettingsProvider>
  );
}
