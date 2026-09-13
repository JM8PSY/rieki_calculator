import { dedicatedMapOf, materialsTotal } from './materials';
import { cheapestShipping, METHOD_BY_ID, shippingOptionsFor, type ShippingOption } from './shipping';
import type {
  Breakdown,
  CostInput,
  Dimensions,
  Options,
  PackagingMaterial,
  Platform,
  Rounding,
} from './types';

export type CalcContext = {
  costs: CostInput;
  dims: Dimensions;
  options: Options;
  /** 資材カタログ（設定画面で編集された価格を反映したもの） */
  materials: PackagingMaterial[];
  /** プラットフォームID -> 発送方法ID（手動で発送方法を選んだ場合） */
  methodOverrides?: Record<string, string>;
};

export function applyRounding(value: number, mode: Rounding): number {
  if (mode === 'ceil') return Math.ceil(value);
  if (mode === 'round') return Math.round(value);
  return Math.floor(value);
}

export function roundUpTo(value: number, step: number): number {
  if (step <= 1) return Math.ceil(value);
  return Math.ceil(value / step) * step;
}

type ResolvedShipping = {
  /** 送料 + 専用資材費 */
  amount: number;
  /** 専用資材の金額（内訳表示用） */
  materialCost: number;
  materialName?: string;
  label: string;
  /** 匿名配送になるか */
  anonymous: boolean;
  ok: boolean;
  reason?: string;
};

/** その発送方法で匿名配送になるか（提携配送のみ匿名。自己発送の汎用便は不可） */
export function isAnonymous(platform: Platform, methodId: string): boolean {
  return platform.anonymousDelivery && !METHOD_BY_ID[methodId]?.selfShip;
}

/**
 * そのプラットフォームで実際に選べる発送方法。
 * 匿名配送のみに絞る設定のときは、自己発送の汎用便（レターパック等）を候補から外す。
 */
export function usableShipping(platform: Platform, options: Options): Record<string, number> {
  if (!options.anonymousOnly || !platform.anonymousDelivery) return platform.shipping;
  return Object.fromEntries(
    Object.entries(platform.shipping).filter(([id]) => !METHOD_BY_ID[id]?.selfShip),
  );
}

/** そのプラットフォームで実際に負担する送料（専用資材込み）を決める */
export function resolveShipping(platform: Platform, ctx: CalcContext): ResolvedShipping {
  const { options } = ctx;
  if (options.shippingMode === 'buyer') {
    return { amount: 0, materialCost: 0, label: '送料は購入者負担', anonymous: false, ok: true };
  }
  if (options.shippingMode === 'manual') {
    return {
      amount: options.manualShipping,
      materialCost: 0,
      label: '送料を手入力',
      anonymous: false,
      ok: true,
    };
  }
  if (options.shippingMode === 'flat') {
    // 定額便はサイズ判定をしない（送料がすでに確定しているため）
    const method = METHOD_BY_ID[options.flatMethodId];
    const fare = platform.shipping[options.flatMethodId];
    if (!method || fare == null) {
      return {
        amount: 0,
        materialCost: 0,
        label: '定額便なし',
        anonymous: false,
        ok: false,
        reason: 'この販路では選んだ定額便が使えません',
      };
    }
    return {
      amount: fare,
      materialCost: 0,
      label: `${method.name} ${fare}円（全国一律）`,
      anonymous: isAnonymous(platform, options.flatMethodId),
      ok: true,
    };
  }

  const dedicated = dedicatedMapOf(ctx.materials);
  const shipping = usableShipping(platform, options);

  // 自分で選んだ発送方法は、匿名フィルタやサイズ判定より優先する
  const overrideId = ctx.methodOverrides?.[platform.id];
  if (overrideId) {
    const fare = platform.shipping[overrideId];
    const method = METHOD_BY_ID[overrideId];
    if (fare != null && method) {
      const material = dedicated[overrideId];
      const option: ShippingOption = {
        method,
        fare,
        material,
        total: fare + (material?.price ?? 0),
      };
      return {
        amount: option.total,
        materialCost: material?.price ?? 0,
        materialName: material?.name,
        label: labelFor(option),
        anonymous: isAnonymous(platform, overrideId),
        ok: true,
      };
    }
  }

  const best = cheapestShipping(shipping, ctx.dims, dedicated);
  if (!best) {
    return {
      amount: 0,
      materialCost: 0,
      label: '発送方法なし',
      anonymous: false,
      ok: false,
      reason: 'このサイズ・重さで使える発送方法がありません',
    };
  }
  return {
    amount: best.total,
    materialCost: best.material?.price ?? 0,
    materialName: best.material?.name,
    label: labelFor(best),
    anonymous: isAnonymous(platform, best.method.id),
    ok: true,
  };
}

export function labelFor(option: ShippingOption): string {
  if (!option.material) return `${option.method.name} ${option.fare}円`;
  return `${option.method.name} ${option.total}円（送料${option.fare}円 + ${option.material.name}${option.material.price}円）`;
}

/** そのプラットフォームで選べる発送方法の一覧（安い順） */
export function availableShipping(
  platform: Platform,
  dims: Dimensions,
  materials: PackagingMaterial[],
  options?: Options,
): ShippingOption[] {
  const shipping = options ? usableShipping(platform, options) : platform.shipping;
  return shippingOptionsFor(shipping, dims, dedicatedMapOf(materials));
}

export function feeFor(platform: Platform, price: number): number {
  return applyRounding(price * platform.feeRate, platform.feeRounding) + platform.feeFixed;
}

/** 仕入れ + 選んだ梱包資材 + その他経費（送料と専用資材はここに含めない） */
export function fixedCostOf(ctx: CalcContext): { total: number; materials: number } {
  const materials = materialsTotal(ctx.materials, ctx.costs.materials);
  return { total: ctx.costs.purchase + materials + ctx.costs.other, materials };
}

/** 販売価格 → 利益 */
export function calcProfit(platform: Platform, price: number, ctx: CalcContext): Breakdown {
  const ship = resolveShipping(platform, ctx);
  const { total: cost, materials: materialsCost } = fixedCostOf(ctx);
  const payoutFee = ctx.options.includePayoutFee ? platform.payoutFee : 0;
  const fee = feeFor(platform, price);
  const profit = price - fee - ship.amount - cost - payoutFee;

  let ok = ship.ok;
  let reason = ship.reason;
  if (ok && price < platform.minPrice) {
    ok = false;
    reason = `${platform.name}の最低出品価格は${platform.minPrice}円です`;
  }
  if (ok && platform.maxPrice != null && price > platform.maxPrice) {
    ok = false;
    reason = `${platform.name}の上限価格を超えています`;
  }

  return {
    platform,
    price,
    fee,
    shipping: ship.amount,
    shippingLabel: ship.label,
    dedicatedMaterialCost: ship.materialCost,
    dedicatedMaterialName: ship.materialName,
    anonymous: ship.anonymous,
    materialsCost,
    cost,
    payoutFee,
    profit,
    margin: price > 0 ? profit / price : 0,
    ok,
    reason,
  };
}

/** 目標利益 → 必要な販売価格 */
export function calcPriceForTarget(
  platform: Platform,
  targetProfit: number,
  ctx: CalcContext,
): Breakdown {
  const step = Math.max(1, ctx.options.priceStep);
  const ship = resolveShipping(platform, ctx);
  if (!ship.ok) {
    return calcProfit(platform, platform.minPrice, ctx);
  }
  if (platform.feeRate >= 1) {
    const b = calcProfit(platform, platform.minPrice, ctx);
    return { ...b, ok: false, reason: '手数料率が100%以上です' };
  }

  const { total: cost } = fixedCostOf(ctx);
  const payoutFee = ctx.options.includePayoutFee ? platform.payoutFee : 0;
  const base = targetProfit + cost + ship.amount + payoutFee + platform.feeFixed;

  let price = roundUpTo(base / (1 - platform.feeRate), step);
  price = Math.max(price, roundUpTo(platform.minPrice, step));

  // 手数料の端数処理ぶんのズレを詰める
  let guard = 0;
  while (calcProfit(platform, price, ctx).profit < targetProfit && guard++ < 10_000) {
    price += step;
  }
  while (
    price - step >= platform.minPrice &&
    calcProfit(platform, price - step, ctx).profit >= targetProfit
  ) {
    price -= step;
  }

  return calcProfit(platform, price, ctx);
}

export type SortKey = 'profit' | 'price' | 'name';

/** 全プラットフォームを計算して並べ替える */
export function calcAll(
  platforms: Platform[],
  ctx: CalcContext,
  input: { mode: 'price'; value: number } | { mode: 'target'; value: number },
): Breakdown[] {
  const rows = platforms
    .filter((p) => p.enabled)
    .map((p) =>
      input.mode === 'price'
        ? calcProfit(p, input.value, ctx)
        : calcPriceForTarget(p, input.value, ctx),
    );

  return rows.sort((a, b) => {
    if (a.ok !== b.ok) return a.ok ? -1 : 1;
    // 価格→利益モードは利益が多い順、目標利益モードは必要価格が安い順
    return input.mode === 'price' ? b.profit - a.profit : a.price - b.price;
  });
}

/** 損益分岐点（利益がちょうど0になる販売価格） */
export function breakEvenPrice(platform: Platform, ctx: CalcContext): number {
  return calcPriceForTarget(platform, 0, ctx).price;
}

export type { CostInput };
