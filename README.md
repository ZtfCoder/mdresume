# mdresume

用 Markdown 写简历，生成精美 PDF。开箱即用，支持中文。

## 特性

- **纯 Markdown** — 简历就是一个 `.md` 文件，用 Git 管理版本
- **模板 HTML/CSS 分离** — 主题由独立的 `template.html` + `style.css` 组成，易于定制
- **中文友好** — `lang: zh-CN` 自动使用中文标签（邮箱、电话、所在地…）
- **CLI 导出 PDF** — 基于 puppeteer-core，像素级 A4 输出
- **在线预览** — Web 应用支持选择模板、编辑 Markdown、实时预览、浏览器导出 PDF
- **Monorepo 架构** — pnpm workspace + tsup/vite 构建，结构清晰可扩展

## 项目结构

```
mdresume/
├── themes/default/          # 主题（template.html + style.css 分离）
├── packages/
│   ├── core/                # 解析渲染引擎（gray-matter + marked + nunjucks）
│   ├── cli/                 # 命令行工具（PDF 导出）
│   └── web/                 # 在线预览（Vite + React）
└── pnpm-workspace.yaml
```

## 快速开始

### 安装依赖

```bash
pnpm install
pnpm --filter @mdresume/core build
pnpm --filter @mdresume/cli build
```

### CLI 导出 PDF

```bash
node packages/cli/dist/cli.js pdf -i ./resume.md -o ./resume.pdf
```

支持指定主题：

```bash
node packages/cli/dist/cli.js pdf -i ./resume.md -t default -o ./resume.pdf
```

### 在线预览

```bash
cd packages/web
pnpm dev
```

打开浏览器访问 `http://localhost:5173`，支持：
- 选择主题
- 上传或编辑 Markdown
- 实时预览渲染效果
- 浏览器端导出 PDF（打印）

## 简历格式

```markdown
---
theme: default
title: 张三 - 前端开发工程师
lang: zh-CN
basics:
  name: 张三
  headline: 前端开发工程师
  phone: "138 0000 0000"
  email: zhangsan@example.com
  location: 北京
  summary: 3年前端开发经验
---

## 工作经历

### 某科技公司 | 前端开发 | 2022 - 至今

- 负责核心业务模块开发
```

### Frontmatter 字段

| 字段 | 说明 |
|------|------|
| `theme` | 主题名称 |
| `title` | HTML 页面标题 |
| `lang` | 语言（`zh-CN`、`en`） |
| `basics.name` | 姓名 |
| `basics.headline` | 职位 |
| `basics.phone` | 电话 |
| `basics.email` | 邮箱 |
| `basics.location` | 所在地 |
| `basics.website` | 个人网站 |
| `basics.github` | GitHub |
| `basics.summary` | 个人简介 |

所有 `basics` 字段均为可选，正文使用标准 Markdown。

## 自定义主题

在 `themes/` 下创建目录，包含：

- `template.html` — Nunjucks 模板，可用变量：`document`、`basics`、`contentHtml`、`labels`、`style`
- `style.css` — 样式，会通过 `{{ style }}` 注入到模板中

## 技术栈

- **构建**：tsup（core/cli）、Vite（web）
- **解析**：gray-matter（frontmatter）、marked（Markdown → HTML）
- **模板**：Nunjucks
- **PDF**：puppeteer-core
- **Web**：React 19 + Vite 6

## License

MIT
