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
  note?: string;
};

/** 梱包資材の購入先 */
export type MaterialStore = 'japanpost' | 'yamato' | 'other';

export type PackagingMaterial = {
  id: string;
  name: string;
  /** どこで買えるか（郵便局 / ヤマト直営店 / その他） */
  store: MaterialStore;
  /** 単価（円） */
  price: number;
  /**
   * この発送方法の専用資材（専用BOX・専用シールなど）。
   * 指定すると、その発送方法を使うときだけ自動で送料に上乗せされる。
   */
  dedicatedTo?: string;
  /** この資材に収まるサイズの目安（「おすすめ」表示に使う） */
  limit?: SizeLimit;
  /** 使わない資材（リストにも出さず、金額にも入れない） */
  hidden?: boolean;
  /** ユーザーが自分で追加した資材（削除できる） */
  custom?: boolean;
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
  /** 選んだ梱包資材：資材ID -> 個数 */
  materials: Record<string, number>;
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
  /** 送料（出品者負担ぶん。専用資材があればその分を含む） */
  shipping: number;
  /** 採用した発送方法の表示名 */
  shippingLabel: string;
  /** 送料に含まれる専用資材の金額（専用BOX・専用シールなど） */
  dedicatedMaterialCost: number;
  /** 専用資材の名前（なければ undefined） */
  dedicatedMaterialName?: string;
  /** 手動で選んだ梱包資材の合計 */
  materialsCost: number;
  /** 仕入れ + 梱包資材 + その他 */
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
