import { Command } from 'commander';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { execSync } from 'child_process';
import { parseMarkdown, render } from '@mdresume/core';
import { loadThemeByName, loadTheme } from '@mdresume/core/node';
import puppeteer from 'puppeteer-core';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const themesRoot = resolve(__dirname, '../../../themes');

function findChrome(): string {
  // System Chrome
  const systemChrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  try { execSync(`test -f "${systemChrome}"`); return systemChrome; } catch {}
  // Puppeteer cache
  try {
    const found = execSync('find $HOME/.cache/puppeteer -name "Google Chrome for Testing" 2>/dev/null | head -1', { encoding: 'utf-8' }).trim();
    if (found) return found;
  } catch {}
  // Playwright cache
  try {
    const found = execSync('find $HOME/Library/Caches/ms-playwright -name "Chromium" -o -name "chrome" 2>/dev/null | grep -i chrom | head -1', { encoding: 'utf-8' }).trim();
    if (found) return found;
  } catch {}
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  throw new Error('Chrome not found. Install Chrome or set CHROME_PATH.');
}

const program = new Command();

program
  .name('mdresume')
  .description('Markdown 简历转 PDF')
  .version('1.0.0');

program
  .command('pdf')
  .description('导出 PDF')
  .requiredOption('-i, --input <file>', 'Markdown 文件路径')
  .option('-o, --output <file>', '输出 PDF 路径')
  .option('-t, --theme <name>', '主题名称或路径', 'default')
  .action(async (opts) => {
    const input = resolve(opts.input);
    const output = opts.output ? resolve(opts.output) : input.replace(/\.md$/, '.pdf');
    const md = readFileSync(input, 'utf-8');
    const data = parseMarkdown(md);
    const themeName = opts.theme || data.theme || 'default';

    const theme = themeName.includes('/')
      ? loadTheme(resolve(themeName))
      : loadThemeByName(themeName, themesRoot);

    const html = render(data, theme);
    const executablePath = findChrome();

    const browser = await puppeteer.launch({ headless: true, executablePath });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.pdf({
      path: output,
      format: 'A4',
      margin: { top: '0', bottom: '0', left: '0', right: '0' },
      printBackground: true,
    });
    await browser.close();
    console.log(`✅ PDF 已导出: ${output}`);
  });

program.parse();
