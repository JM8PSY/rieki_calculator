import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { StepLayout } from '../src/components/StepLayout';
import { Chip, NumberField, Row, Segmented } from '../src/components/ui';
import { yen } from '../src/domain/format';
import { SIZE_PRESETS, sum3 } from '../src/domain/shipping';
import type { ShippingMode } from '../src/domain/types';
import { useFlow } from '../src/store/FlowContext';
import { useSettings } from '../src/store/SettingsContext';
import { colors, spacing } from '../src/theme';

export default function ShippingStep() {
  const router = useRouter();
  const { options, setOptions } = useSettings();
  const { dims, setDims } = useFlow();
  const next = () => router.push('/goal');

  const needsSize = options.shippingMode === 'auto';

  return (
    <StepLayout
      step={4}
      title="送料はどうする？"
      subtitle="サイズを入れると、各アプリで使える一番安い発送方法を自動で選びます。送料が決まっているなら直接入力でも構いません。"
      onNext={next}
      summary={
        <Text style={styles.summary}>
          {options.shippingMode === 'auto' ? (
            <>
              3辺合計 <Text style={styles.summaryValue}>{sum3(dims)}cm</Text>
              {'　'}重さ <Text style={styles.summaryValue}>{dims.weight}g</Text>
              {'　'}→ 最安の発送方法を自動選択
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
          { label: 'サイズから自動', value: 'auto' },
          { label: '送料を入力', value: 'manual' },
          { label: '購入者負担', value: 'buyer' },
        ]}
        value={options.shippingMode}
        onChange={(shippingMode) => setOptions({ shippingMode })}
      />

      {needsSize && (
        <View style={styles.block}>
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
            3辺合計 {sum3(dims)}cm ／ 厚さは3辺のうち一番短い辺として判定します。ポスト投函便（ネコポス・ゆうパケット）は
            厚さ3cm以内が条件です。
          </Text>
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
  summary: { fontSize: 13, color: colors.sub },
  summaryValue: { fontSize: 15, fontWeight: '800', color: colors.text },
});
