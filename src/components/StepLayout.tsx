import { useRouter } from 'expo-router';
import React from 'react';
import {
  KeyboardAvoidingView,
  Platform as RNPlatform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, spacing } from '../theme';
import { Button } from './ui';

/** 入力フローの総ステップ数（元値 → その他経費 → 資材 → 送料/サイズ → 価格・目標） */
export const TOTAL_STEPS = 5;

export function StepLayout({
  step,
  title,
  subtitle,
  children,
  onNext,
  nextLabel = '次へ',
  nextDisabled,
  summary,
}: {
  step: number;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  /** フッターに出す現在の集計（例：ここまでの原価） */
  summary?: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={['bottom', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={RNPlatform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <StepDots step={step} />
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          <View style={styles.body}>{children}</View>
        </ScrollView>

        <View style={styles.footer}>
          {summary ? <View style={styles.summary}>{summary}</View> : null}
          <View style={styles.footerButtons}>
            {step > 1 && (
              <Pressable style={styles.back} onPress={() => router.back()}>
                <Text style={styles.backText}>戻る</Text>
              </Pressable>
            )}
            <View style={styles.flex}>
              <Button label={nextLabel} onPress={onNext} disabled={nextDisabled} />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function StepDots({ step }: { step: number }) {
  return (
    <View style={styles.dots}>
      {Array.from({ length: TOTAL_STEPS }, (_, i) => (
        <View key={i} style={[styles.dot, i < step && styles.dotDone, i === step - 1 && styles.dotNow]} />
      ))}
      <Text style={styles.dotLabel}>
        {step} / {TOTAL_STEPS}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xl },
  dots: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.lg },
  dot: { width: 22, height: 4, borderRadius: 2, backgroundColor: colors.border },
  dotDone: { backgroundColor: colors.accent },
  dotNow: { backgroundColor: colors.accent, width: 30 },
  dotLabel: { fontSize: 11, color: colors.sub, marginLeft: spacing.xs },
  title: { fontSize: 22, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 13, color: colors.sub, marginTop: spacing.sm, lineHeight: 20 },
  body: { marginTop: spacing.lg },
  footer: {
    padding: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.card,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  summary: {
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.bg,
  },
  footerButtons: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  back: {
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  backText: { fontSize: 14, fontWeight: '700', color: colors.sub },
});
