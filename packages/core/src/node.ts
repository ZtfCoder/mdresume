import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { Theme } from './index.js';

export function loadTheme(themePath: string): Theme {
  const template = readFileSync(resolve(themePath, 'template.html'), 'utf-8');
  const style = readFileSync(resolve(themePath, 'style.css'), 'utf-8');
  return { template, style };
}

export function loadThemeByName(name: string, themesRoot?: string): Theme {
  const root = themesRoot || resolve(dirname(fileURLToPath(import.meta.url)), '../../../themes');
  return loadTheme(resolve(root, name));
}
