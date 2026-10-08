import type { Dimensions, PackagingMaterial, ShippingMethod, SizeLimit } from './types';

/**
 * 発送方法カタログ（サイズ条件のみを定義。料金は platform ごとに持たせる）
 *
 * category:
 *   partner … 提携配送。匿名配送・追跡つき
 *   large   … 大型連携配送。料金がサイズ・地域で変わるので自動選択には入れない
 *   self    … 提携外の自己発送。宛名を自分で書くため匿名にならない
 */
export const SHIPPING_METHODS: ShippingMethod[] = [
  // ══ 提携配送：日本郵便 ═══════════════════════════════════════
  {
    id: 'yupacket_post_mini',
    name: 'ゆうパケットポストmini',
    carrier: '日本郵便',
    category: 'partner',
    limit: { maxLongest: 21.6, maxSecond: 16.8, maxThickness: 3, maxWeight: 2000 },
    tracking: true,
    note: 'A5相当・専用封筒が別途必要',
  },
  {
    id: 'yupacket_post',
    name: 'ゆうパケットポスト',
    carrier: '日本郵便',
    category: 'partner',
    limit: { maxLongest: 34, maxSum3: 60, maxThickness: 3, maxWeight: 2000 },
    tracking: true,
    note: '発送用シールまたは専用箱が別途必要',
  },
  {
    id: 'yupacket',
    name: 'ゆうパケット',
    carrier: '日本郵便',
    category: 'partner',
    limit: { maxLongest: 34, maxSum3: 60, maxThickness: 3, maxWeight: 1000 },
    tracking: true,
    note: 'ポスト投函',
  },
  {
    id: 'yupacket_plus',
    name: 'ゆうパケットプラス',
    carrier: '日本郵便',
    category: 'partner',
    limit: { maxLongest: 24, maxSum3: 46, maxThickness: 7, maxWeight: 2000 },
    tracking: true,
    note: '専用箱が別途必要',
  },
  { id: 'yupack60', name: 'ゆうパック 60サイズ', carrier: '日本郵便', category: 'partner', limit: { maxSum3: 60, maxWeight: 25000 }, tracking: true, sizeBand: 60 },
  { id: 'yupack80', name: 'ゆうパック 80サイズ', carrier: '日本郵便', category: 'partner', limit: { maxSum3: 80, maxWeight: 25000 }, tracking: true, sizeBand: 80 },
  { id: 'yupack100', name: 'ゆうパック 100サイズ', carrier: '日本郵便', category: 'partner', limit: { maxSum3: 100, maxWeight: 25000 }, tracking: true, sizeBand: 100 },
  { id: 'yupack120', name: 'ゆうパック 120サイズ', carrier: '日本郵便', category: 'partner', limit: { maxSum3: 120, maxWeight: 25000 }, tracking: true, sizeBand: 120 },
  { id: 'yupack140', name: 'ゆうパック 140サイズ', carrier: '日本郵便', category: 'partner', limit: { maxSum3: 140, maxWeight: 25000 }, tracking: true, sizeBand: 140 },
  { id: 'yupack160', name: 'ゆうパック 160サイズ', carrier: '日本郵便', category: 'partner', limit: { maxSum3: 160, maxWeight: 25000 }, tracking: true, sizeBand: 160 },
  { id: 'yupack170', name: 'ゆうパック 170サイズ', carrier: '日本郵便', category: 'partner', limit: { maxSum3: 170, maxWeight: 25000 }, tracking: true, sizeBand: 170 },

  // ══ 提携配送：ヤマト運輸 ═══════════════════════════════════════
  {
    id: 'nekoposu',
    name: 'ネコポス',
    carrier: 'ヤマト運輸',
    category: 'partner',
    limit: { maxLongest: 31.2, maxSecond: 22.8, maxThickness: 3, maxWeight: 1000 },
    tracking: true,
    note: 'A4サイズ・ポスト投函',
  },
  {
    id: 'compact',
    name: '宅急便コンパクト',
    carrier: 'ヤマト運輸',
    category: 'partner',
    limit: { maxLongest: 25, maxSum3: 45, maxThickness: 5, maxWeight: 5000 },
    tracking: true,
    note: '専用BOXが別途必要',
  },
  { id: 'takkyubin60', name: '宅急便 60サイズ', carrier: 'ヤマト運輸', category: 'partner', limit: { maxSum3: 60, maxWeight: 2000 }, tracking: true, sizeBand: 60 },
  { id: 'takkyubin80', name: '宅急便 80サイズ', carrier: 'ヤマト運輸', category: 'partner', limit: { maxSum3: 80, maxWeight: 5000 }, tracking: true, sizeBand: 80 },
  { id: 'takkyubin100', name: '宅急便 100サイズ', carrier: 'ヤマト運輸', category: 'partner', limit: { maxSum3: 100, maxWeight: 10000 }, tracking: true, sizeBand: 100 },
  { id: 'takkyubin120', name: '宅急便 120サイズ', carrier: 'ヤマト運輸', category: 'partner', limit: { maxSum3: 120, maxWeight: 15000 }, tracking: true, sizeBand: 120 },
  { id: 'takkyubin140', name: '宅急便 140サイズ', carrier: 'ヤマト運輸', category: 'partner', limit: { maxSum3: 140, maxWeight: 20000 }, tracking: true, sizeBand: 140 },
  { id: 'takkyubin160', name: '宅急便 160サイズ', carrier: 'ヤマト運輸', category: 'partner', limit: { maxSum3: 160, maxWeight: 25000 }, tracking: true, sizeBand: 160 },
  { id: 'takkyubin180', name: '宅急便 180サイズ', carrier: 'ヤマト運輸', category: 'partner', limit: { maxSum3: 180, maxWeight: 30000 }, tracking: true, sizeBand: 180 },
  { id: 'takkyubin200', name: '宅急便 200サイズ', carrier: 'ヤマト運輸', category: 'partner', limit: { maxSum3: 200, maxWeight: 30000 }, tracking: true, sizeBand: 200 },

  // ══ 大型連携配送（料金はサイズ・地域で変動するため要入力） ═══════
  {
    id: 'eco_mercari',
    name: 'エコメルカリ便',
    carrier: 'メルカリ',
    category: 'large',
    limit: {},
    manualPrice: true,
    tracking: true,
    note: '対象エリア・置き配限定。料金は実際の金額を入力してください',
  },
  {
    id: 'tanomerubin',
    name: '梱包・発送たのメル便',
    carrier: 'ヤマトホームコンビニエンス',
    category: 'large',
    limit: { maxSum3: 450 },
    manualPrice: true,
    tracking: true,
    note: '大型家具・家電むけ。80〜450サイズで料金が変わるため実際の金額を入力',
  },
  {
    id: 'omakase',
    name: 'おまかせ配送',
    carrier: 'ヤマトホームコンビニエンス',
    category: 'large',
    limit: {},
    manualPrice: true,
    tracking: true,
    note: '大型家具・家電むけ。料金は実際の金額を入力してください',
  },

  // ══ 提携外の自己発送（匿名配送にならない） ══════════════════════
  {
    id: 'mini_letter',
    name: 'ミニレター（郵便書簡）',
    carrier: '日本郵便',
    category: 'self',
    limit: { maxLongest: 16.4, maxSecond: 9.2, maxThickness: 1, maxWeight: 25 },
    selfShip: true,
    flatRate: true,
    tracking: false,
    note: '封筒代込み・25g以内・追跡なし',
  },
  {
    id: 'teikei25',
    name: '定形郵便（25gまで）',
    carrier: '日本郵便',
    category: 'self',
    limit: { maxLongest: 23.5, maxSecond: 12, maxThickness: 1, maxWeight: 25 },
    selfShip: true,
    tracking: false,
    note: '追跡なし・補償なし',
  },
  {
    id: 'teikei50',
    name: '定形郵便（50gまで）',
    carrier: '日本郵便',
    category: 'self',
    limit: { maxLongest: 23.5, maxSecond: 12, maxThickness: 1, maxWeight: 50 },
    selfShip: true,
    tracking: false,
    note: '追跡なし・補償なし',
  },
  { id: 'teikeigai50', name: '定形外郵便 規格内（50gまで）', carrier: '日本郵便', category: 'self', limit: { maxLongest: 34, maxSecond: 25, maxThickness: 3, maxWeight: 50 }, selfShip: true, tracking: false },
  { id: 'teikeigai100', name: '定形外郵便 規格内（100gまで）', carrier: '日本郵便', category: 'self', limit: { maxLongest: 34, maxSecond: 25, maxThickness: 3, maxWeight: 100 }, selfShip: true, tracking: false },
  { id: 'teikeigai150', name: '定形外郵便 規格内（150gまで）', carrier: '日本郵便', category: 'self', limit: { maxLongest: 34, maxSecond: 25, maxThickness: 3, maxWeight: 150 }, selfShip: true, tracking: false },
  { id: 'teikeigai250', name: '定形外郵便 規格内（250gまで）', carrier: '日本郵便', category: 'self', limit: { maxLongest: 34, maxSecond: 25, maxThickness: 3, maxWeight: 250 }, selfShip: true, tracking: false },
  { id: 'teikeigai500', name: '定形外郵便 規格内（500gまで）', carrier: '日本郵便', category: 'self', limit: { maxLongest: 34, maxSecond: 25, maxThickness: 3, maxWeight: 500 }, selfShip: true, tracking: false },
  { id: 'teikeigai1000', name: '定形外郵便 規格内（1kgまで）', carrier: '日本郵便', category: 'self', limit: { maxLongest: 34, maxSecond: 25, maxThickness: 3, maxWeight: 1000 }, selfShip: true, tracking: false },
  {
    id: 'clickpost',
    name: 'クリックポスト',
    carrier: '日本郵便',
    category: 'self',
    limit: { maxLongest: 34, maxSecond: 25, maxThickness: 3, maxWeight: 1000 },
    selfShip: true,
    flatRate: true,
    tracking: true,
    note: 'ネット決済＋自宅でラベル印刷が必要・封筒は自前・長さ14cm 幅9cm 以上',
  },
  {
    id: 'smart_letter',
    name: 'スマートレター',
    carrier: '日本郵便',
    category: 'self',
    limit: { maxLongest: 25, maxSecond: 17, maxThickness: 2, maxWeight: 1000 },
    selfShip: true,
    flatRate: true,
    tracking: false,
    note: '専用封筒（送料込み）・A5サイズ・追跡なし',
  },
  {
    id: 'letterpack_light',
    name: 'レターパックライト',
    carrier: '日本郵便',
    category: 'self',
    limit: { maxLongest: 34, maxSecond: 24.8, maxThickness: 3, maxWeight: 4000 },
    selfShip: true,
    flatRate: true,
    tracking: true,
    note: '専用封筒（送料込み）・ポスト投函・郵便受けに配達',
  },
  {
    id: 'letterpack_plus',
    name: 'レターパックプラス',
    carrier: '日本郵便',
    category: 'self',
    limit: { maxLongest: 34, maxSecond: 24.8, maxWeight: 4000 },
    selfShip: true,
    flatRate: true,
    tracking: true,
    note: '専用封筒（送料込み）・厚さ制限なし・対面配達',
  },
  { id: 'general60', name: '一般宅配便 60サイズ', carrier: 'ヤマト・佐川・日本郵便', category: 'self', limit: { maxSum3: 60, maxWeight: 25000 }, selfShip: true, tracking: true, note: '元払いの一般料金（距離で変動）' },
  { id: 'general80', name: '一般宅配便 80サイズ', carrier: 'ヤマト・佐川・日本郵便', category: 'self', limit: { maxSum3: 80, maxWeight: 25000 }, selfShip: true, tracking: true },
  { id: 'general100', name: '一般宅配便 100サイズ', carrier: 'ヤマト・佐川・日本郵便', category: 'self', limit: { maxSum3: 100, maxWeight: 25000 }, selfShip: true, tracking: true },
  { id: 'general120', name: '一般宅配便 120サイズ', carrier: 'ヤマト・佐川・日本郵便', category: 'self', limit: { maxSum3: 120, maxWeight: 25000 }, selfShip: true, tracking: true },
  { id: 'general140', name: '一般宅配便 140サイズ', carrier: 'ヤマト・佐川・日本郵便', category: 'self', limit: { maxSum3: 140, maxWeight: 25000 }, selfShip: true, tracking: true },
  { id: 'general160', name: '一般宅配便 160サイズ', carrier: 'ヤマト・佐川・日本郵便', category: 'self', limit: { maxSum3: 160, maxWeight: 25000 }, selfShip: true, tracking: true },
  { id: 'general180', name: '一般宅配便 180サイズ', carrier: 'ヤマト・佐川', category: 'self', limit: { maxSum3: 180, maxWeight: 30000 }, selfShip: true, tracking: true },
  { id: 'general200', name: '一般宅配便 200サイズ', carrier: 'ヤマト・佐川', category: 'self', limit: { maxSum3: 200, maxWeight: 30000 }, selfShip: true, tracking: true },
];

export const METHOD_BY_ID: Record<string, ShippingMethod> = Object.fromEntries(
  SHIPPING_METHODS.map((m) => [m.id, m]),
);

export const CATEGORY_LABEL = {
  partner: '提携配送（匿名・追跡つき）',
  large: '大型連携配送',
  self: '提携外の自己発送（匿名にならない）',
} as const;

export const CATEGORY_ORDER = ['partner', 'large', 'self'] as const;

/**
 * 発送方法一覧の表示グループ。
 * partner（定額の小型便）を最初に見せ、サイズで料金が変わる宅急便・ゆうパックは
 * partner_sized として一段下にまとめる。
 */
export type ListGroup = 'partner' | 'partner_sized' | 'large' | 'self';

export const LIST_GROUP_ORDER: readonly ListGroup[] = ['partner', 'partner_sized', 'large', 'self'];

export const LIST_GROUP_LABEL: Record<ListGroup, string> = {
  partner: '定額の小型便（匿名・追跡つき）',
  partner_sized: 'サイズ別の宅急便・ゆうパック（60〜200サイズ）',
  large: CATEGORY_LABEL.large,
  self: CATEGORY_LABEL.self,
};

export function listGroupOf(method: ShippingMethod): ListGroup {
  if (method.category === 'partner' && method.sizeBand != null) return 'partner_sized';
  return method.category;
}

/** 全国一律の定額便 */
export const FLAT_RATE_METHODS = SHIPPING_METHODS.filter((m) => m.flatRate);

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

/** サイズ条件を「34×24.8cm ・厚さ3cm ・4kg」のような表示用文字列にする */
export function describeLimit(limit: SizeLimit): string {
  const parts: string[] = [];
  if (limit.maxLongest != null) {
    parts.push(
      limit.maxSecond != null ? `${limit.maxLongest}×${limit.maxSecond}cm` : `最長${limit.maxLongest}cm`,
    );
  }
  if (limit.maxSum3 != null) parts.push(`3辺合計${limit.maxSum3}cm`);
  if (limit.maxThickness != null) parts.push(`厚さ${limit.maxThickness}cm`);
  if (limit.maxWeight != null) {
    parts.push(limit.maxWeight >= 1000 ? `${limit.maxWeight / 1000}kg` : `${limit.maxWeight}g`);
  }
  return parts.length > 0 ? parts.join(' ・ ') : 'サイズ条件は商品により変動';
}

export type ShippingOption = {
  method: ShippingMethod;
  /** 送料 */
  fare: number;
  /** この発送方法に必須の指定梱包資材（専用BOX・専用シールなど） */
  material?: PackagingMaterial;
  /** 送料 + 指定梱包資材費 */
  total: number;
};

/**
 * そのプラットフォームで使える発送方法を、安い順に返す。
 * dedicated は「発送方法ID -> 指定梱包資材」（materials.ts の dedicatedMapOf で作る）。
 * 料金が変動する大型配送（manualPrice）は自動選択の対象から外す。
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
    if (method.manualPrice) continue;
    if (!fitsLimit(method.limit, d)) continue;
    const material = dedicated[id];
    options.push({ method, fare, material, total: fare + (material?.price ?? 0) });
  }
  return options.sort((a, b) => a.total - b.total);
}

/**
 * 一覧表示用にグループ分けする。入力は shippingOptionsFor と同じ形。
 * サイズ別便はサイズ順（同サイズなら安い順）、それ以外は安い順。空のグループは返さない。
 */
export function groupShippingOptions(
  options: ShippingOption[],
): { group: ListGroup; items: ShippingOption[] }[] {
  return LIST_GROUP_ORDER.map((group) => {
    const items = options
      .filter((o) => listGroupOf(o.method) === group)
      .sort((a, b) =>
        group === 'partner_sized'
          ? (a.method.sizeBand ?? 0) - (b.method.sizeBand ?? 0) || a.total - b.total
          : a.total - b.total,
      );
    return { group, items };
  }).filter((g) => g.items.length > 0);
}

/** 最安の発送方法（なければ null） */
export function cheapestShipping(
  shipping: Record<string, number>,
  d: Dimensions,
  dedicated: Record<string, PackagingMaterial> = {},
): ShippingOption | null {
  return shippingOptionsFor(shipping, d, dedicated)[0] ?? null;
}
