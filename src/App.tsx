import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, ChevronDown, Heart, Plus, Search, Star, X } from 'lucide-react';
import { CoverImage } from './components/CoverImage';
import { DeployGuideView } from './components/DeployGuideView';
import { InsightsView } from './components/InsightsView';
import { MealPickerView } from './components/MealPickerView';
import { Navbar } from './components/Navbar';
import { StoreCard } from './components/StoreCard';
import { StoreDetailDrawer } from './components/StoreDetailDrawer';
import { StoreFormModal } from './components/StoreFormModal';
import { CUISINE_CATEGORIES, DELIVERY_PLATFORMS, SEED_STORES } from './data/seedStores';
import type {
  AppView,
  CuisineCategory,
  DeliveryPlatform,
  SortOption,
  StoreFilterState,
  TakeoutStore,
} from './types/store';
import { loadStoresFromStorage, saveStoresToStorage } from './utils/storage';
import {
  computeTasteStats,
  filterAndSortStores,
  getTodayDateString,
} from './utils/storeLogic';

export default function App() {
  const [stores, setStores] = useState<TakeoutStore[]>(() => loadStoresFromStorage());
  const [activeView, setActiveView] = useState<AppView>('catalog');

  const [filters, setFilters] = useState<StoreFilterState>({
    search: '',
    category: '全部',
    platform: '全部平台',
    favoritesOnly: false,
    sortBy: 'rating',
  });

  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<TakeoutStore | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    saveStoresToStorage(stores);
  }, [stores]);

  const showToast = (message: string) => {
    setToastMessage(message);
  };

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(null), 2600);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  const filteredStores = useMemo(
    () => filterAndSortStores(stores, filters),
    [stores, filters]
  );

  const stats = useMemo(() => computeTasteStats(stores), [stores]);

  const featuredStore = useMemo(() => {
    if (stores.length === 0) return null;
    const favorites = stores.filter((s) => s.isFavorite);
    const pool = favorites.length > 0 ? favorites : stores;
    return [...pool].sort((a, b) => b.orderCount - a.orderCount || b.rating - a.rating)[0];
  }, [stores]);

  const selectedStore = useMemo(
    () => stores.find((s) => s.id === selectedStoreId) ?? null,
    [stores, selectedStoreId]
  );

  const handleToggleFavorite = (id: string) => {
    setStores((prev) =>
      prev.map((store) =>
        store.id === id ? { ...store, isFavorite: !store.isFavorite } : store
      )
    );
  };

  const handleIncrementOrder = (id: string) => {
    const today = getTodayDateString();
    let storeName = '';
    setStores((prev) =>
      prev.map((store) => {
        if (store.id === id) {
          storeName = store.name;
          return {
            ...store,
            orderCount: store.orderCount + 1,
            lastOrderedAt: today,
          };
        }
        return store;
      })
    );
    if (storeName) {
      showToast(`已记录刚点过「${storeName}」，回购 +1`);
    }
  };

  const handleSaveStore = (payload: {
    id?: string;
    name: string;
    category: CuisineCategory;
    platform: DeliveryPlatform;
    rating: number;
    avgPrice: number;
    deliveryMinutes: number;
    mustOrderDishes: string[];
    notes: string;
    avoidNotes: string;
    coverImage: string;
    isFavorite: boolean;
  }) => {
    if (payload.id) {
      setStores((prev) =>
        prev.map((store) =>
          store.id === payload.id
            ? {
                ...store,
                name: payload.name,
                category: payload.category,
                platform: payload.platform,
                rating: payload.rating,
                avgPrice: payload.avgPrice,
                deliveryMinutes: payload.deliveryMinutes,
                mustOrderDishes: payload.mustOrderDishes,
                notes: payload.notes,
                avoidNotes: payload.avoidNotes,
                coverImage: payload.coverImage,
                isFavorite: payload.isFavorite,
              }
            : store
        )
      );
      showToast(`已更新「${payload.name}」`);
    } else {
      const newStore: TakeoutStore = {
        id: `store-${Date.now()}`,
        name: payload.name,
        category: payload.category,
        platform: payload.platform,
        rating: payload.rating,
        avgPrice: payload.avgPrice,
        deliveryMinutes: payload.deliveryMinutes,
        orderCount: 1,
        isFavorite: payload.isFavorite,
        mustOrderDishes: payload.mustOrderDishes,
        notes: payload.notes,
        avoidNotes: payload.avoidNotes,
        coverImage: payload.coverImage,
        lastOrderedAt: getTodayDateString(),
        createdAt: new Date().toISOString(),
      };
      setStores((prev) => [newStore, ...prev]);
      setActiveView('catalog');
      showToast(`已收入宝藏库：「${payload.name}」`);
    }

    setIsFormOpen(false);
    setEditingStore(null);
  };

  const handleDeleteStore = (id: string) => {
    const target = stores.find((s) => s.id === id);
    setStores((prev) => prev.filter((s) => s.id !== id));
    setSelectedStoreId(null);
    if (target) {
      showToast(`已删除「${target.name}」`);
    }
  };

  const handleOpenAddModal = () => {
    setEditingStore(null);
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (store: TakeoutStore) => {
    setSelectedStoreId(null);
    setEditingStore(store);
    setIsFormOpen(true);
  };

  const hasActiveFilters =
    filters.search.trim() !== '' ||
    filters.category !== '全部' ||
    filters.platform !== '全部平台' ||
    filters.favoritesOnly;

  const resetFilters = () => {
    setFilters({
      search: '',
      category: '全部',
      platform: '全部平台',
      favoritesOnly: false,
      sortBy: 'rating',
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] text-[#111315]">
      <Navbar
        activeView={activeView}
        onSelectView={setActiveView}
        onOpenAddModal={handleOpenAddModal}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24 md:py-12">
        {activeView === 'catalog' && (
          <div className="space-y-8 md:space-y-12">
            {/* Hero Spotlight: Balanced 2-column split */}
            <section
              aria-label="外卖手账概览"
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch"
            >
              <div className="lg:col-span-7 flex flex-col justify-between py-1 md:py-2">
                <div className="space-y-3 sm:space-y-4">
                  <p className="text-xs font-medium text-[#C93B2B]">
                    私人外卖手账 · 本地持久保存
                  </p>
                  <h1 className="font-editorial text-[28px] sm:text-4xl lg:text-[42px] font-semibold text-[#111315] leading-[1.2] tracking-tight">
                    把真正好吃的外卖，
                    <br />
                    留给下次肚子饿的时候。
                  </h1>
                  <p className="text-sm sm:text-base text-[#5A6069] max-w-xl leading-relaxed">
                    记录必点招牌菜、隐藏点单备注与真实送达耗时，告别在各大外卖平台翻找历史订单的烦恼。
                  </p>
                </div>

                {/* Search box + quiet inline metrics */}
                <div className="mt-6 sm:mt-8 space-y-4 sm:space-y-5">
                  <div className="relative max-w-xl">
                    <label htmlFor="store-search" className="sr-only">
                      搜索店铺名称、必点菜品或备注
                    </label>
                    <Search
                      className="w-4 h-4 text-[#5A6069] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                      aria-hidden="true"
                    />
                    <input
                      id="store-search"
                      type="search"
                      value={filters.search}
                      onChange={(e) =>
                        setFilters((prev) => ({ ...prev, search: e.target.value }))
                      }
                      placeholder="搜索店名、必点菜（如：牛肉面、冰博克）..."
                      className="w-full pl-11 pr-11 py-3 min-h-[46px] text-base sm:text-sm bg-white border border-black/[0.12] rounded-xl focus:border-[#C93B2B] focus:outline-none transition-colors"
                    />
                    {filters.search && (
                      <button
                        type="button"
                        onClick={() =>
                          setFilters((prev) => ({ ...prev, search: '' }))
                        }
                        aria-label="清空搜索关键词"
                        className="absolute right-1 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-[#5A6069] hover:text-[#111315] cursor-pointer"
                      >
                        <X className="w-4 h-4" aria-hidden="true" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#5A6069] tabular-nums">
                    <span>
                      已收录{' '}
                      <strong className="font-mono text-sm text-[#111315]">
                        {stats.totalStores}
                      </strong>{' '}
                      家宝藏店
                    </span>
                    <span aria-hidden="true" className="hidden sm:inline">
                      ·
                    </span>
                    <span>
                      置顶收藏{' '}
                      <strong className="font-mono text-sm text-[#111315]">
                        {stats.favoriteCount}
                      </strong>{' '}
                      家
                    </span>
                    <span aria-hidden="true" className="hidden sm:inline">
                      ·
                    </span>
                    <span>
                      累计回购{' '}
                      <strong className="font-mono text-sm text-[#111315]">
                        {stats.totalOrders}
                      </strong>{' '}
                      次
                    </span>
                    <span aria-hidden="true" className="hidden sm:inline">
                      ·
                    </span>
                    <span>
                      平均人均{' '}
                      <strong className="font-mono text-sm text-[#111315]">
                        ¥{stats.averagePrice}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Featured favorite spotlight card */}
              {featuredStore && (
                <div className="lg:col-span-5">
                  <button
                    type="button"
                    onClick={() => setSelectedStoreId(featuredStore.id)}
                    aria-label={`查看本周常点推荐「${featuredStore.name}」`}
                    className="group relative w-full h-full min-h-[215px] sm:min-h-[260px] lg:min-h-[300px] rounded-2xl overflow-hidden text-left block cursor-pointer border border-black/[0.08]"
                  >
                    <CoverImage
                      src={featuredStore.coverImage}
                      alt={featuredStore.name}
                      aspectClass="absolute inset-0 w-full h-full"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-black/82 via-black/35 to-black/10"
                    />
                    <div className="relative h-full p-5 sm:p-6 flex flex-col justify-between text-white">
                      <div className="flex items-center justify-between text-xs text-white/85">
                        <span>回购榜首 · {featuredStore.platform}</span>
                        <span className="inline-flex items-center gap-1 font-mono tabular-nums font-medium">
                          <Star
                            className="w-3.5 h-3.5 fill-white text-white"
                            aria-hidden="true"
                          />
                          {featuredStore.rating.toFixed(1)}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-end justify-between gap-3">
                          <h2 className="font-editorial text-xl sm:text-2xl font-semibold leading-snug">
                            {featuredStore.name}
                          </h2>
                          <ArrowUpRight
                            className="w-5 h-5 shrink-0 opacity-80 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                            aria-hidden="true"
                          />
                        </div>
                        <p className="text-xs sm:text-sm text-white/85 line-clamp-1">
                          必点：{featuredStore.mustOrderDishes.join('、')}
                        </p>
                        <p className="text-xs text-white/75 font-mono tabular-nums pt-0.5">
                          人均 ¥{featuredStore.avgPrice} · 已回购 {featuredStore.orderCount} 次 · 约{' '}
                          {featuredStore.deliveryMinutes} 分钟
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              )}
            </section>

            {/* Filter & Sort Toolbar */}
            <section
              aria-label="筛选与排序"
              className="pt-5 sm:pt-6 border-t border-black/[0.08] space-y-3.5 sm:space-y-4"
            >
              {/* Category tabs - edge-to-edge touch swipe on mobile */}
              <div className="-mx-4 px-4 sm:mx-0 sm:px-0 flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                {(['全部', ...CUISINE_CATEGORIES] as (CuisineCategory | '全部')[]).map(
                  (category) => {
                    const isActive = filters.category === category;
                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() =>
                          setFilters((prev) => ({ ...prev, category }))
                        }
                        aria-pressed={isActive}
                        className={`px-3.5 py-2 min-h-[44px] sm:min-h-[38px] text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          isActive
                            ? 'bg-[#111315] text-white'
                            : 'text-[#5A6069] hover:text-[#111315] hover:bg-black/[0.04]'
                        }`}
                      >
                        {category}
                      </button>
                    );
                  }
                )}
              </div>

              {/* Secondary controls row */}
              <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center justify-between gap-2.5 sm:gap-3">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                  <button
                    type="button"
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        favoritesOnly: !prev.favoritesOnly,
                      }))
                    }
                    aria-pressed={filters.favoritesOnly}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[44px] sm:min-h-[40px] text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      filters.favoritesOnly
                        ? 'border-[#C93B2B] bg-[#C93B2B]/8 text-[#C93B2B]'
                        : 'border-black/[0.1] bg-white text-[#5A6069] hover:text-[#111315]'
                    }`}
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${
                        filters.favoritesOnly ? 'fill-current' : ''
                      }`}
                      aria-hidden="true"
                    />
                    <span>仅看置顶收藏</span>
                  </button>

                  <div className="relative shrink-0">
                    <label className="sr-only" htmlFor="platform-filter">
                      按外卖平台筛选
                    </label>
                    <select
                      id="platform-filter"
                      value={filters.platform}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          platform: e.target.value as DeliveryPlatform | '全部平台',
                        }))
                      }
                      className="appearance-none pl-3.5 pr-9 py-2 min-h-[44px] sm:min-h-[40px] text-xs font-medium bg-white border border-black/[0.1] rounded-lg text-[#111315] cursor-pointer focus:border-[#C93B2B] focus:outline-none"
                    >
                      <option value="全部平台">全部平台</option>
                      {DELIVERY_PLATFORMS.map((platform) => (
                        <option key={platform} value={platform}>
                          {platform}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      className="w-3.5 h-3.5 text-[#5A6069] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                      aria-hidden="true"
                    />
                  </div>

                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="px-2.5 py-2 min-h-[44px] sm:min-h-[40px] text-xs font-medium text-[#C93B2B] hover:text-[#A92F21] cursor-pointer whitespace-nowrap shrink-0"
                    >
                      重置筛选
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3">
                  <span
                    data-testid="filtered-count"
                    className="text-xs text-[#5A6069] tabular-nums"
                  >
                    共 <span className="font-mono font-medium text-[#111315]">{filteredStores.length}</span> 家
                  </span>
                  <div className="relative">
                    <label className="sr-only" htmlFor="sort-select">
                      店铺排序方式
                    </label>
                    <select
                      id="sort-select"
                      value={filters.sortBy}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          sortBy: e.target.value as SortOption,
                        }))
                      }
                      className="appearance-none pl-3.5 pr-9 py-2 min-h-[44px] sm:min-h-[40px] text-xs font-medium bg-white border border-black/[0.1] rounded-lg text-[#111315] cursor-pointer focus:border-[#C93B2B] focus:outline-none"
                    >
                      <option value="rating">按评分从高到低</option>
                      <option value="orderCount">按回购次数最多</option>
                      <option value="deliveryMinutes">按配送最快</option>
                      <option value="avgPrice">按人均从低到高</option>
                      <option value="recent">按最近记录</option>
                    </select>
                    <ChevronDown
                      className="w-3.5 h-3.5 text-[#5A6069] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                      aria-hidden="true"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Store Grid */}
            <section aria-label="外卖店铺列表">
              {filteredStores.length === 0 ? (
                <div className="bg-white border border-black/[0.08] rounded-xl py-16 px-6 text-center space-y-4">
                  <p className="font-editorial text-xl font-semibold text-[#111315]">
                    {stores.length === 0
                      ? '还没有记录任何外卖店铺'
                      : '没有找到符合条件的店铺'}
                  </p>
                  <p className="text-sm text-[#5A6069] max-w-md mx-auto">
                    {stores.length === 0
                      ? '点击右上角「记录新店铺」，把你吃过最满意的外卖收进专属清单。'
                      : '换个关键词、切换菜系分类，或者立刻把这家新发现加进清单里。'}
                  </p>
                  <div className="flex items-center justify-center gap-3 pt-2">
                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={resetFilters}
                        className="px-4 py-2.5 min-h-[44px] text-sm font-medium text-[#111315] border border-black/[0.12] hover:bg-[#F3F4F6] rounded-lg transition-colors cursor-pointer"
                      >
                        查看全部店铺
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleOpenAddModal}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 min-h-[44px] text-sm font-medium text-white bg-[#C93B2B] hover:bg-[#A92F21] rounded-lg transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" aria-hidden="true" />
                      <span>记录新店铺</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7">
                  {filteredStores.map((store) => (
                    <StoreCard
                      key={store.id}
                      store={store}
                      onSelect={(s) => setSelectedStoreId(s.id)}
                      onToggleFavorite={handleToggleFavorite}
                      onIncrementOrder={handleIncrementOrder}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {activeView === 'picker' && (
          <MealPickerView
            stores={stores}
            onSelectStore={(s) => setSelectedStoreId(s.id)}
            onIncrementOrder={handleIncrementOrder}
          />
        )}

        {activeView === 'insights' && (
          <InsightsView
            stores={stores}
            onSelectStore={(s) => setSelectedStoreId(s.id)}
            onImportStores={(imported) => {
              setStores(imported);
              showToast(`已导入 ${imported.length} 家外卖店铺`);
            }}
            onResetDemo={() => {
              setStores(SEED_STORES);
              showToast('已恢复初始示例数据');
            }}
          />
        )}

        {activeView === 'deploy' && <DeployGuideView />}
      </main>

      {/* Quiet Editorial Footer */}
      <footer className="hidden md:block border-t border-black/[0.06] bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6 flex items-center justify-between text-xs text-[#5A6069]">
          <span>食记 · 私人宝藏外卖录</span>
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => setActiveView('insights')}
              className="hover:text-[#111315] transition-colors cursor-pointer"
            >
              数据备份
            </button>
            <button
              type="button"
              onClick={() => setActiveView('deploy')}
              className="hover:text-[#111315] transition-colors cursor-pointer"
            >
              Cloudflare Pages 部署说明
            </button>
          </div>
        </div>
      </footer>

      {/* Detail Slide-over Drawer */}
      <StoreDetailDrawer
        store={selectedStore}
        onClose={() => setSelectedStoreId(null)}
        onEdit={handleOpenEditModal}
        onDelete={handleDeleteStore}
        onToggleFavorite={handleToggleFavorite}
        onIncrementOrder={handleIncrementOrder}
      />

      {/* Add / Edit Store Modal */}
      <StoreFormModal
        isOpen={isFormOpen}
        editingStore={editingStore}
        onClose={() => {
          setIsFormOpen(false);
          setEditingStore(null);
        }}
        onSubmit={handleSaveStore}
      />

      {/* Subtle Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40 px-4 py-2.5 bg-[#111315] text-white text-xs sm:text-sm font-medium rounded-lg shadow-lg"
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
}
