import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { StepLayout } from '../src/components/StepLayout';
import { Chip, NumberField, Row, Segmented } from '../src/components/ui';
import { yen } from '../src/domain/format';
import { FLAT_RATE_METHODS, SIZE_PRESETS, sum3 } from '../src/domain/shipping';
import type { ShippingMode } from '../src/domain/types';
import { useFlow } from '../src/store/FlowContext';
import { useSettings } from '../src/store/SettingsContext';
import { colors, radius, spacing } from '../src/theme';

export default function ShippingStep() {
  const router = useRouter();
  const { options, setOptions, platforms } = useSettings();
  const { dims, setDims } = useFlow();
  const next = () => router.push('/goal');

  // 定額便の料金はどの販路でも同じなので、有効な販路の1つから引く
  const flatPriceOf = (id: string) =>
    platforms.find((p) => p.enabled && p.shipping[id] != null)?.shipping[id] ?? 0;

  const flatMethod = FLAT_RATE_METHODS.find((m) => m.id === options.flatMethodId);

  return (
    <StepLayout
      step={4}
      title="送料はどうする？"
      subtitle="サイズを入れると各アプリで使える最安の発送方法を自動で選びます。レターパックなど送料が決まっている便を使うなら、サイズ入力は要りません。"
      onNext={next}
      summary={
        <Text style={styles.summary}>
          {options.shippingMode === 'auto' ? (
            <>
              3辺合計 <Text style={styles.summaryValue}>{sum3(dims)}cm</Text>
              {'　'}重さ <Text style={styles.summaryValue}>{dims.weight}g</Text>
              {'　'}→ 最安を自動選択
            </>
          ) : options.shippingMode === 'flat' ? (
            <>
              <Text style={styles.summaryValue}>{flatMethod?.name ?? '定額便'}</Text>{' '}
              {yen(flatPriceOf(options.flatMethodId))}（全国一律・サイズ入力なし）
            </>
          ) : options.shippingMode === 'manual' ? (
            <>
              送料 <Text style={styles.summaryValue}>{yen(options.manualShipping)}</Text>（手入力）
            </>
          ) : (
            <>送料は購入者負担（出品者の負担なし）</>
          )}
        </Text>
      }
    >
      <Segmented<ShippingMode>
        options={[
          { label: 'サイズ自動', value: 'auto' },
          { label: '定額便', value: 'flat' },
          { label: '送料入力', value: 'manual' },
          { label: '購入者負担', value: 'buyer' },
        ]}
        value={options.shippingMode}
        onChange={(shippingMode) => setOptions({ shippingMode })}
      />

      {options.shippingMode === 'auto' && (
        <View style={styles.block}>
          <View style={styles.switchRow}>
            <View style={styles.switchText}>
              <Text style={styles.switchLabel}>匿名配送だけを使う</Text>
              <Text style={styles.hint}>
                メルカリ便・ラクマパック・おてがる配送は匿名配送。レターパックなどの自己発送は
                住所・氏名が相手に伝わるため、ONのあいだ候補から外します。
              </Text>
            </View>
            <Switch
              value={options.anonymousOnly}
              onValueChange={(anonymousOnly) => setOptions({ anonymousOnly })}
            />
          </View>

          <Text style={styles.blockLabel}>よく使うサイズ</Text>
          <View style={styles.chips}>
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

          <Row style={{ marginTop: spacing.lg }}>
            <NumberField label="縦" value={dims.length} onChange={(length) => setDims({ length })} suffix="cm" flex={1} />
            <NumberField label="横" value={dims.width} onChange={(width) => setDims({ width })} suffix="cm" flex={1} />
            <NumberField label="厚さ" value={dims.height} onChange={(height) => setDims({ height })} suffix="cm" flex={1} />
          </Row>
          <NumberField
            label="重さ"
            value={dims.weight}
            onChange={(weight) => setDims({ weight })}
            suffix="g"
            onSubmit={next}
          />
          <Text style={styles.hint}>
            3辺合計 {sum3(dims)}cm ／ 厚さは3辺のうち一番短い辺として判定します。ポスト投函便
            （ネコポス・ゆうパケット）は厚さ3cm以内が条件です。
          </Text>
        </View>
      )}

      {options.shippingMode === 'flat' && (
        <View style={styles.block}>
          <Text style={styles.blockLabel}>使う定額便を選ぶ（サイズ入力は不要）</Text>
          {FLAT_RATE_METHODS.map((m) => {
            const active = options.flatMethodId === m.id;
            return (
              <Pressable
                key={m.id}
                style={[styles.flatRow, active && styles.flatRowActive]}
                onPress={() => setOptions({ flatMethodId: m.id })}
              >
                <View style={styles.flatLeft}>
                  <Text style={styles.flatName}>{m.name}</Text>
                  <Text style={styles.flatNote}>{m.note}</Text>
                  <Text style={styles.flatNote}>
                    {m.limit.maxLongest}×{m.limit.maxSecond}cm
                    {m.limit.maxThickness ? ` ・厚さ${m.limit.maxThickness}cm` : ' ・厚さ制限なし'}
                    {m.limit.maxWeight ? ` ・${m.limit.maxWeight / 1000}kg` : ''}
                    {m.tracking ? ' ・追跡あり' : ' ・追跡なし'}
                  </Text>
                </View>
                <Text style={[styles.flatPrice, active && styles.flatPriceActive]}>
                  {yen(flatPriceOf(m.id))}
                </Text>
              </Pressable>
            );
          })}
          <View style={styles.warn}>
            <Text style={styles.warnText}>
              定額便はすべて自己発送のため <Text style={styles.warnStrong}>匿名配送になりません</Text>。
              送り状に自分の住所・氏名を書く必要があり、フリマ各社の配送補償の対象外になります。
            </Text>
          </View>
        </View>
      )}

      {options.shippingMode === 'manual' && (
        <View style={styles.block}>
          <NumberField
            label="送料（全プラットフォーム共通）"
            value={options.manualShipping}
            onChange={(manualShipping) => setOptions({ manualShipping })}
            suffix="円"
            big
            autoFocus
            onSubmit={next}
          />
          <Text style={styles.hint}>
            サイズ判定を行わないので、どのアプリでもこの送料で計算します。
          </Text>
        </View>
      )}

      {options.shippingMode === 'buyer' && (
        <View style={styles.block}>
          <Text style={styles.hint}>
            着払い・購入者負担のため、出品者の送料は 0円 として計算します。
          </Text>
        </View>
      )}
    </StepLayout>
  );
}

const styles = StyleSheet.create({
  block: { marginTop: spacing.lg },
  blockLabel: { fontSize: 12, color: colors.sub, marginBottom: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  hint: { fontSize: 12, color: colors.sub, marginTop: spacing.sm, lineHeight: 18 },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  switchText: { flex: 1 },
  switchLabel: { fontSize: 14, color: colors.text, fontWeight: '700' },
  flatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.card,
    marginBottom: spacing.sm,
  },
  flatRowActive: { borderColor: colors.accent, borderWidth: 1.5, backgroundColor: colors.accentSoft },
  flatLeft: { flex: 1 },
  flatName: { fontSize: 14, fontWeight: '700', color: colors.text },
  flatNote: { fontSize: 11, color: colors.sub, marginTop: 2, lineHeight: 16 },
  flatPrice: { fontSize: 16, fontWeight: '800', color: colors.text },
  flatPriceActive: { color: colors.accent },
  warn: {
    marginTop: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.warnSoft,
  },
  warnText: { fontSize: 12, color: colors.warn, lineHeight: 18 },
  warnStrong: { fontWeight: '800' },
  summary: { fontSize: 13, color: colors.sub },
  summaryValue: { fontSize: 15, fontWeight: '800', color: colors.text },
});
