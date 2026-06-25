import matter from 'gray-matter';
import { marked } from 'marked';
import nunjucks from 'nunjucks';

export interface Basics {
  name?: string;
  headline?: string;
  avatar?: string;
  email?: string;
  phone?: string;
  location?: string;
  website?: string;
  github?: string;
  summary?: string;
}

export interface ResumeData {
  theme?: string;
  title?: string;
  lang?: string;
  basics?: Basics;
  contentHtml: string;
  raw: string;
}

export interface Theme {
  template: string;
  style: string;
}

const LABELS: Record<string, Record<string, string>> = {
  'zh-CN': { email: '邮箱', phone: '电话', location: '所在地', website: '网站', github: 'GitHub' },
  zh: { email: '邮箱', phone: '电话', location: '所在地', website: '网站', github: 'GitHub' },
  en: { email: 'Email', phone: 'Phone', location: 'Location', website: 'Website', github: 'GitHub' },
};

export function getLabels(lang?: string): Record<string, string> {
  return LABELS[lang || 'zh-CN'] || LABELS['zh-CN'];
}

export function parseMarkdown(mdContent: string): ResumeData {
  const { data, content } = matter(mdContent);
  const contentHtml = marked.parse(content) as string;
  return { ...data, contentHtml, raw: content } as ResumeData;
}

export function render(data: ResumeData, theme: Theme): string {
  const lang = data.lang || 'zh-CN';
  const labels = getLabels(lang);
  const env = new nunjucks.Environment(null, { autoescape: false });
  return env.renderString(theme.template, {
    document: { title: data.title || data.basics?.name || '简历', lang },
    basics: data.basics,
    contentHtml: data.contentHtml,
    labels,
    style: theme.style,
  });
}

export function renderFromMarkdown(mdContent: string, theme: Theme): string {
  const data = parseMarkdown(mdContent);
  return render(data, theme);
}
