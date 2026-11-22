# 食记 · 宝藏外卖录

一款专注于记录个人心水外卖店铺的轻量级纯前端应用，零后端依赖，支持直接通过 **GitHub** 部署到 **Cloudflare Pages** 或 **Cloudflare Workers Static Assets**。

## 核心功能

- **宝藏店铺档案**：记录店名、所在城市、外卖平台（美团 / 饿了么 / 京东秒送 / 小程序）、菜系分类、综合评分、人均消费、配送耗时、必点招牌菜与避雷备注。
- **一键 +1 刚点过**：记录回购次数与最近下单时间，自动沉淀你的“无限回购榜”。
- **今天吃啥抽选器**：按所在城市、预算上限、配送时长、菜系和收藏筛选，一键解决外卖选择困难症。
- **品味统计与 JSON 备份**：本地 `localStorage` 自动保存，查看菜系与城市分布，支持导出/导入 `.json` 备份文件。

## 通过 GitHub 部署到 Cloudflare Workers（推荐）

仓库根目录已内置 `wrangler.jsonc`（已配置 `assets.directory = "./dist"` 与 `not_found_handling = "single-page-application"`），在 Cloudflare Workers Git 构建设置中填写：

- **构建命令（Build command）**：`npm run build`
- **部署命令（Deploy command）**：`npx wrangler deploy`
- **根目录（Root directory）**：`/`（或留空）

## 通过 GitHub 部署到 Cloudflare Pages

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)，进入 **Workers & Pages** → **Create** → **Pages** → **Connect to Git**。
2. 选择你的 GitHub 仓库，填写以下构建配置：
   - **Framework preset**：`Vite`
   - **Build command**：`npm run build`
   - **Build output directory**：`dist`
   - **Root directory**：`/`（或留空）
3. 点击 **Save and Deploy** 即可完成部署（未包含 `404.html` 时 Cloudflare Pages 自动启用 SPA 路由回退，无需额外 `_redirects` 文件）。

## 本地使用 Wrangler CLI 部署

```bash
npm install
npm run build
npx wrangler deploy
```
