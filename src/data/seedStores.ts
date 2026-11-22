import type { CuisineCategory, DeliveryPlatform, TakeoutStore } from '../types/store';

export const CUISINE_CATEGORIES: CuisineCategory[] = [
  '中式正餐',
  '粉面粥',
  '轻食沙拉',
  '烧烤夜宵',
  '奶茶咖啡',
  '日韩料理',
  '西餐汉堡',
];

export const DELIVERY_PLATFORMS: DeliveryPlatform[] = [
  '美团',
  '饿了么',
  '京东秒送',
  '小程序',
];

export interface CoverPreset {
  id: string;
  label: string;
  category: CuisineCategory;
  url: string;
}

export const COVER_PRESETS: CoverPreset[] = [
  {
    id: 'sichuan',
    label: '川湘干锅',
    category: '中式正餐',
    url: '/src/assets/images/dish_sichuan_frog_1795354351031.jpg',
  },
  {
    id: 'noodles',
    label: '红烧牛肉面',
    category: '粉面粥',
    url: '/src/assets/images/dish_beef_noodles_1795354352246.jpg',
  },
  {
    id: 'salad',
    label: '三文鱼能量碗',
    category: '轻食沙拉',
    url: '/src/assets/images/dish_poke_salad_1795354356413.jpg',
  },
  {
    id: 'bbq',
    label: '炭火羊肉串',
    category: '烧烤夜宵',
    url: '/src/assets/images/dish_bbq_skewers_1795354355552.jpg',
  },
  {
    id: 'cafe',
    label: '精品咖啡茶饮',
    category: '奶茶咖啡',
    url: '/src/assets/images/dish_matcha_coffee_1795354356041.jpg',
  },
  {
    id: 'donburi',
    label: '炭烤鳗鱼饭',
    category: '日韩料理',
    url: '/src/assets/images/dish_japanese_donburi_1795354355196.jpg',
  },
];

export const DEFAULT_COVER_BY_CATEGORY: Record<CuisineCategory, string> = {
  中式正餐: COVER_PRESETS[0].url,
  粉面粥: COVER_PRESETS[1].url,
  轻食沙拉: COVER_PRESETS[2].url,
  烧烤夜宵: COVER_PRESETS[3].url,
  奶茶咖啡: COVER_PRESETS[4].url,
  日韩料理: COVER_PRESETS[5].url,
  西餐汉堡: COVER_PRESETS[2].url,
};

export const SEED_STORES: TakeoutStore[] = [
  {
    id: 'store-chuanwei-ganguo',
    name: '山城灶台 · 现炒干锅馆',
    category: '中式正餐',
    platform: '美团',
    rating: 4.9,
    avgPrice: 38,
    deliveryMinutes: 28,
    orderCount: 14,
    isFavorite: true,
    mustOrderDishes: ['干锅脆皮鸡配藕片', '手打红糖冰粉', '蒜蓉空心菜'],
    notes: '锅气很足，配菜里的炸藕片和土豆条特别入味，铝箔保温袋送过来还是烫嘴的。',
    avoidNotes: '微辣就已经很有劲，不能吃辣记得备注「少油微微辣」。',
    coverImage: '/src/assets/images/dish_sichuan_frog_1795354351031.jpg',
    lastOrderedAt: '2026-11-20',
    createdAt: '2026-10-12T11:30:00.000Z',
  },
  {
    id: 'store-laozhang-noodles',
    name: '阿明眷村红烧牛肉面',
    category: '粉面粥',
    platform: '饿了么',
    rating: 4.8,
    avgPrice: 32,
    deliveryMinutes: 24,
    orderCount: 11,
    isFavorite: true,
    mustOrderDishes: ['半筋半肉红烧面', '秘制酸菜加份', '卤溏心蛋'],
    notes: '汤面分离打包非常讲究，牛腱肉炖得软烂不塞牙，加班晚上来一碗极其治愈。',
    avoidNotes: '记得勾选「面条偏硬」和「汤面分开」，到手口感和堂食几乎一样。',
    coverImage: '/src/assets/images/dish_beef_noodles_1795354352246.jpg',
    lastOrderedAt: '2026-11-18',
    createdAt: '2026-10-18T18:20:00.000Z',
  },
  {
    id: 'store-nordic-bowl',
    name: '森野谷物 · 炙烤能量碗',
    category: '轻食沙拉',
    platform: '美团',
    rating: 4.7,
    avgPrice: 42,
    deliveryMinutes: 22,
    orderCount: 9,
    isFavorite: false,
    mustOrderDishes: ['炙烤三文鱼牛油果藜麦碗', '焙煎芝麻酱', '烤南瓜角'],
    notes: '食材新鲜度很稳，三文鱼是厚切现煎的，工作日午餐吃完不犯困。',
    avoidNotes: '油醋汁偏酸，更推荐选焙煎芝麻酱或牛油果酸奶酱。',
    coverImage: '/src/assets/images/dish_poke_salad_1795354356413.jpg',
    lastOrderedAt: '2026-11-19',
    createdAt: '2026-10-25T12:10:00.000Z',
  },
  {
    id: 'store-midnight-skewer',
    name: '北疆炭火小串铺',
    category: '烧烤夜宵',
    platform: '京东秒送',
    rating: 4.9,
    avgPrice: 56,
    deliveryMinutes: 35,
    orderCount: 7,
    isFavorite: true,
    mustOrderDishes: ['红柳枝羔羊肉串', '炭烤带皮大蒜', '焦香烤馒头片'],
    notes: '晚上十点后依然在线的宝藏烧烤，孜然和辣椒面香气很正，肥瘦相间烤得焦脆。',
    avoidNotes: '周五晚 9 点后出餐稍慢，建议提前半小时下单。',
    coverImage: '/src/assets/images/dish_bbq_skewers_1795354355552.jpg',
    lastOrderedAt: '2026-11-15',
    createdAt: '2026-11-01T21:40:00.000Z',
  },
  {
    id: 'store-slow-roast',
    name: '白日漫游 · 精品咖啡与抹茶',
    category: '奶茶咖啡',
    platform: '小程序',
    rating: 4.8,
    avgPrice: 24,
    deliveryMinutes: 19,
    orderCount: 16,
    isFavorite: true,
    mustOrderDishes: ['冰博克 Dirty', '宇治手打抹茶燕麦拿铁', '海盐黄油碱水结'],
    notes: '下午三点续命首选，冰块与浓缩分装送达，抹茶粉苦甜平衡完全不腻。',
    avoidNotes: '抹茶燕麦拿铁选「微甜」刚好，无糖会偏苦涩。',
    coverImage: '/src/assets/images/dish_matcha_coffee_1795354356041.jpg',
    lastOrderedAt: '2026-11-21',
    createdAt: '2026-11-04T15:00:00.000Z',
  },
  {
    id: 'store-kuro-unagi',
    name: '炭屋一番 · 活烤鳗鱼专门店',
    category: '日韩料理',
    platform: '饿了么',
    rating: 4.9,
    avgPrice: 64,
    deliveryMinutes: 31,
    orderCount: 5,
    isFavorite: false,
    mustOrderDishes: ['炭烤活鳗温泉蛋盖饭', '味增海带汤', '柚子萝卜小菜'],
    notes: '周末犒劳自己专用，鳗鱼皮微焦带炭香，山椒粉和温泉蛋拌越光米饭绝配。',
    avoidNotes: '酱汁默认给得不多，喜欢拌饭湿润一点的记得备注「多给鳗鱼汁」。',
    coverImage: '/src/assets/images/dish_japanese_donburi_1795354355196.jpg',
    lastOrderedAt: '2026-11-14',
    createdAt: '2026-11-08T19:05:00.000Z',
  },
];
