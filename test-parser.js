const fs = require('fs');

function parseFrontmatter(md) {
  const normalizedMd = md.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const match = normalizedMd.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { meta: {}, content: normalizedMd };
  const meta = {};
  match[1].split('\n').forEach(line => {
    const colonIdx = line.indexOf(':');
    if (colonIdx > 0) {
      const key = line.slice(0, colonIdx).trim();
      const val = line.slice(colonIdx + 1).trim().replace(/^['"]|['"]$/g, '');
      meta[key] = val;
    }
  });
  return { meta, content: match[2] };
}

const files = [
  '2026-04-25-edgeone-pages.md',
  '2026-04-18-glassmorphism.md',
  '2026-04-10-why-i-write.md',
  '2026-03-28-spring-afternoon.md',
  '2026-03-15-css-design-tokens.md'
];

console.log('=== 文章格式验证 ===');
files.forEach(f => {
  const md = fs.readFileSync('./posts/' + f, 'utf8');
  const { meta, content } = parseFrontmatter(md);
  const status = meta.title ? '✅' : '❌';
  console.log(`${status} ${f}`);
  console.log(`   title: ${meta.title || 'MISSING'}`);
  console.log(`   date: ${meta.date || 'MISSING'}`);
  console.log(`   tag: ${meta.tag || 'MISSING'}`);
  console.log(`   content length: ${content.length} chars`);
  console.log('');
});
