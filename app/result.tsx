import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ResultCard } from '../src/components/ResultCard';
import { Card } from '../src/components/ui';
import { availableShipping, calcAll, calcPriceForTarget } from '../src/domain/calc';
import { percent, yen } from '../src/domain/format';
import { materialsTotal } from '../src/domain/materials';
import { METHOD_BY_ID } from '../src/domain/shipping';
import { useFlow } from '../src/store/FlowContext';
import { useSettings } from '../src/store/SettingsContext';
import { colors, radius, spacing } from '../src/theme';

const TARGET_PRESETS = [100, 300, 500, 1000, 3000, 5000];

export default function ResultScreen() {
  const router = useRouter();
  const { platforms, options, materials } = useSettings();
  const { costs, dims, mode, target, price, methodOverrides, setFlow, startOver } = useFlow();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const ctx = useMemo(
    () => ({ costs, dims, options, materials, methodOverrides }),
    [costs, dims, options, materials, methodOverrides],
  );

  const rows = useMemo(
    () =>
      calcAll(
        platforms,
        ctx,
        mode === 'price' ? { mode: 'price', value: price } : { mode: 'target', value: target },
      ),
    [platforms, ctx, mode, price, target],
  );

  const best = rows.find((r) => r.ok);

  const quickTable = useMemo(
    () => (best ? TARGET_PRESETS.map((t) => calcPriceForTarget(best.platform, t, ctx)) : []),
    [best, ctx],
  );

  const materialCost = materialsTotal(materials, costs.materials);

  const restart = () => {
    startOver();
    router.dismissTo('/');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* 入力内容（タップで該当ステップに戻れる） */}
        <View style={styles.recap}>
          <RecapItem label="元値" value={yen(costs.purchase)} onPress={() => router.dismissTo('/')} />
          <RecapItem
            label="資材"
            value={yen(materialCost)}
            onPress={() => router.dismissTo('/materials')}
          />
          <RecapItem
            label="送料"
            value={
              options.shippingMode === 'auto'
                ? `自動（${dims.length + dims.width + dims.height}cm）`
                : options.shippingMode === 'flat'
                  ? (METHOD_BY_ID[options.flatMethodId]?.name ?? '定額便')
                  : options.shippingMode === 'manual'
                    ? yen(options.manualShipping)
                    : '購入者負担'
            }
            onPress={() => router.dismissTo('/shipping')}
          />
        </View>

        {best && (
          <View style={styles.verdict}>
            <Text style={styles.verdictText}>
              {mode === 'target' ? (
                <>
                  <Text style={styles.verdictStrong}>{best.platform.name}</Text> で{' '}
                  <Text style={styles.verdictStrong}>{yen(best.price)}</Text> で売れば{' '}
                  <Text style={styles.verdictStrong}>{yen(target)}</Text> の利益が出ます
                </>
              ) : (
                <>
                  <Text style={styles.verdictStrong}>{yen(price)}</Text> で売るなら{' '}
                  <Text style={styles.verdictStrong}>{best.platform.name}</Text> が一番トク（利益{' '}
                  <Text style={styles.verdictStrong}>{yen(best.profit)}</Text>／{percent(best.margin)}）
                </>
              )}
            </Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>プラットフォーム別</Text>
        {rows.length === 0 ? (
          <Card>
            <Text style={styles.hint}>
              表示するプラットフォームがありません。設定画面で有効にしてください。
            </Text>
          </Card>
        ) : (
          rows.map((r) => (
            <ResultCard
              key={r.platform.id}
              breakdown={r}
              mode={mode}
              best={best?.platform.id === r.platform.id}
              expanded={!!expanded[r.platform.id]}
              onToggle={() =>
                setExpanded((prev) => ({ ...prev, [r.platform.id]: !prev[r.platform.id] }))
              }
              shippingOptions={availableShipping(r.platform, dims, materials, options)}
              selectedMethodId={methodOverrides[r.platform.id]}
              onSelectMethod={(methodId) => {
                const next = { ...methodOverrides };
                if (methodId) next[r.platform.id] = methodId;
                else delete next[r.platform.id];
                setFlow({ methodOverrides: next });
              }}
              showMethodPicker={options.shippingMode === 'auto'}
            />
          ))
        )}

        {best && (
          <Card title={`早見表（${best.platform.name}）`} style={{ marginTop: spacing.md }}>
            {quickTable.map((row, i) => (
              <View key={TARGET_PRESETS[i]} style={styles.tableRow}>
                <Text style={styles.tableLeft}>利益 {yen(TARGET_PRESETS[i])}</Text>
                <Text style={styles.tableArrow}>→</Text>
                <Text style={styles.tableRight}>{yen(row.price)} で出品</Text>
              </View>
            ))}
          </Card>
        )}

        <Text style={styles.footer}>
          手数料・送料は初期値です。改定されたら設定画面で自分の実績値に直してください。
        </Text>
      </ScrollView>

      <View style={styles.actions}>
        <Pressable style={styles.secondary} onPress={() => router.back()}>
          <Text style={styles.secondaryText}>条件を変える</Text>
        </Pressable>
        <Pressable style={styles.primary} onPress={restart}>
          <Text style={styles.primaryText}>次の商品を計算</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function RecapItem({
  label,
  value,
  onPress,
}: {
  label: string;
  value: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.recapItem} onPress={onPress}>
      <Text style={styles.recapLabel}>{label}</Text>
      <Text style={styles.recapValue} numberOfLines={1}>
        {value}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: spacing.xl },
  recap: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  recapItem: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  recapLabel: { fontSize: 10, color: colors.sub },
  recapValue: { fontSize: 13, fontWeight: '700', color: colors.text, marginTop: 1 },
  verdict: {
    backgroundColor: colors.accentSoft,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  verdictText: { fontSize: 15, color: colors.text, lineHeight: 24 },
  verdictStrong: { fontWeight: '800', color: colors.accent },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.sub,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  hint: { fontSize: 12, color: colors.sub, lineHeight: 18 },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  tableLeft: { fontSize: 13, color: colors.sub, width: 110 },
  tableArrow: { fontSize: 13, color: colors.sub, marginHorizontal: spacing.sm },
  tableRight: { fontSize: 15, fontWeight: '700', color: colors.text },
  footer: { fontSize: 11, color: colors.sub, textAlign: 'center', marginTop: spacing.lg, lineHeight: 17 },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.card,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  secondary: {
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  secondaryText: { fontSize: 14, fontWeight: '700', color: colors.sub },
  primary: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.md,
    backgroundColor: colors.accent,
    alignItems: 'center',
  },
  primaryText: { fontSize: 14, fontWeight: '700', color: '#fff' },
});
