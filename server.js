const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const root = __dirname;

// ============ 安全配置 ============
const SECURITY_HEADERS = {
  // 防止 MIME 类型嗅探
  'X-Content-Type-Options': 'nosniff',
  // 防止点击劫持
  'X-Frame-Options': 'SAMEORIGIN',
  // XSS 防护
  'X-XSS-Protection': '1; mode=block',
  // 防止 DNS 预读取
  'X-DNS-Prefetch-Control': 'off',
  // 内容安全策略
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-ancestors 'none'"
  ].join('; '),
  // 引用来源策略
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  // 权限策略
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  // 隐藏服务器信息
  'Server': 'SecureWebServer'
};

// 禁止访问的危险路径模式
const BLOCKED_PATHS = [
  /\/\.git/i,
  /\/\.env/i,
  /\.htaccess/i,
  /\.htpasswd/i,
  /config\.php/i,
  /\.bak$/i,
  /\.sql$/i,
  /\.log$/i,
  /\.ini$/i,
  /wp-admin/i,
  /wp-includes/i,
  /wp-content/i,
  /\.ssh/i,
  /\.aws/i,
  /phpinfo/i,
  /phpmyadmin/i
];

// MIME 类型白名单（禁止敏感文件类型）
const ALLOWED_EXTENSIONS = [
  '.html', '.htm', '.css', '.js', '.json',
  '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webp',
  '.mp4', '.webm', '.mp3', '.wav',
  '.pdf', '.txt', '.md',
  '.woff', '.woff2', '.ttf', '.eot'
];

// 允许访问的 JSON 文件白名单
const ALLOWED_JSON_FILES = ['manifest.json'];

// ============ 速率限制（简单实现）============
const requestLog = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1分钟
const RATE_LIMIT_MAX = 500; // 最大请求数（提高限制避免本地预览被限制）

function checkRateLimit(ip) {
  const now = Date.now();
  const record = requestLog.get(ip);
  
  if (!record) {
    requestLog.set(ip, { count: 1, firstRequest: now });
    return true;
  }
  
  // 清除过期记录
  if (now - record.firstRequest > RATE_LIMIT_WINDOW) {
    requestLog.set(ip, { count: 1, firstRequest: now });
    return true;
  }
  
  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }
  
  record.count++;
  return true;
}

// 定期清理过期的速率限制记录
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of requestLog) {
    if (now - record.firstRequest > RATE_LIMIT_WINDOW * 2) {
      requestLog.delete(ip);
    }
  }
}, RATE_LIMIT_WINDOW);

// ============ 请求过滤 ============
function isPathBlocked(reqPath) {
  // 允许 posts/manifest.json
  if (/^\/posts\/manifest\.json$/i.test(reqPath)) return false;
  return BLOCKED_PATHS.some(pattern => pattern.test(reqPath));
}

// ============ HTTP 服务器 ============
http.createServer((req, res) => {
  const clientIp = req.socket.remoteAddress || 'unknown';
  const parsedUrl = url.parse(req.url, true);
  let urlPath = parsedUrl.pathname;

  // 防止路径遍历攻击
  urlPath = urlPath.replace(/\.\./g, '').replace(/\/\./g, '');
  
  // 检查是否在黑名单路径
  if (isPathBlocked(urlPath)) {
    res.writeHead(403, { 
      'Content-Type': 'text/plain;charset=utf-8',
      ...SECURITY_HEADERS
    });
    res.end('403 Forbidden');
    console.log(`[安全] 阻止访问敏感路径: ${urlPath} - IP: ${clientIp}`);
    return;
  }

  // 速率限制检查
  if (!checkRateLimit(clientIp)) {
    res.writeHead(429, { 
      'Content-Type': 'text/plain;charset=utf-8',
      'Retry-After': '60',
      ...SECURITY_HEADERS
    });
    res.end('429 Too Many Requests - 请稍后再试');
    console.log(`[安全] 速率限制触发: IP: ${clientIp}`);
    return;
  }

  // 限制 URL 长度
  if (req.url.length > 2048) {
    res.writeHead(414, { 
      'Content-Type': 'text/plain;charset=utf-8',
      ...SECURITY_HEADERS
    });
    res.end('414 URI Too Long');
    return;
  }

  // 解析文件路径
  let fp = path.join(root, urlPath === '/' ? 'index.html' : urlPath);
  
  // 安全检查：确保文件在根目录内
  if (!fp.startsWith(root)) {
    res.writeHead(403, { 
      'Content-Type': 'text/plain;charset=utf-8',
      ...SECURITY_HEADERS
    });
    res.end('403 Forbidden');
    console.log(`[安全] 路径遍历尝试: ${urlPath} - IP: ${clientIp}`);
    return;
  }

  // 如果没有扩展名，尝试添加 .html
  if (!path.extname(fp)) {
    fp += '.html';
  }

  // 检查文件扩展名是否允许
  const ext = path.extname(fp).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    res.writeHead(403, { 
      'Content-Type': 'text/plain;charset=utf-8',
      ...SECURITY_HEADERS
    });
    res.end('403 Forbidden - 不允许的文件类型');
    return;
  }

  try {
    const d = fs.readFileSync(fp);
    const ext = path.extname(fp);
    const mimeTypes = {
      '.html': 'text/html;charset=utf-8',
      '.htm': 'text/html;charset=utf-8',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon',
      '.webp': 'image/webp',
      '.mp4': 'video/mp4',
      '.webm': 'video/webm',
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav',
      '.pdf': 'application/pdf',
      '.md': 'text/markdown;charset=utf-8',
      '.txt': 'text/plain;charset=utf-8',
      '.woff': 'font/woff',
      '.woff2': 'font/woff2',
      '.ttf': 'font/ttf',
      '.eot': 'application/vnd.ms-fontobject'
    };

    // 缓存控制（静态资源缓存）
    const cacheHeaders = ext.match(/\.(css|js|img|svg|woff|woff2|ttf|eot)$/i)
      ? { 'Cache-Control': 'public, max-age=86400' }  // 1天缓存
      : { 'Cache-Control': 'no-cache, no-store, must-revalidate' };

    res.writeHead(200, { 
      'Content-Type': mimeTypes[ext] || 'application/octet-stream',
      'Content-Length': Buffer.byteLength(d),
      ...SECURITY_HEADERS,
      ...cacheHeaders,
      // 禁止浏览器缓存敏感页面
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    res.end(d);
  } catch (e) {
    res.writeHead(404, { 
      'Content-Type': 'text/plain;charset=utf-8',
      ...SECURITY_HEADERS
    });
    res.end('404 Not Found');
  }
}).listen(3030, () => {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  🔒 安全博客服务器已启动');
  console.log('  🌐 http://localhost:3030');
  console.log('  📁 根目录:', root);
  console.log('═══════════════════════════════════════════════════════');
  console.log('  ✅ 安全防护已启用:');
  console.log('     - HTTP 安全头 (CSP, X-Frame-Options 等)');
  console.log('     - 路径遍历防护');
  console.log('     - 敏感路径拦截');
  console.log('     - 速率限制');
  console.log('     - 文件类型白名单');
  console.log('     - URL 长度限制');
  console.log('═══════════════════════════════════════════════════════');
});
