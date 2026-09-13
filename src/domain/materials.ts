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
  {
    id: 'jp_yupacket_post_mini_env',
    name: 'ゆうパケットポストmini専用封筒',
    store: 'japanpost',
    price: 20,
    dedicatedTo: 'yupacket_post_mini',
  },
  {
    id: 'jp_yupacket_post_seal',
    name: 'ゆうパケットポスト発送用シール',
    store: 'japanpost',
    price: 20,
    dedicatedTo: 'yupacket_post',
    note: '5枚100円（1枚あたり20円）。専用箱65円を使う場合は金額を変更',
  },
  {
    id: 'jp_yupacket_plus_box',
    name: 'ゆうパケットプラス専用箱',
    store: 'japanpost',
    price: 65,
    dedicatedTo: 'yupacket_plus',
  },
  {
    id: 'ym_compact_box',
    name: '宅急便コンパクト専用BOX',
    store: 'yamato',
    price: 70,
    dedicatedTo: 'compact',
  },
];

/** ユーザー追加ぶんのID（衝突しないように接頭辞をつける） */
export function newMaterialId(): string {
  return `custom_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

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

/** 手動で選べる資材（専用資材は自動加算されるので除く／非表示にしたものも除く） */
export function selectableMaterials(materials: PackagingMaterial[]): PackagingMaterial[] {
  return materials.filter((m) => !m.dedicatedTo && !m.hidden);
}

/** 選んだ資材の合計金額 */
export function materialsTotal(
  materials: PackagingMaterial[],
  selected: Record<string, number>,
): number {
  // 非表示にした資材は金額にも入れない（隠れた経費が残らないように）
  const prices = priceMapOf(materials.filter((m) => !m.hidden));
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
    .filter((m) => !m.hidden && (selected[m.id] ?? 0) > 0)
    .map((m) => ({ material: m, qty: selected[m.id], subtotal: m.price * selected[m.id] }));
}
