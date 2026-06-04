const express = require('express');
const session = require('express-session');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Database setup
const db = new Database(path.join(__dirname, 'data.db'));
db.pragma('journal_mode = WAL');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS news (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT '新闻动态',
    content TEXT NOT NULL,
    summary TEXT,
    cover_image TEXT,
    is_published INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS banners (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    subtitle TEXT,
    image_url TEXT,
    link_url TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1
  );
`);

// Create default admin if not exists
const adminExists = db.prepare('SELECT id FROM users WHERE username = ?').get('admin');
if (!adminExists) {
  db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run('admin', 'jxedu2026');
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'jx-edu-committee-secret-key-2026',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

// ====== API Routes ======

// Get published news list
app.get('/api/news', (req, res) => {
  const { category, page = 1, limit = 10 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  
  let sql = 'SELECT id, title, category, summary, cover_image, created_at FROM news WHERE is_published = 1';
  let countSql = 'SELECT COUNT(*) as total FROM news WHERE is_published = 1';
  const params = [];
  
  if (category) {
    sql += ' AND category = ?';
    countSql += ' AND category = ?';
    params.push(category);
  }
  
  sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), offset);
  
  const news = db.prepare(sql).all(...params);
  const { total } = db.prepare(countSql).all(...params.slice(0, -2))[0];
  
  res.json({ news, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
});

// Get categories
app.get('/api/categories', (req, res) => {
  const categories = db.prepare('SELECT DISTINCT category FROM news WHERE is_published = 1 ORDER BY category').all();
  res.json(categories);
});

// Get single news by id
app.get('/api/news/:id', (req, res) => {
  const news = db.prepare('SELECT * FROM news WHERE id = ? AND is_published = 1').get(req.params.id);
  if (!news) return res.status(404).json({ error: '文章不存在' });
  res.json(news);
});

// Get banners
app.get('/api/banners', (req, res) => {
  const banners = db.prepare('SELECT * FROM banners WHERE is_active = 1 ORDER BY sort_order ASC').all();
  res.json(banners);
});

// ====== Admin Auth ======

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE username = ? AND password = ?').get(username, password);
  if (user) {
    req.session.isAdmin = true;
    req.session.userId = user.id;
    res.json({ success: true });
  } else {
    res.status(401).json({ error: '用户名或密码错误' });
  }
});

app.post('/api/admin/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

app.get('/api/admin/check', (req, res) => {
  res.json({ isAdmin: !!req.session.isAdmin });
});

// Admin middleware
function adminAuth(req, res, next) {
  if (!req.session.isAdmin) return res.status(401).json({ error: '请先登录' });
  next();
}

// ====== Admin News CRUD ======

app.get('/api/admin/news', adminAuth, (req, res) => {
  const news = db.prepare('SELECT * FROM news ORDER BY created_at DESC').all();
  res.json(news);
});

app.get('/api/admin/news/:id', adminAuth, (req, res) => {
  const news = db.prepare('SELECT * FROM news WHERE id = ?').get(req.params.id);
  if (!news) return res.status(404).json({ error: '文章不存在' });
  res.json(news);
});

app.post('/api/admin/news', adminAuth, (req, res) => {
  const { title, category, content, summary, cover_image, is_published } = req.body;
  const result = db.prepare(
    'INSERT INTO news (title, category, content, summary, cover_image, is_published) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(
    title,
    category || '新闻动态',
    content,
    summary || '',
    cover_image || '',
    is_published !== undefined ? is_published : 1
  );
  res.json({ success: true, id: result.lastInsertRowid });
});

app.put('/api/admin/news/:id', adminAuth, (req, res) => {
  const { title, category, content, summary, cover_image, is_published } = req.body;
  db.prepare(
    `UPDATE news SET title=?, category=?, content=?, summary=?, cover_image=?, is_published=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`
  ).run(
    title,
    category || '新闻动态',
    content,
    summary || '',
    cover_image || '',
    is_published !== undefined ? is_published : 1,
    req.params.id
  );
  res.json({ success: true });
});

app.delete('/api/admin/news/:id', adminAuth, (req, res) => {
  db.prepare('DELETE FROM news WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ====== Page Routes ======

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'about.html'));
});

app.get('/organization', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'organization.html'));
});

app.get('/services', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'services.html'));
});

app.get('/news', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'news.html'));
});

app.get('/news/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'news-detail.html'));
});

app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'contact.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`教工委网站运行中: http://localhost:${PORT}`);
});
