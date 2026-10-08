import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { StepLayout } from '../src/components/StepLayout';
import { Chip, NumberField, Row } from '../src/components/ui';
import { isAnonymous } from '../src/domain/calc';
import { yen } from '../src/domain/format';
import { dedicatedMapOf } from '../src/domain/materials';
import {
  describeLimit,
  FLAT_RATE_METHODS,
  groupShippingOptions,
  LIST_GROUP_LABEL,
  METHOD_BY_ID,
  SIZE_PRESETS,
  sum3,
  type ListGroup,
} from '../src/domain/shipping';
import type { Platform, ShippingMode } from '../src/domain/types';
import { useFlow } from '../src/store/FlowContext';
import { useSettings } from '../src/store/SettingsContext';
import { colors, radius, spacing } from '../src/theme';

export default function ShippingStep() {
  const router = useRouter();
  const { options, setOptions, platforms, materials, updateShippingFare } = useSettings();
  const { dims, setDims, platformId, methodOverrides, setFlow } = useFlow();
  const next = () => router.push('/materials');

  const platform = platforms.find((p) => p.id === platformId);
  const compareAll = platformId === 'all' || !platform;

  return compareAll ? (
    <CompareMode onNext={next} />
  ) : (
    <SinglePlatformMode
      platform={platform}
      onNext={next}
      dims={dims}
      setDims={setDims}
      options={options}
      setOptions={setOptions}
      materials={materials}
      updateShippingFare={updateShippingFare}
      methodOverrides={methodOverrides}
      setOverride={(id) => {
        const nextOverrides = { ...methodOverrides };
        if (id) nextOverrides[platform.id] = id;
        else delete nextOverrides[platform.id];
        setFlow({ methodOverrides: nextOverrides });
      }}
    />
  );
}

/* ───────────────────────── 販路を1つに決めた場合 ───────────────────────── */

/** 一覧で最初は折りたたんでおくグループ。小型の定額便を先に見せるため */
const COLLAPSED_GROUPS: readonly ListGroup[] = ['partner_sized', 'self'];

function SinglePlatformMode({
  platform,
  onNext,
  dims,
  setDims,
  options,
  setOptions,
  materials,
  updateShippingFare,
  methodOverrides,
  setOverride,
}: {
  platform: Platform;
  onNext: () => void;
  dims: ReturnType<typeof useFlow>['dims'];
  setDims: ReturnType<typeof useFlow>['setDims'];
  options: ReturnType<typeof useSettings>['options'];
  setOptions: ReturnType<typeof useSettings>['setOptions'];
  materials: ReturnType<typeof useSettings>['materials'];
  updateShippingFare: ReturnType<typeof useSettings>['updateShippingFare'];
  methodOverrides: Record<string, string>;
  setOverride: (methodId?: string) => void;
}) {
  /** 初期状態で折りたたむグループ。タップで開閉する */
  const [expanded, setExpanded] = useState<Partial<Record<ListGroup, boolean>>>({});
  const dedicated = useMemo(() => dedicatedMapOf(materials), [materials]);

  /** 送料の安い順。専用資材が要るものはその分を足した金額で並べる */
  const methods = useMemo(
    () =>
      Object.entries(platform.shipping)
        .map(([id, fare]) => {
          const method = METHOD_BY_ID[id];
          if (!method) return null;
          const material = dedicated[id];
          return { method, fare, material, total: fare + (material?.price ?? 0) };
        })
        .filter((m): m is NonNullable<typeof m> => m !== null)
        .sort((a, b) => a.total - b.total),
    [platform.shipping, dedicated],
  );

  const override = methodOverrides[platform.id];
  const selection =
    options.shippingMode === 'manual'
      ? 'manual'
      : options.shippingMode === 'buyer'
        ? 'buyer'
        : options.shippingMode === 'flat'
          ? options.flatMethodId
          : (override ?? 'auto');

  const select = (value: string) => {
    if (value === 'manual' || value === 'buyer') {
      setOptions({ shippingMode: value });
      return;
    }
    setOptions({ shippingMode: 'auto' });
    setOverride(value === 'auto' ? undefined : value);
  };

  const chosen = selection !== 'auto' ? METHOD_BY_ID[selection] : undefined;

  const grouped = useMemo(() => groupShippingOptions(methods), [methods]);

  return (
    <StepLayout
      step={4}
      title={`${platform.name}でどう送る？`}
      subtitle="この販路で実際に使える発送方法だけを並べています。方法を選べば送料が確定するので、サイズの入力は要りません。"
      onNext={onNext}
      summary={
        <Text style={styles.summary}>
          {selection === 'auto' ? (
            <>
              3辺合計 <Text style={styles.summaryValue}>{sum3(dims)}cm</Text>
              {'　'}重さ <Text style={styles.summaryValue}>{dims.weight}g</Text> → 最安を自動選択
            </>
          ) : selection === 'manual' ? (
            <>
              送料 <Text style={styles.summaryValue}>{yen(options.manualShipping)}</Text>（手入力）
            </>
          ) : selection === 'buyer' ? (
            <>送料は購入者負担</>
          ) : (
            <>
              <Text style={styles.summaryValue}>{chosen?.name}</Text>{' '}
              {yen(methods.find((m) => m.method.id === selection)?.total ?? 0)}
              {isAnonymous(platform, selection) ? ' ・匿名配送' : ' ・匿名配送にならない'}
            </>
          )}
        </Text>
      }
    >
      <MethodRow
        title="サイズから自動で最安を選ぶ"
        note="縦横・厚さ・重さを入れると、条件に合う中で一番安い方法を選びます"
        active={selection === 'auto'}
        onPress={() => select('auto')}
      />

      {selection === 'auto' && (
        <View style={styles.autoBlock}>
          <View style={styles.switchRow}>
            <View style={styles.switchText}>
              <Text style={styles.switchLabel}>匿名配送だけを使う</Text>
              <Text style={styles.hint}>
                レターパックなどの自己発送を候補から外します
              </Text>
            </View>
            <Switch
              value={options.anonymousOnly}
              onValueChange={(anonymousOnly) => setOptions({ anonymousOnly })}
            />
          </View>
          <SizeInputs dims={dims} setDims={setDims} onSubmit={onNext} />
        </View>
      )}

      <Text style={styles.sectionLabel}>発送方法を直接えらぶ（サイズ入力なし）</Text>
      {grouped.map((group) => {
        const collapsible = COLLAPSED_GROUPS.includes(group.group);
        const holdsSelection = group.items.some((m) => m.method.id === selection);
        const collapsed = collapsible && !expanded[group.group] && !holdsSelection;
        return (
          <View key={group.group}>
            <Pressable
              style={styles.groupHead}
              onPress={() =>
                collapsible && setExpanded((e) => ({ ...e, [group.group]: collapsed }))
              }
              disabled={!collapsible || holdsSelection}
            >
              <Text style={styles.groupTitle}>{LIST_GROUP_LABEL[group.group]}</Text>
              {collapsible && !holdsSelection && (
                <Text style={styles.groupToggle}>
                  {collapsed ? `${group.items.length}件を表示` : '隠す'}
                </Text>
              )}
            </Pressable>

            {!collapsed &&
              group.items.map(({ method, fare, material, total }) => (
                <View key={method.id}>
                  <MethodRow
                    title={method.name}
                    note={`${method.carrier} ・ ${describeLimit(method.limit)}${
                      method.note ? ` ・ ${method.note}` : ''
                    }`}
                    price={method.manualPrice ? undefined : total}
                    priceLabel={method.manualPrice ? '料金を入力' : undefined}
                    subPrice={material ? `送料${fare}円 + 資材${material.price}円` : undefined}
                    badge={
                      platform.anonymousDelivery
                        ? isAnonymous(platform, method.id)
                          ? { label: '匿名配送', tone: 'ok' as const }
                          : { label: '匿名×', tone: 'warn' as const }
                        : undefined
                    }
                    active={selection === method.id}
                    onPress={() => select(method.id)}
                  />
                  {method.manualPrice && selection === method.id && (
                    <View style={styles.manualBox}>
                      <NumberField
                        label={`${method.name}の実際の送料`}
                        value={fare}
                        onChange={(v) => updateShippingFare(platform.id, method.id, v)}
                        suffix="円"
                      />
                    </View>
                  )}
                </View>
              ))}
          </View>
        );
      })}

      <Text style={styles.sectionLabel}>そのほか</Text>
      <MethodRow
        title="送料を手入力する"
        note="すでに送料が分かっている場合"
        active={selection === 'manual'}
        onPress={() => select('manual')}
      />
      {selection === 'manual' && (
        <View style={styles.autoBlock}>
          <ManualField options={options} setOptions={setOptions} onSubmit={onNext} />
        </View>
      )}
      <MethodRow
        title="送料は購入者負担"
        note="着払い・送料別。出品者の負担は0円"
        active={selection === 'buyer'}
        onPress={() => select('buyer')}
      />
    </StepLayout>
  );
}

/* ───────────────────────── 全社を比較する場合 ───────────────────────── */

function CompareMode({ onNext }: { onNext: () => void }) {
  const { options, setOptions, platforms } = useSettings();
  const { dims, setDims } = useFlow();

  const flatPriceOf = (id: string) =>
    platforms.find((p) => p.enabled && p.shipping[id] != null)?.shipping[id] ?? 0;
  const flatMethod = FLAT_RATE_METHODS.find((m) => m.id === options.flatMethodId);

  return (
    <StepLayout
      step={4}
      title="送料はどうする？"
      subtitle="全社を比較するので、各アプリで使える最安の方法をサイズから自動で選びます。レターパックなど送料が決まっている便を使うならサイズ入力は要りません。"
      onNext={onNext}
      summary={
        <Text style={styles.summary}>
          {options.shippingMode === 'auto' ? (
            <>
              3辺合計 <Text style={styles.summaryValue}>{sum3(dims)}cm</Text>
              {'　'}重さ <Text style={styles.summaryValue}>{dims.weight}g</Text> → 最安を自動選択
            </>
          ) : options.shippingMode === 'flat' ? (
            <>
              <Text style={styles.summaryValue}>{flatMethod?.name ?? '定額便'}</Text>{' '}
              {yen(flatPriceOf(options.flatMethodId))}（全国一律）
            </>
          ) : options.shippingMode === 'manual' ? (
            <>
              送料 <Text style={styles.summaryValue}>{yen(options.manualShipping)}</Text>（手入力）
            </>
          ) : (
            <>送料は購入者負担</>
          )}
        </Text>
      }
    >
      <Segmented4
        value={options.shippingMode}
        onChange={(shippingMode) => setOptions({ shippingMode })}
      />

      {options.shippingMode === 'auto' && (
        <View style={styles.autoBlock}>
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
          <SizeInputs dims={dims} setDims={setDims} onSubmit={onNext} />
        </View>
      )}

      {options.shippingMode === 'flat' && (
        <View style={styles.autoBlock}>
          {FLAT_RATE_METHODS.map((m) => (
            <MethodRow
              key={m.id}
              title={m.name}
              note={`${describeLimit(m.limit)} ・ ${m.tracking ? '追跡あり' : '追跡なし'}`}
              price={flatPriceOf(m.id)}
              active={options.flatMethodId === m.id}
              onPress={() => setOptions({ flatMethodId: m.id })}
            />
          ))}
          <View style={styles.warn}>
            <Text style={styles.warnText}>
              定額便はすべて自己発送のため{' '}
              <Text style={styles.warnStrong}>匿名配送になりません</Text>。
              送り状に自分の住所・氏名を書く必要があり、フリマ各社の配送補償の対象外です。
            </Text>
          </View>
        </View>
      )}

      {options.shippingMode === 'manual' && (
        <View style={styles.autoBlock}>
          <ManualField options={options} setOptions={setOptions} onSubmit={onNext} />
        </View>
      )}

      {options.shippingMode === 'buyer' && (
        <Text style={styles.hint}>
          着払い・購入者負担のため、出品者の送料は 0円 として計算します。
        </Text>
      )}
    </StepLayout>
  );
}

/* ───────────────────────── 共通パーツ ───────────────────────── */

function Segmented4({
  value,
  onChange,
}: {
  value: ShippingMode;
  onChange: (v: ShippingMode) => void;
}) {
  const items: { label: string; value: ShippingMode }[] = [
    { label: 'サイズ自動', value: 'auto' },
    { label: '定額便', value: 'flat' },
    { label: '送料入力', value: 'manual' },
    { label: '購入者負担', value: 'buyer' },
  ];
  return (
    <View style={styles.segmented}>
      {items.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            style={[styles.segment, active && styles.segmentActive]}
          >
            <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function MethodRow({
  title,
  note,
  price,
  priceLabel,
  subPrice,
  badge,
  active,
  onPress,
}: {
  title: string;
  note: string;
  price?: number;
  priceLabel?: string;
  subPrice?: string;
  badge?: { label: string; tone: 'ok' | 'warn' };
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={[styles.row, active && styles.rowActive]} onPress={onPress}>
      <View style={styles.radio}>{active && <View style={styles.radioDot} />}</View>
      <View style={styles.rowText}>
        <View style={styles.titleRow}>
          <Text style={styles.rowTitle}>{title}</Text>
          {badge && (
            <View style={[styles.badge, badge.tone === 'warn' && styles.badgeWarn]}>
              <Text style={[styles.badgeText, badge.tone === 'warn' && styles.badgeTextWarn]}>
                {badge.label}
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.rowNote}>{note}</Text>
      </View>
      {(price != null || priceLabel) && (
        <View style={styles.priceBox}>
          <Text style={[styles.price, active && styles.priceActive, priceLabel && styles.priceHint]}>
            {priceLabel ?? yen(price ?? 0)}
          </Text>
          {subPrice ? <Text style={styles.subPrice}>{subPrice}</Text> : null}
        </View>
      )}
    </Pressable>
  );
}

function SizeInputs({
  dims,
  setDims,
  onSubmit,
}: {
  dims: ReturnType<typeof useFlow>['dims'];
  setDims: ReturnType<typeof useFlow>['setDims'];
  onSubmit: () => void;
}) {
  return (
    <View>
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
        onSubmit={onSubmit}
      />
      <Text style={styles.hint}>
        3辺合計 {sum3(dims)}cm ／ 厚さは3辺のうち一番短い辺として判定します。
      </Text>
    </View>
  );
}

function ManualField({
  options,
  setOptions,
  onSubmit,
}: {
  options: ReturnType<typeof useSettings>['options'];
  setOptions: ReturnType<typeof useSettings>['setOptions'];
  onSubmit: () => void;
}) {
  return (
    <NumberField
      label="送料"
      value={options.manualShipping}
      onChange={(manualShipping) => setOptions({ manualShipping })}
      suffix="円"
      big
      onSubmit={onSubmit}
    />
  );
}

const styles = StyleSheet.create({
  autoBlock: { marginTop: spacing.sm, marginBottom: spacing.lg },
  blockLabel: { fontSize: 12, color: colors.sub, marginBottom: spacing.sm, marginTop: spacing.sm },
  sectionLabel: {
    fontSize: 12,
    color: colors.sub,
    fontWeight: '700',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  hint: { fontSize: 12, color: colors.sub, marginTop: spacing.sm, lineHeight: 18 },
  switchRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, marginBottom: spacing.md },
  switchText: { flex: 1 },
  switchLabel: { fontSize: 14, color: colors.text, fontWeight: '700' },
  row: {
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
  rowActive: { borderColor: colors.accent, borderWidth: 1.5, backgroundColor: colors.accentSoft },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.accent },
  rowText: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  rowTitle: { fontSize: 14, fontWeight: '700', color: colors.text },
  rowNote: { fontSize: 11, color: colors.sub, marginTop: 2, lineHeight: 16 },
  badge: { backgroundColor: '#e6f4ea', borderRadius: 999, paddingHorizontal: 7, paddingVertical: 1 },
  badgeWarn: { backgroundColor: colors.warnSoft },
  badgeText: { fontSize: 9, fontWeight: '700', color: colors.profit },
  badgeTextWarn: { color: colors.warn },
  priceBox: { alignItems: 'flex-end' },
  price: { fontSize: 15, fontWeight: '800', color: colors.text },
  priceActive: { color: colors.accent },
  priceHint: { fontSize: 11, fontWeight: '700', color: colors.warn },
  groupHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  groupTitle: { fontSize: 11, fontWeight: '700', color: colors.sub, letterSpacing: 0.3 },
  groupToggle: { fontSize: 11, fontWeight: '700', color: colors.accent },
  manualBox: { marginBottom: spacing.sm, paddingHorizontal: spacing.md },
  subPrice: { fontSize: 9, color: colors.sub, marginTop: 1 },
  segmented: { flexDirection: 'row', backgroundColor: colors.bg, borderRadius: radius.md, padding: 3, gap: 3 },
  segment: { flex: 1, paddingVertical: 9, borderRadius: radius.sm, alignItems: 'center' },
  segmentActive: { backgroundColor: colors.card },
  segmentText: { fontSize: 12, color: colors.sub, fontWeight: '600' },
  segmentTextActive: { color: colors.accent },
  warn: { marginTop: spacing.sm, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.warnSoft },
  warnText: { fontSize: 12, color: colors.warn, lineHeight: 18 },
  warnStrong: { fontWeight: '800' },
  summary: { fontSize: 13, color: colors.sub },
  summaryValue: { fontSize: 15, fontWeight: '800', color: colors.text },
});
