import { BookOpen, CloudUpload, Dices, PieChart, Plus } from 'lucide-react';
import type { AppView } from '../types/store';

interface NavbarProps {
  activeView: AppView;
  onSelectView: (view: AppView) => void;
  onOpenAddModal: () => void;
}

const NAV_ITEMS: { id: AppView; label: string; icon: typeof BookOpen }[] = [
  { id: 'catalog', label: '店铺库', icon: BookOpen },
  { id: 'picker', label: '今天吃啥', icon: Dices },
  { id: 'insights', label: '品味统计', icon: PieChart },
  { id: 'deploy', label: '部署指南', icon: CloudUpload },
];

export function Navbar({ activeView, onSelectView, onOpenAddModal }: NavbarProps) {
  return (
    <>
      <header className="sticky top-0 z-30 bg-[#FAFAFA]/92 backdrop-blur-md border-b border-black/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-13 md:h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single-element brand wordmark */}
          <button
            type="button"
            onClick={() => onSelectView('catalog')}
            className="font-editorial text-xl md:text-2xl font-semibold tracking-tight text-[#111315] whitespace-nowrap shrink-0 cursor-pointer hover:text-[#C93B2B] transition-colors"
          >
            食记
          </button>

          {/* Zone 2: 4 clean single-line navigation links */}
          <nav
            aria-label="主导航"
            className="hidden md:flex items-center gap-8"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectView(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`relative py-2 text-sm font-medium whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                    isActive
                      ? 'text-[#111315]'
                      : 'text-[#5A6069] hover:text-[#111315]'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute left-0 right-0 -bottom-[17px] h-[2px] bg-[#C93B2B]"
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="shrink-0">
            <button
              type="button"
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 min-h-[44px] md:min-h-[40px] text-sm font-medium text-white bg-[#C93B2B] hover:bg-[#A92F21] active:scale-[0.98] rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>记录新店铺</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile bottom tab bar (combined sticky height 52 + 56 = 108px < 15% of 844px) */}
      <nav
        aria-label="移动端底部导航"
        className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-black/[0.08] pb-safe"
      >
        <div className="grid grid-cols-4 h-14">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectView(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`flex flex-col items-center justify-center gap-0.5 min-h-[44px] active:scale-95 cursor-pointer transition-all ${
                  isActive ? 'text-[#C93B2B]' : 'text-[#5A6069]'
                }`}
              >
                <Icon className="w-5 h-5 stroke-[1.75]" aria-hidden="true" />
                <span className="text-[11px] font-medium whitespace-nowrap">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
