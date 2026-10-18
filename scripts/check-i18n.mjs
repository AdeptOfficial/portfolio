import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
const digest = text => createHash('sha256').update(text).digest('hex');
const translations = JSON.parse(fs.readFileSync('src/i18n/zh-Hans.json', 'utf8'));
const manifest = JSON.parse(fs.readFileSync('src/i18n/reviewed-sources.json', 'utf8'));
const errors = [];
function walk(dir) {
  return fs.readdirSync(dir,{withFileTypes:true}).flatMap(item => item.isDirectory() ? walk(path.join(dir,item.name)) : [path.join(dir,item.name)]);
}
for (const file of walk('src').filter(f => /\.(astro|tsx|ts)$/.test(f))) {
  const text = fs.readFileSync(file,'utf8');
  // Source text is the key: an English wording edit creates a missing translation.
  for (const match of text.matchAll(/\bt\(\s*("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')\s*\)/g)) {
    const literal = match[1];
    const key = literal[0] === '"' ? JSON.parse(literal) : literal.slice(1,-1).replace(/\\'/g,"'").replace(/\\\\/g,'\\');
    if (!translations[key]?.trim()) errors.push(`${file}: missing translation for ${key}`);
  }
}
for (const [source,translated] of Object.entries(translations)) {
  if (!translated.trim()) errors.push(`Empty translation: ${source}`);
  if (manifest.strings[source] !== digest(source)) errors.push(`Unreviewed source: ${source}`);
}
if (fs.existsSync('src/content/apps')) {
  const files = fs.readdirSync('src/content/apps').filter(f=>f.endsWith('.md'));
  for (const file of files) {
    const text=fs.readFileSync(`src/content/apps/${file}`,'utf8');
    const [,frontmatter,...body]=text.split(/^---\s*$/m);
    const copy=[...frontmatter.matchAll(/^(?:tagline|screenshotAlt):.*$/gm)].map(m=>m[0]).join('\n')+'\n'+body.join('---').trim();
    if (manifest.apps?.[file] !== digest(copy)) errors.push(`Stale Chinese app copy: ${file}`);
    if (!fs.existsSync(`src/content/apps-zh/${file}`)) errors.push(`Missing Chinese app: ${file}`);
  }
}
if(errors.length) {console.error(errors.join('\n'));process.exit(1);}
console.log(`Translation checks passed (${Object.keys(translations).length} strings).`);
