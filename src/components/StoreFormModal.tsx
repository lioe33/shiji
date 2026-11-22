import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { Upload, X } from 'lucide-react';
import {
  COVER_PRESETS,
  CUISINE_CATEGORIES,
  DEFAULT_COVER_BY_CATEGORY,
  DELIVERY_PLATFORMS,
  POPULAR_CITIES,
} from '../data/seedStores';
import type {
  CuisineCategory,
  DeliveryPlatform,
  StoreFormInput,
  TakeoutStore,
  ValidationErrors,
} from '../types/store';
import { compressImageFile } from '../utils/storage';
import { validateStoreInput } from '../utils/storeLogic';

interface StoreFormModalProps {
  isOpen: boolean;
  editingStore: TakeoutStore | null;
  onClose: () => void;
  onSubmit: (payload: {
    id?: string;
    name: string;
    city: string;
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
  }) => void;
}

function buildInitialForm(editingStore: TakeoutStore | null): StoreFormInput {
  if (editingStore) {
    return {
      name: editingStore.name,
      city: editingStore.city,
      category: editingStore.category,
      platform: editingStore.platform,
      rating: editingStore.rating,
      avgPrice: String(editingStore.avgPrice),
      deliveryMinutes: String(editingStore.deliveryMinutes),
      mustOrderText: editingStore.mustOrderDishes.join('、'),
      notes: editingStore.notes,
      avoidNotes: editingStore.avoidNotes,
      coverImage: editingStore.coverImage,
      isFavorite: editingStore.isFavorite,
    };
  }
  return {
    name: '',
    city: '',
    category: '中式正餐',
    platform: '美团',
    rating: 4.8,
    avgPrice: '35',
    deliveryMinutes: '30',
    mustOrderText: '',
    notes: '',
    avoidNotes: '',
    coverImage: DEFAULT_COVER_BY_CATEGORY['中式正餐'],
    isFavorite: false,
  };
}

export function StoreFormModal({
  isOpen,
  editingStore,
  onClose,
  onSubmit,
}: StoreFormModalProps) {
  const [form, setForm] = useState<StoreFormInput>(() => buildInitialForm(editingStore));
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [coverManuallyChosen, setCoverManuallyChosen] = useState(Boolean(editingStore));

  useEffect(() => {
    if (isOpen) {
      setForm(buildInitialForm(editingStore));
      setErrors({});
      setUploadError(null);
      setCoverManuallyChosen(Boolean(editingStore));
    }
  }, [isOpen, editingStore]);

  useEffect(() => {
    if (!isOpen) return;
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
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCategoryChange = (category: CuisineCategory) => {
    setForm((prev) => ({
      ...prev,
      category,
      coverImage: coverManuallyChosen
        ? prev.coverImage
        : DEFAULT_COVER_BY_CATEGORY[category],
    }));
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    if (!file.type.startsWith('image/')) {
      setUploadError('请选择有效的图片文件');
      return;
    }
    try {
      const compressed = await compressImageFile(file);
      setForm((prev) => ({ ...prev, coverImage: compressed }));
      setCoverManuallyChosen(true);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : '图片处理失败');
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const validation = validateStoreInput(form);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    onSubmit({
      id: editingStore?.id,
      name: form.name.trim(),
      city: form.city.trim(),
      category: form.category,
      platform: form.platform,
      rating: Number(form.rating.toFixed(1)),
      avgPrice: validation.parsedPrice,
      deliveryMinutes: validation.parsedDelivery,
      mustOrderDishes: validation.parsedDishes,
      notes: form.notes.trim(),
      avoidNotes: form.avoidNotes.trim(),
      coverImage: form.coverImage || DEFAULT_COVER_BY_CATEGORY[form.category],
      isFavorite: form.isFavorite,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/45 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="store-form-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-2xl max-h-[92dvh] sm:max-h-[90vh] bg-white rounded-t-2xl sm:rounded-2xl border border-black/[0.08] flex flex-col overflow-hidden overscroll-contain">
        {/* Mobile grab handle */}
        <div className="sm:hidden pt-2.5 pb-1 flex justify-center shrink-0" aria-hidden="true">
          <div className="w-10 h-1 rounded-full bg-black/15" />
        </div>

        {/* Header */}
        <div className="shrink-0 px-5 sm:px-6 py-3 sm:py-4 border-b border-black/[0.08] flex items-center justify-between">
          <h2 id="store-form-title" className="font-editorial text-lg sm:text-xl font-semibold text-[#111315]">
            {editingStore ? '编辑外卖店铺' : '记录新外卖店铺'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭表单窗口"
            className="w-11 h-11 rounded-lg flex items-center justify-center text-[#5A6069] hover:text-[#111315] hover:bg-[#F3F4F6] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Form wrapper with scrollable fields + pinned bottom footer */}
        <form onSubmit={handleSubmit} noValidate className="flex-1 min-h-0 flex flex-col">
          <div className="flex-1 overflow-y-auto overscroll-contain p-5 sm:p-6 space-y-5">
            {/* Store Name + City */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="sm:col-span-2">
                <label htmlFor="store-name" className="block text-sm font-medium text-[#111315] mb-1.5">
                  店铺名称 <span className="text-[#C93B2B]">*</span>
                </label>
                <input
                  id="store-name"
                  type="text"
                  value={form.name}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, name: e.target.value }));
                    if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                  }}
                  placeholder="例如：潮汕阿强牛肉粿条（科技园店）"
                  className="w-full px-3.5 py-2.5 min-h-[44px] text-base sm:text-sm bg-white border border-black/[0.14] rounded-lg focus:border-[#C93B2B] focus:outline-none"
                />
                {errors.name && (
                  <p role="alert" className="mt-1.5 text-xs text-[#C93B2B]">
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="store-city" className="block text-sm font-medium text-[#111315] mb-1.5">
                  所在城市 <span className="text-[#C93B2B]">*</span>
                </label>
                <input
                  id="store-city"
                  type="text"
                  list="popular-city-options"
                  value={form.city}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, city: e.target.value }));
                    if (errors.city) setErrors((prev) => ({ ...prev, city: undefined }));
                  }}
                  placeholder="如：上海、汕头"
                  className="w-full px-3.5 py-2.5 min-h-[44px] text-base sm:text-sm bg-white border border-black/[0.14] rounded-lg focus:border-[#C93B2B] focus:outline-none"
                />
                <datalist id="popular-city-options">
                  {POPULAR_CITIES.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
                {errors.city && (
                  <p role="alert" className="mt-1.5 text-xs text-[#C93B2B]">
                    {errors.city}
                  </p>
                )}
              </div>
            </div>

            {/* Category + Platform */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label htmlFor="store-category" className="block text-sm font-medium text-[#111315] mb-1.5">
                  菜系分类
                </label>
                <select
                  id="store-category"
                  value={form.category}
                  onChange={(e) => handleCategoryChange(e.target.value as CuisineCategory)}
                  className="w-full px-3 py-2.5 min-h-[44px] text-base sm:text-sm bg-white border border-black/[0.14] rounded-lg focus:border-[#C93B2B] focus:outline-none"
                >
                  {CUISINE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="store-platform" className="block text-sm font-medium text-[#111315] mb-1.5">
                  常用平台
                </label>
                <select
                  id="store-platform"
                  value={form.platform}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      platform: e.target.value as DeliveryPlatform,
                    }))
                  }
                  className="w-full px-3 py-2.5 min-h-[44px] text-base sm:text-sm bg-white border border-black/[0.14] rounded-lg focus:border-[#C93B2B] focus:outline-none"
                >
                  {DELIVERY_PLATFORMS.map((platform) => (
                    <option key={platform} value={platform}>
                      {platform}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Price + Delivery + Rating */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <label htmlFor="store-price" className="block text-sm font-medium text-[#111315] mb-1.5">
                  人均消费（元）<span className="text-[#C93B2B]">*</span>
                </label>
                <input
                  id="store-price"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={2000}
                  value={form.avgPrice}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, avgPrice: e.target.value }));
                    if (errors.avgPrice) setErrors((prev) => ({ ...prev, avgPrice: undefined }));
                  }}
                  className="w-full px-3.5 py-2.5 min-h-[44px] text-base sm:text-sm font-mono tabular-nums bg-white border border-black/[0.14] rounded-lg focus:border-[#C93B2B] focus:outline-none"
                />
                {errors.avgPrice && (
                  <p role="alert" className="mt-1.5 text-xs text-[#C93B2B]">
                    {errors.avgPrice}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="store-delivery" className="block text-sm font-medium text-[#111315] mb-1.5">
                  配送时长（分）<span className="text-[#C93B2B]">*</span>
                </label>
                <input
                  id="store-delivery"
                  type="number"
                  inputMode="numeric"
                  min={5}
                  max={180}
                  value={form.deliveryMinutes}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, deliveryMinutes: e.target.value }));
                    if (errors.deliveryMinutes) {
                      setErrors((prev) => ({ ...prev, deliveryMinutes: undefined }));
                    }
                  }}
                  className="w-full px-3.5 py-2.5 min-h-[44px] text-base sm:text-sm font-mono tabular-nums bg-white border border-black/[0.14] rounded-lg focus:border-[#C93B2B] focus:outline-none"
                />
                {errors.deliveryMinutes && (
                  <p role="alert" className="mt-1.5 text-xs text-[#C93B2B]">
                    {errors.deliveryMinutes}
                  </p>
                )}
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label htmlFor="store-rating" className="block text-sm font-medium text-[#111315] mb-1.5">
                  个人评分（<span className="font-mono tabular-nums">{form.rating.toFixed(1)}</span>）
                </label>
                <input
                  id="store-rating"
                  type="range"
                  min={1}
                  max={5}
                  step={0.1}
                  value={form.rating}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, rating: Number(e.target.value) }))
                  }
                  className="w-full h-9 accent-[#C93B2B] cursor-pointer"
                />
              </div>
            </div>

            {/* Must-order dishes */}
            <div>
              <label htmlFor="store-dishes" className="block text-sm font-medium text-[#111315] mb-1.5">
                必点招牌菜 <span className="text-[#C93B2B]">*</span>
              </label>
              <input
                id="store-dishes"
                type="text"
                value={form.mustOrderText}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, mustOrderText: e.target.value }));
                  if (errors.mustOrderText) {
                    setErrors((prev) => ({ ...prev, mustOrderText: undefined }));
                  }
                }}
                placeholder="用逗号或顿号分隔，例如：吊龙粿条、手打牛肉丸"
                className="w-full px-3.5 py-2.5 min-h-[44px] text-base sm:text-sm bg-white border border-black/[0.14] rounded-lg focus:border-[#C93B2B] focus:outline-none"
              />
              {errors.mustOrderText && (
                <p role="alert" className="mt-1.5 text-xs text-[#C93B2B]">
                  {errors.mustOrderText}
                </p>
              )}
            </div>

            {/* Notes & Avoid Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="store-notes" className="block text-sm font-medium text-[#111315] mb-1.5">
                  推荐理由 / 口味心得
                </label>
                <textarea
                  id="store-notes"
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="包装是否讲究、分量如何、什么时候吃最爽..."
                  className="w-full px-3.5 py-2.5 text-base sm:text-sm bg-white border border-black/[0.14] rounded-lg focus:border-[#C93B2B] focus:outline-none resize-none"
                />
              </div>

              <div>
                <label htmlFor="store-avoid" className="block text-sm font-medium text-[#111315] mb-1.5">
                  点单备注 / 避雷提醒
                </label>
                <textarea
                  id="store-avoid"
                  rows={3}
                  value={form.avoidNotes}
                  onChange={(e) => setForm((prev) => ({ ...prev, avoidNotes: e.target.value }))}
                  placeholder="例如：微辣偏辣、记得备注汤面分离或不要香菜"
                  className="w-full px-3.5 py-2.5 text-base sm:text-sm bg-white border border-black/[0.14] rounded-lg focus:border-[#C93B2B] focus:outline-none resize-none"
                />
              </div>
            </div>

            {/* Cover image selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[#111315]">封面图选择</span>
                <label className="inline-flex items-center gap-1.5 min-h-[36px] px-2 text-xs font-medium text-[#C93B2B] hover:text-[#A92F21] cursor-pointer">
                  <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>上传本地实拍图</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="sr-only"
                  />
                </label>
              </div>
              {uploadError && (
                <p role="alert" className="mb-2 text-xs text-[#C93B2B]">
                  {uploadError}
                </p>
              )}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                {COVER_PRESETS.map((preset) => {
                  const selected = form.coverImage === preset.url;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setForm((prev) => ({ ...prev, coverImage: preset.url }));
                        setCoverManuallyChosen(true);
                      }}
                      aria-label={`选择封面：${preset.label}`}
                      aria-pressed={selected}
                      className={`relative rounded-lg overflow-hidden aspect-[4/3] border-2 transition-all cursor-pointer ${
                        selected
                          ? 'border-[#C93B2B] ring-2 ring-[#C93B2B]/20'
                          : 'border-transparent opacity-80 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Favorite checkbox */}
            <label className="inline-flex items-center gap-2.5 min-h-[44px] text-sm text-[#111315] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.isFavorite}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, isFavorite: e.target.checked }))
                }
                className="w-5 h-5 accent-[#C93B2B] rounded cursor-pointer"
              />
              <span>加入置顶收藏清单</span>
            </label>
          </div>

          {/* Sticky footer actions */}
          <div className="shrink-0 bg-white px-5 sm:px-6 pt-3.5 pb-[calc(0.875rem+env(safe-area-inset-bottom,0px))] border-t border-black/[0.08] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 min-h-[46px] text-sm font-medium text-[#5A6069] hover:text-[#111315] hover:bg-[#F3F4F6] rounded-lg transition-colors cursor-pointer"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 sm:flex-none px-6 py-2.5 min-h-[46px] text-sm font-medium text-white bg-[#C93B2B] hover:bg-[#A92F21] active:scale-[0.99] rounded-lg transition-all cursor-pointer"
            >
              {editingStore ? '保存修改' : '保存店铺'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
