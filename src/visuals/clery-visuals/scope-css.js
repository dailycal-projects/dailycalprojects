/* eslint-disable */
// Scope the Astro viewer's styles to this article. The source repository is
// read-only; rerun with its root after updating its styles:
// node src/visuals/clery-visuals/scope-css.js ~/downloads/coding/ucpd_crime_log
const fs = require('fs');
const path = require('path');
const postcss = require('postcss');

const source = process.argv[2];
if (!source) throw new Error('Pass the path to ucpd_crime_log.');
const ROOT = '.clery-viewer';
const sources = ['src/layouts/Layout.astro', 'src/pages/index.astro', 'src/pages/table.astro'];
const styles = sources.map((file) => {
  const astro = fs.readFileSync(path.join(source, file), 'utf8');
  const blocks = [...astro.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g)];
  if (!blocks.length) throw new Error(`No stylesheet found in ${file}.`);
  return blocks.map((block) => block[1]).join('\n');
}).join('\n');

const scope = {
  postcssPlugin: 'scope-clery',
  Rule(rule) {
    if (rule.parent?.type === 'atrule' && /keyframes$/.test(rule.parent.name)) return;
    rule.selectors = [...new Set(rule.selectors.map((selector) => {
      const s = selector.trim();
      if ([':root', 'html', 'body'].includes(s)) return ROOT;
      if (/^(html|body)[:.[]/.test(s)) return s.replace(/^(html|body)/, ROOT);
      return `${ROOT} ${s}`;
    }))];
  },
};

const reset = `/* Generated from ucpd_crime_log by scope-css.js. */
${ROOT} :where(h1, h2, h3, h4, h5, h6, p, ul, ol, li, dl, dd, dt, a, button,
  input, select, textarea, label, table, thead, tbody, tr, th, td, figure,
  figcaption, blockquote, small, strong, b, em, i, code, pre, hr, img, abbr):where(:not(.leaflet-container *)) {
  all: revert;
}
`;
const output = postcss([scope]).process(styles, { from: undefined }).css;
const directory = path.join(__dirname, 'styles');
fs.mkdirSync(directory, { recursive: true });
fs.writeFileSync(path.join(directory, 'dashboard.css'), reset + output);
console.log('Scoped the map, table, and shared viewer styles to .clery-viewer.');
