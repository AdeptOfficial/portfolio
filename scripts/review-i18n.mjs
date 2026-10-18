// Run only after reviewing the translation against the specified English source.
import fs from 'node:fs';
import {createHash} from 'node:crypto';
const [kind, key] = process.argv.slice(2);
const file='src/i18n/reviewed-sources.json';
const manifest=JSON.parse(fs.readFileSync(file,'utf8'));
const hash=text=>createHash('sha256').update(text).digest('hex');
if(kind==='string' && key) {
 const translations=JSON.parse(fs.readFileSync('src/i18n/zh-Hans.json','utf8'));
 if(!translations[key]?.trim()) throw Error('Add and review the Chinese translation first.');
 manifest.strings[key]=hash(key);
} else if(kind==='app' && /^[a-z0-9-]+$/.test(key ?? '')) {
 if(!fs.existsSync(`src/content/apps-zh/${key}.md`)) throw Error('Add and review the Chinese app translation first.');
 const text=fs.readFileSync(`src/content/apps/${key}.md`,'utf8');
 const [,frontmatter,...body]=text.split(/^---\s*$/m);
 const copy=[...frontmatter.matchAll(/^(?:tagline|screenshotAlt):.*$/gm)].map(m=>m[0]).join('\n')+'\n'+body.join('---').trim();
 manifest.apps[`${key}.md`]=hash(copy);
} else throw Error('Usage: node scripts/review-i18n.mjs string "English source" OR app dayplan');
fs.writeFileSync(file,JSON.stringify(manifest,null,2)+'\n');
console.log('Recorded review of the specified source. Run npm run check:i18n.');
