import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, NumberField, Row } from '../src/components/ui';
import { DEFAULTS_UPDATED_AT } from '../src/domain/platforms';
import { METHOD_BY_ID, SHIPPING_METHODS } from '../src/domain/shipping';
import { useSettings } from '../src/store/SettingsContext';
import { colors, radius, spacing } from '../src/theme';

export default function SettingsScreen() {
  const { platforms, updatePlatform, updateShippingFare, resetAll } = useSettings();
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const confirmReset = () => {
    Alert.alert('初期値に戻す', '手数料・送料の編集内容をすべて破棄します。よろしいですか？', [
      { text: 'キャンセル', style: 'cancel' },
      { text: '戻す', style: 'destructive', onPress: resetAll },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.intro}>
          初期値は {DEFAULTS_UPDATED_AT} 時点の目安です。各社の改定後は、ここで自分の実績値に直してください。
        </Text>

        {platforms.map((p) => {
          const isOpen = !!open[p.id];
          return (
            <Card key={p.id}>
              <View style={styles.head}>
                <Pressable style={styles.headLeft} onPress={() => setOpen((s) => ({ ...s, [p.id]: !isOpen }))}>
                  <Text style={styles.name}>{p.name}</Text>
                  <Text style={styles.sub}>
                    手数料 {(p.feeRate * 100).toFixed(1)}%
                    {p.feeFixed ? ` + ${p.feeFixed}円` : ''}
                    {p.payoutFee ? ` ／ 振込 ${p.payoutFee}円` : ''}
                  </Text>
                  {p.note ? <Text style={styles.note}>{p.note}</Text> : null}
                </Pressable>
                <Switch value={p.enabled} onValueChange={(enabled) => updatePlatform(p.id, { enabled })} />
              </View>

              <Pressable onPress={() => setOpen((s) => ({ ...s, [p.id]: !isOpen }))}>
                <Text style={styles.toggle}>{isOpen ? '閉じる' : '手数料・送料を編集'}</Text>
              </Pressable>

              {isOpen && (
                <View style={styles.detail}>
                  <Row>
                    <NumberField
                      label="販売手数料"
                      value={Math.round(p.feeRate * 1000) / 10}
                      onChange={(v) => updatePlatform(p.id, { feeRate: v / 100 })}
                      suffix="%"
                      flex={1}
                    />
                    <NumberField
                      label="固定手数料"
                      value={p.feeFixed}
                      onChange={(feeFixed) => updatePlatform(p.id, { feeFixed })}
                      suffix="円"
                      flex={1}
                    />
                  </Row>
                  <Row>
                    <NumberField
                      label="振込手数料"
                      value={p.payoutFee}
                      onChange={(payoutFee) => updatePlatform(p.id, { payoutFee })}
                      suffix="円"
                      flex={1}
                    />
                    <NumberField
                      label="最低出品価格"
                      value={p.minPrice}
                      onChange={(minPrice) => updatePlatform(p.id, { minPrice })}
                      suffix="円"
                      flex={1}
                    />
                  </Row>

                  <Text style={styles.sectionLabel}>送料（0円にすると選択肢から外れます）</Text>
                  {SHIPPING_METHODS.filter((m) => p.shipping[m.id] != null).map((m) => (
                    <View key={m.id} style={styles.fareRow}>
                      <View style={styles.fareLabel}>
                        <Text style={styles.fareName}>{m.name}</Text>
                        <Text style={styles.fareNote}>
                          {m.carrier}
                          {m.materialCost ? ` ／ 資材 ${m.materialCost}円` : ''}
                        </Text>
                      </View>
                      <View style={styles.fareInput}>
                        <NumberField

                          value={p.shipping[m.id]}
                          onChange={(fare) => updateShippingFare(p.id, m.id, fare)}
                          suffix="円"
                        />
                      </View>
                    </View>
                  ))}

                  <Text style={styles.sectionLabel}>使える発送方法を追加</Text>
                  <View style={styles.addRow}>
                    {SHIPPING_METHODS.filter((m) => p.shipping[m.id] == null).map((m) => (
                      <Pressable
                        key={m.id}
                        style={styles.addChip}
                        onPress={() => updateShippingFare(p.id, m.id, 0)}
                      >
                        <Text style={styles.addChipText}>+ {METHOD_BY_ID[m.id].name}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              )}
            </Card>
          );
        })}

        <Pressable style={styles.reset} onPress={confirmReset}>
          <Text style={styles.resetText}>すべて初期値に戻す</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: spacing.xl * 2 },
  intro: { fontSize: 12, color: colors.sub, lineHeight: 18, marginBottom: spacing.md },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  headLeft: { flex: 1 },
  name: { fontSize: 16, fontWeight: '700', color: colors.text },
  sub: { fontSize: 12, color: colors.sub, marginTop: 3 },
  note: { fontSize: 11, color: colors.sub, marginTop: 2 },
  toggle: { fontSize: 12, color: colors.accent, fontWeight: '600', marginTop: spacing.md },
  detail: { marginTop: spacing.md, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border, paddingTop: spacing.md },
  sectionLabel: { fontSize: 12, color: colors.sub, fontWeight: '700', marginTop: spacing.sm, marginBottom: spacing.sm },
  fareRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  fareLabel: { flex: 1 },
  fareName: { fontSize: 13, color: colors.text, fontWeight: '600' },
  fareNote: { fontSize: 11, color: colors.sub },
  fareInput: { width: 120 },
  addRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  addChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.accent,
  },
  addChipText: { fontSize: 12, color: colors.accent, fontWeight: '600' },
  reset: {
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.loss,
  },
  resetText: { color: colors.loss, fontWeight: '700', fontSize: 13 },
});
