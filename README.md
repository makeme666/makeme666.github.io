# 个人博客 · Apple 设计风格

> 一个可部署在**任意静态托管平台**的个人博客，采用苹果 macOS 设计语言，全站玻璃态（Glassmorphism）UI 风格。
>
> ✅ 支持：**GitHub Pages** · **Cloudflare Pages** · **Vercel** · **EdgeOne Pages**

## ☁️ 一键部署

| 平台 | 状态 | 部署方式 |
|------|------|----------|
| GitHub Pages | ✅ 支持 | Git 仓库自动部署 |
| Cloudflare Pages | ✅ 支持 | Git 仓库自动部署 |
| Vercel | ✅ 支持 | Git 仓库自动部署 / CLI |
| EdgeOne Pages | ✅ 支持 | Git 仓库自动部署 |

## 📁 项目结构

```
blog/
├── index.html              # 🏠 首页（Hero + 文章摘要）
├── articles.html           # 📋 所有文章（按时间/标签筛选）
├── article.html             # 📄 文章详情页（动态加载 Markdown）
├── about.html              # 👤 关于作者
├── posts/                  # 📝 文章目录（Markdown 格式）
│   ├── manifest.json       # 文章索引（自动生成）
│   └── *.md                # 文章文件
├── css/
│   └── style.css           # 全局样式（玻璃态 + 苹果设计）
├── js/
│   ├── main.js             # 交互脚本（动画、筛选、搜索）
│   └── md-parser.js        # Markdown 解析器 + 文章加载器
├── images/                 # 图片资源
│   ├── avatar.png          # 头像
│   ├── wechat_qrcode.png   # 微信收款码
│   └── alipay_qrcode.jpg   # 支付宝收款码
│
├── .nojekyll               # ⚠️ GitHub Pages 必须！禁用 Jekyll 处理
├── vercel.json              # Vercel 配置文件
├── _headers                 # Cloudflare Pages HTTP 头配置
├── _redirects               # Cloudflare Pages 路由配置
├── dist.json                # EdgeOne Pages 配置文件
└── server.js               # 本地开发服务器
```

## ✨ 功能特性

| 功能 | 说明 |
|------|------|
| 苹果设计风格 | SF Pro 字体、圆角卡片、精致间距 |
| 玻璃态效果 | backdrop-filter 毛玻璃，半透明白色背景 |
| 淡蓝色顶部 | 首页/文章页均有渐变蓝色 Hero 区域 |
| 导航栏 | 固定顶部，模糊背景 |
| 文章摘要 | 主页按时间降序，显示摘要、分类标签 |
| 标签筛选 | 文章列表支持分类筛选 |
| 全文搜索 | 支持标题、内容、标签搜索 |
| 打赏功能 | 文章底部内嵌微信 + 支付宝收款码 |
| 法律声明 | 每页底部包含版权和免责声明 |
| 回到顶部 | 滚动 400px 后出现悬浮按钮 |
| 入场动画 | 文章卡片交错淡入动画 |
| 响应式 | 完美适配手机、平板、桌面 |

---

## 🚀 部署教程

### 1️⃣ GitHub Pages（免费，推荐）

#### 步骤 1：创建 GitHub 仓库

1. 登录 [GitHub](https://github.com/)，点击右上角 **+** → **New repository**
2. 仓库名填写 `你的用户名.github.io`（例如：`makeme666.github.io`）
3. 选择 **Public**（公开仓库）
4. 点击 **Create repository**

#### 步骤 2：推送代码

在博客项目目录下执行：

```bash
# 初始化 Git（如果尚未初始化）
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit"

# 关联远程仓库（替换为你的仓库地址）
git remote add origin git@github.com:你的用户名/你的用户名.github.io.git

# 推送到 GitHub
git push -u origin main
```

#### 步骤 3：启用 GitHub Pages

1. 进入仓库 **Settings** → 左侧菜单 **Pages**
2. **Source** 选择：**Deploy from a branch** → **main** → **/ (root)**
3. 点击 **Save**
4. 等待 1-2 分钟，博客地址：`https://你的用户名.github.io`

#### ⚠️ 重要：`.nojekyll` 文件

本项目已包含 `.nojekyll` 文件，它告诉 GitHub Pages **不要使用 Jekyll 处理**，确保 `.md` 文件和 `.json` 文件能正常加载。

---

### 2️⃣ Cloudflare Pages（免费，全球 CDN）

#### 步骤 1：上传到 GitHub

首先将博客代码推送到 GitHub 仓库。

#### 步骤 2：连接 Cloudflare

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Workers & Pages** → **Create application** → **Pages**
3. 点击 **Connect to Git**
4. 选择你的 GitHub 仓库
5. **Project settings**：
   - **Project name**：你的博客名称
   - **Build command**：留空（纯静态）
   - **Build output directory**：`/`
6. 点击 **Save and Deploy**

#### 步骤 3：自定义域名（可选）

1. 在 **Custom domains** 中添加你的域名
2. Cloudflare 会自动配置 SSL 证书
3. 博客地址：`https://你的域名`

#### 📝 配置文件

本项目已包含 `_headers` 和 `_redirects` 文件，Cloudflare Pages 会自动读取。

---

### 3️⃣ Vercel（免费，部署极速）

#### 方式一：Git 导入（推荐）

1. 登录 [Vercel](https://vercel.com/)
2. 点击 **Add New** → **Project**
3. 选择 **Import Git Repository**
4. 选择你的 GitHub 仓库
5. **Framework Preset** 选择：**Other**
6. **Build Command**：留空
7. **Output Directory**：`.`
8. 点击 **Deploy**

#### 方式二：CLI 部署

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel

# 生产环境部署
vercel --prod
```

#### 📝 配置文件

本项目已包含 `vercel.json` 文件，包含安全头和缓存配置。

---

### 4️⃣ EdgeOne Pages（腾讯云，适合国内访问）

#### 步骤 1：上传到 GitHub

首先将博客代码推送到 GitHub 仓库。

#### 步骤 2：连接 EdgeOne

1. 登录 [腾讯云 EdgeOne 控制台](https://console.cloud.tencent.com/edgeone)
2. 进入 **Pages 服务**
3. 点击 **创建项目** → **导入 Git 仓库**
4. 选择你的 GitHub 仓库
5. **构建配置**：
   - **构建命令**：留空
   - **输出目录**：`/`
6. 点击 **部署**

#### 步骤 3：自定义域名（可选）

1. 在项目设置中添加自定义域名
2. 按提示配置 DNS 解析
3. EdgeOne 会自动申请 SSL 证书

#### 📝 配置文件

本项目已包含 `dist.json` 文件，用于 EdgeOne 路由和安全头配置。

---

## 🔧 本地开发

### 启动本地服务器

```bash
# 进入博客目录
cd blog

# 启动服务器
node server.js

# 访问 http://localhost:3030
```

### 修改后测试

1. 修改 HTML/CSS/JS 文件后，**直接刷新浏览器**即可看到效果
2. 无需重启服务器

---

## 🎨 个性化定制

### 修改博客名称

在所有 HTML 文件中将 `我的博客` 替换为你的博客名称。

### 修改联系邮箱

在以下文件中替换邮箱地址：
- `index.html`
- `about.html`
- `article.html`

### 替换头像

将你的头像图片命名为 `avatar.png`，替换 `images/avatar.png`。

### 替换收款码

将你的收款码图片放入 `images/` 目录：
- `wechat_qrcode.png` - 微信收款码
- `alipay_qrcode.jpg` - 支付宝收款码

### 新增文章

1. 在 `posts/` 目录创建新的 `.md` 文件
2. 使用以下格式编写：

```markdown
---
title: 文章标题
date: 2026-04-20
tag: 技术
readtime: 5 分钟
---

这里是文章正文，支持 Markdown 格式。
```

3. 更新 `posts/manifest.json` 中的文章列表（可选，会自动 fallback 到默认列表）

---

## 🛠 技术栈

- **纯静态 HTML + CSS + JavaScript**（无需构建工具）
- CSS 自定义属性（Design Tokens）
- `backdrop-filter` 玻璃态效果
- IntersectionObserver 滚动动画
- Fetch API 动态加载 Markdown
- 无任何外部依赖，加载极速

---

## 📜 License

MIT License - 可自由使用、修改和部署。

---

Made with ☕ · 部署于全球 CDN
