// ============================================================
// КЛЁВОЕ МЕСТО — бэкенд с платными объявлениями (ручное подтверждение).
//
// Модель объявления:
// {
//   id, title, text, contact, photo (имя файла или null),
//   type: "user" | "reservoir_admin",
//   status: "pending_payment" | "published" | "rejected",
//   price: 100 | null,
//   createdAt, publishedAt, expiresAt
// }
//
// Поток для обычного пользователя:
//   POST /api/ads/submit (без авторизации, с фото) -> status pending_payment
//   Автор связывается с администратором в Telegram и платит вручную.
//   Администратор в /admin.html нажимает "Подтвердить оплату" ->
//   status становится published, expiresAt = now + 24 часа.
//   Через 24 часа объявление перестаёт показываться автоматически
//   (без удаления — админ видит его в списке с пометкой "истекло").
//
// Поток для администрации водоёма:
//   Администратор сам добавляет объявление в /admin.html ->
//   сразу published, без цены и без автоматического срока истечения
//   (т.к. это "по договорённости").
// ============================================================

require('dotenv').config();
const express = require('express');
const fs = require('fs').promises;
const fssync = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'change-me';
const DATA_DIR = path.join(__dirname, 'data');
const PUBLIC_DIR = path.join(__dirname, 'public');
const UPLOADS_DIR = path.join(PUBLIC_DIR, 'uploads', 'ads');

const AD_PRICE_RUB = 100;
const AD_DURATION_HOURS = 24;

// Создаём папку для фото объявлений, если её нет
if (!fssync.existsSync(UPLOADS_DIR)) {
  fssync.mkdirSync(UPLOADS_DIR, { recursive: true });
}

app.use(express.json({ limit: '2mb' }));
app.use(express.static(PUBLIC_DIR));

// ---------- Файловое хранилище ----------

async function readJSON(file, fallback) {
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, file), 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    return fallback;
  }
}

async function writeJSON(file, data) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(path.join(DATA_DIR, file), JSON.stringify(data, null, 2), 'utf-8');
}

// ---------- Авторизация администратора ----------

const activeTokens = new Set();

function requireAdmin(req, res, next) {
  const token = req.headers['x-admin-token'];
  if (token && activeTokens.has(token)) return next();
  res.status(401).json({ error: 'Требуется авторизация администратора' });
}

app.post('/api/login', (req, res) => {
  const { password } = req.body || {};
  if (password && password === ADMIN_PASSWORD) {
    const token = crypto.randomBytes(24).toString('hex');
    activeTokens.add(token);
    return res.json({ token });
  }
  res.status(401).json({ error: 'Неверный пароль' });
});

app.post('/api/logout', requireAdmin, (req, res) => {
  activeTokens.delete(req.headers['x-admin-token']);
  res.json({ ok: true });
});

// ---------- Загрузка фото для объявлений (multer) ----------

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeExt = ['.jpg', '.jpeg', '.png', '.webp'].includes(ext) ? ext : '.jpg';
    cb(null, crypto.randomBytes(16).toString('hex') + safeExt);
  },
});

function fileFilter(req, file, cb) {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Разрешены только изображения JPG, PNG или WebP'));
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 МБ
});

// ---------- Вспомогательные функции для объявлений ----------

function isExpired(ad) {
  return ad.status === 'published' && ad.expiresAt && Date.now() > new Date(ad.expiresAt).getTime();
}

function isVisiblePublic(ad) {
  return ad.status === 'published' && !isExpired(ad);
}

async function deletePhotoFile(filename) {
  if (!filename) return;
  try {
    await fs.unlink(path.join(UPLOADS_DIR, filename));
  } catch (e) {
    // Файла может уже не быть — это не критично
  }
}

// ---------- Публичные данные для сайта (без авторизации) ----------

app.get('/api/public/bootstrap', async (req, res) => {
  const [reservoirs, ads, settings] = await Promise.all([
    readJSON('reservoirs.json', []),
    readJSON('ads.json', []),
    readJSON('settings.json', {
      heroTitle: 'Куда поехать на рыбалку?',
      heroSubtitle:
        'Карточки водоёмов ДНР: геолокация, виды рыбы, прикормки и насадки по сезонам, интерактивная карта мест и чат рыбаков.',
      telegramChatUrl: 'https://t.me/ribalka_chat/1',
      adminContactUrl: 'https://t.me/Vollkofff',
    }),
  ]);

  const publicAds = ads.filter(isVisiblePublic);

  res.json({
    reservoirs,
    ads: publicAds,
    settings,
    adPricing: { price: AD_PRICE_RUB, durationHours: AD_DURATION_HOURS },
  });
});

// ---------- Водоёмы ----------

app.get('/api/reservoirs', async (req, res) => {
  res.json(await readJSON('reservoirs.json', []));
});

app.post('/api/reservoirs', requireAdmin, async (req, res) => {
  const list = await readJSON('reservoirs.json', []);
  const item = req.body || {};
  if (!item.id) return res.status(400).json({ error: 'Нужен уникальный id водоёма (латиницей, без пробелов)' });
  if (list.some((r) => r.id === item.id)) {
    return res.status(409).json({ error: 'Водоём с таким id уже существует' });
  }
  list.push(item);
  await writeJSON('reservoirs.json', list);
  res.json({ ok: true, item });
});

app.put('/api/reservoirs/:id', requireAdmin, async (req, res) => {
  const list = await readJSON('reservoirs.json', []);
  const idx = list.findIndex((r) => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Водоём не найден' });
  list[idx] = { ...list[idx], ...req.body };
  await writeJSON('reservoirs.json', list);
  res.json({ ok: true, item: list[idx] });
});

app.delete('/api/reservoirs/:id', requireAdmin, async (req, res) => {
  let list = await readJSON('reservoirs.json', []);
  const before = list.length;
  list = list.filter((r) => r.id !== req.params.id);
  await writeJSON('reservoirs.json', list);
  res.json({ ok: true, removed: before - list.length });
});

// ---------- Объявления: отправка пользователем ----------

app.post('/api/ads/submit', upload.single('photo'), async (req, res) => {
  try {
    const { title, text, contact } = req.body || {};
    if (!title || !text) {
      if (req.file) await deletePhotoFile(req.file.filename);
      return res.status(400).json({ error: 'Заполните заголовок и текст объявления' });
    }

    const list = await readJSON('ads.json', []);
    const ad = {
      id: crypto.randomUUID(),
      title: String(title).slice(0, 80),
      text: String(text).slice(0, 500),
      contact: String(contact || '').slice(0, 80),
      photo: req.file ? req.file.filename : null,
      type: 'user',
      status: 'pending_payment',
      price: AD_PRICE_RUB,
      createdAt: new Date().toISOString(),
      publishedAt: null,
      expiresAt: null,
    };
    list.push(ad);
    await writeJSON('ads.json', list);
    res.json({ ok: true, item: ad });
  } catch (e) {
    res.status(500).json({ error: 'Не удалось сохранить объявление' });
  }
});

// Приём ошибок multer (слишком большой файл, неверный тип) отдельным обработчиком
app.use('/api/ads/submit', (err, req, res, next) => {
  if (err) return res.status(400).json({ error: err.message || 'Ошибка загрузки файла' });
  next();
});

// ---------- Объявления: список для админки (все статусы) ----------

app.get('/api/ads/all', requireAdmin, async (req, res) => {
  const list = await readJSON('ads.json', []);
  const withFlags = list.map((ad) => ({ ...ad, expired: isExpired(ad) }));
  res.json(withFlags);
});

// ---------- Объявления: публичный список (используется и напрямую) ----------

app.get('/api/ads', async (req, res) => {
  const list = await readJSON('ads.json', []);
  res.json(list.filter(isVisiblePublic));
});

// ---------- Объявления: подтверждение оплаты администратором ----------

app.put('/api/ads/:id/confirm', requireAdmin, async (req, res) => {
  const list = await readJSON('ads.json', []);
  const idx = list.findIndex((a) => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Объявление не найдено' });

  const now = new Date();
  const expires = new Date(now.getTime() + AD_DURATION_HOURS * 60 * 60 * 1000);

  list[idx].status = 'published';
  list[idx].publishedAt = now.toISOString();
  list[idx].expiresAt = expires.toISOString();

  await writeJSON('ads.json', list);
  res.json({ ok: true, item: list[idx] });
});

// ---------- Объявления: отклонение ----------

app.put('/api/ads/:id/reject', requireAdmin, async (req, res) => {
  const list = await readJSON('ads.json', []);
  const idx = list.findIndex((a) => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Объявление не найдено' });
  list[idx].status = 'rejected';
  await writeJSON('ads.json', list);
  res.json({ ok: true, item: list[idx] });
});

// ---------- Объявления: добавление от имени администрации водоёма ----------
// Публикуется сразу, без цены, без автоматического срока истечения.

app.post('/api/ads/admin-create', requireAdmin, upload.single('photo'), async (req, res) => {
  try {
    const { title, text, contact } = req.body || {};
    if (!title || !text) {
      if (req.file) await deletePhotoFile(req.file.filename);
      return res.status(400).json({ error: 'Заполните заголовок и текст объявления' });
    }

    const list = await readJSON('ads.json', []);
    const ad = {
      id: crypto.randomUUID(),
      title: String(title).slice(0, 80),
      text: String(text).slice(0, 500),
      contact: String(contact || '').slice(0, 80),
      photo: req.file ? req.file.filename : null,
      type: 'reservoir_admin',
      status: 'published',
      price: null,
      createdAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
      expiresAt: null,
    };
    list.push(ad);
    await writeJSON('ads.json', list);
    res.json({ ok: true, item: ad });
  } catch (e) {
    res.status(500).json({ error: 'Не удалось сохранить объявление' });
  }
});

app.use('/api/ads/admin-create', (err, req, res, next) => {
  if (err) return res.status(400).json({ error: err.message || 'Ошибка загрузки файла' });
  next();
});

// ---------- Объявления: удаление ----------

app.delete('/api/ads/:id', requireAdmin, async (req, res) => {
  let list = await readJSON('ads.json', []);
  const ad = list.find((a) => a.id === req.params.id);
  if (ad && ad.photo) await deletePhotoFile(ad.photo);
  list = list.filter((a) => a.id !== req.params.id);
  await writeJSON('ads.json', list);
  res.json({ ok: true });
});

// ---------- Настройки главной страницы ----------

app.get('/api/settings', async (req, res) => {
  res.json(await readJSON('settings.json', {}));
});

app.put('/api/settings', requireAdmin, async (req, res) => {
  const current = await readJSON('settings.json', {});
  const updated = { ...current, ...req.body };
  await writeJSON('settings.json', updated);
  res.json({ ok: true, settings: updated });
});

// ---------- SPA-фолбэк ----------

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  if (path.extname(req.path)) return next();
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'), (err) => {
    if (err) next();
  });
});

app.listen(PORT, () => {
  console.log(`Клёвое место: сервер запущен на порту ${PORT}`);
  if (ADMIN_PASSWORD === 'change-me') {
    console.warn('⚠ ВНИМАНИЕ: используется пароль администратора по умолчанию. Задайте ADMIN_PASSWORD в .env!');
  }
});