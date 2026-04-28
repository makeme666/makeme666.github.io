# 个人博客 · Apple 设计风格

> 一个可部署在 **EdgeOne Pages** 的个人博客，采用苹果 macOS 设计语言，全站玻璃态（Glassmorphism）UI 风格。

## 📁 项目结构

```
blog/
├── index.html          # 🏠 首页（淡蓝色 Hero + 文章摘要 + 法律声明页脚）
├── articles.html       # 📋 所有文章（按时间排序，支持标签筛选）
├── about.html          # 👤 关于作者
├── _headers            # EdgeOne Pages 响应头配置
├── _redirects          # EdgeOne Pages 路由配置
├── css/
│   └── style.css       # 全局样式（玻璃态 + 苹果设计）
├── js/
│   └── main.js         # 交互脚本（打赏、动画、筛选）
├── images/             # 图片资源目录
│   ├── wechat-pay.png  # ← 放入微信收款码图片
│   └── alipay.png      # ← 放入支付宝收款码图片
└── articles/           # 文章详情页
    ├── article-1.html  # 示例文章（含打赏功能）
    └── ...
```

## ✨ 功能特性

| 功能 | 说明 |
|------|------|
| 苹果设计风格 | SF Pro 字体、圆角卡片、精致间距 |
| 玻璃态效果 | backdrop-filter 毛玻璃，半透明白色背景 |
| 淡蓝色顶部 | 首页/文章页均有渐变蓝色 Hero 区域 |
| 导航栏 | 固定顶部，模糊背景，含「所有文章」「关于作者」 |
| 文章摘要 | 主页按时间降序，显示摘要、分类标签 |
| 标签筛选 | 首页和文章列表页均支持分类筛选 |
| 打赏功能 | 文章底部内嵌微信 + 支付宝收款码，点击展开 |
| 法律声明 | 每页底部包含版权和免责声明 |
| 回到顶部 | 滚动 400px 后出现悬浮按钮 |
| 入场动画 | 文章卡片交错淡入动画 |
| 响应式 | 完美适配手机、平板、桌面 |

## 🚀 部署到 EdgeOne Pages

### 方法一：直接上传

1. 登录 [腾讯云控制台](https://console.cloud.tencent.com/)
2. 进入 **EdgeOne → Pages**
3. 点击「新建项目」→「直接上传」
4. 将 `blog/` 目录下所有文件打包上传

### 方法二：Git 仓库自动部署（推荐）

1. 将项目推送到 GitHub/GitLab
2. EdgeOne Pages → 新建项目 → 从 Git 导入
3. 构建命令：留空（纯静态）
4. 输出目录：`./`（或 `/`）
5. 点击部署，等待完成

## 🎨 个性化定制

### 替换收款码图片

将你的收款码图片放入 `images/` 目录，然后修改文章模板中的占位符：

```html
<!-- 找到这段注释，替换为实际图片 -->
<img src="../images/wechat-pay.png" class="reward-qr-img" alt="微信收款码">
<img src="../images/alipay.png" class="reward-qr-img" alt="支付宝收款码">
```

### 修改博客名称

在所有 HTML 文件中将 `✦ 我的博客` 替换为你的博客名称。

### 修改法律声明

在各页面的 `<footer>` 部分修改为你自己的联系邮箱和声明内容。

### 新增文章

复制 `articles/article-1.html`，修改内容，并在 `index.html` 和 `articles.html` 中添加对应条目。

## 🛠 技术栈

- **纯静态 HTML + CSS + JavaScript**（无需构建工具）
- CSS 自定义属性（Design Tokens）
- `backdrop-filter` 玻璃态效果
- IntersectionObserver 滚动动画
- 无任何外部依赖，加载极速

---

Made with ☕ · Powered by EdgeOne Pages
