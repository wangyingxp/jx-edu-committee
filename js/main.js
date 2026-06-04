/**
 * 上海江西商会教工委 - 公共JavaScript工具函数
 */

// 导航高亮
function initNavHighlight() {
  const path = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav a');
  navLinks.forEach(link => {
    link.classList.remove('active');
    const href = link.getAttribute('href');
    if (href === '/') {
      if (path === '/' || path === '') link.classList.add('active');
    } else if (href === '/news') {
      if (path.startsWith('/news')) link.classList.add('active');
    } else if (path === href) {
      link.classList.add('active');
    }
  });
}

// 获取新闻列表（通用）
async function fetchNewsList(params = {}) {
  const { category, page = 1, limit = 10 } = params;
  let url = `/api/news?page=${page}&limit=${limit}`;
  if (category && category !== '全部') {
    url += `&category=${encodeURIComponent(category)}`;
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error('获取新闻失败');
  return res.json();
}

// 获取分类列表
async function fetchCategories() {
  const res = await fetch('/api/categories');
  if (!res.ok) throw new Error('获取分类失败');
  return res.json();
}

// 日期格式化
function formatDate(dateStr) {
  const d = new Date(dateStr);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 获取月份名称
function getMonthName(dateStr) {
  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
  const d = new Date(dateStr);
  return months[d.getMonth()];
}

// 渲染新闻卡片（用于首页）
function renderNewsCards(newsArray, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!newsArray || newsArray.length === 0) {
    container.innerHTML = '<p style="text-align:center;color:var(--text-light);padding:40px;">暂无新闻</p>';
    return;
  }

  container.innerHTML = newsArray.map(item => `
    <div class="news-card">
      <div class="news-card-image"${item.cover_image ? ` style="background-image:url('${escapeHtml(item.cover_image)}');background-size:cover;background-position:center;"` : ''}>
        ${item.cover_image ? '' : '📰'}
      </div>
      <div class="news-card-body">
        <span class="news-card-category">${escapeHtml(item.category)}</span>
        <h4><a href="/news/${item.id}">${escapeHtml(item.title)}</a></h4>
        <p>${escapeHtml(item.summary || item.content?.substring(0, 100) || '')}</p>
        <div class="news-card-date">${formatDate(item.created_at)}</div>
      </div>
    </div>
  `).join('');
}

// HTML转义
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  initNavHighlight();
});
