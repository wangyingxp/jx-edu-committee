const express = require('express');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'jx-edu-committee-jwt-secret-2026';

// ====== Data Layer ======
// Reads: from local data.json (bundled with deployment)
// Writes: via GitHub API (commits to repo, triggers Vercel redeploy)
// Without GITHUB_TOKEN: read-only mode (serves seed data from file)

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const GITHUB_REPO = process.env.GITHUB_REPO || ''; // e.g. "username/repo"
const DATA_FILE = path.join(__dirname, '..', 'data.json');

// Embedded fallback seed data
const SEED_USERS = [
  { id: 1, username: 'admin', password: 'jxedu2026', created_at: '2026-04-01T00:00:00.000Z' }
];

const SEED_NEWS = [
  { id: 1, title: '上海江西商会教工委正式成立', category: '机构动态', summary: '经上海江西商会批准，教育服务工作委员会于2026年4月正式成立，标志着商会服务会员家庭教育工作进入新阶段。', content: '<p>经上海江西商会理事会审议批准，<strong>上海江西商会教育服务工作委员会</strong>（以下简称"教工委"）于2026年4月正式成立。</p><p>教工委的成立，是商会回应广大会员家庭在子女教育方面实际需求的重要举措。随着越来越多赣籍企业家在上海长期发展，子女教育问题已成为影响家庭稳定和事业发展的重要因素。</p><p>教工委定位为服务商会会员家庭子女教育事务的专业支持与协同平台，同时作为沪赣两地教育交流与人才对接的桥梁纽带。通过搭建这一平台，商会将更好地服务会员、凝聚力量。</p>', is_published: 1, created_at: '2026-04-15T10:00:00.000Z', updated_at: '2026-04-15T10:00:00.000Z' },
  { id: 2, title: '教工委试运营方案公布：分三阶段稳步推进', category: '机构动态', summary: '教工委公布2026年4-9月试运营方案，分为启动期、验证期和评估期三个阶段，确保各项服务稳健落地。', content: '<p>为确保教工委各项工作稳步推进，秘书处制定了<strong>2026年4月至9月试运营方案</strong>，分三个阶段实施：</p><h3>第一阶段：启动期（2026年4-5月）</h3><ul><li>完成组织架构搭建</li><li>组建秘书处工作团队</li><li>建立基础运行制度</li><li>首批专家顾问邀请</li></ul><h3>第二阶段：验证期（2026年6-8月）</h3><ul><li>启动教育信息定期发布</li><li>组织首次主题沙龙活动</li><li>试行教育服务甄选机制</li><li>开展沪赣教育交流对接</li></ul><h3>第三阶段：评估期（2026年9月）</h3><ul><li>试运营工作总结评估</li><li>收集会员反馈意见</li><li>形成正式运营方案</li></ul>', is_published: 1, created_at: '2026-04-20T09:00:00.000Z', updated_at: '2026-04-20T09:00:00.000Z' },
  { id: 3, title: '教工委首批专家顾问团队组建完成', category: '机构动态', summary: '经过前期筹备，教工委已成功邀请15位来自教育领域的专家学者担任顾问，涵盖基础教育、高等教育、职业教育等多个领域。', content: '<p>经过前期认真筹备和广泛联络，教工委<strong>首批专家顾问团队</strong>已组建完成，共邀请15位在教育领域具有丰富经验和深厚造诣的专家学者。</p><p>顾问团队涵盖以下领域：</p><ul><li>基础教育政策研究</li><li>高等教育招生与培养</li><li>职业教育与技能培训</li><li>国际教育交流</li><li>教育心理学与家庭教育</li></ul><p>专家顾问将为教工委提供政策解读、专业咨询和活动支持，为会员家庭提供权威、可靠的教育指导。</p>', is_published: 1, created_at: '2026-05-05T08:00:00.000Z', updated_at: '2026-05-05T08:00:00.000Z' },
  { id: 4, title: '教工委首场主题沙龙成功举办：聚焦中考改革', category: '活动报道', summary: '5月20日，教工委举办首场"教育面对面"主题沙龙活动，邀请教育专家就上海中考改革政策进行深度解读，吸引30余位会员家庭参与。', content: '<p>2026年5月20日，教工委首场<strong>"教育面对面"主题沙龙</strong>在商会会议室成功举办。本次活动聚焦上海中考改革政策，邀请到上海市教育科学研究院专家进行深度解读。</p><p>活动现场气氛热烈，30余位会员家庭积极参与。专家就以下议题进行了详细讲解：</p><ul><li>上海中考最新政策变化</li><li>名额分配综合评价录取办法</li><li>志愿填报策略与注意事项</li><li>学科备考建议</li></ul><p>在互动环节，会员家长们踊跃提问，专家一一耐心解答。参会会员纷纷表示沙龙内容务实、收获很大。</p>', is_published: 1, created_at: '2026-05-21T14:00:00.000Z', updated_at: '2026-05-21T14:00:00.000Z' },
  { id: 5, title: '沪赣教育交流：第一批校际结对共建意向达成', category: '沪赣交流', summary: '在教工委推动下，上海与江西两地首批5对中小学达成校际结对共建意向，将在师资交流、课程共享等方面开展合作。', content: '<p>在教工委的积极推动和协调下，<strong>上海与江西两地首批校际结对共建</strong>已达成意向。共有5对中小学表达了结对意愿，将在以下方面开展合作：</p><ul><li>教师互访与教学研讨</li><li>优质课程资源共享</li><li>学生线上交流活动</li><li>教育管理经验交流</li></ul><p>此次结对共建是教工委"沪赣教育与人才双向交流"核心服务的重要实践成果，也是推动两地教育资源协同发展的良好开端。</p>', is_published: 1, created_at: '2026-05-28T11:00:00.000Z', updated_at: '2026-05-28T11:00:00.000Z' },
  { id: 6, title: '教工委发布首期教育信息简报', category: '教育资讯', summary: '教工委正式推出每周教育信息简报服务，首期聚焦2026年上海义务教育阶段招生政策要点，以简明清晰的方式为会员提供关键信息。', content: '<p>教工委正式推出<strong>每周教育信息简报</strong>服务，首期于6月1日发布。这是教工委"教育信息支持"核心服务的重要落地举措。</p><p>首期简报聚焦<strong>2026年上海义务教育阶段招生政策要点</strong>，主要内容包括：</p><ul><li>2026年"幼升小"入学政策梳理</li><li>"小升初"招生日程与关键节点</li><li>各区招生政策差异对比</li><li>常见问题解答</li></ul><p>简报以简明清晰的表格和要点形式呈现，帮助会员快速获取关键信息，降低政策理解门槛。今后简报将于每周一发布，涵盖升学政策、教育动态、资源推荐等内容。</p>', is_published: 1, created_at: '2026-06-01T07:00:00.000Z', updated_at: '2026-06-01T07:00:00.000Z' }
];

function loadLocalData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      // Object format: {news, users, nextId}
      if (parsed.news && parsed.users && typeof parsed.nextId === 'number') return parsed;
      // Array format: convert to object
      if (Array.isArray(parsed)) {
        const maxId = parsed.reduce((max, n) => Math.max(max, n.id || 0), 0);
        return { news: parsed, users: [...SEED_USERS], nextId: maxId + 1 };
      }
    }
  } catch (e) { /* fall through */ }
  return { news: [...SEED_NEWS], users: [...SEED_USERS], nextId: SEED_NEWS.length + 1 };
}

// In-memory cache for the current session
let cachedData = null;
function getLocalData() {
  if (!cachedData) cachedData = loadLocalData();
  return cachedData;
}

// Check if GitHub write is configured
function canWriteToGitHub() {
  return !!(GITHUB_TOKEN && GITHUB_REPO);
}

// Read from GitHub (gets latest data.json from repo)
// Handles both formats: array of news items, or {news, users, nextId} object
async function githubRead() {
  const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/data.json`;
  const headers = { Accept: 'application/vnd.github.v3+json' };
  if (GITHUB_TOKEN) headers.Authorization = `Bearer ${GITHUB_TOKEN}`;

  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`GitHub read failed: ${res.status}`);
  const file = await res.json();
  const content = file.content ? Buffer.from(file.content, 'base64').toString('utf8') : '';
  
  let data;
  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) {
      // Array format: convert to proper structure
      const news = parsed.map(item => ({
        id: item.id, title: item.title, category: item.category,
        content: item.content, summary: item.summary || '',
        cover_image: item.cover_image || '',
        is_published: item.is_published !== undefined ? item.is_published : 1,
        created_at: item.created_at || new Date().toISOString(),
        updated_at: item.updated_at || item.created_at || new Date().toISOString()
      }));
      data = { news, users: [...SEED_USERS], nextId: Math.max(...news.map(n => n.id), 0) + 1 };
    } else {
      data = parsed;
    }
  } catch (e) {
    throw new Error(`GitHub JSON parse error: ${e.message}`);
  }
  
  return { data, sha: file.sha };
}

// Write to GitHub (commits updated data.json)
async function githubWrite(data, commitMsg) {
  // First get current file to obtain its SHA
  const { sha } = await githubRead();

  const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/data.json`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      'Content-Type': 'application/json',
      Accept: 'application/vnd.github.v3+json'
    },
    body: JSON.stringify({
      message: commitMsg || '更新新闻数据',
      content: Buffer.from(JSON.stringify(data, null, 2)).toString('base64'),
      sha: sha
    })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`GitHub write failed: ${res.status} ${err.message || ''}`);
  }
  return res.json();
}

// ====== Middleware ======
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ====== API Routes ======

// Get published news list
app.get('/api/news', (req, res) => {
  try {
    const data = getLocalData();
    const { category, page = 1, limit = 10 } = req.query;
    let news = data.news.filter(n => n.is_published);

    if (category) {
      news = news.filter(n => n.category === category);
    }

    news.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const total = news.length;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const paged = news.slice(offset, offset + parseInt(limit));

    const result = paged.map(n => ({
      id: n.id, title: n.title, category: n.category,
      summary: n.summary, cover_image: n.cover_image || '',
      created_at: n.created_at
    }));

    res.json({ news: result, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    console.error('GET /api/news error:', err.message);
    res.status(500).json({ error: '服务器错误' });
  }
});

// Get categories
app.get('/api/categories', (req, res) => {
  try {
    const data = getLocalData();
    const categories = [...new Set(data.news.filter(n => n.is_published).map(n => n.category))];
    res.json(categories.map(c => ({ category: c })));
  } catch (err) {
    res.status(500).json({ error: '服务器错误' });
  }
});

// Get single news (public, only published)
app.get('/api/news/:id', (req, res) => {
  try {
    const data = getLocalData();
    const news = data.news.find(n => n.id === parseInt(req.params.id) && n.is_published);
    if (!news) return res.status(404).json({ error: '文章不存在' });
    res.json(news);
  } catch (err) {
    res.status(500).json({ error: '服务器错误' });
  }
});

// Get banners
app.get('/api/banners', (req, res) => {
  res.json([]);
});

// ====== Admin Auth (JWT-based) ======

app.post('/api/admin/login', (req, res) => {
  try {
    const data = getLocalData();
    const { username, password } = req.body;
    const user = data.users.find(u => u.username === username && u.password === password);
    if (user) {
      const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
      res.json({ success: true, token });
    } else {
      res.status(401).json({ error: '用户名或密码错误' });
    }
  } catch (err) {
    res.status(500).json({ error: '服务器错误' });
  }
});

app.post('/api/admin/logout', (req, res) => {
  res.json({ success: true });
});

app.get('/api/admin/check', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.json({ isAdmin: false });
  try {
    const token = authHeader.replace('Bearer ', '');
    jwt.verify(token, JWT_SECRET);
    res.json({ isAdmin: true });
  } catch (e) {
    res.json({ isAdmin: false });
  }
});

function adminAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: '请先登录' });
  try {
    const token = authHeader.replace('Bearer ', '');
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (e) {
    res.status(401).json({ error: '登录已过期，请重新登录' });
  }
}

// ====== Admin News CRUD ======

app.get('/api/admin/news', adminAuth, (req, res) => {
  try {
    const data = getLocalData();
    const news = [...data.news].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    res.json(news);
  } catch (err) {
    res.status(500).json({ error: '服务器错误' });
  }
});

app.get('/api/admin/news/:id', adminAuth, (req, res) => {
  try {
    const data = getLocalData();
    const news = data.news.find(n => n.id === parseInt(req.params.id));
    if (!news) return res.status(404).json({ error: '文章不存在' });
    res.json(news);
  } catch (err) {
    res.status(500).json({ error: '服务器错误' });
  }
});

app.post('/api/admin/news', adminAuth, async (req, res) => {
  try {
    const data = getLocalData();
    const { title, category, content, summary, cover_image, is_published } = req.body;
    const now = new Date().toISOString();
    const newItem = {
      id: data.nextId++,
      title,
      category: category || '新闻动态',
      content: content || '',
      summary: summary || '',
      cover_image: cover_image || '',
      is_published: is_published !== undefined ? is_published : 1,
      created_at: now,
      updated_at: now
    };
    data.news.push(newItem);

    let gitError = null;
    if (canWriteToGitHub()) {
      try {
        await githubWrite(data, `发布新闻: ${title}`);
      } catch (e) {
        console.error('GitHub write error:', e.message);
        gitError = e.message;
      }
    }

    res.json({ success: true, id: newItem.id, githubSync: canWriteToGitHub() && !gitError, gitError });
  } catch (err) {
    console.error('POST /api/admin/news error:', err.message);
    res.status(500).json({ error: '服务器错误' });
  }
});

app.put('/api/admin/news/:id', adminAuth, async (req, res) => {
  try {
    const data = getLocalData();
    const { title, category, content, summary, cover_image, is_published } = req.body;
    const item = data.news.find(n => n.id === parseInt(req.params.id));
    if (!item) return res.status(404).json({ error: '文章不存在' });

    if (title !== undefined) item.title = title;
    if (category !== undefined) item.category = category;
    if (content !== undefined) item.content = content;
    if (summary !== undefined) item.summary = summary;
    if (cover_image !== undefined) item.cover_image = cover_image;
    if (is_published !== undefined) item.is_published = is_published;
    item.updated_at = new Date().toISOString();

    // Try GitHub write if configured
    let gitError = null;
    if (canWriteToGitHub()) {
      try {
        await githubWrite(data, `编辑新闻: ${item.title}`);
      } catch (e) {
        console.error('GitHub write error:', e.message);
        gitError = e.message;
      }
    }

    res.json({ success: true, githubSync: canWriteToGitHub() && !gitError, gitError });
  } catch (err) {
    console.error('PUT /api/admin/news/:id error:', err.message);
    res.status(500).json({ error: '服务器错误' });
  }
});

app.delete('/api/admin/news/:id', adminAuth, async (req, res) => {
  try {
    const data = getLocalData();
    const item = data.news.find(n => n.id === parseInt(req.params.id));
    data.news = data.news.filter(n => n.id !== parseInt(req.params.id));

    // Try GitHub write if configured
    if (canWriteToGitHub()) {
      try {
        await githubWrite(data, `删除新闻: ${item?.title || '未知'}`);
      } catch (e) {
        console.error('GitHub write error:', e.message);
      }
    }

    res.json({ success: true, githubSync: canWriteToGitHub() });
  } catch (err) {
    console.error('DELETE /api/admin/news/:id error:', err.message);
    res.status(500).json({ error: '服务器错误' });
  }
});

// Status endpoint to check GitHub config
app.get('/api/admin/status', adminAuth, (req, res) => {
  res.json({
    githubConfigured: canWriteToGitHub(),
    repo: GITHUB_REPO || '(未配置)'
  });
});

// Export for Vercel serverless
module.exports = app;
