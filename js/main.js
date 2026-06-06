// ===== Navbar scroll effect =====
window.addEventListener('scroll', function() {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 50);
});

// ===== Mobile menu =====
function toggleMenu() {
  document.getElementById('mobileMenu').classList.toggle('open');
}

// ===== Hero Slider =====
var currentSlide = 0;
var slides = document.querySelectorAll('.slide');
var dotsContainer = document.getElementById('slideDots');
var autoTimer;

// Create dots
slides.forEach(function(_, i) {
  var dot = document.createElement('div');
  dot.className = 'dot' + (i === 0 ? ' active' : '');
  dot.onclick = (function(n) {
    return function() { clearInterval(autoTimer); goToSlide(n); startAuto(); };
  })(i);
  dotsContainer.appendChild(dot);
});

function goToSlide(n) {
  slides[currentSlide].classList.remove('active');
  dotsContainer.children[currentSlide].classList.remove('active');
  currentSlide = (n + slides.length) % slides.length;
  slides[currentSlide].classList.add('active');
  dotsContainer.children[currentSlide].classList.add('active');
}

function changeSlide(dir) {
  clearInterval(autoTimer);
  goToSlide(currentSlide + dir);
  startAuto();
}

function startAuto() {
  autoTimer = setInterval(function() { goToSlide(currentSlide + 1); }, 5000);
}
startAuto();

// ===== News tabs =====
function switchTab(btn, targetId) {
  document.querySelectorAll('.tab-btn').forEach(function(b) { b.classList.remove('active'); });
  document.querySelectorAll('.tab-content').forEach(function(c) { c.classList.remove('active'); });
  btn.classList.add('active');
  document.getElementById(targetId).classList.add('active');
}

// ===== Load news from API =====
var allNewsData = [];

function loadNews() {
  fetch('/api/news?limit=50')
    .then(function(res) {
      if (!res.ok) throw new Error('Failed to load news');
      return res.json();
    })
    .then(function(data) {
      allNewsData = (data.news || data || []).map(function(item) {
        // Map our API fields to what the renderer expects
        return {
          _id: item.id,
          id: item.id,
          title: item.title,
          summary: item.summary || '',
          content: item.content || '',
          category: item.category || 'news',
          tag: item.category === '通知公告' ? '公告' : (item.category === '活动报道' ? '活动' : ''),
          date: item.created_at ? item.created_at.substring(0, 10) : '',
          image: item.cover_image || '',
          featured: false
        };
      });
      renderAllNews(allNewsData);
    })
    .catch(function(err) {
      console.error('新闻加载失败:', err);
      // Show fallback
      ['news-list', 'activity-list', 'notice-list'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.innerHTML = '<p style="color:#999;padding:20px">暂无内容</p>';
      });
    });
}

function renderNewsCard(item) {
  var id = item._id || item.id;
  var dateStr = item.date || '';
  var tagHtml = '';
  if (item.tag) {
    var tagClass = item.category === 'notice' || item.category === '通知公告' ? ' news-tag notice' : ' news-tag';
    tagHtml = '<span class="news-tag' + tagClass + '">' + item.tag + '</span>';
  }
  var imgHtml = '';
  if (item.image) {
    imgHtml = '<div class="news-img"><img src="' + item.image + '" alt="" onerror="this.parentElement.classList.add(\'img-placeholder\')" /></div>';
  }
  var clickAttr = 'onclick="openNewsModal(\'' + id + '\')"';

  if (item.featured && imgHtml) {
    return '<div class="news-card featured" ' + clickAttr + ' style="cursor:pointer">' +
      imgHtml +
      '<div class="news-info">' + tagHtml + '<h3>' + item.title + '</h3><p>' + (item.summary || '') + '</p>' +
      '<div class="news-meta"><span>' + (dateStr ? '📅 ' + dateStr : '') + '</span><span class="read-more">阅读全文 →</span></div>' +
      '</div></div>';
  }
  return '<div class="news-card" ' + clickAttr + ' style="cursor:pointer">' +
    '<div class="news-info">' + tagHtml + '<h3>' + item.title + '</h3><p>' + (item.summary || '') + '</p>' +
    '<div class="news-meta"><span>' + (dateStr ? '📅 ' + dateStr : '') + '</span><span class="read-more">阅读全文 →</span></div>' +
    '</div></div>';
}

function renderAllNews(data) {
  // Tab "最新动态": show all published news
  var newsList = document.getElementById('news-list');
  if (newsList) {
    var newsItems = data.filter(function(n) {
      return !n.category || n.category !== '活动报道' && n.category !== '通知公告';
    });
    if (newsItems.length === 0) newsItems = data; // fallback: show all
    newsList.innerHTML = newsItems.map(renderNewsCard).join('') || '<p style="color:#999;padding:20px">暂无内容</p>';
  }

  // Tab "活动报道"
  var activityList = document.getElementById('activity-list');
  if (activityList) {
    var activityItems = data.filter(function(n) { return n.category === '活动报道'; });
    activityList.innerHTML = activityItems.map(renderNewsCard).join('') || '<p style="color:#999;padding:20px">暂无活动报道</p>';
  }

  // Tab "通知公告"
  var noticeList = document.getElementById('notice-list');
  if (noticeList) {
    var noticeItems = data.filter(function(n) { return n.category === '通知公告'; });
    noticeList.innerHTML = noticeItems.map(renderNewsCard).join('') || '<p style="color:#999;padding:20px">暂无通知公告</p>';
  }

  // Scroll reveal animation for news cards
  document.querySelectorAll('.news-card').forEach(function(el) {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    revealObserver.observe(el);
  });
}

// ===== News Modal =====
function openNewsModal(id) {
  var item = allNewsData.find(function(n) { return (n._id || n.id) == id; });
  if (!item) return;

  var tagEl = document.getElementById('modal-tag');
  tagEl.textContent = item.tag || '';
  tagEl.style.display = item.tag ? 'inline-block' : 'none';
  tagEl.className = (item.category === 'notice' || item.category === '通知公告') ? 'news-tag notice' : 'news-tag';

  document.getElementById('modal-date').textContent = (item.date ? '📅 ' + item.date : '');
  document.getElementById('modal-title-text').textContent = item.title;

  var bodyHtml = '';
  if (item.content) {
    bodyHtml = item.content; // content is already HTML from the API
  } else if (item.summary) {
    bodyHtml = '<p>' + item.summary + '</p><p style="color:#999;margin-top:16px">（完整内容暂未录入）</p>';
  }
  document.getElementById('modal-body-content').innerHTML = bodyHtml;

  document.getElementById('newsModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeNewsModal(e) {
  if (e && e.target !== document.getElementById('newsModal')) return;
  document.getElementById('newsModal').classList.remove('open');
  document.body.style.overflow = '';
}
document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeNewsModal(); });

// ===== Contact form =====
function submitForm(e) {
  e.preventDefault();
  var btn = e.target.querySelector('button[type=submit]');
  btn.textContent = '提交中…';
  btn.disabled = true;

  // For now, just show success (API endpoint for messages not yet implemented)
  setTimeout(function() {
    e.target.style.display = 'none';
    document.getElementById('form-success').style.display = 'block';
  }, 500);
}

// ===== Smooth scroll for anchor links =====
document.querySelectorAll('a[href^="#"]').forEach(function(a) {
  a.addEventListener('click', function(e) {
    var target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      window.scrollTo({ top: target.offsetTop - 70, behavior: 'smooth' });
    }
  });
});

// ===== Scroll reveal animation =====
var revealObserver = new IntersectionObserver(function(entries) {
  entries.forEach(function(entry) {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.ql-item, .org-layer, .criteria-item, .service-card, .pain-item').forEach(function(el) {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  revealObserver.observe(el);
});

// ===== Boot =====
loadNews();
