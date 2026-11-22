# 食记 · 宝藏外卖录

一款专注于记录个人心水外卖店铺的轻量级纯前端应用，零后端依赖，支持直接通过 **GitHub** 部署到 **Cloudflare Pages** 或 **Cloudflare Workers Static Assets**。

## 核心功能

- **宝藏店铺档案**：记录店名、外卖平台（美团 / 饿了么 / 京东秒送 / 小程序）、菜系分类、综合评分、人均消费、配送耗时、必点招牌菜与避雷备注。
- **一键 +1 刚点过**：记录回购次数与最近下单时间，自动沉淀你的“无限回购榜”。
- **今天吃啥抽选器**：按预算上限、配送时长、菜系和收藏筛选，一键解决外卖选择困难症。
- **品味统计与 JSON 备份**：本地 `localStorage` 自动保存，支持导出/导入 `.json` 备份文件，跨设备迁移无忧。

## 通过 GitHub 部署到 Cloudflare Pages

1. 将本仓库推送到你的 GitHub 仓库。
2. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)，进入 **Workers & Pages** → **Create** → **Pages** → **Connect to Git**。
3. 选择你的 GitHub 仓库，填写以下构建配置：
   - **Framework preset**：`Vite`
   - **Build command**：`npm run build`
   - **Build output directory**：`dist`
4. 点击 **Save and Deploy**，约 30 秒即可获得全球加速的专属访问域名。

## 使用 Wrangler CLI 部署

```bash
npm install
npm run build
npx wrangler deploy
```
