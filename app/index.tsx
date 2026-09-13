import { Link, useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { StepLayout } from '../src/components/StepLayout';
import { NumberField } from '../src/components/ui';
import { yen } from '../src/domain/format';
import { useFlow } from '../src/store/FlowContext';
import { colors, spacing } from '../src/theme';

export default function PurchaseStep() {
  const router = useRouter();
  const { costs, setCosts } = useFlow();
  const next = () => router.push('/expenses');

  return (
    <StepLayout
      step={1}
      title="元値はいくら？"
      subtitle="仕入れにかかった金額を入れてください。ここから手数料・送料・資材費を引いて利益を出します。"
      onNext={next}
      summary={
        <Text style={styles.summary}>
          仕入れ値 <Text style={styles.summaryValue}>{yen(costs.purchase)}</Text>
        </Text>
      }
    >
      <NumberField
        label="元値（仕入れ値）"
        value={costs.purchase}
        onChange={(purchase) => setCosts({ purchase })}
        suffix="円"
        big
        autoFocus
        onSubmit={next}
      />
      <Link href="/settings" asChild>
        <Pressable hitSlop={8}>
          <Text style={styles.link}>手数料・送料の設定を開く</Text>
        </Pressable>
      </Link>
    </StepLayout>
  );
}

const styles = StyleSheet.create({
  link: { color: colors.accent, fontSize: 13, fontWeight: '600', marginTop: spacing.md },
  summary: { fontSize: 13, color: colors.sub },
  summaryValue: { fontSize: 15, fontWeight: '800', color: colors.text },
});
