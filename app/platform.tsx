import { Link, useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { StepLayout } from '../src/components/StepLayout';
import { percent } from '../src/domain/format';
import { useFlow } from '../src/store/FlowContext';
import { useSettings } from '../src/store/SettingsContext';
import { colors, radius, spacing } from '../src/theme';

export default function PlatformStep() {
  const router = useRouter();
  const { platforms } = useSettings();
  const { platformId, setFlow } = useFlow();
  const next = () => router.push('/shipping');

  const enabled = platforms.filter((p) => p.enabled);
  const selected = platforms.find((p) => p.id === platformId);

  return (
    <StepLayout
      step={4}
      title="どこで売る？"
      subtitle="販路を決めると、そのアプリで実際に使える発送方法だけが次の画面に出ます。迷っているなら「全社を比較」を選べば、同じ条件で全部の販路を並べて比べられます。"
      onNext={next}
      summary={
        <Text style={styles.summary}>
          {platformId === 'all' ? (
            <>
              <Text style={styles.summaryValue}>全社を比較</Text>（{enabled.length}件の販路）
            </>
          ) : (
            <>
              <Text style={styles.summaryValue}>{selected?.name ?? '—'}</Text>
              {selected ? ` ・ 手数料 ${percent(selected.feeRate, 1)}` : ''}
            </>
          )}
        </Text>
      }
    >
      <Option
        title="全社を比較する"
        note="有効なすべての販路で計算し、利益の多い順・必要な売値の安い順に並べます"
        active={platformId === 'all'}
        onPress={() => setFlow({ platformId: 'all' })}
      />

      <Text style={styles.sectionLabel}>販路を1つに決める</Text>
      {enabled.map((p) => (
        <Option
          key={p.id}
          title={p.name}
          note={`手数料 ${percent(p.feeRate, 1)}${p.feeFixed ? ` + ${p.feeFixed}円` : ''}${
            p.payoutFee ? ` ・ 振込 ${p.payoutFee}円` : ''
          }`}
          badge={p.anonymousDelivery ? '匿名配送あり' : undefined}
          active={platformId === p.id}
          onPress={() => setFlow({ platformId: p.id })}
        />
      ))}

      <Link href="/settings" asChild>
        <Pressable hitSlop={8}>
          <Text style={styles.link}>販路の追加・手数料の編集</Text>
        </Pressable>
      </Link>
    </StepLayout>
  );
}

function Option({
  title,
  note,
  badge,
  active,
  onPress,
}: {
  title: string;
  note: string;
  badge?: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={[styles.row, active && styles.rowActive]} onPress={onPress}>
      <View style={styles.radio}>{active && <View style={styles.radioDot} />}</View>
      <View style={styles.rowText}>
        <View style={styles.titleRow}>
          <Text style={styles.rowTitle}>{title}</Text>
          {badge ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.rowNote}>{note}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
  rowTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  rowNote: { fontSize: 11, color: colors.sub, marginTop: 2, lineHeight: 16 },
  badge: { backgroundColor: '#e6f4ea', borderRadius: 999, paddingHorizontal: 7, paddingVertical: 1 },
  badgeText: { fontSize: 9, fontWeight: '700', color: colors.profit },
  sectionLabel: {
    fontSize: 12,
    color: colors.sub,
    fontWeight: '700',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  link: { color: colors.accent, fontSize: 13, fontWeight: '600', marginTop: spacing.lg },
  summary: { fontSize: 13, color: colors.sub },
  summaryValue: { fontSize: 15, fontWeight: '800', color: colors.text },
});
