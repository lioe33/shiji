import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface CopyRowProps {
  label: string;
  value: string;
}

function CopyRow({ label, value }: CopyRowProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-3 border-b border-black/[0.06] last:border-b-0">
      <span className="text-sm text-[#5A6069]">{label}</span>
      <div className="flex items-center gap-2 min-w-0">
        <code className="font-mono text-xs sm:text-sm text-[#111315] bg-[#F3F4F6] px-2.5 py-1.5 rounded overflow-x-auto max-w-full whitespace-nowrap no-scrollbar">
          {value}
        </code>
        <button
          type="button"
          onClick={handleCopy}
          aria-label={`复制 ${label}`}
          className="w-11 h-11 rounded-md flex items-center justify-center text-[#5A6069] hover:text-[#111315] hover:bg-[#F3F4F6] transition-colors shrink-0 cursor-pointer"
        >
          {copied ? (
            <Check className="w-4 h-4 text-[#C93B2B]" aria-hidden="true" />
          ) : (
            <Copy className="w-4 h-4" aria-hidden="true" />
          )}
        </button>
      </div>
    </div>
  );
}

export function DeployGuideView() {
  return (
    <div className="space-y-10 max-w-4xl">
      <div>
        <p className="text-xs font-medium text-[#C93B2B] mb-2">
          纯静态构建 · 零服务器费用
        </p>
        <h1 className="font-editorial text-3xl md:text-4xl font-semibold text-[#111315] tracking-tight mb-3">
          通过 GitHub 部署到 Cloudflare
        </h1>
        <p className="text-sm md:text-base text-[#5A6069] leading-relaxed">
          项目已预置 Cloudflare Pages 路由回退配置（<code className="font-mono text-xs">public/_redirects</code>）与 Workers Static Assets 配置（<code className="font-mono text-xs">wrangler.jsonc</code>），推送到 GitHub 后连接即可自动持续部署。
        </p>
      </div>

      {/* Step-by-step editorial list */}
      <section className="bg-white border border-black/[0.08] rounded-xl p-6 md:p-8 space-y-6">
        <h2 className="font-editorial text-xl font-semibold text-[#111315]">
          01. Cloudflare Pages 连接 GitHub（推荐）
        </h2>
        <ol className="space-y-4 text-sm text-[#5A6069] leading-relaxed">
          <li className="flex gap-3">
            <span className="font-mono tabular-nums text-[#111315] font-semibold shrink-0">
              1.
            </span>
            <span>
              在 GitHub 新建仓库并将本项目全部代码推送至 <code className="font-mono text-xs text-[#111315]">main</code> 分支。
            </span>
          </li>
          <li className="flex gap-3">
            <span className="font-mono tabular-nums text-[#111315] font-semibold shrink-0">
              2.
            </span>
            <span>
              打开 Cloudflare Dashboard，依次进入 <strong className="font-medium text-[#111315]">Workers &amp; Pages → Create → Pages → Connect to Git</strong>。
            </span>
          </li>
          <li className="flex gap-3">
            <span className="font-mono tabular-nums text-[#111315] font-semibold shrink-0">
              3.
            </span>
            <span>
              选中你的 GitHub 仓库，按下方构建参数填写后点击 <strong className="font-medium text-[#111315]">Save and Deploy</strong>，之后每次 <code className="font-mono text-xs text-[#111315]">git push</code> 都会自动重新构建上线。
            </span>
          </li>
        </ol>

        <div className="pt-2">
          <CopyRow label="Framework preset（框架预设）" value="Vite" />
          <CopyRow label="Build command（构建命令）" value="npm run build" />
          <CopyRow label="Build output directory（输出目录）" value="dist" />
          <CopyRow label="Node.js 环境变量（可选）" value="NODE_VERSION=20" />
        </div>
      </section>

      <section className="bg-white border border-black/[0.08] rounded-xl p-6 md:p-8 space-y-5">
        <h2 className="font-editorial text-xl font-semibold text-[#111315]">
          02. 使用 Wrangler CLI 命令行直推
        </h2>
        <p className="text-sm text-[#5A6069] leading-relaxed">
          如果你偏好本地命令行发布，仓库根目录已内置 <code className="font-mono text-xs text-[#111315]">wrangler.jsonc</code>，执行下方命令即可直接部署到 Cloudflare Workers 全球边缘节点。
        </p>
        <div>
          <CopyRow label="本地构建并发布" value="npm run build && npx wrangler deploy" />
          <CopyRow label="仅静态发布到 Pages" value="npx wrangler pages deploy dist" />
        </div>
      </section>

      <section className="bg-white border border-black/[0.08] rounded-xl p-6 md:p-8 space-y-3">
        <h2 className="font-editorial text-xl font-semibold text-[#111315]">
          03. 内置部署检查清单
        </h2>
        <ul className="space-y-2.5 text-sm text-[#5A6069]">
          <li>· 纯前端静态构建，无需配置数据库或任何第三方 API 密钥。</li>
          <li>· 已内置 <code className="font-mono text-xs text-[#111315]">public/_redirects</code>，确保刷新任意子路径不出现 404。</li>
          <li>· 店铺封面支持内置美食图集与本地照片自动压缩，不会触发外链防盗链失效。</li>
          <li>· 在「品味统计」页可随时导出 JSON 备份文件，轻松实现手机与电脑间迁移。</li>
        </ul>
      </section>
    </div>
  );
}
