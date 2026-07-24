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
  var result = [];
  var inList = false;
  var inOrderedList = false;
  var inBlockquote = false;

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];

    // 代码块占位符
    if (line.indexOf('%%CODEBLOCK_') !== -1) {
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
    var headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      closeLists();
      closeBlockquote();
      var level = headingMatch[1].length;
      var text = inlineFormat(headingMatch[2]);
      result.push('<h' + level + '>' + text + '</h' + level + '>');
      continue;
    }

    // 引用块
    if (line.indexOf('> ') === 0) {
      closeLists();
      if (!inBlockquote) {
        inBlockquote = true;
        result.push('<blockquote>');
      }
      result.push('<p>' + inlineFormat(line.slice(2)) + '</p>');
      continue;
    } else if (inBlockquote) {
      closeBlockquote();
    }

    // 有序列表
    var olMatch = line.match(/^\d+\.\s+(.+)$/);
    if (olMatch) {
      closeBlockquote();
      if (!inOrderedList) {
        inOrderedList = true;
        result.push('<ol>');
      }
      result.push('<li>' + inlineFormat(olMatch[1]) + '</li>');
      continue;
    }

    // 无序列表
    var ulMatch = line.match(/^[-*+]\s+(.+)$/);
    if (ulMatch) {
      closeBlockquote();
      if (!inList) {
        inList = true;
        result.push('<ul>');
      }
      result.push('<li>' + inlineFormat(ulMatch[1]) + '</li>');
      continue;
    }

    // 普通段落
    closeLists();
    closeBlockquote();
    result.push('<p>' + inlineFormat(line) + '</p>');
  }

  closeLists();
  closeBlockquote();

  html = result.join('\n');

  // 恢复代码块
  codeBlocks.forEach(function(block, idx) {
    html = html.replace('%%CODEBLOCK_' + idx + '%%', block);
  });
  inlineCodes.forEach(function(code, idx) {
    html = html.replace('%%INLINE_' + idx + '%%', code);
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
  text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, function(m, alt, src) {
    var safeSrc = validateUrl(src) ? src : '';
    return '<img src="' + safeSrc + '" alt="' + escapeHtml(alt) + '" style="max-width:100%;border-radius:12px;margin:16px 0;" />';
  });
  // 链接 [text](href) - XSS 防护
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, function(m, label, href) {
    var safeHref = validateUrl(href) ? href : '#';
    return '<a href="' + safeHref + '" target="_blank" rel="noopener noreferrer" style="color:#0071e3;text-decoration:underline;">' + escapeHtml(label) + '</a>';
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
  return /^https?:\/\//i.test(url) || url.charAt(0) === '/' || url.charAt(0) === '#';
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ===================== Frontmatter 解析 =====================

function parseFrontmatter(md) {
  // 统一处理 CRLF 和 LF 换行符（兼容 Windows）
  var normalizedMd = md.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  var match = normalizedMd.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { meta: {}, content: normalizedMd };

  var meta = {};
  match[1].split('\n').forEach(function(line) {
    var colonIdx = line.indexOf(':');
    if (colonIdx > 0) {
      var key = line.slice(0, colonIdx).trim();
      var val = line.slice(colonIdx + 1).trim().replace(/^['"]|['"]$/g, '');
      meta[key] = val;
    }
  });

  return { meta: meta, content: match[2] };
}

// ===================== 兼容性补丁 =====================

// Promise.allSettled polyfill（兼容 iOS 12 / Android 旧版）
if (typeof Promise !== 'undefined' && !Promise.allSettled) {
  Promise.allSettled = function(promises) {
    return Promise.all(
      promises.map(function(p) {
        return Promise.resolve(p).then(
          function(value) { return { status: 'fulfilled', value: value }; },
          function(reason) { return { status: 'rejected', reason: reason }; }
        );
      })
    );
  };
}

// fetch with timeout（防止手机网络超时无响应）
function fetchWithTimeout(url, timeoutMs) {
  timeoutMs = timeoutMs || 8000;
  return new Promise(function(resolve, reject) {
    var timer = setTimeout(function() {
      reject(new Error('fetch timeout: ' + url));
    }, timeoutMs);

    fetch(url).then(function(res) {
      clearTimeout(timer);
      resolve(res);
    }).catch(function(err) {
      clearTimeout(timer);
      reject(err);
    });
  });
}

// ===================== 文章加载器 =====================

var PostLoader = {
  cache: null,

  // GitHub 仓库配置（用于自动扫描 posts 目录）
  _githubRepo: 'makeme666/makeme666.github.io',
  _githubBranch: 'main',

  // 诊断日志
  _log: function() {
    if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
      var args = Array.prototype.slice.call(arguments);
      args.unshift('[PostLoader]');
      console.log.apply(console, args);
    }
  },

  // 获取站点基础路径（兼容各种部署环境）
  // - 根域名部署: https://newline.ccwu.cc/  → '/'
  // - 子路径部署: https://xxx.github.io/blog/ → '/blog/'
  _getBasePath: function() {
    var path = location.pathname;
    // 去掉末尾的文件名，只保留目录
    var dir = path.substring(0, path.lastIndexOf('/') + 1);
    // 如果目录是根，返回 /
    if (!dir || dir === '/') return '/';
    return dir;
  },

  // 获取完整资源路径
  _resolvePath: function(relative) {
    if (relative.charAt(0) === '/') return relative;
    var base = this._getBasePath();
    return base + relative;
  },

  // 通过 GitHub API 自动扫描 posts 目录
  _fetchPostsFromGithub: function() {
    var self = this;
    var apiUrl = 'https://api.github.com/repos/' + self._githubRepo + '/contents/posts?ref=' + self._githubBranch;
    self._log('尝试 GitHub API 扫描:', apiUrl);

    return fetchWithTimeout(apiUrl, 8000)
      .then(function(res) {
        if (!res.ok) throw new Error('GitHub API HTTP ' + res.status);
        return res.json();
      })
      .then(function(items) {
        if (!items || !items.length) throw new Error('GitHub API 返回空');
        // 只保留 .md 文件，按名称降序（新文章在前）
        var mdFiles = [];
        for (var i = 0; i < items.length; i++) {
          if (items[i].type === 'file' && items[i].name && /\.md$/i.test(items[i].name)) {
            mdFiles.push(items[i].name);
          }
        }
        mdFiles.sort(function(a, b) { return b.localeCompare(a); });
        if (mdFiles.length === 0) throw new Error('posts 目录无 .md 文件');
        self._log('✓ GitHub API 扫描成功:', mdFiles.length, '篇');
        return mdFiles;
      });
  },

  loadAllPosts: function() {
    var self = this;
    if (self.cache) return Promise.resolve(self.cache);

    var postsPath = self._resolvePath('posts/');
    self._log('文章目录:', postsPath);

    // 默认文章列表（最终兜底）
    var defaultPostsList = [
      '2026-04-18-glassmorphism.md',
      '2026-04-10-why-i-write.md',
      '2026-03-28-spring-afternoon.md',
      '2026-03-15-css-design-tokens.md'
    ];

    // 加载流程：GitHub API → manifest.json → 默认列表
    return self._fetchPostsFromGithub()
      .catch(function(e) {
        self._log('✗ GitHub API 失败:', e.message, '| 尝试 manifest');
        var manifestPath = postsPath + 'manifest.json';
        return fetchWithTimeout(manifestPath, 6000)
          .then(function(res) {
            if (!res.ok) throw new Error('manifest HTTP ' + res.status);
            return res.text();
          })
          .then(function(text) {
            var manifest = JSON.parse(text);
            if (manifest.posts && manifest.posts.length > 0) {
              self._log('✓ manifest 加载成功:', manifest.posts.length, '篇');
              return manifest.posts;
            }
            throw new Error('manifest 为空');
          });
      })
      .catch(function(e) {
        self._log('✗ manifest 失败:', e.message, '| 使用默认列表');
        return defaultPostsList;
      })
      .then(function(postsDir) {
        // 并行加载所有文章
        self._log('并行加载', postsDir.length, '篇文章...');
        var loadTasks = postsDir.map(function(file) {
          return self._loadPost(postsPath, file);
        });
        return Promise.allSettled(loadTasks);
      })
      .then(function(results) {
        var posts = [];
        results.forEach(function(r) {
          if (r.status === 'fulfilled') posts.push(r.value);
        });
        self._log('成功加载', posts.length, '篇文章');
        if (posts.length === 0) self._log('警告: 未能加载任何文章！');
        // 按日期降序排列
        posts.sort(function(a, b) {
          return new Date(b.meta.date || 0) - new Date(a.meta.date || 0);
        });
        self.cache = posts;
        return posts;
      });
  },

  // 单独加载一篇文章
  _loadPost: function(basePath, file) {
    var self = this;
    var filePath = basePath + file;

    return fetchWithTimeout(filePath, 8000)
      .then(function(res) {
        if (!res.ok) {
          self._log('✗ 加载失败:', file, 'status:', res.status);
          throw new Error('HTTP ' + res.status);
        }
        return res.text();
      })
      .then(function(md) {
        self._log('✓ 加载成功:', file);
        var parsed = parseFrontmatter(md);
        return { file: file, meta: parsed.meta, content: parsed.content };
      });
  },

  // 生成文章 URL
  getPostUrl: function(postFile) {
    var base = this._getBasePath();
    var basePath = base === '/' ? 'posts/' : base + 'posts/';
    return 'article.html?post=' + encodeURIComponent(postFile) + '&base=' + encodeURIComponent(basePath);
  },

  // 格式化日期
  formatDate: function(dateStr) {
    if (!dateStr) return '';
    // 加上时间避免时区问题导致日期偏一天
    var d = new Date(dateStr + 'T00:00:00');
    if (isNaN(d.getTime())) return dateStr;
    var y = d.getFullYear();
    var m = d.getMonth() + 1;
    var day = d.getDate();
    return y + '年' + m + '月' + day + '日';
  },

  formatDateShort: function(dateStr) {
    if (!dateStr) return '';
    var d = new Date(dateStr + 'T00:00:00');
    if (isNaN(d.getTime())) return dateStr;
    var m = d.getMonth() + 1;
    var day = d.getDate();
    return m + '月' + day + '日';
  },

  // 提取摘要（取前 120 字，清理 Markdown 格式）
  excerpt: function(content, len) {
    len = len || 120;
    if (!content) return '...';
    var cleaned = content
      .replace(/^#{1,6}\s+.+$/gm, '')
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`[^`]+`/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
      .replace(/[*_~`#>]/g, '')
      .replace(/\n+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return cleaned.slice(0, len) + (cleaned.length > len ? '...' : '');
  }
};
