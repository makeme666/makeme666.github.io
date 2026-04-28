/* ===== md-parser.js - Markdown 解析器 + 文章渲染系统 ===== */

// ===================== Markdown 解析 =====================

function parseMarkdown(md) {
  if (!md) return '';

  let html = md;

  // 1. 保护代码块（防止内部被转义）
  const codeBlocks = [];
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (m, lang, code) => {
    const idx = codeBlocks.length;
    codeBlocks.push(`<pre><code class="language-${lang || 'text'}">${escapeHtml(code.trimEnd())}</code></pre>`);
    return `%%CODEBLOCK_${idx}%%`;
  });

  // 2. 保护行内代码
  const inlineCodes = [];
  html = html.replace(/`([^`]+)`/g, (m, code) => {
    const idx = inlineCodes.length;
    inlineCodes.push(`<code>${escapeHtml(code)}</code>`);
    return `%%INLINE_${idx}%%`;
  });

  // 3. 按行处理
  const lines = html.split('\n');
  let result = [];
  let inList = false;
  let inOrderedList = false;
  let inBlockquote = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // 代码块占位符
    if (line.includes('%%CODEBLOCK_')) {
      closeLists();
      closeBlockquote();
      result.push(line);
      continue;
    }

    // 空行
    if (line.trim() === '') {
      closeLists();
      closeBlockquote();
      continue;
    }

    // 标题
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      closeLists();
      closeBlockquote();
      const level = headingMatch[1].length;
      const text = inlineFormat(headingMatch[2]);
      result.push(`<h${level}>${text}</h${level}>`);
      continue;
    }

    // 引用块
    if (line.startsWith('> ')) {
      closeLists();
      if (!inBlockquote) {
        inBlockquote = true;
        result.push('<blockquote>');
      }
      result.push(`<p>${inlineFormat(line.slice(2))}</p>`);
      continue;
    } else if (inBlockquote) {
      closeBlockquote();
    }

    // 有序列表
    const olMatch = line.match(/^\d+\.\s+(.+)$/);
    if (olMatch) {
      closeBlockquote();
      if (!inOrderedList) {
        inOrderedList = true;
        result.push('<ol>');
      }
      result.push(`<li>${inlineFormat(olMatch[1])}</li>`);
      continue;
    }

    // 无序列表
    const ulMatch = line.match(/^[-*+]\s+(.+)$/);
    if (ulMatch) {
      closeBlockquote();
      if (!inList) {
        inList = true;
        result.push('<ul>');
      }
      result.push(`<li>${inlineFormat(ulMatch[1])}</li>`);
      continue;
    }

    // 普通段落
    closeLists();
    closeBlockquote();
    result.push(`<p>${inlineFormat(line)}</p>`);
  }

  closeLists();
  closeBlockquote();

  html = result.join('\n');

  // 恢复代码块
  codeBlocks.forEach((block, idx) => {
    html = html.replace(`%%CODEBLOCK_${idx}%%`, block);
  });
  inlineCodes.forEach((code, idx) => {
    html = html.replace(`%%INLINE_${idx}%%`, code);
  });

  function closeLists() {
    if (inList) { result.push('</ul>'); inList = false; }
    if (inOrderedList) { result.push('</ol>'); inOrderedList = false; }
  }
  function closeBlockquote() {
    if (inBlockquote) { result.push('</blockquote>'); inBlockquote = false; }
  }

  return html;
}

function inlineFormat(text) {
  // 图片 ![alt](src) - XSS 防护
  text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (m, alt, src) => {
    const safeSrc = validateUrl(src) ? src : '';
    return `<img src="${safeSrc}" alt="${escapeHtml(alt)}" style="max-width:100%;border-radius:12px;margin:16px 0;" />`;
  });
  // 链接 [text](href) - XSS 防护
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (m, label, href) => {
    const safeHref = validateUrl(href) ? href : '#';
    return `<a href="${safeHref}" target="_blank" rel="noopener noreferrer" style="color:#0071e3;text-decoration:underline;">${escapeHtml(label)}</a>`;
  });
  // 加粗 **text**
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // 斜体 *text*
  text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
  // 删除线 ~~text~~
  text = text.replace(/~~(.+?)~~/g, '<del>$1</del>');
  return text;
}

// URL 安全验证 - 防止 XSS
function validateUrl(url) {
  if (!url) return false;
  // 允许绝对 URL (http/https) 和相对路径 (/)
  return /^https?:\/\//i.test(url) || url.startsWith('/') || url.startsWith('#');
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ===================== Frontmatter 解析 =====================

function parseFrontmatter(md) {
  // 统一处理 CRLF 和 LF 换行符
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

// ===================== 文章加载器 =====================

const PostLoader = {
  cache: null,

  // 文章目录路径（始终使用 /posts/）
  _getBasePath() {
    return '/posts/';
  },

  async loadAllPosts() {
    if (this.cache) return this.cache;

    const base = this._getBasePath();
    
    // 动态获取文章列表
    let postsDir;
    try {
      const res = await fetch(base + 'manifest.json');
      if (res.ok) {
        const manifest = await res.json();
        postsDir = manifest.posts || [];
      }
    } catch (e) {
      // manifest.json 不存在时使用默认列表
      postsDir = [
        '2026-04-18-glassmorphism.md',
        '2026-04-10-why-i-write.md',
        '2026-03-28-spring-afternoon.md',
        '2026-03-15-css-design-tokens.md'
      ];
    }

    // 并行请求所有文章，大幅缩短加载时间
    const results = await Promise.allSettled(
      postsDir.map(file => fetch(base + file).then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text().then(md => ({ file, ...parseFrontmatter(md) }));
      }))
    );

    const posts = results
      .filter(r => r.status === 'fulfilled')
      .map(r => r.value);

    // 按日期降序排列
    posts.sort((a, b) => new Date(b.meta.date || 0) - new Date(a.meta.date || 0));
    this.cache = posts;
    return posts;
  },

  // 生成文章 URL（文章始终在 posts/ 目录，相对根目录）
  getPostUrl(postFile) {
    return `article.html?post=${encodeURIComponent(postFile)}&base=posts/`;
  },

  // 格式化日期
  formatDate(dateStr) {
    // 使用明确的时间戳格式避免时区问题
    const d = new Date(dateStr + 'T00:00:00');
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}年${parseInt(m)}月${parseInt(day)}日`;
  },

  formatDateShort(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${parseInt(m)}月${parseInt(day)}日`;
  },

  // 提取摘要（取前 120 字，清理 Markdown 格式）
  excerpt(content, len = 120) {
    if (!content) return '...';
    // 移除 frontmatter 后处理，先移除标题和链接等格式
    const cleaned = content
      .replace(/^#{1,6}\s+.+$/gm, '')           // 移除标题行
      .replace(/```[\s\S]*?```/g, '')           // 移除代码块
      .replace(/`[^`]+`/g, '')                  // 移除行内代码
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')   // 链接转文字
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')    // 移除图片
      .replace(/[*_~`#>]/g, '')                 // 移除 Markdown 符号
      .replace(/\n+/g, ' ')                     // 换行转空格
      .replace(/\s+/g, ' ')                     // 多个空格合并
      .trim();
    return cleaned.slice(0, len) + (cleaned.length > len ? '...' : '');
  }
};
