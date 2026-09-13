import React, { useEffect, useState } from 'react';
import {
  Platform as RNPlatform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type ViewStyle,
} from 'react-native';
import { colors, radius, spacing } from '../theme';
import { toNumber } from '../domain/format';

export function Card({
  title,
  right,
  children,
  style,
}: {
  title?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  return (
    <View style={[styles.card, style]}>
      {(title || right) && (
        <View style={styles.cardHeader}>
          {title ? <Text style={styles.cardTitle}>{title}</Text> : <View />}
          {right}
        </View>
      )}
      {children}
    </View>
  );
}

export function NumberField({
  label,
  value,
  onChange,
  suffix,
  placeholder,
  flex,
}: {
  label?: string;
  value: number;
  onChange: (n: number) => void;
  suffix?: string;
  placeholder?: string;
  flex?: number;
}) {
  const [text, setText] = useState(String(value));

  // 外から値が変わったとき（プリセット適用など）に追従する
  useEffect(() => {
    if (toNumber(text) !== value) setText(String(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <View style={[styles.field, flex != null && { flex }]}>
      {label ? <Text style={styles.fieldLabel}>{label}</Text> : null}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={(t) => {
            setText(t);
            onChange(toNumber(t));
          }}
          onBlur={() => setText(String(toNumber(text)))}
          keyboardType={RNPlatform.OS === 'ios' ? 'decimal-pad' : 'numeric'}
          placeholder={placeholder}
          placeholderTextColor={colors.sub}
          selectTextOnFocus
        />
        {suffix ? <Text style={styles.suffix}>{suffix}</Text> : null}
      </View>
    </View>
  );
}

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  flex,
}: {
  label?: string;
  value: string;
  onChange: (t: string) => void;
  placeholder?: string;
  flex?: number;
}) {
  return (
    <View style={[styles.field, flex != null && { flex }]}>
      {label ? <Text style={styles.fieldLabel}>{label}</Text> : null}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={colors.sub}
        />
      </View>
    </View>
  );
}

export function Button({
  label,
  onPress,
  disabled,
  tone = 'primary',
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  tone?: 'primary' | 'ghost';
}) {
  const primary = tone === 'primary';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        primary ? styles.buttonPrimary : styles.buttonGhost,
        disabled && styles.buttonDisabled,
      ]}
    >
      <Text style={[styles.buttonText, primary ? styles.buttonTextPrimary : styles.buttonTextGhost]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: T }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View style={styles.segmented}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={String(o.value)}
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

export function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

export function Row({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.row, style]}>{children}</View>;
}

export function KeyValue({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value: string;
  tone?: 'default' | 'profit' | 'loss' | 'sub';
}) {
  const color =
    tone === 'profit'
      ? colors.profit
      : tone === 'loss'
        ? colors.loss
        : tone === 'sub'
          ? colors.sub
          : colors.text;
  return (
    <View style={styles.kv}>
      <Text style={styles.kvLabel}>{label}</Text>
      <Text style={[styles.kvValue, { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  field: { marginBottom: spacing.md },
  fieldLabel: { fontSize: 12, color: colors.sub, marginBottom: spacing.xs },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
  },
  suffix: { fontSize: 13, color: colors.sub, marginLeft: spacing.sm },
  segmented: {
    flexDirection: 'row',
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    padding: 3,
    gap: 3,
  },
  segment: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  segmentActive: { backgroundColor: colors.card, shadowOpacity: 0.06, shadowRadius: 3, elevation: 1 },
  segmentText: { fontSize: 13, color: colors.sub, fontWeight: '600' },
  segmentTextActive: { color: colors.accent },
  button: {
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  buttonPrimary: { backgroundColor: colors.accent },
  buttonGhost: {
    backgroundColor: 'transparent',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { fontSize: 14, fontWeight: '700' },
  buttonTextPrimary: { color: '#fff' },
  buttonTextGhost: { color: colors.sub },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: colors.bg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.accentSoft, borderColor: colors.accent },
  chipText: { fontSize: 13, color: colors.sub, fontWeight: '600' },
  chipTextActive: { color: colors.accent },
  row: { flexDirection: 'row', gap: spacing.md, flexWrap: 'wrap' },
  kv: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  kvLabel: { fontSize: 13, color: colors.sub },
  kvValue: { fontSize: 13, fontWeight: '600' },
});
