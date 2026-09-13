import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { StepLayout } from '../src/components/StepLayout';
import { Chip, NumberField, Segmented } from '../src/components/ui';
import { yen } from '../src/domain/format';
import { materialsTotal } from '../src/domain/materials';
import { useFlow } from '../src/store/FlowContext';
import { useSettings } from '../src/store/SettingsContext';
import { colors, spacing } from '../src/theme';

const TARGET_PRESETS = [100, 300, 500, 1000, 3000, 5000];

export default function GoalStep() {
  const router = useRouter();
  const { options, setOptions, materials } = useSettings();
  const { costs, mode, target, price, setFlow } = useFlow();
  const calculate = () => router.push('/result');

  const baseCost = costs.purchase + costs.other + materialsTotal(materials, costs.materials);

  return (
    <StepLayout
      step={5}
      title={mode === 'target' ? 'いくら利益がほしい？' : 'いくらで売る？'}
      subtitle="目標利益から売値を逆算するか、売値から手取りを出すかを選べます。"
      onNext={calculate}
      nextLabel="計算する"
      summary={
        <Text style={styles.summary}>
          送料を除く原価 <Text style={styles.summaryValue}>{yen(baseCost)}</Text>
          {'　'}（仕入れ {yen(costs.purchase)} ＋ 資材 {yen(materialsTotal(materials, costs.materials))}
          {costs.other > 0 ? ` ＋ その他 ${yen(costs.other)}` : ''}）
        </Text>
      }
    >
      <Segmented
        options={[
          { label: '目標利益 → 売値', value: 'target' as const },
          { label: '売値 → 利益', value: 'price' as const },
        ]}
        value={mode}
        onChange={(m) => setFlow({ mode: m })}
      />

      <View style={styles.block}>
        {mode === 'target' ? (
          <>
            <NumberField
              label="目標利益"
              value={target}
              onChange={(v) => setFlow({ target: v })}
              suffix="円"
              big
              autoFocus
              onSubmit={calculate}
            />
            <View style={styles.chips}>
              {TARGET_PRESETS.map((t) => (
                <Chip
                  key={t}
                  label={`${t.toLocaleString('ja-JP')}円`}
                  active={target === t}
                  onPress={() => setFlow({ target: t })}
                />
              ))}
            </View>
          </>
        ) : (
          <NumberField
            label="販売価格"
            value={price}
            onChange={(v) => setFlow({ price: v })}
            suffix="円"
            big
            autoFocus
            onSubmit={calculate}
          />
        )}
      </View>

      {mode === 'target' && (
        <View style={styles.block}>
          <Text style={styles.blockLabel}>売値の丸め単位</Text>
          <Segmented
            options={[
              { label: '1円', value: 1 },
              { label: '10円', value: 10 },
              { label: '100円', value: 100 },
            ]}
            value={options.priceStep}
            onChange={(priceStep) => setOptions({ priceStep })}
          />
        </View>
      )}

      <View style={styles.switchRow}>
        <View style={styles.switchText}>
          <Text style={styles.switchLabel}>振込手数料も引く</Text>
          <Text style={styles.hint}>売上金を毎回口座に振り込む場合はON</Text>
        </View>
        <Switch
          value={options.includePayoutFee}
          onValueChange={(includePayoutFee) => setOptions({ includePayoutFee })}
        />
      </View>
    </StepLayout>
  );
}

const styles = StyleSheet.create({
  block: { marginTop: spacing.lg },
  blockLabel: { fontSize: 12, color: colors.sub, marginBottom: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  switchText: { flex: 1 },
  switchLabel: { fontSize: 14, color: colors.text, fontWeight: '700' },
  hint: { fontSize: 11, color: colors.sub, marginTop: 2 },
  summary: { fontSize: 12, color: colors.sub, lineHeight: 18 },
  summaryValue: { fontSize: 14, fontWeight: '800', color: colors.text },
});
