import { cheapestShipping, METHOD_BY_ID, shippingOptionsFor, type ShippingOption } from './shipping';
import type { Breakdown, CostInput, Dimensions, Options, Platform, Rounding } from './types';

export type CalcContext = {
  costs: CostInput;
  dims: Dimensions;
  options: Options;
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
  amount: number;
  label: string;
  ok: boolean;
  reason?: string;
};

/** そのプラットフォームで実際に負担する送料を決める */
export function resolveShipping(platform: Platform, ctx: CalcContext): ResolvedShipping {
  const { options } = ctx;
  if (options.shippingMode === 'buyer') {
    return { amount: 0, label: '送料は購入者負担', ok: true };
  }
  if (options.shippingMode === 'manual') {
    return { amount: options.manualShipping, label: '送料を手入力', ok: true };
  }

  const overrideId = ctx.methodOverrides?.[platform.id];
  if (overrideId) {
    const fare = platform.shipping[overrideId];
    const method = METHOD_BY_ID[overrideId];
    if (fare != null && method) {
      const total = fare + (method.materialCost ?? 0);
      return { amount: total, label: labelFor({ method, fare, total }), ok: true };
    }
  }

  const best = cheapestShipping(platform.shipping, ctx.dims);
  if (!best) {
    return {
      amount: 0,
      label: '発送方法なし',
      ok: false,
      reason: 'このサイズ・重さで使える発送方法がありません',
    };
  }
  return { amount: best.total, label: labelFor(best), ok: true };
}

export function labelFor(option: ShippingOption): string {
  const material = option.method.materialCost ?? 0;
  const suffix = material > 0 ? `（${option.fare}円 + 資材${material}円）` : '';
  return `${option.method.name} ${option.total}円${suffix}`;
}

/** そのプラットフォームで選べる発送方法の一覧（安い順） */
export function availableShipping(platform: Platform, dims: Dimensions): ShippingOption[] {
  return shippingOptionsFor(platform.shipping, dims);
}

export function feeFor(platform: Platform, price: number): number {
  return applyRounding(price * platform.feeRate, platform.feeRounding) + platform.feeFixed;
}

/** 販売価格 → 利益 */
export function calcProfit(platform: Platform, price: number, ctx: CalcContext): Breakdown {
  const ship = resolveShipping(platform, ctx);
  const cost = ctx.costs.purchase + ctx.costs.packaging + ctx.costs.other;
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

  const cost = ctx.costs.purchase + ctx.costs.packaging + ctx.costs.other;
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
