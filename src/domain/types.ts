/** 端数処理の方式 */
export type Rounding = 'floor' | 'round' | 'ceil';

/** 発送方法のサイズ・重量制限（未指定の項目は無制限として扱う） */
export type SizeLimit = {
  /** 最長辺 cm */
  maxLongest?: number;
  /** 3辺合計 cm */
  maxSum3?: number;
  /** 厚さ cm */
  maxThickness?: number;
  /** 重さ g */
  maxWeight?: number;
};

export type ShippingMethod = {
  id: string;
  name: string;
  carrier: string;
  limit: SizeLimit;
  /** 専用箱・専用シールなどの追加費用（円） */
  materialCost?: number;
  note?: string;
};

export type Platform = {
  id: string;
  name: string;
  /** 販売手数料率（0.10 = 10%） */
  feeRate: number;
  /** 固定の販売手数料（円）。カテゴリ成約料など */
  feeFixed: number;
  /** 手数料の端数処理 */
  feeRounding: Rounding;
  /** 売上金の振込手数料（円） */
  payoutFee: number;
  /** 出品可能な最低価格（円） */
  minPrice: number;
  /** 出品可能な最高価格（円） */
  maxPrice?: number;
  /** 発送方法ID -> 送料（円）。ここに載っている方法だけが選択肢になる */
  shipping: Record<string, number>;
  enabled: boolean;
  note?: string;
};

export type Dimensions = {
  /** 縦 cm */
  length: number;
  /** 横 cm */
  width: number;
  /** 厚さ・高さ cm */
  height: number;
  /** 重さ g */
  weight: number;
};

export type CostInput = {
  /** 仕入れ値（元値） */
  purchase: number;
  /** 梱包資材費 */
  packaging: number;
  /** その他経費（交通費・手数料など） */
  other: number;
};

/** 送料の扱い方 */
export type ShippingMode =
  /** サイズから自動で最安の発送方法を選ぶ */
  | 'auto'
  /** 送料を自分で直接入力する */
  | 'manual'
  /** 送料は購入者負担（＝出品者の負担 0円） */
  | 'buyer';

export type Options = {
  shippingMode: ShippingMode;
  /** shippingMode === 'manual' のときの送料 */
  manualShipping: number;
  /** 振込手数料を利益計算に含めるか */
  includePayoutFee: boolean;
  /** 販売価格の丸め単位（1 / 10 / 100 円） */
  priceStep: number;
};

/** 1プラットフォームぶんの計算結果 */
export type Breakdown = {
  platform: Platform;
  /** 販売価格 */
  price: number;
  /** 販売手数料 */
  fee: number;
  /** 送料（出品者負担ぶん） */
  shipping: number;
  /** 採用した発送方法の表示名 */
  shippingLabel: string;
  /** 仕入れ + 梱包 + その他 */
  cost: number;
  /** 振込手数料（含めない設定なら 0） */
  payoutFee: number;
  /** 手取り利益 */
  profit: number;
  /** 利益率（利益 / 販売価格） */
  margin: number;
  /** 計算可能かどうか */
  ok: boolean;
  /** ok === false のときの理由 */
  reason?: string;
};
