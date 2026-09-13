import type { Dimensions, ShippingMethod, SizeLimit } from './types';

/**
 * 発送方法カタログ（サイズ制限のみを定義。送料は platform ごとに持たせる）
 * ここに1行足すだけで全プラットフォームで使い回せる。
 */
export const SHIPPING_METHODS: ShippingMethod[] = [
  {
    id: 'nekoposu',
    name: 'ネコポス',
    carrier: 'ヤマト運輸',
    limit: { maxLongest: 31.2, maxThickness: 3, maxWeight: 1000 },
    note: 'A4サイズ・ポスト投函',
  },
  {
    id: 'yupacket',
    name: 'ゆうパケット',
    carrier: '日本郵便',
    limit: { maxLongest: 34, maxSum3: 60, maxThickness: 3, maxWeight: 1000 },
    note: 'ポスト投函',
  },
  {
    id: 'yupacket_post_mini',
    name: 'ゆうパケットポストmini',
    carrier: '日本郵便',
    limit: { maxLongest: 21.6, maxThickness: 3, maxWeight: 2000 },
    materialCost: 20,
    note: '専用封筒 20円が別途必要',
  },
  {
    id: 'yupacket_post',
    name: 'ゆうパケットポスト',
    carrier: '日本郵便',
    limit: { maxSum3: 60, maxLongest: 34, maxThickness: 3, maxWeight: 2000 },
    materialCost: 20,
    note: '専用シール 20円が別途必要',
  },
  {
    id: 'compact',
    name: '宅急便コンパクト',
    carrier: 'ヤマト運輸',
    limit: { maxLongest: 25, maxSum3: 45, maxThickness: 5, maxWeight: 5000 },
    materialCost: 70,
    note: '専用BOX 70円が別途必要',
  },
  {
    id: 'yupacket_plus',
    name: 'ゆうパケットプラス',
    carrier: '日本郵便',
    limit: { maxLongest: 24, maxSum3: 46, maxThickness: 7, maxWeight: 2000 },
    materialCost: 65,
    note: '専用BOX 65円が別途必要',
  },
  { id: 'size60', name: '60サイズ', carrier: '宅配便', limit: { maxSum3: 60, maxWeight: 2000 } },
  { id: 'size80', name: '80サイズ', carrier: '宅配便', limit: { maxSum3: 80, maxWeight: 5000 } },
  { id: 'size100', name: '100サイズ', carrier: '宅配便', limit: { maxSum3: 100, maxWeight: 10000 } },
  { id: 'size120', name: '120サイズ', carrier: '宅配便', limit: { maxSum3: 120, maxWeight: 15000 } },
  { id: 'size140', name: '140サイズ', carrier: '宅配便', limit: { maxSum3: 140, maxWeight: 20000 } },
  { id: 'size160', name: '160サイズ', carrier: '宅配便', limit: { maxSum3: 160, maxWeight: 25000 } },
  { id: 'size180', name: '180サイズ', carrier: '宅配便', limit: { maxSum3: 180, maxWeight: 30000 } },
  { id: 'size200', name: '200サイズ', carrier: '宅配便', limit: { maxSum3: 200, maxWeight: 30000 } },
];

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

export function fitsLimit(limit: SizeLimit, d: Dimensions): boolean {
  if (limit.maxLongest != null && longest(d) > limit.maxLongest) return false;
  if (limit.maxSum3 != null && sum3(d) > limit.maxSum3) return false;
  if (limit.maxThickness != null && thickness(d) > limit.maxThickness) return false;
  if (limit.maxWeight != null && d.weight > limit.maxWeight) return false;
  return true;
}

export type ShippingOption = {
  method: ShippingMethod;
  /** 送料 */
  fare: number;
  /** 送料 + 資材費 */
  total: number;
};

/** そのプラットフォームで使える発送方法を、安い順に返す */
export function shippingOptionsFor(
  shipping: Record<string, number>,
  d: Dimensions,
): ShippingOption[] {
  const options: ShippingOption[] = [];
  for (const [id, fare] of Object.entries(shipping)) {
    const method = METHOD_BY_ID[id];
    if (!method) continue;
    if (!fitsLimit(method.limit, d)) continue;
    options.push({ method, fare, total: fare + (method.materialCost ?? 0) });
  }
  return options.sort((a, b) => a.total - b.total);
}

/** 最安の発送方法（なければ null） */
export function cheapestShipping(
  shipping: Record<string, number>,
  d: Dimensions,
): ShippingOption | null {
  return shippingOptionsFor(shipping, d)[0] ?? null;
}
