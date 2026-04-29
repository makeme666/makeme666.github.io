/* ===== main.js - Blog Interactions ===== */

// ---- 回到顶部按钮 ----
(function initScrollTop() {
  var btn = document.getElementById('scrollTop');
  if (!btn) return;
  window.addEventListener('scroll', function() {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
})();

// ---- 导航栏滚动效果 ----
(function initNavbar() {
  var nav = document.querySelector('.navbar');
  if (!nav) return;
  window.addEventListener('scroll', function() {
    nav.style.boxShadow = window.scrollY > 10 ? '0 1px 20px rgba(0,0,0,0.08)' : 'none';
  }, { passive: true });
})();

// ---- 打赏展开/收起 ----
function toggleReward(btn) {
  var qrArea = document.getElementById('rewardQR');
  if (!qrArea) return;
  var show = !qrArea.classList.contains('show');
  qrArea.classList.toggle('show', show);
  btn.innerHTML = show
    ? '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 8l4-4 4 4" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg> 收起'
    : '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2l1.5 3 3.5.5-2.5 2.5.5 3.5L8 10l-3 1.5.5-3.5L3 5.5l3.5-.5L8 2z" stroke="white" stroke-width="1.2" stroke-linejoin="round" fill="rgba(255,255,255,0.3)"/></svg> 打赏支持';
}

// ---- 文章标签筛选 ----
function filterTag(btn, tag) {
  var btns = document.querySelectorAll('.tag-btn');
  for (var i = 0; i < btns.length; i++) btns[i].classList.remove('active');
  btn.classList.add('active');
  var items = document.querySelectorAll('#articleList [data-tag]');
  var count = 0;
  for (var j = 0; j < items.length; j++) {
    var show = tag === 'all' || items[j].dataset.tag === tag;
    items[j].style.display = show ? '' : 'none';
    if (show) count++;
  }
  var emptyTip = document.getElementById('emptyTip');
  if (emptyTip) emptyTip.style.display = count === 0 ? 'block' : 'none';
}

// ---- 文章卡片进入动画 ----
(function initCardAnimation() {
  var cards = document.querySelectorAll('.article-card, .article-list-item, .about-card, .reward-section, .search-container');
  if (!cards.length) return;
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -20px 0px' });
  cards.forEach(function(card, i) {
    card.style.opacity = '0';
    card.style.transform = 'translateY(16px)';
    card.style.transition = 'opacity 0.5s ease ' + (i * 0.06) + 's, transform 0.5s ease ' + (i * 0.06) + 's, box-shadow 0.3s ease, border-color 0.3s ease';
    observer.observe(card);
  });
})();

// ===================== 励志名言滚动 =====================
var Quotes = [
  { text: '保持饥饿，保持愚蠢', author: '史蒂夫·乔布斯' },
  { text: '做你害怕做的事，恐惧就会消失', author: '爱默生' },
  { text: '优秀不是一种行为，而是一种习惯', author: '亚里士多德' },
  { text: '千里之行，始于足下', author: '老子' },
  { text: '学而不思则罔', author: '孔子' },
  { text: '己所不欲，勿施于人', author: '孔子' },
  { text: '上善若水', author: '老子' },
  { text: '凡是过往，皆为序章', author: '莎士比亚' },
];

var currentQuote = 0;
window._quoteTimer = null;

function initQuoteRotator() {
  var container = document.getElementById('quoteRotator');
  if (!container) return;

  // 动态创建所有名言 DOM
  for (var i = 0; i < Quotes.length; i++) {
    var div = document.createElement('div');
    div.className = 'quote-item' + (i === 0 ? ' active' : '');
    div.innerHTML = '<div class="quote-text">' + Quotes[i].text + '</div><div class="quote-author">\u2014\u2014 ' + Quotes[i].author + '</div>';
    container.appendChild(div);
  }

  // 清除旧计时器，防止重复
  if (window._quoteTimer) clearInterval(window._quoteTimer);
  window._quoteTimer = setInterval(rotateQuote, 5000);
}

function rotateQuote() {
  var container = document.getElementById('quoteRotator');
  if (!container) return;
  var items = container.querySelectorAll('.quote-item');
  var current = items[currentQuote];
  var next = items[(currentQuote + 1) % items.length];

  current.classList.remove('active');
  current.classList.add('exit');

  setTimeout(function() {
    current.classList.remove('exit');
    next.classList.add('active');
    currentQuote = (currentQuote + 1) % items.length;
  }, 400);
}

// ===================== 文章动态加载 =====================
async function renderArticleCards() {
  var list = document.getElementById('articleList');
  if (!list) return;
  try {
    var posts = await PostLoader.loadAllPosts();
    list.innerHTML = posts.map(function(post) {
      return '<a href="' + PostLoader.getPostUrl(post.file) + '" class="article-card" data-tag="' + (post.meta.tag || '') + '">'
        + '<div class="article-card-meta">'
          + '<span class="article-date">'
            + '<svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M11 2H5a3 3 0 00-3 3v6a3 3 0 003 3h6a3 3 0 003-3V5a3 3 0 00-3-3z" stroke="currentColor" stroke-width="1.5"/><path d="M8 7v3M8 5.5v.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>'
            + PostLoader.formatDate(post.meta.date || '')
          + '</span>'
          + '<span class="article-tag">' + (post.meta.tag || '未分类') + '</span>'
        + '</div>'
        + '<h3 class="article-title">' + (post.meta.title || '无标题') + '</h3>'
        + '<p class="article-excerpt">' + PostLoader.excerpt(post.content) + '</p>'
        + '<span class="article-read-more">阅读全文 <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>'
        + '</a>';
    }).join('');
    var countEl = document.getElementById('articleCount');
    if (countEl) countEl.textContent = '\u5171 ' + posts.length + ' \u7bc7 \u00b7 \u6301\u7eed\u66f4\u65b0\u4e2d';
    initCardAnimation();
  } catch (e) {
    console.error('Failed to render articles:', e);
    list.innerHTML = '<p style="text-align:center;color:#aeaeb2;padding:40px 0;">\u52a0\u8f7d\u6587\u7ae0\u5931\u8d25\uff0c\u8bf7\u5237\u65b0\u91cd\u8bd5</p>';
  }
}

async function renderArticleList() {
  var list = document.getElementById('articleList');
  if (!list) return;
  try {
    var posts = await PostLoader.loadAllPosts();
    var years = {};
    posts.forEach(function(post) {
      var y = new Date(post.meta.date).getFullYear();
      if (!years[y]) years[y] = [];
      years[y].push(post);
    });
    var html = '';
    Object.keys(years).sort(function(a, b) { return b - a; }).forEach(function(year) {
      html += '<div class="year-label">' + year + '</div>';
      years[year].forEach(function(post) {
        html += '<a href="' + PostLoader.getPostUrl(post.file) + '" class="article-list-item" data-tag="' + (post.meta.tag || '') + '">'
          + '<span class="article-list-item-title">' + (post.meta.title || '无标题') + '<span class="article-tag" style="margin-left:8px;">' + (post.meta.tag || '') + '</span></span>'
          + '<span class="article-list-item-date">' + PostLoader.formatDateShort(post.meta.date || '') + '</span>'
          + '</a>';
      });
    });
    list.innerHTML = html;
    var countEl = document.getElementById('articleCount');
    if (countEl) countEl.textContent = '\u5171 ' + posts.length + ' \u7bc7 \u00b7 \u6301\u7eed\u66f4\u65b0\u4e2d';
    var tagCounts = {};
    posts.forEach(function(p) { tagCounts[p.meta.tag] = (tagCounts[p.meta.tag] || 0) + 1; });
    document.querySelectorAll('.tag-btn[data-tag]').forEach(function(btn) {
      var tag = btn.dataset.tag;
      if (tag === 'all') btn.textContent = '\u5168\u90e8 (' + posts.length + ')';
      else if (tagCounts[tag]) btn.textContent = tag + ' (' + tagCounts[tag] + ')';
    });
    initCardAnimation();
  } catch (e) { console.error('Failed to render article list:', e); }
}

// ===================== 搜索功能 =====================
function initSearch() {
  var input = document.getElementById('searchInput');
  var clearBtn = document.getElementById('searchClear');
  if (!input) return;
  var timer;
  input.addEventListener('input', function() {
    clearTimeout(timer);
    var q = input.value.trim();
    clearBtn && clearBtn.classList.toggle('show', q.length > 0);
    timer = setTimeout(function() { searchArticles(q); }, 200);
  });
  if (clearBtn) {
    clearBtn.addEventListener('click', function() {
      input.value = '';
      clearBtn.classList.remove('show');
      searchArticles('');
      input.focus();
    });
  }
}

async function searchArticles(keyword) {
  var list = document.getElementById('articleList');
  if (!list) return;
  if (!keyword) {
    await renderArticleList();
    var hint = document.getElementById('searchHint');
    if (hint) hint.textContent = '';
    return;
  }
  var posts = await PostLoader.loadAllPosts();
  var kw = keyword.toLowerCase();
  var results = posts.filter(function(p) {
    return (p.meta.title || '').toLowerCase().indexOf(kw) !== -1 ||
           (p.meta.tag || '').toLowerCase().indexOf(kw) !== -1 ||
           (p.content || '').toLowerCase().indexOf(kw) !== -1;
  });
  if (results.length === 0) {
    list.innerHTML = '<div style="text-align:center;padding:60px 0;color:#aeaeb2;">'
      + '<div style="font-size:32px;margin-bottom:12px;">\ud83d\udd0d</div>'
      + '\u6ca1\u6709\u627e\u5230\u4e0e\u300c' + escapeHtml(keyword) + '\u300d\u76f8\u5173\u7684\u6587\u7ae0'
      + '</div>';
  } else {
    var html = '';
    results.forEach(function(post) {
      html += '<a href="' + PostLoader.getPostUrl(post.file) + '" class="article-list-item" data-tag="' + (post.meta.tag || '') + '">'
        + '<span class="article-list-item-title">' + (post.meta.title || '无标题') + '<span class="article-tag" style="margin-left:8px;">' + (post.meta.tag || '') + '</span></span>'
        + '<span class="article-list-item-date">' + PostLoader.formatDateShort(post.meta.date || '') + '</span>'
        + '</a>';
    });
    list.innerHTML = html;
  }
  var hint = document.getElementById('searchHint');
  if (hint) hint.textContent = keyword ? '\u627e\u5230 ' + results.length + ' \u7bc7\u76f8\u5173\u6587\u7ae0' : '';
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ===================== 页面初始化 =====================
document.addEventListener('DOMContentLoaded', function() {
  initQuoteRotator();
  initSearch();
});
