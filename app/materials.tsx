import { Link, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialPicker } from '../src/components/MaterialPicker';
import { StepLayout } from '../src/components/StepLayout';
import { yen } from '../src/domain/format';
import { materialsTotal, selectedMaterialLines } from '../src/domain/materials';
import { useFlow } from '../src/store/FlowContext';
import { useSettings } from '../src/store/SettingsContext';
import { colors, spacing } from '../src/theme';

export default function MaterialsStep() {
  const router = useRouter();
  const { materials } = useSettings();
  const { costs, dims, setCosts } = useFlow();

  const total = useMemo(
    () => materialsTotal(materials, costs.materials),
    [materials, costs.materials],
  );
  const lines = useMemo(
    () => selectedMaterialLines(materials, costs.materials),
    [materials, costs.materials],
  );

  return (
    <StepLayout
      step={3}
      title="発送資材は何を使う？"
      subtitle="封筒やダンボールなど、この商品を送るのに買う資材を選んでください。宅急便コンパクトなどの専用BOXは、発送方法を選んだ時点で自動的に加算されるのでここでは不要です。サイズは次の画面で入力します。"
      onNext={() => router.push('/platform')}
      nextLabel={lines.length === 0 ? '資材なしで進む' : '次へ'}
      summary={
        <View>
          <Text style={styles.summary}>
            資材合計 <Text style={styles.summaryValue}>{yen(total)}</Text>
            {'　'}原価計 <Text style={styles.summaryValue}>{yen(costs.purchase + costs.other + total)}</Text>
          </Text>
          {lines.length > 0 && (
            <Text style={styles.lines} numberOfLines={2}>
              {lines.map((l) => `${l.material.name}×${l.qty}`).join(' ／ ')}
            </Text>
          )}
        </View>
      }
    >
      <MaterialPicker
        materials={materials}
        selected={costs.materials}
        onChange={(next) => setCosts({ materials: next })}
        dims={dims}
        initialFitOnly={false}
      />
      <Link href="/settings" asChild>
        <Pressable hitSlop={8}>
          <Text style={styles.link}>使う資材を追加・編集する</Text>
        </Pressable>
      </Link>
    </StepLayout>
  );
}

const styles = StyleSheet.create({
  link: { color: colors.accent, fontSize: 13, fontWeight: '600', marginTop: spacing.lg },
  summary: { fontSize: 13, color: colors.sub },
  summaryValue: { fontSize: 15, fontWeight: '800', color: colors.text },
  lines: { fontSize: 11, color: colors.sub, marginTop: 2 },
});
