import type { Platform } from './types';

/**
 * 手数料・送料のデフォルト値。
 * ★ここの数字はあくまで「初期値」です。各社の改定は頻繁なので、
 *   アプリの設定画面（または このファイル）で自分の実績値に直して使ってください。
 */
export const DEFAULTS_UPDATED_AT = '2025-06';

/**
 * 全国一律の定額便。プラットフォームを問わず自己発送で使えるので、全社に同じ値で入れる。
 * ただし自己発送なので匿名配送にはならない（相手に住所・氏名が伝わる）。
 */
const FLAT = {
  clickpost: 185,
  smart_letter: 210,
  letterpack_light: 430,
  letterpack_plus: 600,
};

/** メルカリ便（らくらく／ゆうゆう） */
const mercariShipping = {
  yupacket_post_mini: 160,
  nekoposu: 210,
  yupacket_post: 215,
  yupacket: 230,
  compact: 450,
  yupacket_plus: 455,
  size60: 750,
  size80: 850,
  size100: 1050,
  size120: 1200,
  size140: 1450,
  size160: 1700,
  size180: 2100,
  size200: 2500,
  ...FLAT,
};

/** かんたんラクマパック（60・80サイズは日本郵便とヤマトで料金が違う） */
const rakumaShipping = {
  yupacket_post_mini: 160,
  yupacket_post: 175,
  yupacket: 180,
  nekoposu: 200,
  yupacket_plus: 380,
  compact: 590,
  yupack60: 700,
  yupack80: 800,
  size60: 900,
  size80: 1000,
  size100: 1150,
  size120: 1350,
  size140: 1550,
  size160: 1950,
  ...FLAT,
};

/** Yahoo!フリマ おてがる配送 */
const yahooFleaShipping = {
  yupacket_post_mini: 160,
  yupacket_post: 180,
  yupacket: 205,
  nekoposu: 210,
  yupacket_plus: 410,
  compact: 490,
  size60: 750,
  size80: 850,
  size100: 1050,
  size120: 1200,
  size140: 1450,
  size160: 1700,
  ...FLAT,
};

/** ヤフオク! おてがる配送（出品者負担） */
const yahooAuctionShipping = {
  yupacket_post_mini: 160,
  yupacket_post: 210,
  nekoposu: 210,
  yupacket: 215,
  yupacket_plus: 410,
  compact: 490,
  size60: 750,
  size80: 850,
  size100: 1050,
  size120: 1200,
  size140: 1450,
  size160: 1700,
  ...FLAT,
};

/** 提携配送のない販路向け。一般料金（持込割引なし）の目安 */
const courierShipping = {
  yupacket: 250,
  compact: 610,
  size60: 940,
  size80: 1150,
  size100: 1390,
  size120: 1610,
  size140: 1850,
  size160: 2070,
  size180: 2400,
  size200: 2800,
  ...FLAT,
};

export const DEFAULT_PLATFORMS: Platform[] = [
  {
    id: 'mercari',
    name: 'メルカリ',
    feeRate: 0.1,
    feeFixed: 0,
    feeRounding: 'floor',
    payoutFee: 200,
    minPrice: 300,
    maxPrice: 9_999_999,
    anonymousDelivery: true,
    shipping: mercariShipping,
    enabled: true,
    note: '販売手数料10%／らくらく・ゆうゆうメルカリ便は匿名配送',
  },
  {
    id: 'rakuma',
    name: 'ラクマ',
    feeRate: 0.045,
    feeFixed: 0,
    feeRounding: 'floor',
    payoutFee: 210,
    minPrice: 300,
    anonymousDelivery: true,
    shipping: rakumaShipping,
    enabled: true,
    note: '販売手数料4.5%／かんたんラクマパックは匿名配送（郵便・ヤマト両方）',
  },
  {
    id: 'yahoo_flea',
    name: 'Yahoo!フリマ',
    feeRate: 0.05,
    feeFixed: 0,
    feeRounding: 'floor',
    payoutFee: 0,
    minPrice: 300,
    anonymousDelivery: true,
    shipping: yahooFleaShipping,
    enabled: true,
    note: '販売手数料5%／おてがる配送は匿名配送',
  },
  {
    id: 'yahoo_auction',
    name: 'ヤフオク!',
    feeRate: 0.1,
    feeFixed: 0,
    feeRounding: 'floor',
    payoutFee: 0,
    minPrice: 1,
    anonymousDelivery: true,
    shipping: yahooAuctionShipping,
    enabled: true,
    note: '落札システム利用料10%（個人）／おてがる配送は匿名配送',
  },
  {
    id: 'amazon',
    name: 'Amazon',
    feeRate: 0.15,
    feeFixed: 0,
    feeRounding: 'round',
    payoutFee: 0,
    minPrice: 1,
    anonymousDelivery: false,
    shipping: courierShipping,
    enabled: true,
    note: 'カテゴリにより8〜15%。小口出品は別途1件100円',
  },
  {
    id: 'base',
    name: 'BASE / 自社EC',
    feeRate: 0.066,
    feeFixed: 40,
    feeRounding: 'round',
    payoutFee: 250,
    minPrice: 1,
    anonymousDelivery: false,
    shipping: courierShipping,
    enabled: false,
    note: 'スタンダードプラン 6.6% + 40円',
  },
  {
    id: 'custom1',
    name: 'カスタム①',
    feeRate: 0,
    feeFixed: 0,
    feeRounding: 'floor',
    payoutFee: 0,
    minPrice: 1,
    anonymousDelivery: false,
    shipping: courierShipping,
    enabled: false,
    note: '設定画面で自由に手数料・送料を設定',
  },
  {
    id: 'custom2',
    name: 'カスタム②',
    feeRate: 0,
    feeFixed: 0,
    feeRounding: 'floor',
    payoutFee: 0,
    minPrice: 1,
    anonymousDelivery: false,
    shipping: courierShipping,
    enabled: false,
    note: '設定画面で自由に手数料・送料を設定',
  },
];
