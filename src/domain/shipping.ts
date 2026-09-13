import type { Dimensions, PackagingMaterial, ShippingMethod, SizeLimit } from './types';

/**
 * 発送方法カタログ（サイズ制限のみを定義。送料は platform ごとに持たせる）
 * ここに1行足すだけで全プラットフォームで使い回せる。
 */
export const SHIPPING_METHODS: ShippingMethod[] = [
  {
    id: 'nekoposu',
    name: 'ネコポス',
    carrier: 'ヤマト運輸',
    limit: { maxLongest: 31.2, maxSecond: 22.8, maxThickness: 3, maxWeight: 1000 },
    tracking: true,
    note: 'A4サイズ・ポスト投函',
  },
  {
    id: 'yupacket',
    name: 'ゆうパケット',
    carrier: '日本郵便',
    limit: { maxLongest: 34, maxSum3: 60, maxThickness: 3, maxWeight: 1000 },
    tracking: true,
    note: 'ポスト投函',
  },
  {
    id: 'yupacket_post_mini',
    name: 'ゆうパケットポストmini',
    carrier: '日本郵便',
    limit: { maxLongest: 21.6, maxSecond: 16.8, maxThickness: 3, maxWeight: 2000 },
    tracking: true,
    note: 'A5相当・郵便局で買う専用封筒が別途必要',
  },
  {
    id: 'yupacket_post',
    name: 'ゆうパケットポスト',
    carrier: '日本郵便',
    limit: { maxSum3: 60, maxLongest: 34, maxThickness: 3, maxWeight: 2000 },
    tracking: true,
    note: '郵便局で買う発送用シールが別途必要',
  },
  {
    id: 'compact',
    name: '宅急便コンパクト',
    carrier: 'ヤマト運輸',
    limit: { maxLongest: 25, maxSum3: 45, maxThickness: 5, maxWeight: 5000 },
    tracking: true,
    note: 'ヤマト直営店で買う専用BOXが別途必要',
  },
  {
    id: 'yupacket_plus',
    name: 'ゆうパケットプラス',
    carrier: '日本郵便',
    limit: { maxLongest: 24, maxSum3: 46, maxThickness: 7, maxWeight: 2000 },
    tracking: true,
    note: '郵便局で買う専用箱が別途必要',
  },
  {
    id: 'yupack60',
    name: 'ゆうパック 60サイズ',
    carrier: '日本郵便',
    limit: { maxSum3: 60, maxWeight: 25000 },
    tracking: true,
  },
  {
    id: 'yupack80',
    name: 'ゆうパック 80サイズ',
    carrier: '日本郵便',
    limit: { maxSum3: 80, maxWeight: 25000 },
    tracking: true,
  },
  { id: 'size60', name: '60サイズ', carrier: '宅配便', limit: { maxSum3: 60, maxWeight: 2000 } },
  { id: 'size80', name: '80サイズ', carrier: '宅配便', limit: { maxSum3: 80, maxWeight: 5000 } },
  { id: 'size100', name: '100サイズ', carrier: '宅配便', limit: { maxSum3: 100, maxWeight: 10000 } },
  { id: 'size120', name: '120サイズ', carrier: '宅配便', limit: { maxSum3: 120, maxWeight: 15000 } },
  { id: 'size140', name: '140サイズ', carrier: '宅配便', limit: { maxSum3: 140, maxWeight: 20000 } },
  { id: 'size160', name: '160サイズ', carrier: '宅配便', limit: { maxSum3: 160, maxWeight: 25000 } },
  { id: 'size180', name: '180サイズ', carrier: '宅配便', limit: { maxSum3: 180, maxWeight: 30000 } },
  { id: 'size200', name: '200サイズ', carrier: '宅配便', limit: { maxSum3: 200, maxWeight: 30000 } },

  // ── 全国一律の定額便（自己発送・匿名配送にはならない） ──────────
  {
    id: 'letterpack_light',
    name: 'レターパックライト',
    carrier: '日本郵便',
    limit: { maxLongest: 34, maxSecond: 24.8, maxThickness: 3, maxWeight: 4000 },
    selfShip: true,
    flatRate: true,
    tracking: true,
    note: '専用封筒430円（送料込み）・ポスト投函・郵便受けに配達',
  },
  {
    id: 'letterpack_plus',
    name: 'レターパックプラス',
    carrier: '日本郵便',
    limit: { maxLongest: 34, maxSecond: 24.8, maxWeight: 4000 },
    selfShip: true,
    flatRate: true,
    tracking: true,
    note: '専用封筒600円（送料込み）・厚さ制限なし・対面配達で受領印あり',
  },
  {
    id: 'smart_letter',
    name: 'スマートレター',
    carrier: '日本郵便',
    limit: { maxLongest: 25, maxSecond: 17, maxThickness: 2, maxWeight: 1000 },
    selfShip: true,
    flatRate: true,
    tracking: false,
    note: '専用封筒210円（送料込み）・A5サイズ・追跡なし',
  },
  {
    id: 'clickpost',
    name: 'クリックポスト',
    carrier: '日本郵便',
    limit: { maxLongest: 34, maxSecond: 25, maxThickness: 3, maxWeight: 1000 },
    selfShip: true,
    flatRate: true,
    tracking: true,
    note: 'ネット決済＋自宅でラベル印刷が必要・封筒は自前・長さ14cm 幅9cm 以上',
  },
];

/** 全国一律の定額便（どのプラットフォームでも同じ料金で使える） */
export const FLAT_RATE_METHODS = SHIPPING_METHODS.filter((m) => m.flatRate);

export const METHOD_BY_ID: Record<string, ShippingMethod> = Object.fromEntries(
  SHIPPING_METHODS.map((m) => [m.id, m]),
);

/** サイズ入力のクイックプリセット */
export const SIZE_PRESETS: { label: string; dims: Dimensions }[] = [
  { label: '薄い小物', dims: { length: 25, width: 18, height: 2, weight: 200 } },
  { label: '厚めの小物', dims: { length: 24, width: 17, height: 6, weight: 700 } },
  { label: '60サイズ', dims: { length: 25, width: 20, height: 15, weight: 1500 } },
  { label: '80サイズ', dims: { length: 35, width: 25, height: 20, weight: 4000 } },
  { label: '100サイズ', dims: { length: 45, width: 30, height: 25, weight: 8000 } },
  { label: '120サイズ', dims: { length: 50, width: 40, height: 30, weight: 12000 } },
];

export function sum3(d: Dimensions): number {
  return d.length + d.width + d.height;
}

export function longest(d: Dimensions): number {
  return Math.max(d.length, d.width, d.height);
}

/** 厚さ＝3辺のうち最も短い辺とみなす */
export function thickness(d: Dimensions): number {
  return Math.min(d.length, d.width, d.height);
}

/** 2番目に長い辺（＝封筒の短辺側に収まるかの判定に使う） */
export function second(d: Dimensions): number {
  const sorted = [d.length, d.width, d.height].sort((a, b) => b - a);
  return sorted[1];
}

export function fitsLimit(limit: SizeLimit, d: Dimensions): boolean {
  if (limit.maxLongest != null && longest(d) > limit.maxLongest) return false;
  if (limit.maxSecond != null && second(d) > limit.maxSecond) return false;
  if (limit.maxSum3 != null && sum3(d) > limit.maxSum3) return false;
  if (limit.maxThickness != null && thickness(d) > limit.maxThickness) return false;
  if (limit.maxWeight != null && d.weight > limit.maxWeight) return false;
  return true;
}

/** サイズ条件を「34×24.8cm ・厚さ3cm ・1kg」のような表示用文字列にする */
export function describeLimit(limit: SizeLimit): string {
  const parts: string[] = [];
  if (limit.maxLongest != null) {
    parts.push(limit.maxSecond != null ? `${limit.maxLongest}×${limit.maxSecond}cm` : `最長${limit.maxLongest}cm`);
  }
  if (limit.maxSum3 != null) parts.push(`3辺合計${limit.maxSum3}cm`);
  if (limit.maxThickness != null) parts.push(`厚さ${limit.maxThickness}cm`);
  if (limit.maxWeight != null) {
    parts.push(limit.maxWeight >= 1000 ? `${limit.maxWeight / 1000}kg` : `${limit.maxWeight}g`);
  }
  return parts.join(' ・ ');
}

export type ShippingOption = {
  method: ShippingMethod;
  /** 送料 */
  fare: number;
  /** この発送方法に必須の専用資材（専用BOX・専用シールなど） */
  material?: PackagingMaterial;
  /** 送料 + 専用資材費 */
  total: number;
};

/**
 * そのプラットフォームで使える発送方法を、安い順に返す。
 * dedicated は「発送方法ID -> 専用資材」（materials.ts の dedicatedMapOf で作る）。
 */
export function shippingOptionsFor(
  shipping: Record<string, number>,
  d: Dimensions,
  dedicated: Record<string, PackagingMaterial> = {},
): ShippingOption[] {
  const options: ShippingOption[] = [];
  for (const [id, fare] of Object.entries(shipping)) {
    const method = METHOD_BY_ID[id];
    if (!method) continue;
    if (!fitsLimit(method.limit, d)) continue;
    const material = dedicated[id];
    options.push({ method, fare, material, total: fare + (material?.price ?? 0) });
  }
  return options.sort((a, b) => a.total - b.total);
}

/** 最安の発送方法（なければ null） */
export function cheapestShipping(
  shipping: Record<string, number>,
  d: Dimensions,
  dedicated: Record<string, PackagingMaterial> = {},
): ShippingOption | null {
  return shippingOptionsFor(shipping, d, dedicated)[0] ?? null;
}
