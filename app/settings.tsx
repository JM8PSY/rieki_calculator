import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, NumberField, Row, Segmented, TextField } from '../src/components/ui';
import { yen } from '../src/domain/format';
import { newMaterialId, STORE_LABEL, STORE_ORDER } from '../src/domain/materials';
import { DEFAULTS_UPDATED_AT } from '../src/domain/platforms';
import { METHOD_BY_ID, SHIPPING_METHODS } from '../src/domain/shipping';
import type { MaterialStore } from '../src/domain/types';
import { useSettings } from '../src/store/SettingsContext';
import { colors, radius, spacing } from '../src/theme';

const EMPTY_DRAFT = {
  name: '',
  store: 'other' as MaterialStore,
  price: 0,
  maxSum3: 0,
  maxThickness: 0,
};

export default function SettingsScreen() {
  const {
    platforms,
    materials,
    updatePlatform,
    updateShippingFare,
    updateMaterial,
    addMaterial,
    removeMaterial,
    resetAll,
  } = useSettings();
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [materialsOpen, setMaterialsOpen] = useState(false);
  const [draft, setDraft] = useState(EMPTY_DRAFT);

  const confirmReset = () => {
    Alert.alert(
      '初期値に戻す',
      '手数料・送料・資材の編集内容をすべて破棄します（自分で追加した資材も消えます）。よろしいですか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        { text: '戻す', style: 'destructive', onPress: resetAll },
      ],
    );
  };

  const confirmRemoveMaterial = (id: string, name: string) => {
    Alert.alert('資材を削除', `「${name}」を削除します。よろしいですか？`, [
      { text: 'キャンセル', style: 'cancel' },
      { text: '削除', style: 'destructive', onPress: () => removeMaterial(id) },
    ]);
  };

  const submitDraft = () => {
    const name = draft.name.trim();
    if (!name) return;
    const limit =
      draft.maxSum3 > 0 || draft.maxThickness > 0
        ? {
            ...(draft.maxSum3 > 0 ? { maxSum3: draft.maxSum3 } : {}),
            ...(draft.maxThickness > 0 ? { maxThickness: draft.maxThickness } : {}),
          }
        : undefined;
    addMaterial({
      id: newMaterialId(),
      name,
      store: draft.store,
      price: draft.price,
      limit,
      custom: true,
    });
    setDraft(EMPTY_DRAFT);
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
                          {m.note ? ` ／ ${m.note}` : ''}
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

        {/* ── 梱包資材 ───────────────────────────────── */}
        <Card>
          <Pressable onPress={() => setMaterialsOpen((v) => !v)}>
            <Text style={styles.name}>梱包資材</Text>
            <Text style={styles.sub}>
              単価の調整・使わない資材の非表示・自分の資材の追加ができます
            </Text>
            <Text style={styles.toggle}>{materialsOpen ? '閉じる' : '編集する'}</Text>
          </Pressable>

          {materialsOpen && (
            <View style={styles.detail}>
              {STORE_ORDER.map((store) => {
                const items = materials.filter((m) => m.store === store);
                if (items.length === 0) return null;
                return (
                  <View key={store}>
                    <Text style={styles.sectionLabel}>{STORE_LABEL[store]}</Text>
                    {items.map((m) => (
                      <View key={m.id} style={[styles.matRow, m.hidden && styles.matRowOff]}>
                        <View style={styles.matHead}>
                          <Text style={styles.fareName}>{m.name}</Text>
                          {m.custom && (
                            <Pressable
                              onPress={() => confirmRemoveMaterial(m.id, m.name)}
                              hitSlop={8}
                            >
                              <Text style={styles.delete}>削除</Text>
                            </Pressable>
                          )}
                        </View>
                        <Text style={styles.fareNote}>
                          {m.dedicatedTo
                            ? `${METHOD_BY_ID[m.dedicatedTo]?.name ?? m.dedicatedTo}専用（送料に自動加算）`
                            : [
                                m.note,
                                m.limit?.maxSum3 ? `3辺合計 ${m.limit.maxSum3}cm まで` : null,
                                m.limit?.maxThickness ? `厚さ ${m.limit.maxThickness}cm まで` : null,
                              ]
                                .filter(Boolean)
                                .join(' ／ ') || `現在 ${yen(m.price)}`}
                        </Text>
                        <View style={styles.matControls}>
                          <View style={styles.matPrice}>
                            <NumberField
                              value={m.price}
                              onChange={(price) => updateMaterial(m.id, { price })}
                              suffix="円"
                            />
                          </View>
                          {!m.dedicatedTo && (
                            <View style={styles.useToggle}>
                              <Text style={styles.useLabel}>{m.hidden ? '使わない' : '使う'}</Text>
                              <Switch
                                value={!m.hidden}
                                onValueChange={(v) => updateMaterial(m.id, { hidden: !v })}
                              />
                            </View>
                          )}
                        </View>
                      </View>
                    ))}
                  </View>
                );
              })}

              {/* 資材を追加 */}
              <Text style={styles.sectionLabel}>資材を追加</Text>
              <TextField
                label="名前"
                value={draft.name}
                onChange={(name) => setDraft((d) => ({ ...d, name }))}
                placeholder="例：プチプチ（1回分）"
              />
              <Text style={styles.fieldLabel}>購入先</Text>
              <Segmented<MaterialStore>
                options={[
                  { label: '郵便局', value: 'japanpost' },
                  { label: 'ヤマト', value: 'yamato' },
                  { label: 'その他', value: 'other' },
                ]}
                value={draft.store}
                onChange={(store) => setDraft((d) => ({ ...d, store }))}
              />
              <View style={{ height: spacing.md }} />
              <NumberField
                label="単価"
                value={draft.price}
                onChange={(price) => setDraft((d) => ({ ...d, price }))}
                suffix="円"
              />
              <Row>
                <NumberField
                  label="3辺合計の上限（0で指定なし）"
                  value={draft.maxSum3}
                  onChange={(maxSum3) => setDraft((d) => ({ ...d, maxSum3 }))}
                  suffix="cm"
                  flex={1}
                />
                <NumberField
                  label="厚さの上限（0で指定なし）"
                  value={draft.maxThickness}
                  onChange={(maxThickness) => setDraft((d) => ({ ...d, maxThickness }))}
                  suffix="cm"
                  flex={1}
                />
              </Row>
              <Button label="追加する" onPress={submitDraft} disabled={!draft.name.trim()} />
              <Text style={styles.fareNote}>
                サイズの上限を入れると、その大きさに収まるときだけ計算画面に「サイズ適合」として
                表示されます。追加した資材は端末に保存されます。
              </Text>
            </View>
          )}
        </Card>

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
  fieldLabel: { fontSize: 12, color: colors.sub, marginBottom: spacing.xs },
  matRow: {
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  matRowOff: { opacity: 0.5 },
  matHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  matControls: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.xs },
  matPrice: { width: 130 },
  useToggle: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  useLabel: { fontSize: 12, color: colors.sub },
  delete: { fontSize: 12, color: colors.loss, fontWeight: '700' },
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
