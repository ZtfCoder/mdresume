import { useState, useMemo, useRef } from 'react';
import { marked } from 'marked';
import nunjucks from 'nunjucks';
import defaultTemplate from '../../../themes/default/template.html?raw';
import defaultStyle from '../../../themes/default/style.css?raw';
import minimalTemplate from '../../../themes/minimal/template.html?raw';
import minimalStyle from '../../../themes/minimal/style.css?raw';
import elegantTemplate from '../../../themes/elegant/template.html?raw';
import elegantStyle from '../../../themes/elegant/style.css?raw';
import compactTemplate from '../../../themes/compact/template.html?raw';
import compactStyle from '../../../themes/compact/style.css?raw';

interface Basics {
  name?: string;
  headline?: string;
  phone?: string;
  email?: string;
  location?: string;
  website?: string;
  github?: string;
  summary?: string;
}

interface Theme {
  template: string;
  style: string;
}

const THEMES: Record<string, Theme> = {
  default: { template: defaultTemplate, style: defaultStyle },
  minimal: { template: minimalTemplate, style: minimalStyle },
  elegant: { template: elegantTemplate, style: elegantStyle },
  compact: { template: compactTemplate, style: compactStyle },
};

const LABELS: Record<string, Record<string, string>> = {
  'zh-CN': { email: '邮箱', phone: '电话', location: '所在地', website: '网站', github: 'GitHub' },
  zh: { email: '邮箱', phone: '电话', location: '所在地', website: '网站', github: 'GitHub' },
  en: { email: 'Email', phone: 'Phone', location: 'Location', website: 'Website', github: 'GitHub' },
};

function parseFrontmatter(md: string): { data: Record<string, any>; content: string } {
  const match = md.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { data: {}, content: md };
  const yamlStr = match[1];
  const content = match[2];
  const data: Record<string, any> = {};
  let currentObj: Record<string, any> | null = null;
  for (const line of yamlStr.split('\n')) {
    if (/^\s*#/.test(line) || !line.trim()) continue;
    const topMatch = line.match(/^(\w+):\s*(.*)$/);
    if (topMatch) {
      const [, key, val] = topMatch;
      if (val.trim()) {
        data[key] = val.replace(/^["']|["']$/g, '').trim();
        currentObj = null;
      } else {
        data[key] = {};
        currentObj = data[key] as Record<string, any>;
      }
    } else if (currentObj) {
      const subMatch = line.match(/^\s+(\w+):\s*(.+)$/);
      if (subMatch) {
        currentObj[subMatch[1]] = subMatch[2].replace(/^["']|["']$/g, '').trim();
      }
    }
  }
  return { data, content };
}

function renderResume(md: string, theme: Theme): string {
  const { data, content } = parseFrontmatter(md);
  const contentHtml = marked.parse(content) as string;
  const lang = (data.lang as string) || 'zh-CN';
  const labels = LABELS[lang] || LABELS['zh-CN'];
  const env = new nunjucks.Environment(null, { autoescape: false });
  return env.renderString(theme.template, {
    document: { title: data.title || data.basics?.name || '简历', lang },
    basics: data.basics as Basics,
    contentHtml,
    labels,
    style: theme.style,
  });
}

const SAMPLE_MD = `---
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
- 参与架构优化，提升性能 30%

## 教育经历

### 某大学 | 计算机科学（本科） | 2018 - 2022
`;

export function App() {
  const [md, setMd] = useState(SAMPLE_MD);
  const [themeName, setThemeName] = useState('default');
  const previewRef = useRef<HTMLDivElement>(null);

  const html = useMemo(() => {
    try {
      const theme = THEMES[themeName] || THEMES.default;
      return renderResume(md, theme);
    } catch (e) {
      return `<p style="color:red;padding:20px;">解析出错：${(e as Error).message}</p>`;
    }
  }, [md, themeName]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setMd(reader.result as string);
    reader.readAsText(file);
  };

  const handleExportPdf = () => {
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    const doc = iframe.contentDocument!;
    doc.open();
    doc.write(html);
    doc.close();
    setTimeout(() => {
      iframe.contentWindow!.print();
      setTimeout(() => document.body.removeChild(iframe), 1000);
    }, 300);
  };

  return (
    <div className="app">
      <div className="editor-panel">
        <div className="editor-header">
          <div className="brand">
            <h1>mdresume</h1>
            <span>Markdown 简历</span>
          </div>
          <div className="toolbar">
            <select value={themeName} onChange={(e) => setThemeName(e.target.value)}>
              {Object.keys(THEMES).map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <button className="btn-secondary" onClick={() => document.getElementById('file-input')?.click()}>
              <i className="fas fa-upload"></i> 上传
            </button>
            <input id="file-input" type="file" accept=".md" onChange={handleUpload} style={{ display: 'none' }} />
            <button className="btn-accent" onClick={handleExportPdf}>
              <i className="fas fa-file-pdf"></i> 导出 PDF
            </button>
          </div>
        </div>
        <div className="editor-hint">
          <i className="fas fa-pen-nib"></i>
          编辑 Markdown 或上传 .md 文件
        </div>
        <div className="editor-area">
          <textarea value={md} onChange={(e) => setMd(e.target.value)} spellCheck={false} />
        </div>
      </div>
      <div className="preview-panel">
        <div className="preview-frame" ref={previewRef} dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  );
}
