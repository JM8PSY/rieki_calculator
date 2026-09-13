import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { StepLayout } from '../src/components/StepLayout';
import { Chip, NumberField } from '../src/components/ui';
import { yen } from '../src/domain/format';
import { useFlow } from '../src/store/FlowContext';
import { colors, spacing } from '../src/theme';

const PRESETS = [0, 100, 300, 500];

export default function ExpensesStep() {
  const router = useRouter();
  const { costs, setCosts } = useFlow();
  const next = () => router.push('/platform');

  return (
    <StepLayout
      step={2}
      title="その他の経費は？"
      subtitle="交通費・ガソリン代・保管費など、資材以外でかかったぶんがあれば入れてください。なければ 0 のままで大丈夫です。"
      onNext={next}
      summary={
        <Text style={styles.summary}>
          仕入れ {yen(costs.purchase)} ＋ その他 {yen(costs.other)} ＝{' '}
          <Text style={styles.summaryValue}>{yen(costs.purchase + costs.other)}</Text>
        </Text>
      }
    >
      <NumberField
        label="その他経費"
        value={costs.other}
        onChange={(other) => setCosts({ other })}
        suffix="円"
        big
        autoFocus
        onSubmit={next}
      />
      <View style={styles.chips}>
        {PRESETS.map((v) => (
          <Chip
            key={v}
            label={v === 0 ? 'なし' : `${v}円`}
            active={costs.other === v}
            onPress={() => setCosts({ other: v })}
          />
        ))}
      </View>
    </StepLayout>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm },
  summary: { fontSize: 13, color: colors.sub },
  summaryValue: { fontSize: 15, fontWeight: '800', color: colors.text },
});
