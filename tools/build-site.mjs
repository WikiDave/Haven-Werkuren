// Bouwt de openbare website (repository Haven-Werkuren) uit deze broncode:
// JavaScript samengeperst met terser, commentaar uit HTML en CSS, enkel de bestanden die de site nodig heeft.
// Gebruik: TERSER=/pad/naar/node_modules/terser node tools/build-site.mjs <uitvoermap>
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const out = path.resolve(process.argv[2] || 'site');
const require = createRequire(import.meta.url);
const { minify } = require(process.env.TERSER || 'terser');

const COPY = ['privacy.html', 'verstuurd.html', 'manifest.webmanifest', 'version.json', 'LICENSE', 'icons', 'vendor'];
const JS = ['app.js', 'loon.js', 'postcodes.js', 'scan.js', 'sw.js'];

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
for (const f of COPY) fs.cpSync(path.join(root, f), path.join(out, f), { recursive: true });

for (const f of JS) {
  const src = fs.readFileSync(path.join(root, f), 'utf8');
  const res = await minify(src, { compress: { passes: 2 }, mangle: true, format: { comments: false } });
  fs.writeFileSync(path.join(out, f), `/* Haven Werkuren · © 2026 David Schütt · alle rechten voorbehouden */\n${res.code}\n`);
}

// HTML: commentaar weg, CSS zonder commentaar en inspringing
let html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
html = html.replace(/<!--[\s\S]*?-->\n?/g, '');
html = html.replace(/<style>([\s\S]*?)<\/style>/g, (m, css) => `<style>${css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\n\s+/g, '\n').replace(/\n{2,}/g, '\n')}</style>`);
html = html.replace(/\n[ \t]+</g, '\n<');
fs.writeFileSync(path.join(out, 'index.html'), html);

fs.writeFileSync(path.join(out, 'README.md'), `# Haven Werkuren

Onofficiële hobby-app voor havenarbeiders in Zeebrugge, van David Schütt. **Geen app van Cewez** en ook niet van een havenbedrijf.

App: https://wikidave.github.io/Haven-Werkuren/ · Privacy: [privacy.html](privacy.html)

© 2026 David Schütt, alle rechten voorbehouden (zie [LICENSE](LICENSE)). Kopiëren, aanpassen, opnieuw publiceren of verspreiden mag niet zonder schriftelijke toestemming.
`);
fs.writeFileSync(path.join(out, '.nojekyll'), '');
console.log('site gebouwd in', out);
