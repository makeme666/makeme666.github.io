/* ===== main.js - Blog Interactions (optimized) ===== */

// ---- 回到顶部按钮 ----
(function initScrollTop() {
  const btn = document.getElementById('scrollTop');
  if (!btn) return;
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        btn.classList.toggle('visible', window.scrollY > 400);
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
})();

// ---- 导航栏滚动效果 ----
(function initNavbar() {
  const nav = document.querySelector('.navbar');
  if (!nav) return;
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        nav.style.boxShadow = window.scrollY > 10 ? '0 1px 20px rgba(0,0,0,0.08)' : 'none';
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
})();

// ---- 打赏展开/收起 ----
function toggleReward(btn) {
  const qrArea = document.getElementById('rewardQR');
  if (!qrArea) return;
  const show = !qrArea.classList.contains('show');
  qrArea.classList.toggle('show', show);
  btn.innerHTML = show
    ? '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 8l4-4 4 4" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg> 收起'
    : '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2l1.5 3 3.5.5-2.5 2.5.5 3.5L8 10l-3 1.5.5-3.5L3 5.5l3.5-.5L8 2z" stroke="white" stroke-width="1.2" stroke-linejoin="round" fill="rgba(255,255,255,0.3)"/></svg> 打赏支持';
}

// ---- 文章标签筛选 ----
function filterTag(btn, tag) {
  document.querySelectorAll('.tag-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const items = document.querySelectorAll('#articleList [data-tag]');
  let count = 0;
  items.forEach(item => {
    const show = tag === 'all' || item.dataset.tag === tag;
    item.style.display = show ? '' : 'none';
    if (show) count++;
  });
  const emptyTip = document.getElementById('emptyTip');
  if (emptyTip) emptyTip.style.display = count === 0 ? 'block' : 'none';
}

// ---- 文章卡片进入动画（IntersectionObserver，60fps）----
function initCardAnimation() {
  const cards = document.querySelectorAll('.article-card, .article-list-item, .about-card, .reward-section, .search-container');
  if (!cards.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -20px 0px' });
  cards.forEach((card, i) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(16px)';
    card.style.transition = `opacity 0.5s ease ${i * 0.06}s, transform 0.5s ease ${i * 0.06}s, box-shadow 0.3s ease, border-color 0.3s ease`;
    observer.observe(card);
  });
}

// ===================== 励志名言滚动 =====================
const HeroQuotes = [
  { text: '保持饥饿，保持愚蠢', author: '史蒂夫·乔布斯' },
  { text: '做你害怕做的事，然后恐惧就会消失', author: '爱默生' },
  { text: '优秀不是一种行为，而是一种习惯', author: '亚里士多德' },
  { text: '千里之行，始于足下', author: '老子' },
  { text: '学而不思则罔', author: '孔子' },
  { text: '己所不欲，勿施于人', author: '孔子' },
  { text: '上善若水', author: '老子' },
  { text: '凡是过往，皆为序章', author: '莎士比亚' },
];

let currentQuoteIndex = 0;
let quoteTimer = null;

function initHeroQuote() {
  const wrap = document.getElementById('heroQuoteWrap');
  if (!wrap) return;
  
  const textEl = document.getElementById('quoteText');
  const authorEl = document.getElementById('quoteAuthor');
  if (!textEl || !authorEl) return;

  function showQuote(index) {
    const quote = HeroQuotes[index];
    textEl.style.opacity = '0';
    textEl.style.transform = 'translateY(-10px)';
    authorEl.style.opacity = '0';
    authorEl.style.transform = 'translateY(-10px)';
    
    setTimeout(() => {
      textEl.textContent = quote.text;
      authorEl.textContent = '—— ' + quote.author;
      textEl.style.opacity = '1';
      textEl.style.transform = 'translateY(0)';
      authorEl.style.opacity = '1';
      authorEl.style.transform = 'translateY(0)';
    }, 300);
  }

  function nextQuote() {
    currentQuoteIndex = (currentQuoteIndex + 1) % HeroQuotes.length;
    showQuote(currentQuoteIndex);
  }

  // 初始显示
  showQuote(0);
  
  // 每5秒切换
  quoteTimer = setInterval(nextQuote, 5000);
}

// ===================== 文章动态加载 =====================
async function renderArticleCards() {
  const list = document.getElementById('articleList');
  if (!list) return;
  try {
    const posts = await PostLoader.loadAllPosts();
    list.innerHTML = posts.map(post => `
      <a href="${PostLoader.getPostUrl(post.file)}" class="article-card" data-tag="${post.meta.tag}">
        <div class="article-card-meta">
          <span class="article-date">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M11 2H5a3 3 0 00-3 3v6a3 3 0 003 3h6a3 3 0 003-3V5a3 3 0 00-3-3z" stroke="currentColor" stroke-width="1.5"/><path d="M8 7v3M8 5.5v.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
            ${PostLoader.formatDate(post.meta.date)}
          </span>
          <span class="article-tag">${post.meta.tag}</span>
        </div>
        <h3 class="article-title">${post.meta.title}</h3>
        <p class="article-excerpt">${PostLoader.excerpt(post.content)}</p>
        <span class="article-read-more">阅读全文 <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
      </a>`).join('');
    const countEl = document.getElementById('articleCount');
    if (countEl) countEl.textContent = `共 ${posts.length} 篇 · 持续更新中`;
    initCardAnimation();
  } catch(e) {
    list.innerHTML = '<p style="text-align:center;color:#aeaeb2;padding:40px 0;">加载文章失败，请刷新重试</p>';
  }
}

async function renderArticleList() {
  const list = document.getElementById('articleList');
  if (!list) return;
  try {
    const posts = await PostLoader.loadAllPosts();
    const years = {};
    posts.forEach(post => {
      const y = new Date(post.meta.date).getFullYear();
      if (!years[y]) years[y] = [];
      years[y].push(post);
    });
    let html = '';
    Object.keys(years).sort((a, b) => b - a).forEach(year => {
      html += `<div class="year-label">${year}</div>`;
      years[year].forEach(post => {
        html += `<a href="${PostLoader.getPostUrl(post.file)}" class="article-list-item" data-tag="${post.meta.tag}">
          <span class="article-list-item-title">${post.meta.title}<span class="article-tag" style="margin-left:8px;">${post.meta.tag}</span></span>
          <span class="article-list-item-date">${PostLoader.formatDateShort(post.meta.date)}</span>
        </a>`;
      });
    });
    list.innerHTML = html;
    const countEl = document.getElementById('articleCount');
    if (countEl) countEl.textContent = `共 ${posts.length} 篇 · 持续更新中`;
    const tagCounts = {};
    posts.forEach(p => { tagCounts[p.meta.tag] = (tagCounts[p.meta.tag] || 0) + 1; });
    document.querySelectorAll('.tag-btn[data-tag]').forEach(btn => {
      const tag = btn.dataset.tag;
      if (tag === 'all') btn.textContent = `全部 (${posts.length})`;
      else if (tagCounts[tag]) btn.textContent = `${tag} (${tagCounts[tag]})`;
    });
    initCardAnimation();
  } catch(e) { /* 静默处理 */ }
}

// ===================== 搜索功能 =====================
let searchTimer = null;

function initSearch() {
  const input = document.getElementById('searchInput');
  const clearBtn = document.getElementById('searchClear');
  if (!input) return;
  
  input.addEventListener('input', () => {
    clearTimeout(searchTimer);
    const q = input.value.trim();
    clearBtn && clearBtn.classList.toggle('show', q.length > 0);
    searchTimer = setTimeout(() => searchArticles(q), 200);
  });
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      input.value = '';
      clearBtn.classList.remove('show');
      searchArticles('');
      input.focus();
    });
  }
}

// 页面卸载时清理计时器
window.addEventListener('beforeunload', () => {
  if (searchTimer) clearTimeout(searchTimer);
});

async function searchArticles(keyword) {
  const list = document.getElementById('articleList');
  if (!list) return;
  if (!keyword) { await renderArticleList(); const h=document.getElementById('searchHint'); if(h)h.textContent=''; return; }
  const posts = await PostLoader.loadAllPosts();
  const kw = keyword.toLowerCase();
  const results = posts.filter(p =>
    p.meta.title.toLowerCase().includes(kw) ||
    p.meta.tag.toLowerCase().includes(kw) ||
    p.content.toLowerCase().includes(kw)
  );
  if (!results.length) {
    list.innerHTML = `<div style="text-align:center;padding:60px 0;color:#aeaeb2;"><div style="font-size:32px;margin-bottom:12px;">🔍</div>没有找到与「${escapeHtml(keyword)}」相关的文章</div>`;
  } else {
    list.innerHTML = results.map(post => `
      <a href="${PostLoader.getPostUrl(post.file)}" class="article-list-item" data-tag="${post.meta.tag}">
        <span class="article-list-item-title">${post.meta.title}<span class="article-tag" style="margin-left:8px;">${post.meta.tag}</span></span>
        <span class="article-list-item-date">${PostLoader.formatDateShort(post.meta.date)}</span>
      </a>`).join('');
  }
  const hint = document.getElementById('searchHint');
  if (hint) hint.textContent = keyword ? `找到 ${results.length} 篇相关文章` : '';
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ===================== 页面初始化 =====================
document.addEventListener('DOMContentLoaded', () => {
  initHeroQuote();
  initSearch();
});
