import { Link } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform as RNPlatform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ResultCard } from '../src/components/ResultCard';
import { Card, Chip, NumberField, Row, Segmented } from '../src/components/ui';
import { availableShipping, calcAll, calcPriceForTarget } from '../src/domain/calc';
import { percent, yen } from '../src/domain/format';
import { SIZE_PRESETS } from '../src/domain/shipping';
import type { CostInput, Dimensions, ShippingMode } from '../src/domain/types';
import { useSettings } from '../src/store/SettingsContext';
import { colors, radius, spacing } from '../src/theme';

const TARGET_PRESETS = [100, 300, 500, 1000, 3000, 5000];

export default function CalculatorScreen() {
  const { platforms, options, setOptions } = useSettings();

  const [costs, setCosts] = useState<CostInput>({ purchase: 1000, packaging: 30, other: 0 });
  const [dims, setDims] = useState<Dimensions>({ length: 25, width: 18, height: 2, weight: 200 });
  const [mode, setMode] = useState<'price' | 'target'>('target');
  const [price, setPrice] = useState(2000);
  const [target, setTarget] = useState(500);
  const [methodOverrides, setMethodOverrides] = useState<Record<string, string>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const ctx = useMemo(() => ({ costs, dims, options, methodOverrides }), [costs, dims, options, methodOverrides]);

  const rows = useMemo(
    () => calcAll(platforms, ctx, mode === 'price' ? { mode: 'price', value: price } : { mode: 'target', value: target }),
    [platforms, ctx, mode, price, target],
  );

  const best = rows.find((r) => r.ok);

  const quickTable = useMemo(() => {
    if (!best) return [];
    return TARGET_PRESETS.map((t) => calcPriceForTarget(best.platform, t, ctx));
  }, [best, ctx]);

  const setCost = (patch: Partial<CostInput>) => setCosts((prev) => ({ ...prev, ...patch }));
  const setDim = (patch: Partial<Dimensions>) => setDims((prev) => ({ ...prev, ...patch }));

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
          {/* ── 仕入れ・経費 ───────────────────────────── */}
          <Card
            title="仕入れ・経費"
            right={
              <Link href="/settings" asChild>
                <Pressable hitSlop={8}>
                  <Text style={styles.link}>設定</Text>
                </Pressable>
              </Link>
            }
          >
            <NumberField
              label="元値（仕入れ値）"
              value={costs.purchase}
              onChange={(purchase) => setCost({ purchase })}
              suffix="円"
            />
            <Row>
              <NumberField
                label="梱包資材費"
                value={costs.packaging}
                onChange={(packaging) => setCost({ packaging })}
                suffix="円"
                flex={1}
              />
              <NumberField
                label="その他経費"
                value={costs.other}
                onChange={(other) => setCost({ other })}
                suffix="円"
                flex={1}
              />
            </Row>
          </Card>

          {/* ── サイズ・送料 ───────────────────────────── */}
          <Card title="サイズ・送料">
            <Segmented<ShippingMode>
              options={[
                { label: 'サイズから自動', value: 'auto' },
                { label: '送料を入力', value: 'manual' },
                { label: '購入者負担', value: 'buyer' },
              ]}
              value={options.shippingMode}
              onChange={(shippingMode) => setOptions({ shippingMode })}
            />

            {options.shippingMode === 'auto' && (
              <View style={{ marginTop: spacing.md }}>
                <View style={styles.chipRow}>
                  {SIZE_PRESETS.map((p) => (
                    <Chip
                      key={p.label}
                      label={p.label}
                      active={
                        p.dims.length === dims.length &&
                        p.dims.width === dims.width &&
                        p.dims.height === dims.height
                      }
                      onPress={() => setDims(p.dims)}
                    />
                  ))}
                </View>
                <Row style={{ marginTop: spacing.md }}>
                  <NumberField label="縦" value={dims.length} onChange={(length) => setDim({ length })} suffix="cm" flex={1} />
                  <NumberField label="横" value={dims.width} onChange={(width) => setDim({ width })} suffix="cm" flex={1} />
                  <NumberField label="厚さ" value={dims.height} onChange={(height) => setDim({ height })} suffix="cm" flex={1} />
                </Row>
                <NumberField label="重さ" value={dims.weight} onChange={(weight) => setDim({ weight })} suffix="g" />
                <Text style={styles.hint}>
                  3辺合計 {dims.length + dims.width + dims.height}cm ／ 各社で使える最安の発送方法を自動で選びます
                </Text>
              </View>
            )}

            {options.shippingMode === 'manual' && (
              <View style={{ marginTop: spacing.md }}>
                <NumberField
                  label="送料（全プラットフォーム共通）"
                  value={options.manualShipping}
                  onChange={(manualShipping) => setOptions({ manualShipping })}
                  suffix="円"
                />
              </View>
            )}

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>振込手数料も引く</Text>
              <Switch
                value={options.includePayoutFee}
                onValueChange={(includePayoutFee) => setOptions({ includePayoutFee })}
              />
            </View>
          </Card>

          {/* ── 計算モード ────────────────────────────── */}
          <Card title="計算">
            <Segmented
              options={[
                { label: '目標利益 → 販売価格', value: 'target' as const },
                { label: '販売価格 → 利益', value: 'price' as const },
              ]}
              value={mode}
              onChange={setMode}
            />

            <View style={{ marginTop: spacing.md }}>
              {mode === 'target' ? (
                <>
                  <NumberField
                    label="いくら利益を出したい？"
                    value={target}
                    onChange={setTarget}
                    suffix="円"
                  />
                  <View style={styles.chipRow}>
                    {TARGET_PRESETS.map((t) => (
                      <Chip key={t} label={`${t.toLocaleString('ja-JP')}円`} active={target === t} onPress={() => setTarget(t)} />
                    ))}
                  </View>
                </>
              ) : (
                <NumberField label="いくらで売る？" value={price} onChange={setPrice} suffix="円" />
              )}
            </View>

            <View style={{ marginTop: spacing.md }}>
              <Text style={styles.fieldLabelSmall}>販売価格の丸め単位</Text>
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
          </Card>

          {/* ── 結論 ─────────────────────────────────── */}
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

          {/* ── プラットフォーム別 ─────────────────────── */}
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
                shippingOptions={availableShipping(r.platform, dims)}
                selectedMethodId={methodOverrides[r.platform.id]}
                onSelectMethod={(methodId) =>
                  setMethodOverrides((prev) => {
                    const next = { ...prev };
                    if (methodId) next[r.platform.id] = methodId;
                    else delete next[r.platform.id];
                    return next;
                  })
                }
                showMethodPicker={options.shippingMode === 'auto'}
              />
            ))
          )}

          {/* ── 早見表 ───────────────────────────────── */}
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xl * 2 },
  link: { color: colors.accent, fontSize: 13, fontWeight: '600' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  hint: { fontSize: 12, color: colors.sub, marginTop: spacing.sm, lineHeight: 18 },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  switchLabel: { fontSize: 13, color: colors.text, fontWeight: '600' },
  fieldLabelSmall: { fontSize: 12, color: colors.sub, marginBottom: spacing.xs },
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
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  tableLeft: { fontSize: 13, color: colors.sub, width: 110 },
  tableArrow: { fontSize: 13, color: colors.sub, marginHorizontal: spacing.sm },
  tableRight: { fontSize: 15, fontWeight: '700', color: colors.text },
  footer: { fontSize: 11, color: colors.sub, textAlign: 'center', marginTop: spacing.lg, lineHeight: 17 },
});
