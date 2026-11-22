import { useMemo, useRef, useState, type ChangeEvent } from 'react';
import { Download, RotateCcw, Upload } from 'lucide-react';
import type { TakeoutStore } from '../types/store';
import {
  computeTasteStats,
  exportStoresToJson,
  parseImportedStoresJson,
} from '../utils/storeLogic';

interface InsightsViewProps {
  stores: TakeoutStore[];
  onSelectStore: (store: TakeoutStore) => void;
  onImportStores: (stores: TakeoutStore[]) => void;
  onResetDemo: () => void;
}

export function InsightsView({
  stores,
  onSelectStore,
  onImportStores,
  onResetDemo,
}: InsightsViewProps) {
  const stats = useMemo(() => computeTasteStats(stores), [stores]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importFeedback, setImportFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const handleExport = () => {
    const json = exportStoresToJson(stores);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shiji-takeout-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const result = parseImportedStoresJson(text);
      if (!result.ok) {
        setImportFeedback({ type: 'error', message: result.error });
      } else {
        onImportStores(result.stores);
        setImportFeedback({
          type: 'success',
          message: `已成功导入 ${result.stores.length} 家外卖店铺记录`,
        });
      }
    } catch {
      setImportFeedback({ type: 'error', message: '读取备份文件失败' });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-10">
      <div className="max-w-2xl">
        <p className="text-xs font-medium text-[#C93B2B] mb-2">个人饮食偏好档案</p>
        <h1 className="font-editorial text-3xl md:text-4xl font-semibold text-[#111315] tracking-tight mb-3">
          品味统计与数据备份
        </h1>
        <p className="text-sm md:text-base text-[#5A6069] leading-relaxed">
          所有记录自动保存在本地浏览器中，支持随时导出或导入 JSON 文件进行备份与跨设备同步。
        </p>
      </div>

      {/* 4-column KPI strip */}
      <section aria-label="核心统计指标" className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-black/[0.08] rounded-xl p-4 sm:p-5">
          <p className="text-xs text-[#5A6069] mb-1.5 sm:mb-2">已收录店铺</p>
          <p className="font-mono tabular-nums text-2xl sm:text-3xl font-semibold text-[#111315]">
            {stats.totalStores}
          </p>
          <p className="text-xs text-[#5A6069] mt-1.5 sm:mt-2">
            置顶收藏 <span className="font-mono tabular-nums">{stats.favoriteCount}</span> 家
          </p>
        </div>

        <div className="bg-white border border-black/[0.08] rounded-xl p-4 sm:p-5">
          <p className="text-xs text-[#5A6069] mb-1.5 sm:mb-2">累计回购次数</p>
          <p className="font-mono tabular-nums text-2xl sm:text-3xl font-semibold text-[#111315]">
            {stats.totalOrders}
          </p>
          <p className="text-xs text-[#5A6069] mt-1.5 sm:mt-2">
            均分 <span className="font-mono tabular-nums">{stats.averageRating.toFixed(1)}</span> 星
          </p>
        </div>

        <div className="bg-white border border-black/[0.08] rounded-xl p-4 sm:p-5">
          <p className="text-xs text-[#5A6069] mb-1.5 sm:mb-2">平均人均消费</p>
          <p className="font-mono tabular-nums text-2xl sm:text-3xl font-semibold text-[#111315]">
            ¥{stats.averagePrice}
          </p>
          <p className="text-xs text-[#5A6069] mt-1.5 sm:mt-2 truncate">
            最常吃：{stats.topCategory ?? '暂无'}
          </p>
        </div>

        <div className="bg-white border border-black/[0.08] rounded-xl p-4 sm:p-5">
          <p className="text-xs text-[#5A6069] mb-1.5 sm:mb-2">最快送达记录</p>
          <p className="font-mono tabular-nums text-2xl sm:text-3xl font-semibold text-[#111315]">
            {stats.fastestDelivery !== null ? `${stats.fastestDelivery}m` : '—'}
          </p>
          <p className="text-xs text-[#5A6069] mt-1.5 sm:mt-2">分钟级直达救场</p>
        </div>
      </section>

      {/* Breakdown + Top Reordered */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Cuisine & Platform Distribution */}
        <section className="lg:col-span-6 bg-white border border-black/[0.08] rounded-xl p-6 space-y-6">
          <div>
            <h2 className="font-editorial text-xl font-semibold text-[#111315] mb-4">
              菜系偏好分布
            </h2>
            {stats.categoryBreakdown.length === 0 ? (
              <p className="text-sm text-[#5A6069]">暂无店铺数据</p>
            ) : (
              <div className="space-y-3.5">
                {stats.categoryBreakdown.map((item) => (
                  <div key={item.category}>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="text-[#111315] font-medium">{item.category}</span>
                      <span className="font-mono tabular-nums text-xs text-[#5A6069]">
                        {item.count} 家 · {item.percentage}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-[#F3F4F6] overflow-hidden">
                      <div
                        className="h-full bg-[#111315] rounded-full transition-all duration-300"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-5 border-t border-black/[0.08]">
            <h3 className="text-sm font-semibold text-[#111315] mb-3">城市分布</h3>
            <div className="grid grid-cols-2 gap-3">
              {stats.cityBreakdown.map((item) => (
                <div
                  key={item.city}
                  className="flex items-center justify-between py-2 border-b border-black/[0.06]"
                >
                  <span className="text-sm text-[#111315] truncate">{item.city}</span>
                  <span className="font-mono tabular-nums text-xs text-[#5A6069] shrink-0">
                    {item.count} 家 ({item.percentage}%)
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-5 border-t border-black/[0.08]">
            <h3 className="text-sm font-semibold text-[#111315] mb-3">常用下单平台</h3>
            <div className="grid grid-cols-2 gap-3">
              {stats.platformBreakdown.map((item) => (
                <div
                  key={item.platform}
                  className="flex items-center justify-between py-2 border-b border-black/[0.06]"
                >
                  <span className="text-sm text-[#111315]">{item.platform}</span>
                  <span className="font-mono tabular-nums text-xs text-[#5A6069]">
                    {item.count} 家 ({item.percentage}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Top Reordered Leaderboard */}
        <section className="lg:col-span-6 bg-white border border-black/[0.08] rounded-xl p-6">
          <h2 className="font-editorial text-xl font-semibold text-[#111315] mb-4">
            无限回购榜
          </h2>
          {stats.topReordered.length === 0 ? (
            <p className="text-sm text-[#5A6069]">记录店铺并点击「刚点过」即可生成榜单</p>
          ) : (
            <ol className="divide-y divide-black/[0.06]">
              {stats.topReordered.map((store, idx) => (
                <li key={store.id} className="py-3.5 first:pt-0 last:pb-0">
                  <button
                    type="button"
                    onClick={() => onSelectStore(store)}
                    className="w-full flex items-center justify-between gap-4 text-left group cursor-pointer"
                  >
                    <div className="flex items-baseline gap-3 min-w-0">
                      <span
                        className={`font-mono tabular-nums text-sm font-semibold w-6 shrink-0 ${
                          idx === 0 ? 'text-[#C93B2B]' : 'text-[#5A6069]'
                        }`}
                      >
                        0{idx + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#111315] group-hover:text-[#C93B2B] transition-colors truncate">
                          {store.name}
                        </p>
                        <p className="text-xs text-[#5A6069] truncate mt-0.5">
                          {store.city} · {store.category} · {store.platform} · 人均 ¥{store.avgPrice}
                        </p>
                      </div>
                    </div>
                    <span className="font-mono tabular-nums text-sm font-semibold text-[#111315] shrink-0">
                      {store.orderCount} 次
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>

      {/* Local Data Management */}
      <section className="bg-white border border-black/[0.08] rounded-xl p-6 md:p-8 space-y-5">
        <div className="max-w-xl">
          <h2 className="font-editorial text-xl font-semibold text-[#111315] mb-2">
            本地数据备份与迁移
          </h2>
          <p className="text-sm text-[#5A6069] leading-relaxed">
            导出 JSON 文件即可永久存档，或在手机与电脑之间快速同步你的宝藏外卖清单。
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3">
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[46px] text-sm font-medium text-white bg-[#111315] hover:bg-[#2A2D32] rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            <span>导出 JSON 备份</span>
          </button>

          <label className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[46px] text-sm font-medium text-[#111315] border border-black/[0.14] hover:bg-[#F3F4F6] rounded-lg transition-colors cursor-pointer">
            <Upload className="w-4 h-4" aria-hidden="true" />
            <span>导入 JSON 恢复</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              onChange={handleImportFile}
              className="sr-only"
            />
          </label>

          {!confirmReset ? (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] text-sm font-medium text-[#5A6069] hover:text-[#C93B2B] rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              <span>恢复示例数据</span>
            </button>
          ) : (
            <div className="inline-flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onResetDemo();
                  setConfirmReset(false);
                  setImportFeedback({
                    type: 'success',
                    message: '已恢复初始示例店铺数据',
                  });
                }}
                className="px-3.5 py-2 min-h-[40px] text-xs font-medium text-white bg-[#C93B2B] hover:bg-[#A92F21] rounded-lg cursor-pointer"
              >
                确认重置
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="px-3 py-2 min-h-[40px] text-xs font-medium text-[#5A6069] hover:text-[#111315] cursor-pointer"
              >
                取消
              </button>
            </div>
          )}
        </div>

        {importFeedback && (
          <p
            role="status"
            className={`text-sm font-medium ${
              importFeedback.type === 'error' ? 'text-[#C93B2B]' : 'text-[#111315]'
            }`}
          >
            {importFeedback.message}
          </p>
        )}
      </section>
    </div>
  );
}
