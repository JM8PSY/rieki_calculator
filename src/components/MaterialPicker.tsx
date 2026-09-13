import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { yen } from '../domain/format';
import { selectableMaterials, STORE_LABEL, STORE_ORDER } from '../domain/materials';
import { fitsLimit } from '../domain/shipping';
import type { Dimensions, MaterialStore, PackagingMaterial } from '../domain/types';
import { colors, radius, spacing } from '../theme';

type Props = {
  materials: PackagingMaterial[];
  /** 資材ID -> 個数 */
  selected: Record<string, number>;
  onChange: (selected: Record<string, number>) => void;
  dims: Dimensions;
};

export function MaterialPicker({ materials, selected, onChange, dims }: Props) {
  const [fitOnly, setFitOnly] = useState(true);

  const grouped = useMemo(() => {
    const list = selectableMaterials(materials);
    return STORE_ORDER.map((store) => ({
      store: store as MaterialStore,
      items: list.filter((m) => m.store === store),
    })).filter((g) => g.items.length > 0);
  }, [materials]);

  /** 中身のサイズがこの資材に収まるか（limit 未設定なら常に OK） */
  const fits = (m: PackagingMaterial) => (m.limit ? fitsLimit(m.limit, dims) : true);

  const setQty = (id: string, qty: number) => {
    const next = { ...selected };
    if (qty <= 0) delete next[id];
    else next[id] = qty;
    onChange(next);
  };

  return (
    <View>
      <View style={styles.filterRow}>
        <Text style={styles.filterLabel}>今のサイズに合う資材だけ表示</Text>
        <Switch value={fitOnly} onValueChange={setFitOnly} />
      </View>

      {grouped.map((group) => {
        const items = group.items.filter((m) => !fitOnly || fits(m) || (selected[m.id] ?? 0) > 0);
        if (items.length === 0) return null;
        return (
          <View key={group.store} style={styles.group}>
            <Text style={styles.groupTitle}>{STORE_LABEL[group.store]}</Text>
            {items.map((m) => {
              const qty = selected[m.id] ?? 0;
              const recommended = m.limit != null && fits(m);
              return (
                <View key={m.id} style={[styles.row, qty > 0 && styles.rowActive]}>
                  <View style={styles.rowLeft}>
                    <View style={styles.nameRow}>
                      <Text style={styles.name} numberOfLines={2}>
                        {m.name}
                      </Text>
                      {recommended && (
                        <View style={styles.badge}>
                          <Text style={styles.badgeText}>サイズ適合</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.meta}>
                      {yen(m.price)}
                      {m.note ? ` ・ ${m.note}` : ''}
                    </Text>
                  </View>

                  <View style={styles.stepper}>
                    <Pressable
                      style={[styles.stepBtn, qty === 0 && styles.stepBtnDisabled]}
                      onPress={() => setQty(m.id, qty - 1)}
                      disabled={qty === 0}
                      hitSlop={6}
                    >
                      <Text style={[styles.stepText, qty === 0 && styles.stepTextDisabled]}>−</Text>
                    </Pressable>
                    <Text style={styles.qty}>{qty}</Text>
                    <Pressable style={styles.stepBtn} onPress={() => setQty(m.id, qty + 1)} hitSlop={6}>
                      <Text style={styles.stepText}>＋</Text>
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  filterLabel: { fontSize: 12, color: colors.sub },
  group: { marginTop: spacing.sm },
  groupTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.sub,
    marginBottom: spacing.xs,
    letterSpacing: 0.4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
  },
  rowActive: { backgroundColor: colors.accentSoft },
  rowLeft: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flexWrap: 'wrap' },
  name: { fontSize: 13, color: colors.text, fontWeight: '600', flexShrink: 1 },
  badge: {
    backgroundColor: colors.profit,
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '700' },
  meta: { fontSize: 11, color: colors.sub, marginTop: 2 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  stepBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  stepBtnDisabled: { opacity: 0.4 },
  stepText: { fontSize: 15, color: colors.accent, fontWeight: '700' },
  stepTextDisabled: { color: colors.sub },
  qty: { fontSize: 14, fontWeight: '700', color: colors.text, minWidth: 16, textAlign: 'center' },
});
