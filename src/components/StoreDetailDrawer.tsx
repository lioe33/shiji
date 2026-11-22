import { useEffect, useState } from 'react';
import {
  Check,
  Copy,
  Edit3,
  Heart,
  Plus,
  Star,
  Trash2,
  X,
} from 'lucide-react';
import type { TakeoutStore } from '../types/store';
import { CoverImage } from './CoverImage';

interface StoreDetailDrawerProps {
  store: TakeoutStore | null;
  onClose: () => void;
  onEdit: (store: TakeoutStore) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onIncrementOrder: (id: string) => void;
}

export function StoreDetailDrawer({
  store,
  onClose,
  onEdit,
  onDelete,
  onToggleFavorite,
  onIncrementOrder,
}: StoreDetailDrawerProps) {
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setConfirmDelete(false);
    setCopied(false);
  }, [store?.id]);

  useEffect(() => {
    if (!store) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [store, onClose]);

  if (!store) return null;

  const handleCopyName = async () => {
    try {
      await navigator.clipboard.writeText(store.name);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-stretch justify-center md:justify-end bg-black/45 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="detail-drawer-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full md:max-w-lg bg-white max-h-[92dvh] md:max-h-none md:h-full rounded-t-2xl md:rounded-none overflow-hidden flex flex-col border-t md:border-t-0 md:border-l border-black/[0.08] overscroll-contain">
        {/* Mobile grab handle */}
        <div className="md:hidden pt-2.5 pb-1 flex justify-center shrink-0" aria-hidden="true">
          <div className="w-10 h-1 rounded-full bg-black/15" />
        </div>

        {/* Top bar inside drawer */}
        <div className="shrink-0 bg-white/95 backdrop-blur-md px-5 sm:px-6 py-3 md:py-4 border-b border-black/[0.08] flex items-center justify-between gap-4">
          <span className="text-sm font-medium text-[#5A6069]">店铺档案详情</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleFavorite(store.id)}
              aria-label={store.isFavorite ? '取消收藏该店铺' : '收藏该店铺'}
              aria-pressed={store.isFavorite}
              className={`w-11 h-11 rounded-lg flex items-center justify-center border transition-colors cursor-pointer ${
                store.isFavorite
                  ? 'border-[#C93B2B] bg-[#C93B2B] text-white'
                  : 'border-black/[0.1] text-[#111315] hover:bg-[#F3F4F6]'
              }`}
            >
              <Heart
                className={`w-4 h-4 ${store.isFavorite ? 'fill-current' : ''}`}
                aria-hidden="true"
              />
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="关闭店铺详情"
              className="w-11 h-11 rounded-lg flex items-center justify-center border border-black/[0.1] text-[#111315] hover:bg-[#F3F4F6] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {/* Cover */}
          <div className="px-5 sm:px-6 pt-5">
            <CoverImage
              src={store.coverImage}
              alt={store.name}
              aspectClass="aspect-[16/10]"
              className="rounded-xl"
            />
          </div>

          {/* Body */}
          <div className="p-5 sm:p-6 pb-8 space-y-5">
            <div>
              <p className="text-xs text-[#5A6069] mb-2">
                {store.category} · {store.platform} · 最近下单{' '}
                <span className="font-mono tabular-nums">{store.lastOrderedAt}</span>
              </p>
              <div className="flex items-start justify-between gap-3">
                <h2
                  id="detail-drawer-title"
                  className="font-editorial text-xl sm:text-2xl font-semibold text-[#111315] leading-snug"
                >
                  {store.name}
                </h2>
                <button
                  type="button"
                  onClick={handleCopyName}
                  className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] text-xs font-medium text-[#111315] border border-black/[0.1] hover:bg-[#F3F4F6] rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#C93B2B]" aria-hidden="true" />
                      <span>已复制店名</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>复制店名</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* 4-column tabular metrics strip */}
            <div className="grid grid-cols-4 gap-2 sm:gap-3 py-4 border-y border-black/[0.08]">
              <div>
                <p className="text-xs text-[#5A6069] mb-1">评分</p>
                <p className="font-mono tabular-nums text-base sm:text-lg font-semibold text-[#111315] flex items-center gap-1">
                  <Star
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-[#C93B2B] text-[#C93B2B] shrink-0"
                    aria-hidden="true"
                  />
                  {store.rating.toFixed(1)}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#5A6069] mb-1">人均</p>
                <p className="font-mono tabular-nums text-base sm:text-lg font-semibold text-[#111315]">
                  ¥{store.avgPrice}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#5A6069] mb-1">配送</p>
                <p className="font-mono tabular-nums text-base sm:text-lg font-semibold text-[#111315]">
                  {store.deliveryMinutes}m
                </p>
              </div>
              <div>
                <p className="text-xs text-[#5A6069] mb-1">回购</p>
                <p className="font-mono tabular-nums text-base sm:text-lg font-semibold text-[#111315]">
                  {store.orderCount}次
                </p>
              </div>
            </div>

            {/* Must-order dishes */}
            <section>
              <h3 className="text-sm font-semibold text-[#111315] mb-3">必点招牌菜</h3>
              <ol className="space-y-2">
                {store.mustOrderDishes.map((dish, idx) => (
                  <li
                    key={`${dish}-${idx}`}
                    className="flex items-baseline gap-3 text-sm text-[#111315] py-1.5 border-b border-black/[0.05] last:border-b-0"
                  >
                    <span className="font-mono tabular-nums text-xs text-[#5A6069] w-5 shrink-0">
                      0{idx + 1}
                    </span>
                    <span>{dish}</span>
                  </li>
                ))}
              </ol>
            </section>

            {/* Taste notes */}
            {store.notes && (
              <section>
                <h3 className="text-sm font-semibold text-[#111315] mb-2">推荐理由</h3>
                <p className="text-sm text-[#5A6069] leading-relaxed">{store.notes}</p>
              </section>
            )}

            {/* Avoid / order tips */}
            {store.avoidNotes && (
              <section className="p-4 rounded-lg bg-[#FAFAFA] border border-black/[0.08]">
                <h3 className="text-sm font-semibold text-[#111315] mb-1.5">
                  点单备注与避雷提醒
                </h3>
                <p className="text-sm text-[#5A6069] leading-relaxed">{store.avoidNotes}</p>
              </section>
            )}
          </div>
        </div>

        {/* Sticky footer actions with safe-area */}
        <div className="shrink-0 bg-white border-t border-black/[0.08] px-5 sm:px-6 pt-3.5 pb-[calc(0.875rem+env(safe-area-inset-bottom,0px))] flex items-center justify-between gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={() => onIncrementOrder(store.id)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 min-h-[46px] text-sm font-medium text-white bg-[#C93B2B] hover:bg-[#A92F21] active:scale-[0.99] rounded-lg transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>刚点过 +1</span>
          </button>

          <button
            type="button"
            onClick={() => onEdit(store)}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 min-h-[46px] text-sm font-medium text-[#111315] border border-black/[0.12] hover:bg-[#F3F4F6] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Edit3 className="w-4 h-4" aria-hidden="true" />
            <span>编辑</span>
          </button>

          {!confirmDelete ? (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              aria-label={`删除「${store.name}」`}
              className="w-[46px] h-[46px] rounded-lg flex items-center justify-center border border-black/[0.12] text-[#5A6069] hover:text-[#C93B2B] hover:border-[#C93B2B] transition-colors shrink-0 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" aria-hidden="true" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onDelete(store.id)}
              className="px-3.5 py-2.5 min-h-[46px] text-xs font-medium text-white bg-[#111315] hover:bg-[#C93B2B] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              确认删除
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
