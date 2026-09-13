import { Link, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialPicker } from '../src/components/MaterialPicker';
import { StepLayout } from '../src/components/StepLayout';
import { resolveShipping } from '../src/domain/calc';
import { yen } from '../src/domain/format';
import { materialsTotal, selectableMaterials, selectedMaterialLines } from '../src/domain/materials';
import { useFlow } from '../src/store/FlowContext';
import { useSettings } from '../src/store/SettingsContext';
import { colors, radius, spacing } from '../src/theme';

export default function MaterialsStep() {
  const router = useRouter();
  const { materials, platforms, options } = useSettings();
  const { costs, dims, platformId, methodOverrides, setCosts } = useFlow();

  const ctx = useMemo(
    () => ({ costs, dims, options, materials, methodOverrides }),
    [costs, dims, options, materials, methodOverrides],
  );

  /** 選んだ発送方法に必須の指定梱包資材（送料に自動で乗るぶん） */
  const required = useMemo(() => {
    const targets =
      platformId === 'all'
        ? platforms.filter((p) => p.enabled)
        : platforms.filter((p) => p.id === platformId);
    return targets
      .map((p) => ({ platform: p, ship: resolveShipping(p, ctx) }))
      .filter((r) => r.ship.ok && r.ship.materialCost > 0);
  }, [platforms, platformId, ctx]);

  const optional = selectableMaterials(materials);
  const total = materialsTotal(materials, costs.materials);
  const lines = selectedMaterialLines(materials, costs.materials);

  return (
    <StepLayout
      step={5}
      title="梱包資材はどうする？"
      subtitle="指定の梱包資材が要る発送方法は、その分を自動で送料に足しています。ほかに費用が乗る資材があれば足してください。"
      onNext={() => router.push('/goal')}
      nextLabel={lines.length === 0 ? 'このまま進む' : '次へ'}
      summary={
        <View>
          <Text style={styles.summary}>
            指定資材 <Text style={styles.summaryValue}>{yen(required[0]?.ship.materialCost ?? 0)}</Text>
            {'　'}追加資材 <Text style={styles.summaryValue}>{yen(total)}</Text>
          </Text>
          {lines.length > 0 && (
            <Text style={styles.lines} numberOfLines={2}>
              {lines.map((l) => `${l.material.name}×${l.qty}`).join(' ／ ')}
            </Text>
          )}
        </View>
      }
    >
      <Text style={styles.sectionLabel}>この発送方法に必要な指定梱包資材</Text>
      {required.length === 0 ? (
        <View style={styles.note}>
          <Text style={styles.noteText}>
            選んだ発送方法に指定の梱包資材はありません。封筒やダンボールは手持ちのもので構わないので、
            費用として数えないならこのまま進んでください。
          </Text>
        </View>
      ) : (
        required.map(({ platform, ship }) => (
          <View key={platform.id} style={styles.required}>
            <View style={styles.requiredLeft}>
              <Text style={styles.requiredName}>{ship.materialName}</Text>
              <Text style={styles.requiredNote}>
                {platformId === 'all' ? `${platform.name}：` : ''}
                {ship.label}
              </Text>
            </View>
            <Text style={styles.requiredPrice}>{yen(ship.materialCost)}</Text>
          </View>
        ))
      )}
      {required.length > 0 && (
        <Text style={styles.hint}>※ この金額はすでに送料に含めて計算しています</Text>
      )}

      <Text style={styles.sectionLabel}>ほかに費用が乗る資材（任意）</Text>
      {optional.length === 0 ? (
        <View style={styles.note}>
          <Text style={styles.noteText}>
            登録されている資材はありません。緩衝材やOPP袋など、毎回かならず費用がかかるものがあれば
            設定画面から登録すると、ここで個数を指定して原価に入れられます。
          </Text>
        </View>
      ) : (
        <MaterialPicker
          materials={materials}
          selected={costs.materials}
          onChange={(next) => setCosts({ materials: next })}
          dims={dims}
          initialFitOnly={false}
        />
      )}

      <Link href="/settings" asChild>
        <Pressable hitSlop={8}>
          <Text style={styles.link}>資材を追加・編集する</Text>
        </Pressable>
      </Link>
    </StepLayout>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: 12,
    color: colors.sub,
    fontWeight: '700',
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  required: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.accentSoft,
    marginBottom: spacing.sm,
  },
  requiredLeft: { flex: 1 },
  requiredName: { fontSize: 14, fontWeight: '700', color: colors.text },
  requiredNote: { fontSize: 11, color: colors.sub, marginTop: 2, lineHeight: 16 },
  requiredPrice: { fontSize: 15, fontWeight: '800', color: colors.accent },
  note: { padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.bg },
  noteText: { fontSize: 12, color: colors.sub, lineHeight: 18 },
  hint: { fontSize: 11, color: colors.sub, marginTop: spacing.xs },
  link: { color: colors.accent, fontSize: 13, fontWeight: '600', marginTop: spacing.lg },
  summary: { fontSize: 13, color: colors.sub },
  summaryValue: { fontSize: 15, fontWeight: '800', color: colors.text },
  lines: { fontSize: 11, color: colors.sub, marginTop: 2 },
});
