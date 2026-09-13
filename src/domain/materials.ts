import type { PackagingMaterial } from './types';

export const STORE_LABEL = {
  japanpost: '郵便局',
  yamato: 'クロネコヤマト直営店',
  other: 'その他（100均・ネット等）',
} as const;

export const STORE_ORDER = ['japanpost', 'yamato', 'other'] as const;

/**
 * 梱包資材カタログ。郵便局・ヤマト直営店の店頭で買えるものを基準にした目安価格。
 * dedicatedTo が付いたものは「その発送方法を選ぶと自動で送料に上乗せされる」専用資材なので、
 * 手動の資材リストには出てこない（二重計上を防ぐため）。
 */
export const DEFAULT_MATERIALS: PackagingMaterial[] = [
  // ── 郵便局 ─────────────────────────────────────────
  {
    id: 'jp_yupacket_post_seal',
    name: 'ゆうパケットポスト発送用シール',
    store: 'japanpost',
    price: 20,
    dedicatedTo: 'yupacket_post',
    note: '5枚100円（1枚あたり20円）',
  },
  {
    id: 'jp_yupacket_post_mini_env',
    name: 'ゆうパケットポストmini専用封筒',
    store: 'japanpost',
    price: 20,
    dedicatedTo: 'yupacket_post_mini',
  },
  {
    id: 'jp_yupacket_plus_box',
    name: 'ゆうパケットプラス専用箱',
    store: 'japanpost',
    price: 65,
    dedicatedTo: 'yupacket_plus',
  },
  {
    id: 'jp_yupacket_post_box',
    name: 'ゆうパケットポスト専用箱',
    store: 'japanpost',
    price: 65,
    limit: { maxLongest: 32, maxThickness: 3 },
    note: 'シールの代わりに箱で出す場合',
  },
  {
    id: 'jp_cushion_env',
    name: 'クッション封筒（A4）',
    store: 'japanpost',
    price: 140,
    limit: { maxLongest: 34, maxThickness: 3 },
    note: 'ゆうパケット・ネコポス向け',
  },
  {
    id: 'jp_box_60',
    name: 'ゆうパック用ダンボール 小（60サイズ）',
    store: 'japanpost',
    price: 110,
    limit: { maxSum3: 60 },
  },
  {
    id: 'jp_box_80',
    name: 'ゆうパック用ダンボール 中（80サイズ）',
    store: 'japanpost',
    price: 160,
    limit: { maxSum3: 80 },
  },
  {
    id: 'jp_box_100',
    name: 'ゆうパック用ダンボール 大（100サイズ）',
    store: 'japanpost',
    price: 210,
    limit: { maxSum3: 100 },
  },
  {
    id: 'jp_tape',
    name: '梱包用テープ（1回分）',
    store: 'japanpost',
    price: 10,
    note: '1巻200円を約20回で割った目安',
  },

  // ── クロネコヤマト直営店 ───────────────────────────
  {
    id: 'ym_compact_box',
    name: '宅急便コンパクト専用BOX',
    store: 'yamato',
    price: 70,
    dedicatedTo: 'compact',
  },
  {
    id: 'ym_nekoposu_box',
    name: 'ネコポス用ボックス',
    store: 'yamato',
    price: 70,
    limit: { maxLongest: 31.2, maxThickness: 3 },
  },
  {
    id: 'ym_cushion_env',
    name: 'クッション封筒',
    store: 'yamato',
    price: 130,
    limit: { maxLongest: 34, maxThickness: 3 },
  },
  { id: 'ym_box_60', name: '宅急便ダンボール 60サイズ', store: 'yamato', price: 140, limit: { maxSum3: 60 } },
  { id: 'ym_box_80', name: '宅急便ダンボール 80サイズ', store: 'yamato', price: 200, limit: { maxSum3: 80 } },
  { id: 'ym_box_100', name: '宅急便ダンボール 100サイズ', store: 'yamato', price: 240, limit: { maxSum3: 100 } },
  { id: 'ym_box_120', name: '宅急便ダンボール 120サイズ', store: 'yamato', price: 370, limit: { maxSum3: 120 } },
  { id: 'ym_box_140', name: '宅急便ダンボール 140サイズ', store: 'yamato', price: 450, limit: { maxSum3: 140 } },
  { id: 'ym_box_160', name: '宅急便ダンボール 160サイズ', store: 'yamato', price: 550, limit: { maxSum3: 160 } },
  {
    id: 'ym_tape',
    name: 'クロネコガムテープ（1回分）',
    store: 'yamato',
    price: 12,
    note: '1巻250円を約20回で割った目安',
  },

  // ── その他 ─────────────────────────────────────────
  { id: 'ot_bubble', name: 'プチプチ・緩衝材（1回分）', store: 'other', price: 20 },
  { id: 'ot_opp', name: 'OPP袋・水濡れ防止（1枚）', store: 'other', price: 5 },
  { id: 'ot_own_env', name: '自前の封筒・紙袋', store: 'other', price: 0 },
];

/** 資材ID -> 単価 の早見表 */
export function priceMapOf(materials: PackagingMaterial[]): Record<string, number> {
  return Object.fromEntries(materials.map((m) => [m.id, m.price]));
}

/** 発送方法ID -> 専用資材 の早見表 */
export function dedicatedMapOf(
  materials: PackagingMaterial[],
): Record<string, PackagingMaterial> {
  const map: Record<string, PackagingMaterial> = {};
  for (const m of materials) if (m.dedicatedTo) map[m.dedicatedTo] = m;
  return map;
}

/** 手動で選べる資材（専用資材は自動加算されるので除く） */
export function selectableMaterials(materials: PackagingMaterial[]): PackagingMaterial[] {
  return materials.filter((m) => !m.dedicatedTo);
}

/** 選んだ資材の合計金額 */
export function materialsTotal(
  materials: PackagingMaterial[],
  selected: Record<string, number>,
): number {
  const prices = priceMapOf(materials);
  let total = 0;
  for (const [id, qty] of Object.entries(selected)) {
    if (!qty) continue;
    total += (prices[id] ?? 0) * qty;
  }
  return total;
}

/** 選んだ資材の明細（表示用） */
export function selectedMaterialLines(
  materials: PackagingMaterial[],
  selected: Record<string, number>,
): { material: PackagingMaterial; qty: number; subtotal: number }[] {
  return materials
    .filter((m) => (selected[m.id] ?? 0) > 0)
    .map((m) => ({ material: m, qty: selected[m.id], subtotal: m.price * selected[m.id] }));
}
