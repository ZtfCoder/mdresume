# 主题开发指南

## 主题目录结构

```
themes/<theme-name>/
├── template.html    # 必须 - Nunjucks 页面模板
└── style.css        # 必须 - 样式文件
```

## 模板变量

`template.html` 使用 [Nunjucks](https://mozilla.github.io/nunjucks/) 模板引擎，可用变量如下：

| 变量 | 类型 | 说明 |
|------|------|------|
| `document.title` | `string` | 页面标题 |
| `document.lang` | `string` | 语言（`zh-CN`、`en`） |
| `basics.name` | `string` | 姓名 |
| `basics.headline` | `string` | 职位标题 |
| `basics.phone` | `string` | 电话 |
| `basics.email` | `string` | 邮箱 |
| `basics.location` | `string` | 所在地 |
| `basics.website` | `string` | 个人网站 |
| `basics.github` | `string` | GitHub |
| `basics.summary` | `string` | 个人简介 |
| `labels` | `object` | 国际化标签（`labels.phone`、`labels.email` 等） |
| `style` | `string` | style.css 的内容（通过 `{{ style }}` 注入） |
| `contentHtml` | `string` | Markdown 正文渲染后的 HTML |

## 最小模板示例

```html
<!DOCTYPE html>
<html lang="{{ document.lang }}">
<head>
<meta charset="UTF-8">
<title>{{ document.title }}</title>
<style>{{ style }}</style>
</head>
<body>
<main class="resume-page">
  <header class="resume-header">
    {% if basics and basics.name %}<h1>{{ basics.name }}</h1>{% endif %}
    {% if basics and basics.headline %}<p>{{ basics.headline }}</p>{% endif %}
    <ul class="contacts">
      {% if basics and basics.phone %}<li><span>{{ labels.phone }}</span>{{ basics.phone }}</li>{% endif %}
      {% if basics and basics.email %}<li><span>{{ labels.email }}</span>{{ basics.email }}</li>{% endif %}
    </ul>
  </header>
  <article class="resume-content">
    {{ contentHtml }}
  </article>
</main>
</body>
</html>
```

## 样式要求

`style.css` 中必须包含打印支持：

```css
@page {
  size: A4;
  margin: 0;
}
```

建议：

- 页面容器宽度 `210mm`，最小高度 `297mm`
- 使用 `break-inside: avoid` 防止标题被分页截断
- 设置 `printBackground: true` 相关的背景色在打印时保留

## 国际化标签

当 `lang: zh-CN` 时，`labels` 对象为：

```json
{ "email": "邮箱", "phone": "电话", "location": "所在地", "website": "网站", "github": "GitHub" }
```

当 `lang: en` 时：

```json
{ "email": "Email", "phone": "Phone", "location": "Location", "website": "Website", "github": "GitHub" }
```

## 使用自定义主题

### CLI

```bash
node packages/cli/dist/cli.js pdf -i resume.md -t ./themes/my-theme -o resume.pdf
```

### Web

在 `packages/web/src/App.tsx` 的 `THEMES` 对象中添加：

```ts
import myTemplate from '../../../themes/my-theme/template.html?raw';
import myStyle from '../../../themes/my-theme/style.css?raw';

const THEMES = {
  default: { template: defaultTemplate, style: defaultStyle },
  'my-theme': { template: myTemplate, style: myStyle },
};
```

## 开发流程

```bash
# 1. 复制默认主题
cp -r themes/default themes/my-theme

# 2. 编辑模板和样式
# 修改 themes/my-theme/template.html
# 修改 themes/my-theme/style.css

# 3. 预览效果
node packages/cli/dist/cli.js pdf -i resume.md -t ./themes/my-theme -o preview.pdf

# 4. 在 Web 中预览（需要注册到 THEMES）
cd packages/web && pnpm dev
```
