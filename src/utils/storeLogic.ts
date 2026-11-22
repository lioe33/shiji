import { CUISINE_CATEGORIES, DELIVERY_PLATFORMS, DEFAULT_COVER_BY_CATEGORY } from '../data/seedStores';
import type {
  CuisineCategory,
  DeliveryPlatform,
  MealPickerCriteria,
  StoreFilterState,
  StoreFormInput,
  TakeoutStore,
  TasteStats,
  ValidationErrors,
} from '../types/store';

export function parseDishesText(raw: string): string[] {
  return raw
    .split(/[,，、\n;；]+/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

export function validateStoreInput(input: StoreFormInput): {
  valid: boolean;
  errors: ValidationErrors;
  parsedPrice: number;
  parsedDelivery: number;
  parsedDishes: string[];
} {
  const errors: ValidationErrors = {};
  const trimmedName = input.name.trim();

  if (!trimmedName) {
    errors.name = '请输入店铺名称';
  } else if (trimmedName.length > 50) {
    errors.name = '店铺名称不超过 50 个字';
  }

  const parsedPrice = Number(input.avgPrice);
  if (!input.avgPrice.trim() || Number.isNaN(parsedPrice) || parsedPrice <= 0 || parsedPrice > 2000) {
    errors.avgPrice = '请输入有效人均金额（1 - 2000 元）';
  }

  const parsedDelivery = Number(input.deliveryMinutes);
  if (
    !input.deliveryMinutes.trim() ||
    Number.isNaN(parsedDelivery) ||
    parsedDelivery < 5 ||
    parsedDelivery > 180
  ) {
    errors.deliveryMinutes = '请输入有效配送时长（5 - 180 分钟）';
  }

  if (Number.isNaN(input.rating) || input.rating < 1 || input.rating > 5) {
    errors.rating = '评分需在 1.0 到 5.0 之间';
  }

  const parsedDishes = parseDishesText(input.mustOrderText);
  if (parsedDishes.length === 0) {
    errors.mustOrderText = '请至少填写 1 道必点招牌菜';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    parsedPrice: Math.round(parsedPrice),
    parsedDelivery: Math.round(parsedDelivery),
    parsedDishes,
  };
}

export function filterAndSortStores(
  stores: TakeoutStore[],
  filters: StoreFilterState
): TakeoutStore[] {
  const query = filters.search.trim().toLowerCase();

  const filtered = stores.filter((store) => {
    if (filters.favoritesOnly && !store.isFavorite) {
      return false;
    }
    if (filters.category !== '全部' && store.category !== filters.category) {
      return false;
    }
    if (filters.platform !== '全部平台' && store.platform !== filters.platform) {
      return false;
    }
    if (query) {
      const searchable = [
        store.name,
        store.category,
        store.platform,
        store.notes,
        store.avoidNotes,
        ...store.mustOrderDishes,
      ]
        .join(' ')
        .toLowerCase();
      if (!searchable.includes(query)) {
        return false;
      }
    }
    return true;
  });

  return [...filtered].sort((a, b) => {
    switch (filters.sortBy) {
      case 'rating':
        if (b.rating !== a.rating) return b.rating - a.rating;
        return b.orderCount - a.orderCount;
      case 'orderCount':
        if (b.orderCount !== a.orderCount) return b.orderCount - a.orderCount;
        return b.rating - a.rating;
      case 'deliveryMinutes':
        if (a.deliveryMinutes !== b.deliveryMinutes) {
          return a.deliveryMinutes - b.deliveryMinutes;
        }
        return b.rating - a.rating;
      case 'avgPrice':
        if (a.avgPrice !== b.avgPrice) return a.avgPrice - b.avgPrice;
        return b.rating - a.rating;
      case 'recent':
      default:
        return b.createdAt.localeCompare(a.createdAt);
    }
  });
}

export function pickMatchingStores(
  stores: TakeoutStore[],
  criteria: MealPickerCriteria
): TakeoutStore[] {
  return stores.filter((store) => {
    if (criteria.favoritesOnly && !store.isFavorite) return false;
    if (criteria.category !== '全部' && store.category !== criteria.category) return false;
    if (criteria.maxPrice !== null && store.avgPrice > criteria.maxPrice) return false;
    if (
      criteria.maxDeliveryMinutes !== null &&
      store.deliveryMinutes > criteria.maxDeliveryMinutes
    ) {
      return false;
    }
    return true;
  });
}

export function pickRandomStore(
  stores: TakeoutStore[],
  criteria: MealPickerCriteria,
  excludeId?: string,
  randomFn: () => number = Math.random
): TakeoutStore | null {
  const candidates = pickMatchingStores(stores, criteria);
  if (candidates.length === 0) return null;
  if (candidates.length === 1) return candidates[0];

  const pool =
    excludeId && candidates.some((s) => s.id !== excludeId)
      ? candidates.filter((s) => s.id !== excludeId)
      : candidates;

  const index = Math.min(pool.length - 1, Math.floor(randomFn() * pool.length));
  return pool[index];
}

export function computeTasteStats(stores: TakeoutStore[]): TasteStats {
  const totalStores = stores.length;
  if (totalStores === 0) {
    return {
      totalStores: 0,
      favoriteCount: 0,
      totalOrders: 0,
      averagePrice: 0,
      averageRating: 0,
      fastestDelivery: null,
      topCategory: null,
      categoryBreakdown: [],
      platformBreakdown: [],
      topReordered: [],
    };
  }

  let favoriteCount = 0;
  let totalOrders = 0;
  let totalPrice = 0;
  let totalRating = 0;
  let fastestDelivery = stores[0].deliveryMinutes;

  const categoryCounts = new Map<CuisineCategory, number>();
  const platformCounts = new Map<DeliveryPlatform, number>();

  for (const store of stores) {
    if (store.isFavorite) favoriteCount += 1;
    totalOrders += store.orderCount;
    totalPrice += store.avgPrice;
    totalRating += store.rating;
    if (store.deliveryMinutes < fastestDelivery) {
      fastestDelivery = store.deliveryMinutes;
    }
    categoryCounts.set(store.category, (categoryCounts.get(store.category) ?? 0) + 1);
    platformCounts.set(store.platform, (platformCounts.get(store.platform) ?? 0) + 1);
  }

  const categoryBreakdown = Array.from(categoryCounts.entries())
    .map(([category, count]) => ({
      category,
      count,
      percentage: Math.round((count / totalStores) * 100),
    }))
    .sort((a, b) => b.count - a.count);

  const platformBreakdown = Array.from(platformCounts.entries())
    .map(([platform, count]) => ({
      platform,
      count,
      percentage: Math.round((count / totalStores) * 100),
    }))
    .sort((a, b) => b.count - a.count);

  const topReordered = [...stores]
    .sort((a, b) => b.orderCount - a.orderCount || b.rating - a.rating)
    .slice(0, 5);

  return {
    totalStores,
    favoriteCount,
    totalOrders,
    averagePrice: Math.round(totalPrice / totalStores),
    averageRating: Number((totalRating / totalStores).toFixed(1)),
    fastestDelivery,
    topCategory: categoryBreakdown[0]?.category ?? null,
    categoryBreakdown,
    platformBreakdown,
    topReordered,
  };
}

export function exportStoresToJson(stores: TakeoutStore[]): string {
  return JSON.stringify(
    {
      version: 1,
      exportedAt: new Date().toISOString(),
      stores,
    },
    null,
    2
  );
}

export function parseImportedStoresJson(
  jsonText: string
): { ok: true; stores: TakeoutStore[] } | { ok: false; error: string } {
  try {
    const parsed = JSON.parse(jsonText);
    const rawList: unknown = Array.isArray(parsed) ? parsed : parsed?.stores;
    if (!Array.isArray(rawList)) {
      return { ok: false, error: 'JSON 格式不正确：未找到 stores 数组' };
    }

    const validCategories = new Set<string>(CUISINE_CATEGORIES);
    const validPlatforms = new Set<string>(DELIVERY_PLATFORMS);

    const normalized: TakeoutStore[] = [];
    for (let i = 0; i < rawList.length; i += 1) {
      const item = rawList[i] as Record<string, unknown>;
      if (!item || typeof item !== 'object' || typeof item.name !== 'string' || !item.name.trim()) {
        return { ok: false, error: `第 ${i + 1} 条记录缺少有效的店铺名称` };
      }

      const category: CuisineCategory = validCategories.has(String(item.category))
        ? (item.category as CuisineCategory)
        : '中式正餐';
      const platform: DeliveryPlatform = validPlatforms.has(String(item.platform))
        ? (item.platform as DeliveryPlatform)
        : '美团';
      const ratingNum = Number(item.rating);
      const avgPriceNum = Number(item.avgPrice);
      const deliveryNum = Number(item.deliveryMinutes);
      const orderNum = Number(item.orderCount);

      const dishes = Array.isArray(item.mustOrderDishes)
        ? item.mustOrderDishes.map((d) => String(d).trim()).filter(Boolean)
        : [];

      normalized.push({
        id: typeof item.id === 'string' && item.id.trim() ? item.id : `imported-${Date.now()}-${i}`,
        name: item.name.trim(),
        category,
        platform,
        rating:
          !Number.isNaN(ratingNum) && ratingNum >= 1 && ratingNum <= 5
            ? Number(ratingNum.toFixed(1))
            : 4.5,
        avgPrice: !Number.isNaN(avgPriceNum) && avgPriceNum > 0 ? Math.round(avgPriceNum) : 30,
        deliveryMinutes:
          !Number.isNaN(deliveryNum) && deliveryNum >= 5 ? Math.round(deliveryNum) : 30,
        orderCount: !Number.isNaN(orderNum) && orderNum >= 0 ? Math.round(orderNum) : 1,
        isFavorite: Boolean(item.isFavorite),
        mustOrderDishes: dishes.length > 0 ? dishes : ['招牌必点'],
        notes: typeof item.notes === 'string' ? item.notes : '',
        avoidNotes: typeof item.avoidNotes === 'string' ? item.avoidNotes : '',
        coverImage:
          typeof item.coverImage === 'string' && item.coverImage.trim()
            ? item.coverImage
            : DEFAULT_COVER_BY_CATEGORY[category],
        lastOrderedAt:
          typeof item.lastOrderedAt === 'string' && item.lastOrderedAt.trim()
            ? item.lastOrderedAt
            : new Date().toISOString().slice(0, 10),
        createdAt:
          typeof item.createdAt === 'string' && item.createdAt.trim()
            ? item.createdAt
            : new Date().toISOString(),
      });
    }

    if (normalized.length === 0) {
      return { ok: false, error: '导入文件中没有任何店铺记录' };
    }

    return { ok: true, stores: normalized };
  } catch {
    return { ok: false, error: '无法解析 JSON 文件，请确认文件内容完整' };
  }
}

export function getTodayDateString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
