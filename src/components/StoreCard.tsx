import { Heart, Plus, Star } from 'lucide-react';
import type { TakeoutStore } from '../types/store';
import { CoverImage } from './CoverImage';

interface StoreCardProps {
  store: TakeoutStore;
  onSelect: (store: TakeoutStore) => void;
  onToggleFavorite: (id: string) => void;
  onIncrementOrder: (id: string) => void;
}

export function StoreCard({
  store,
  onSelect,
  onToggleFavorite,
  onIncrementOrder,
}: StoreCardProps) {
  return (
    <article
      data-testid="store-card"
      className="group bg-white border border-black/[0.08] rounded-xl overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-0.5 hover:border-black/[0.16]"
    >
      {/* Visual cover slot */}
      <div className="relative">
        <button
          type="button"
          onClick={() => onSelect(store)}
          aria-label={`查看「${store.name}」详情`}
          className="block w-full text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-[-2px]"
        >
          <CoverImage src={store.coverImage} alt={store.name} />
        </button>

        {/* Favorite toggle button */}
        <button
          type="button"
          onClick={() => onToggleFavorite(store.id)}
          aria-label={
            store.isFavorite ? `取消收藏「${store.name}」` : `收藏「${store.name}」`
          }
          aria-pressed={store.isFavorite}
          className={`absolute top-3 right-3 w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md transition-all active:scale-95 cursor-pointer ${
            store.isFavorite
              ? 'bg-[#C93B2B] text-white'
              : 'bg-white/90 text-[#111315] hover:bg-white'
          }`}
        >
          <Heart
            className={`w-4 h-4 ${store.isFavorite ? 'fill-current' : ''}`}
            aria-hidden="true"
          />
        </button>
      </div>

      {/* Content block */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col">
        {/* Clean unboxed metadata kicker */}
        <div className="flex items-center justify-between gap-2 text-xs text-[#5A6069] mb-2">
          <span className="truncate">
            {store.city} · {store.category} · {store.platform} · 约{' '}
            <span className="font-mono tabular-nums">{store.deliveryMinutes}</span> 分钟
          </span>
          <span className="inline-flex items-center gap-1 font-mono tabular-nums font-medium text-[#111315] shrink-0">
            <Star
              className="w-3.5 h-3.5 fill-[#C93B2B] text-[#C93B2B]"
              aria-hidden="true"
            />
            {store.rating.toFixed(1)}
          </span>
        </div>

        {/* Store title */}
        <h3 className="text-base font-semibold text-[#111315] leading-snug mb-2">
          <button
            type="button"
            onClick={() => onSelect(store)}
            className="text-left hover:text-[#C93B2B] transition-colors cursor-pointer line-clamp-1"
          >
            {store.name}
          </button>
        </h3>

        {/* Must-order dishes summary */}
        <p className="text-sm text-[#5A6069] line-clamp-2 leading-relaxed mb-4 flex-1">
          <span className="text-[#111315] font-medium">必点：</span>
          {store.mustOrderDishes.join('、')}
        </p>

        {/* Footer stats & quick reorder button */}
        <div className="pt-3.5 border-t border-black/[0.06] flex items-center justify-between gap-3">
          <div className="text-xs text-[#5A6069] tabular-nums">
            <span>人均 </span>
            <span className="font-mono text-sm font-semibold text-[#111315]">
              ¥{store.avgPrice}
            </span>
            <span aria-hidden="true" className="mx-1.5">
              ·
            </span>
            <span>
              回购 <span className="font-mono font-medium text-[#111315]">{store.orderCount}</span>{' '}
              次
            </span>
          </div>

          <button
            type="button"
            onClick={() => onIncrementOrder(store.id)}
            aria-label={`记录刚点过「${store.name}」`}
            className="inline-flex items-center gap-1 px-3.5 sm:px-3 py-1.5 min-h-[44px] sm:min-h-[36px] text-xs font-medium text-[#111315] bg-[#F3F4F6] hover:bg-[#111315] hover:text-white active:scale-[0.98] rounded-md transition-all whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
            <span>刚点过</span>
          </button>
        </div>
      </div>
    </article>
  );
}
