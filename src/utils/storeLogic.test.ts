import test from 'node:test';
import assert from 'node:assert/strict';
import { SEED_STORES } from '../data/seedStores';
import {
  computeTasteStats,
  exportStoresToJson,
  filterAndSortStores,
  parseDishesText,
  parseImportedStoresJson,
  pickMatchingStores,
  pickRandomStore,
  validateStoreInput,
} from './storeLogic';

test('parseDishesText splits Chinese and English separators cleanly', () => {
  const dishes = parseDishesText('干锅牛蛙，手打冰粉、蒜蓉生菜\n酸梅汤');
  assert.deepEqual(dishes, ['干锅牛蛙', '手打冰粉', '蒜蓉生菜', '酸梅汤']);
});

test('validateStoreInput rejects empty required fields and invalid ranges', () => {
  const result = validateStoreInput({
    name: '   ',
    category: '粉面粥',
    platform: '美团',
    rating: 4.8,
    avgPrice: '-5',
    deliveryMinutes: '2',
    mustOrderText: '',
    notes: '',
    avoidNotes: '',
    coverImage: '',
    isFavorite: false,
  });

  assert.equal(result.valid, false);
  assert.ok(result.errors.name);
  assert.ok(result.errors.avgPrice);
  assert.ok(result.errors.deliveryMinutes);
  assert.ok(result.errors.mustOrderText);
});

test('validateStoreInput accepts valid form data and parses numbers', () => {
  const result = validateStoreInput({
    name: '潮汕阿强牛肉粿条',
    category: '粉面粥',
    platform: '美团',
    rating: 4.9,
    avgPrice: '32.6',
    deliveryMinutes: '25',
    mustOrderText: '吊龙粿条, 手打牛肉丸',
    notes: '汤底鲜甜',
    avoidNotes: '沙茶酱另装',
    coverImage: '/src/assets/images/dish_beef_noodles_1795354352246.jpg',
    isFavorite: true,
  });

  assert.equal(result.valid, true);
  assert.equal(result.parsedPrice, 33);
  assert.equal(result.parsedDelivery, 25);
  assert.deepEqual(result.parsedDishes, ['吊龙粿条', '手打牛肉丸']);
});

test('filterAndSortStores filters by category, platform, favorites, and dish search', () => {
  const byCategory = filterAndSortStores(SEED_STORES, {
    search: '',
    category: '粉面粥',
    platform: '全部平台',
    favoritesOnly: false,
    sortBy: 'rating',
  });
  assert.equal(byCategory.length, 1);
  assert.equal(byCategory[0].id, 'store-laozhang-noodles');

  const byDish = filterAndSortStores(SEED_STORES, {
    search: '冰博克',
    category: '全部',
    platform: '全部平台',
    favoritesOnly: false,
    sortBy: 'rating',
  });
  assert.equal(byDish.length, 1);
  assert.equal(byDish[0].id, 'store-slow-roast');

  const byPriceAsc = filterAndSortStores(SEED_STORES, {
    search: '',
    category: '全部',
    platform: '全部平台',
    favoritesOnly: false,
    sortBy: 'avgPrice',
  });
  assert.equal(byPriceAsc[0].avgPrice, 24);
  assert.equal(byPriceAsc[byPriceAsc.length - 1].avgPrice, 64);
});

test('pickRandomStore honors budget/time filters and avoids immediate repeat', () => {
  const criteria = {
    category: '全部' as const,
    maxPrice: 35,
    maxDeliveryMinutes: 30,
    favoritesOnly: false,
  };
  const matches = pickMatchingStores(SEED_STORES, criteria);
  assert.equal(matches.length, 2); // 32元牛肉面 + 24元咖啡

  const picked = pickRandomStore(SEED_STORES, criteria, matches[0].id, () => 0);
  assert.ok(picked);
  assert.notEqual(picked.id, matches[0].id);

  const impossible = pickRandomStore(SEED_STORES, {
    category: '西餐汉堡',
    maxPrice: 15,
    maxDeliveryMinutes: 10,
    favoritesOnly: true,
  });
  assert.equal(impossible, null);
});

test('computeTasteStats aggregates counts, averages, and top reordered stores', () => {
  const stats = computeTasteStats(SEED_STORES);
  assert.equal(stats.totalStores, 6);
  assert.equal(stats.favoriteCount, 4);
  assert.equal(stats.totalOrders, 14 + 11 + 9 + 7 + 16 + 5);
  assert.equal(stats.fastestDelivery, 19);
  assert.equal(stats.topReordered[0].id, 'store-slow-roast');
});

test('exportStoresToJson and parseImportedStoresJson round-trip cleanly and reject invalid JSON', () => {
  const exported = exportStoresToJson(SEED_STORES);
  const parsed = parseImportedStoresJson(exported);
  assert.equal(parsed.ok, true);
  if (parsed.ok) {
    assert.equal(parsed.stores.length, SEED_STORES.length);
    assert.equal(parsed.stores[0].name, SEED_STORES[0].name);
  }

  const badJson = parseImportedStoresJson('{ broken json');
  assert.equal(badJson.ok, false);

  const missingName = parseImportedStoresJson(JSON.stringify({ stores: [{ category: '粉面粥' }] }));
  assert.equal(missingName.ok, false);
});
