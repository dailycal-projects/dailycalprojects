const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');
const output = path.resolve(__dirname, '../../../public/data/endorsementweb');
esbuild.buildSync({
  entryPoints: [path.join(__dirname, 'main.ts')],
  bundle: true,
  minify: true,
  target: ['es2020'],
  outfile: path.join(output, 'graph.js'),
  external: ['./fonts/*'],
});
const body = fs.readFileSync(path.join(__dirname, 'template.html'), 'utf8');
fs.writeFileSync(path.join(output, 'index.html'), `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Berkeley election endorsements</title><link rel="stylesheet" href="./graph.css"></head><body class="app">${body}<script src="./graph.js"></script></body></html>`);
