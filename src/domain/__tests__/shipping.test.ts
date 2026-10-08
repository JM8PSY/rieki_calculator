/// <reference types="node" />
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { groupShippingOptions, METHOD_BY_ID, type ShippingOption } from '../shipping';

const opt = (id: string, fare: number): ShippingOption => ({
  method: METHOD_BY_ID[id],
  fare,
  total: fare,
});

test('サイズ別の宅急便・ゆうパックだけが sizeBand を持つ', () => {
  assert.equal(METHOD_BY_ID.takkyubin80.sizeBand, 80);
  assert.equal(METHOD_BY_ID.yupack170.sizeBand, 170);
  assert.equal(METHOD_BY_ID.compact.sizeBand, undefined);
  assert.equal(METHOD_BY_ID.nekoposu.sizeBand, undefined);
  assert.equal(METHOD_BY_ID.general80.sizeBand, undefined);
});

test('定額の小型便 → サイズ別便 → 大型 → 自己発送 の順に分け、空グループは出さない', () => {
  const groups = groupShippingOptions([
    opt('takkyubin80', 850),
    opt('letterpack_light', 430),
    opt('nekoposu', 210),
    opt('yupack60', 750),
    opt('compact', 450),
  ]);
  assert.deepEqual(
    groups.map((g) => [g.group, g.items.map((i) => i.method.id)]),
    [
      ['partner', ['nekoposu', 'compact']],
      ['partner_sized', ['yupack60', 'takkyubin80']],
      ['self', ['letterpack_light']],
    ],
  );
});

test('サイズ別便はサイズ順、同サイズなら安い順に並ぶ', () => {
  const groups = groupShippingOptions([
    opt('yupack80', 800),
    opt('takkyubin60', 900),
    opt('takkyubin80', 1000),
    opt('yupack60', 700),
  ]);
  assert.deepEqual(
    groups[0].items.map((i) => i.method.id),
    ['yupack60', 'takkyubin60', 'yupack80', 'takkyubin80'],
  );
});
