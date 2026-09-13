import type { Platform } from './types';

/**
 * 手数料・送料のデフォルト値。
 * ★ここの数字はあくまで「初期値」です。各社の改定は頻繁なので、
 *   アプリの設定画面（または このファイル）で自分の実績値に直して使ってください。
 */
export const DEFAULTS_UPDATED_AT = '2025-06';

/**
 * 提携外の自己発送。出品者が自分で宛名を書いて出すので匿名配送にはならない。
 * 郵便の料金は2024年10月改定後の値。一般宅配便は元払いの目安（距離で変わる）。
 */
const SELF_SHIP = {
  teikei25: 110,
  teikei50: 140,
  teikeigai50: 140,
  teikeigai100: 180,
  teikeigai150: 270,
  teikeigai250: 320,
  teikeigai500: 510,
  teikeigai1000: 750,
  clickpost: 185,
  smart_letter: 210,
  letterpack_light: 430,
  letterpack_plus: 600,
  general60: 940,
  general80: 1150,
  general100: 1390,
  general120: 1610,
  general140: 1850,
  general160: 2070,
  general180: 2400,
  general200: 2800,
};

/** ミニレターはメルカリのヘルプにのみ明記されているので、そこだけ足す */
const MINI_LETTER = { mini_letter: 85 };

/** らくらくメルカリ便＋ゆうゆうメルカリ便 */
const mercariShipping = {
  // ゆうゆうメルカリ便（日本郵便）
  yupacket_post_mini: 160,
  yupacket_post: 215,
  yupacket: 230,
  yupacket_plus: 455,
  yupack60: 750,
  yupack80: 850,
  yupack100: 1050,
  yupack120: 1200,
  yupack140: 1450,
  yupack160: 1700,
  yupack170: 1900,
  // らくらくメルカリ便（ヤマト運輸）
  nekoposu: 210,
  compact: 450,
  takkyubin60: 750,
  takkyubin80: 850,
  takkyubin100: 1050,
  takkyubin120: 1200,
  takkyubin140: 1450,
  takkyubin160: 1700,
  takkyubin180: 2100,
  takkyubin200: 2500,
  // 大型・特殊（料金は要入力）
  eco_mercari: 0,
  tanomerubin: 1700,
  ...MINI_LETTER,
  ...SELF_SHIP,
};

/** かんたんラクマパック（日本郵便＋ヤマト運輸） */
const rakumaShipping = {
  yupacket_post_mini: 160,
  yupacket_post: 175,
  yupacket: 180,
  yupacket_plus: 380,
  yupack60: 700,
  yupack80: 800,
  yupack100: 1150,
  yupack120: 1350,
  yupack140: 1550,
  yupack160: 1950,
  yupack170: 2100,
  nekoposu: 200,
  compact: 590,
  takkyubin60: 900,
  takkyubin80: 1000,
  takkyubin100: 1150,
  takkyubin120: 1350,
  takkyubin140: 1550,
  takkyubin160: 1950,
  takkyubin180: 2400,
  takkyubin200: 2800,
  ...SELF_SHIP,
};

/**
 * Yahoo!フリマ おてがる配送。
 * 提携外の発送（普通郵便・レターパックなど手書き宛名）は利用できないため、
 * 自己発送の方法はいっさい持たせない。
 */
const yahooFleaShipping = {
  yupacket_post_mini: 160,
  yupacket_post: 180,
  yupacket: 205,
  yupacket_plus: 410,
  yupack60: 750,
  yupack80: 850,
  yupack100: 1050,
  yupack120: 1200,
  yupack140: 1450,
  yupack160: 1700,
  yupack170: 1900,
  nekoposu: 210,
  compact: 490,
  takkyubin60: 750,
  takkyubin80: 850,
  takkyubin100: 1050,
  takkyubin120: 1200,
  takkyubin140: 1450,
  takkyubin160: 1700,
  takkyubin180: 2100,
  takkyubin200: 2500,
  omakase: 0,
};

/** ヤフオク! おてがる配送（出品者負担）＋提携外 */
const yahooAuctionShipping = {
  yupacket_post_mini: 160,
  yupacket_post: 210,
  yupacket: 215,
  yupacket_plus: 410,
  yupack60: 750,
  yupack80: 850,
  yupack100: 1050,
  yupack120: 1200,
  yupack140: 1450,
  yupack160: 1700,
  yupack170: 1900,
  nekoposu: 210,
  compact: 490,
  takkyubin60: 750,
  takkyubin80: 850,
  takkyubin100: 1050,
  takkyubin120: 1200,
  takkyubin140: 1450,
  takkyubin160: 1700,
  takkyubin180: 2100,
  takkyubin200: 2500,
  omakase: 0,
  ...SELF_SHIP,
};

/** 提携配送のない販路。すべて自己発送 */
const selfShipOnly = { ...MINI_LETTER, ...SELF_SHIP };

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
    note: '販売手数料10%／らくらく・ゆうゆうメルカリ便は匿名配送。提携外の発送も可',
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
    note: '販売手数料4.5%／かんたんラクマパック（郵便・ヤマト）は匿名配送。提携外の発送も可',
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
    note: '販売手数料5%／おてがる配送のみ。全件が匿名・追跡つきで、提携外の発送は不可',
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
    note: '落札システム利用料10%（個人）／おてがる配送は匿名配送。提携外の発送も可',
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
    shipping: selfShipOnly,
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
    shipping: selfShipOnly,
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
    shipping: selfShipOnly,
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
    shipping: selfShipOnly,
    enabled: false,
    note: '設定画面で自由に手数料・送料を設定',
  },
];
