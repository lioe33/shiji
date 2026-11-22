export type CuisineCategory =
  | '中式正餐'
  | '粉面粥'
  | '轻食沙拉'
  | '烧烤夜宵'
  | '奶茶咖啡'
  | '日韩料理'
  | '西餐汉堡';

export type DeliveryPlatform = '美团' | '饿了么' | '京东秒送' | '小程序';

export type SortOption =
  | 'rating'
  | 'orderCount'
  | 'deliveryMinutes'
  | 'avgPrice'
  | 'recent';

export type AppView = 'catalog' | 'picker' | 'insights' | 'deploy';

export interface TakeoutStore {
  id: string;
  name: string;
  category: CuisineCategory;
  platform: DeliveryPlatform;
  rating: number; // 1.0 - 5.0
  avgPrice: number; // RMB per person
  deliveryMinutes: number;
  orderCount: number;
  isFavorite: boolean;
  mustOrderDishes: string[];
  notes: string;
  avoidNotes: string;
  coverImage: string;
  lastOrderedAt: string; // YYYY-MM-DD
  createdAt: string; // ISO string
}

export interface StoreFilterState {
  search: string;
  category: CuisineCategory | '全部';
  platform: DeliveryPlatform | '全部平台';
  favoritesOnly: boolean;
  sortBy: SortOption;
}

export interface MealPickerCriteria {
  category: CuisineCategory | '全部';
  maxPrice: number | null;
  maxDeliveryMinutes: number | null;
  favoritesOnly: boolean;
}

export interface StoreFormInput {
  name: string;
  category: CuisineCategory;
  platform: DeliveryPlatform;
  rating: number;
  avgPrice: string;
  deliveryMinutes: string;
  mustOrderText: string;
  notes: string;
  avoidNotes: string;
  coverImage: string;
  isFavorite: boolean;
}

export interface ValidationErrors {
  name?: string;
  avgPrice?: string;
  deliveryMinutes?: string;
  rating?: string;
  mustOrderText?: string;
}

export interface CategoryBreakdownItem {
  category: CuisineCategory;
  count: number;
  percentage: number;
}

export interface PlatformBreakdownItem {
  platform: DeliveryPlatform;
  count: number;
  percentage: number;
}

export interface TasteStats {
  totalStores: number;
  favoriteCount: number;
  totalOrders: number;
  averagePrice: number;
  averageRating: number;
  fastestDelivery: number | null;
  topCategory: CuisineCategory | null;
  categoryBreakdown: CategoryBreakdownItem[];
  platformBreakdown: PlatformBreakdownItem[];
  topReordered: TakeoutStore[];
}
