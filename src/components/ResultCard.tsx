import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ShippingOption } from '../domain/shipping';
import { labelFor } from '../domain/calc';
import { percent, yen } from '../domain/format';
import type { Breakdown } from '../domain/types';
import { colors, radius, spacing } from '../theme';
import { Chip, KeyValue } from './ui';

type Props = {
  breakdown: Breakdown;
  mode: 'price' | 'target';
  best?: boolean;
  expanded: boolean;
  onToggle: () => void;
  shippingOptions: ShippingOption[];
  selectedMethodId?: string;
  onSelectMethod: (methodId: string | undefined) => void;
  showMethodPicker: boolean;
};

export function ResultCard({
  breakdown: b,
  mode,
  best,
  expanded,
  onToggle,
  shippingOptions,
  selectedMethodId,
  onSelectMethod,
  showMethodPicker,
}: Props) {
  const positive = b.profit >= 0;
  const headline = mode === 'price' ? yen(b.profit) : yen(b.price);
  const headlineTone = mode === 'price' ? (positive ? colors.profit : colors.loss) : colors.text;

  const sub =
    mode === 'price'
      ? `${yen(b.price)}で販売 ・ 利益率 ${percent(b.margin)}`
      : `利益 ${yen(b.profit)} ・ 利益率 ${percent(b.margin)}`;

  return (
    <Pressable onPress={onToggle} style={[styles.card, best && styles.cardBest]}>
      <View style={styles.head}>
        <View style={styles.headLeft}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{b.platform.name}</Text>
            {best && b.ok ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>ベスト</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.sub}>{b.ok ? sub : (b.reason ?? '計算できません')}</Text>
        </View>
        {b.ok ? (
          <Text style={[styles.headline, { color: headlineTone }]}>
            {mode === 'price' && positive ? '+' : ''}
            {headline}
          </Text>
        ) : (
          <Text style={styles.ng}>—</Text>
        )}
      </View>

      {expanded && (
        <View style={styles.detail}>
          <KeyValue label="販売価格" value={yen(b.price)} />
          <KeyValue
            label={`販売手数料（${percent(b.platform.feeRate, 1)}${b.platform.feeFixed ? ` + ${b.platform.feeFixed}円` : ''}）`}
            value={`- ${yen(b.fee)}`}
            tone="sub"
          />
          <KeyValue label={`送料：${b.shippingLabel}`} value={`- ${yen(b.shipping)}`} tone="sub" />
          {b.dedicatedMaterialCost > 0 && (
            <Text style={styles.subNote}>
              ※ 送料には {b.dedicatedMaterialName}（{yen(b.dedicatedMaterialCost)}）を含みます
            </Text>
          )}
          {b.materialsCost > 0 && (
            <KeyValue label="梱包資材" value={`- ${yen(b.materialsCost)}`} tone="sub" />
          )}
          <KeyValue label="仕入れ・その他経費" value={`- ${yen(b.cost - b.materialsCost)}`} tone="sub" />
          {b.payoutFee > 0 && (
            <KeyValue label="振込手数料" value={`- ${yen(b.payoutFee)}`} tone="sub" />
          )}
          <View style={styles.divider} />
          <KeyValue
            label="手取り利益"
            value={yen(b.profit)}
            tone={b.profit >= 0 ? 'profit' : 'loss'}
          />

          {showMethodPicker && shippingOptions.length > 0 && (
            <View style={styles.picker}>
              <Text style={styles.pickerLabel}>発送方法を選ぶ</Text>
              <View style={styles.pickerRow}>
                <Chip
                  label="最安（自動）"
                  active={!selectedMethodId}
                  onPress={() => onSelectMethod(undefined)}
                />
                {shippingOptions.map((o) => (
                  <Chip
                    key={o.method.id}
                    label={labelFor(o)}
                    active={selectedMethodId === o.method.id}
                    onPress={() => onSelectMethod(o.method.id)}
                  />
                ))}
              </View>
            </View>
          )}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  cardBest: { borderColor: colors.profit, borderWidth: 1.5 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  headLeft: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  name: { fontSize: 16, fontWeight: '700', color: colors.text },
  badge: {
    backgroundColor: colors.profit,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  sub: { fontSize: 12, color: colors.sub, marginTop: 3 },
  headline: { fontSize: 24, fontWeight: '800', fontVariant: ['tabular-nums'] },
  ng: { fontSize: 20, color: colors.sub },
  detail: { marginTop: spacing.md, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border, paddingTop: spacing.md },
  subNote: { fontSize: 11, color: colors.sub, marginTop: 2, marginBottom: 2, lineHeight: 16 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginVertical: spacing.sm },
  picker: { marginTop: spacing.md },
  pickerLabel: { fontSize: 12, color: colors.sub, marginBottom: spacing.sm },
  pickerRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
