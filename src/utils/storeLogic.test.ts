import test from 'node:test';
import assert from 'node:assert/strict';
import { SEED_STORES } from '../data/seedStores';
import {
  computeTasteStats,
  exportStoresToJson,
  filterAndSortStores,
  getUniqueCities,
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

test('validateStoreInput rejects empty required fields including city and invalid ranges', () => {
  const result = validateStoreInput({
    name: '   ',
    city: ' ',
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
  assert.ok(result.errors.city);
  assert.ok(result.errors.avgPrice);
  assert.ok(result.errors.deliveryMinutes);
  assert.ok(result.errors.mustOrderText);
});

test('validateStoreInput accepts valid form data with city and parses numbers', () => {
  const result = validateStoreInput({
    name: '潮汕阿强牛肉粿条',
    city: '汕头',
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

test('filterAndSortStores filters by city, category, platform, favorites, and search', () => {
  const byCity = filterAndSortStores(SEED_STORES, {
    search: '',
    city: '上海',
    category: '全部',
    platform: '全部平台',
    favoritesOnly: false,
    sortBy: 'rating',
  });
  assert.equal(byCity.length, 2);
  assert.ok(byCity.every((s) => s.city === '上海'));

  const byCitySearch = filterAndSortStores(SEED_STORES, {
    search: '成都',
    city: '全部城市',
    category: '全部',
    platform: '全部平台',
    favoritesOnly: false,
    sortBy: 'rating',
  });
  assert.equal(byCitySearch.length, 1);
  assert.equal(byCitySearch[0].id, 'store-chuanwei-ganguo');

  const byCategory = filterAndSortStores(SEED_STORES, {
    search: '',
    city: '全部城市',
    category: '粉面粥',
    platform: '全部平台',
    favoritesOnly: false,
    sortBy: 'rating',
  });
  assert.equal(byCategory.length, 1);
  assert.equal(byCategory[0].id, 'store-laozhang-noodles');

  const byPriceAsc = filterAndSortStores(SEED_STORES, {
    search: '',
    city: '全部城市',
    category: '全部',
    platform: '全部平台',
    favoritesOnly: false,
    sortBy: 'avgPrice',
  });
  assert.equal(byPriceAsc[0].avgPrice, 24);
  assert.equal(byPriceAsc[byPriceAsc.length - 1].avgPrice, 64);
});

test('getUniqueCities returns cities sorted by frequency', () => {
  const cities = getUniqueCities(SEED_STORES);
  assert.equal(cities[0], '上海');
  assert.equal(cities.length, 5);
});

test('pickRandomStore honors city, budget, and time filters and avoids immediate repeat', () => {
  const criteria = {
    city: '上海',
    category: '全部' as const,
    maxPrice: 50,
    maxDeliveryMinutes: 30,
    favoritesOnly: false,
  };
  const matches = pickMatchingStores(SEED_STORES, criteria);
  assert.equal(matches.length, 2); // 上海牛肉面 + 上海能量碗

  const picked = pickRandomStore(SEED_STORES, criteria, matches[0].id, () => 0);
  assert.ok(picked);
  assert.notEqual(picked.id, matches[0].id);

  const impossible = pickRandomStore(SEED_STORES, {
    city: '哈尔滨',
    category: '全部',
    maxPrice: null,
    maxDeliveryMinutes: null,
    favoritesOnly: false,
  });
  assert.equal(impossible, null);
});

test('computeTasteStats aggregates counts, averages, city breakdown, and top reordered stores', () => {
  const stats = computeTasteStats(SEED_STORES);
  assert.equal(stats.totalStores, 6);
  assert.equal(stats.favoriteCount, 4);
  assert.equal(stats.totalOrders, 14 + 11 + 9 + 7 + 16 + 5);
  assert.equal(stats.fastestDelivery, 19);
  assert.equal(stats.topReordered[0].id, 'store-slow-roast');
  assert.equal(stats.cityBreakdown[0].city, '上海');
  assert.equal(stats.cityBreakdown[0].count, 2);
});

test('exportStoresToJson and parseImportedStoresJson preserve city and handle legacy backups', () => {
  const exported = exportStoresToJson(SEED_STORES);
  const parsed = parseImportedStoresJson(exported);
  assert.equal(parsed.ok, true);
  if (parsed.ok) {
    assert.equal(parsed.stores.length, SEED_STORES.length);
    assert.equal(parsed.stores[0].city, '成都');
  }

  const legacy = parseImportedStoresJson(
    JSON.stringify({
      stores: [{ name: '老数据面馆', category: '粉面粥', platform: '美团', avgPrice: 25 }],
    })
  );
  assert.equal(legacy.ok, true);
  if (legacy.ok) {
    assert.equal(legacy.stores[0].city, '未填城市');
  }

  const badJson = parseImportedStoresJson('{ broken json');
  assert.equal(badJson.ok, false);
});
