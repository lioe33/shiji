import { useMemo, useRef, useState } from 'react';
import { Check, Copy, Dices, Plus, RotateCw, Star } from 'lucide-react';
import { CUISINE_CATEGORIES } from '../data/seedStores';
import type { CuisineCategory, MealPickerCriteria, TakeoutStore } from '../types/store';
import { pickMatchingStores, pickRandomStore } from '../utils/storeLogic';
import { CoverImage } from './CoverImage';

interface MealPickerViewProps {
  stores: TakeoutStore[];
  onSelectStore: (store: TakeoutStore) => void;
  onIncrementOrder: (id: string) => void;
}

const BUDGET_OPTIONS: { label: string; value: number | null }[] = [
  { label: '预算不限', value: null },
  { label: '¥30 以内', value: 30 },
  { label: '¥45 以内', value: 45 },
  { label: '¥65 以内', value: 65 },
];

const TIME_OPTIONS: { label: string; value: number | null }[] = [
  { label: '时长不限', value: null },
  { label: '25 分钟内', value: 25 },
  { label: '35 分钟内', value: 35 },
];

export function MealPickerView({
  stores,
  onSelectStore,
  onIncrementOrder,
}: MealPickerViewProps) {
  const [criteria, setCriteria] = useState<MealPickerCriteria>({
    category: '全部',
    maxPrice: null,
    maxDeliveryMinutes: null,
    favoritesOnly: false,
  });
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [copied, setCopied] = useState(false);
  const resultRef = useRef<HTMLElement>(null);

  const matchingStores = useMemo(
    () => pickMatchingStores(stores, criteria),
    [stores, criteria]
  );

  const pickedStore = useMemo(
    () => stores.find((s) => s.id === pickedId) ?? null,
    [stores, pickedId]
  );

  const handleRoll = () => {
    if (matchingStores.length === 0) return;
    setCopied(false);
    setIsRolling(true);

    if (window.innerWidth < 1024) {
      window.setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
    }

    let step = 0;
    const totalSteps = 5;
    const interval = window.setInterval(() => {
      step += 1;
      const preview = pickRandomStore(stores, criteria, pickedId ?? undefined);
      if (preview) setPickedId(preview.id);
      if (step >= totalSteps) {
        window.clearInterval(interval);
        const finalPick = pickRandomStore(stores, criteria, pickedId ?? undefined);
        setPickedId(finalPick ? finalPick.id : null);
        setIsRolling(false);
      }
    }, 65);
  };

  const handleCopy = async (name: string) => {
    try {
      await navigator.clipboard.writeText(name);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="max-w-2xl">
        <p className="text-xs font-medium text-[#C93B2B] mb-2">外卖选择困难症解药</p>
        <h1 className="font-editorial text-3xl md:text-4xl font-semibold text-[#111315] tracking-tight mb-3">
          今天这顿吃什么？
        </h1>
        <p className="text-sm md:text-base text-[#5A6069] leading-relaxed">
          按当下预算与等待时间筛选，只从你亲自验证过的宝藏店铺里抽选，绝不踩雷。
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Criteria panel */}
        <section
          aria-label="抽选条件"
          className="lg:col-span-5 bg-white border border-black/[0.08] rounded-xl p-5 sm:p-6 space-y-5 sm:space-y-6"
        >
          <div>
            <p className="text-sm font-medium text-[#111315] mb-3">想吃什么菜系</p>
            <div className="flex flex-wrap gap-2">
              {(['全部', ...CUISINE_CATEGORIES] as (CuisineCategory | '全部')[]).map(
                (cat) => {
                  const active = criteria.category === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() =>
                        setCriteria((prev) => ({ ...prev, category: cat }))
                      }
                      aria-pressed={active}
                      className={`px-3.5 py-2 min-h-[40px] sm:min-h-[36px] text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        active
                          ? 'bg-[#111315] text-white'
                          : 'bg-[#F3F4F6] text-[#5A6069] hover:text-[#111315]'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                }
              )}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-[#111315] mb-3">人均预算上限</p>
            <div className="grid grid-cols-2 gap-2">
              {BUDGET_OPTIONS.map((opt) => {
                const active = criteria.maxPrice === opt.value;
                return (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() =>
                      setCriteria((prev) => ({ ...prev, maxPrice: opt.value }))
                    }
                    aria-pressed={active}
                    className={`px-3 py-2.5 min-h-[44px] sm:min-h-[40px] text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                      active
                        ? 'bg-[#111315] text-white'
                        : 'bg-[#F3F4F6] text-[#5A6069] hover:text-[#111315]'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-[#111315] mb-3">配送速度要求</p>
            <div className="grid grid-cols-3 gap-2">
              {TIME_OPTIONS.map((opt) => {
                const active = criteria.maxDeliveryMinutes === opt.value;
                return (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() =>
                      setCriteria((prev) => ({
                        ...prev,
                        maxDeliveryMinutes: opt.value,
                      }))
                    }
                    aria-pressed={active}
                    className={`px-2.5 py-2.5 min-h-[44px] sm:min-h-[40px] text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                      active
                        ? 'bg-[#111315] text-white'
                        : 'bg-[#F3F4F6] text-[#5A6069] hover:text-[#111315]'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <label className="flex items-center gap-2.5 min-h-[44px] text-sm text-[#111315] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={criteria.favoritesOnly}
              onChange={(e) =>
                setCriteria((prev) => ({
                  ...prev,
                  favoritesOnly: e.target.checked,
                }))
              }
              className="w-5 h-5 accent-[#C93B2B] rounded cursor-pointer"
            />
            <span>仅从置顶收藏的店铺中抽选</span>
          </label>

          <div className="pt-4 border-t border-black/[0.08] space-y-3">
            <p className="text-xs text-[#5A6069]">
              当前符合条件的候选店铺：
              <span className="font-mono tabular-nums font-semibold text-[#111315] mx-1">
                {matchingStores.length}
              </span>
              家
            </p>
            <button
              type="button"
              onClick={handleRoll}
              disabled={matchingStores.length === 0 || isRolling}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[48px] text-sm font-medium text-white bg-[#C93B2B] hover:bg-[#A92F21] active:scale-[0.99] disabled:bg-[#C93B2B]/50 disabled:cursor-not-allowed rounded-lg transition-all cursor-pointer"
            >
              <Dices className="w-4 h-4" aria-hidden="true" />
              <span>{isRolling ? '正在挑选...' : '帮我选一家'}</span>
            </button>
          </div>
        </section>

        {/* Right: Result stage */}
        <section
          ref={resultRef}
          aria-label="抽选结果"
          className="lg:col-span-7 bg-white border border-black/[0.08] rounded-xl overflow-hidden scroll-mt-16"
        >
          {pickedStore ? (
            <div>
              <CoverImage
                src={pickedStore.coverImage}
                alt={pickedStore.name}
                aspectClass="aspect-[16/9] max-h-[285px] w-full"
              />
              <div className="p-5 md:p-6 space-y-4">
                <div className="flex items-center justify-between gap-4 text-xs text-[#5A6069]">
                  <span className="truncate">
                    {pickedStore.category} · {pickedStore.platform} · 约{' '}
                    <span className="font-mono tabular-nums">
                      {pickedStore.deliveryMinutes}
                    </span>{' '}
                    分钟送达
                  </span>
                  <span className="inline-flex items-center gap-1 font-mono tabular-nums font-semibold text-[#111315] shrink-0">
                    <Star
                      className="w-3.5 h-3.5 fill-[#C93B2B] text-[#C93B2B]"
                      aria-hidden="true"
                    />
                    {pickedStore.rating.toFixed(1)}
                  </span>
                </div>

                <div>
                  <h2 className="font-editorial text-xl sm:text-2xl md:text-3xl font-semibold text-[#111315] mb-2">
                    {pickedStore.name}
                  </h2>
                  <p className="text-sm text-[#5A6069] leading-relaxed">
                    <span className="text-[#111315] font-medium">推荐必点：</span>
                    {pickedStore.mustOrderDishes.join('、')}
                  </p>
                </div>

                {pickedStore.avoidNotes && (
                  <p className="text-xs text-[#5A6069] bg-[#FAFAFA] border border-black/[0.06] rounded-lg px-4 py-3">
                    点单提醒：{pickedStore.avoidNotes}
                  </p>
                )}

                <div className="pt-4 border-t border-black/[0.08] flex flex-wrap items-center gap-2.5 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => onIncrementOrder(pickedStore.id)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 min-h-[46px] text-sm font-medium text-white bg-[#C93B2B] hover:bg-[#A92F21] active:scale-[0.99] rounded-lg transition-all whitespace-nowrap cursor-pointer"
                  >
                    <Plus className="w-4 h-4" aria-hidden="true" />
                    <span>就吃这家（回购 +1）</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopy(pickedStore.name)}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 min-h-[44px] text-sm font-medium text-[#111315] border border-black/[0.12] hover:bg-[#F3F4F6] rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-[#C93B2B]" aria-hidden="true" />
                        <span>已复制店名</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" aria-hidden="true" />
                        <span>复制店名</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleRoll}
                    disabled={matchingStores.length <= 1 || isRolling}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 min-h-[44px] text-sm font-medium text-[#5A6069] hover:text-[#111315] border border-black/[0.08] sm:border-transparent disabled:opacity-40 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                  >
                    <RotateCw className="w-4 h-4" aria-hidden="true" />
                    <span>换一家</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectStore(pickedStore)}
                    className="w-full sm:w-auto sm:ml-auto py-2 text-center sm:text-left text-sm font-medium text-[#5A6069] hover:text-[#111315] underline underline-offset-4 cursor-pointer"
                  >
                    查看完整档案
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-10 md:p-16 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-[#F3F4F6] text-[#111315] flex items-center justify-center mx-auto">
                <Dices className="w-6 h-6 stroke-[1.5]" aria-hidden="true" />
              </div>
              <h2 className="font-editorial text-xl font-semibold text-[#111315]">
                {matchingStores.length > 0
                  ? '选好条件，点击左侧「帮我选一家」'
                  : '没有符合当前筛选条件的店铺'}
              </h2>
              <p className="text-sm text-[#5A6069] max-w-sm mx-auto leading-relaxed">
                {matchingStores.length > 0
                  ? `你的私人库中有 ${matchingStores.length} 家候选店铺整装待发，立刻决定今天这顿吃什么。`
                  : '试试放宽预算或配送时长限制，或者去店铺库记录更多新发现。'}
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
