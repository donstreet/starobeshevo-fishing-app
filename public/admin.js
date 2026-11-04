// ============================================================
// АДМИН-ПАНЕЛЬ — работа с API бэкенда (server.js).
// Версия 2: подтверждение оплаты объявлений, отклонение,
// добавление объявлений администрации водоёма с фото.
// ============================================================

const TOKEN_KEY = 'klevoe_admin_token';

function qs(sel, root) { return (root || document).querySelector(sel); }
function qsa(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }
function esc(str) {
  if (str == null) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function getToken() { return sessionStorage.getItem(TOKEN_KEY); }
function setToken(t) { sessionStorage.setItem(TOKEN_KEY, t); }
function clearToken() { sessionStorage.removeItem(TOKEN_KEY); }

function showToast(msg, isError) {
  const t = qs('#toast');
  t.textContent = msg;
  t.className = 'toast show' + (isError ? ' err' : '');
  setTimeout(() => { t.className = 'toast'; }, 2600);
}

async function api(path, options = {}) {
  const headers = Object.assign({}, options.headers || {});
  const token = getToken();
  if (token) headers['x-admin-token'] = token;
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  const res = await fetch(path, Object.assign({}, options, { headers }));
  if (res.status === 401) {
    clearToken();
    showLogin();
    throw new Error('Сессия истекла, войдите снова');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Ошибка запроса');
  return data;
}

function showLogin() {
  qs('#loginBox').classList.remove('hidden');
  qs('#adminApp').classList.add('hidden');
  qs('#logoutWrap').classList.add('hidden');
}

function showApp() {
  qs('#loginBox').classList.add('hidden');
  qs('#adminApp').classList.remove('hidden');
  qs('#logoutWrap').classList.remove('hidden');
  loadSettings();
  loadAds();
  loadReservoirs();
}

async function doLogin() {
  const password = qs('#loginPassword').value;
  qs('#loginErr').textContent = '';
  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Ошибка входа');
    setToken(data.token);
    showApp();
  } catch (e) {
    qs('#loginErr').textContent = e.message;
  }
}

function doLogout() {
  api('/api/logout', { method: 'POST' }).catch(() => {});
  clearToken();
  showLogin();
}

function initAdminTabs() {
  qsa('.admin-tabs .tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      qsa('.admin-tabs .tab-btn').forEach((b) => b.classList.remove('active'));
      qsa('.admin-tab-panel').forEach((p) => p.classList.remove('active'));
      btn.classList.add('active');
      qs(`#admintab-${btn.dataset.admintab}`)?.classList.add('active');
    });
  });
}

// ---------- Настройки главной страницы ----------

async function loadSettings() {
  try {
    const s = await api('/api/settings');
    qs('#heroTitle').value = s.heroTitle || '';
    qs('#heroSubtitle').value = s.heroSubtitle || '';
    qs('#telegramChatUrl').value = s.telegramChatUrl || '';
    qs('#adminContactUrl').value = s.adminContactUrl || 'https://t.me/Vollkofff';
  } catch (e) {
    showToast(e.message, true);
  }
}

function initSettingsForm() {
  qs('#saveSettingsBtn').addEventListener('click', async () => {
    try {
      await api('/api/settings', {
        method: 'PUT',
        body: JSON.stringify({
          heroTitle: qs('#heroTitle').value,
          heroSubtitle: qs('#heroSubtitle').value,
          telegramChatUrl: qs('#telegramChatUrl').value,
          adminContactUrl: qs('#adminContactUrl').value,
        }),
      });
      showToast('Сохранено');
    } catch (e) {
      showToast(e.message, true);
    }
  });
}

// ---------- Объявления ----------

function statusLabel(status, expired) {
  if (status === 'pending_payment') return 'Ожидает оплаты';
  if (status === 'published' && expired) return 'Истекло';
  if (status === 'published') return 'Опубликовано';
  if (status === 'rejected') return 'Отклонено';
  return status;
}
function statusClass(status, expired) {
  if (status === 'published' && expired) return 'expired';
  return status;
}

function renderAdItem(ad, { showConfirm, showReject }) {
  const photoHtml = ad.photo
    ? `<img class="admin-ad-photo" src="/uploads/ads/${esc(ad.photo)}" alt="">`
    : '';
  const typeLabel = ad.type === 'reservoir_admin' ? ' · от администрации водоёма' : '';
  const priceLabel = ad.price ? ` · ${ad.price} ₽` : ' · по договорённости';

  let actions = `<button class="icon-btn danger" data-del-ad="${esc(ad.id)}" title="Удалить">🗑️</button>`;
  if (showConfirm) {
    actions = `<button class="icon-btn confirm" data-confirm-ad="${esc(ad.id)}" title="Подтвердить оплату">✅</button>` + actions;
  }
  if (showReject) {
    actions = `<button class="icon-btn danger" data-reject-ad="${esc(ad.id)}" title="Отклонить">🚫</button>` + actions;
  }

  return `
    <div class="admin-list-item" data-id="${esc(ad.id)}">
      <div class="ad-row-with-photo" style="flex:1;min-width:0;">
        ${photoHtml}
        <div class="ali-body">
          <span class="ad-status-badge ${statusClass(ad.status, ad.expired)}">${statusLabel(ad.status, ad.expired)}</span>
          <div class="ali-title">${esc(ad.title)}</div>
          <div>${esc(ad.text)}</div>
          <div class="ali-meta">${esc(ad.contact || '')}${typeLabel}${priceLabel}</div>
        </div>
      </div>
      <div class="ali-actions">${actions}</div>
    </div>`;
}

function attachAdActions(container) {
  qsa('[data-confirm-ad]', container).forEach((btn) => {
    btn.addEventListener('click', async () => {
      if (!confirm('Подтвердить получение оплаты 100 ₽ и опубликовать объявление на 24 часа?')) return;
      try {
        await api(`/api/ads/${btn.dataset.confirmAd}/confirm`, { method: 'PUT' });
        showToast('Объявление опубликовано');
        loadAds();
      } catch (e) {
        showToast(e.message, true);
      }
    });
  });
  qsa('[data-reject-ad]', container).forEach((btn) => {
    btn.addEventListener('click', async () => {
      if (!confirm('Отклонить это объявление?')) return;
      try {
        await api(`/api/ads/${btn.dataset.rejectAd}/reject`, { method: 'PUT' });
        showToast('Объявление отклонено');
        loadAds();
      } catch (e) {
        showToast(e.message, true);
      }
    });
  });
  qsa('[data-del-ad]', container).forEach((btn) => {
    btn.addEventListener('click', async () => {
      if (!confirm('Удалить это объявление навсегда?')) return;
      try {
        await api(`/api/ads/${btn.dataset.delAd}`, { method: 'DELETE' });
        showToast('Объявление удалено');
        loadAds();
      } catch (e) {
        showToast(e.message, true);
      }
    });
  });
}

async function loadAds() {
  try {
    const all = await api('/api/ads/all');

    const pending = all.filter((a) => a.status === 'pending_payment');
    const others = all.filter((a) => a.status !== 'pending_payment');

    const pendingList = qs('#adsPendingList');
    if (pending.length === 0) {
      pendingList.innerHTML = '<p style="color:var(--text-dimmer);font-size:13px;">Нет объявлений, ожидающих оплаты.</p>';
    } else {
      pendingList.innerHTML = pending
        .slice()
        .reverse()
        .map((ad) => renderAdItem(ad, { showConfirm: true, showReject: true }))
        .join('');
      attachAdActions(pendingList);
    }

    const otherList = qs('#adsOtherList');
    if (others.length === 0) {
      otherList.innerHTML = '<p style="color:var(--text-dimmer);font-size:13px;">Пока пусто.</p>';
    } else {
      otherList.innerHTML = others
        .slice()
        .reverse()
        .map((ad) => renderAdItem(ad, { showConfirm: false, showReject: false }))
        .join('');
      attachAdActions(otherList);
    }
  } catch (e) {
    showToast(e.message, true);
  }
}

function initReservoirAdForm() {
  qs('#addResAdBtn').addEventListener('click', async () => {
    const title = qs('#resAdTitle').value.trim();
    const text = qs('#resAdText').value.trim();
    const contact = qs('#resAdContact').value.trim();
    const photoInput = qs('#resAdPhoto');

    if (!title || !text) {
      showToast('Заполните заголовок и текст', true);
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('text', text);
    formData.append('contact', contact);
    if (photoInput.files && photoInput.files[0]) {
      formData.append('photo', photoInput.files[0]);
    }

    try {
      await api('/api/ads/admin-create', { method: 'POST', body: formData });
      showToast('Объявление опубликовано');
      qs('#resAdTitle').value = '';
      qs('#resAdText').value = '';
      qs('#resAdContact').value = '';
      photoInput.value = '';
      loadAds();
    } catch (e) {
      showToast(e.message, true);
    }
  });
}

// ---------- Водоёмы ----------

async function loadReservoirs() {
  try {
    const list = await api('/api/reservoirs');
    const el = qs('#reservoirsAdminList');
    if (list.length === 0) {
      el.innerHTML = '<p style="color:var(--text-dimmer);font-size:13px;">Водоёмов пока нет.</p>';
      return;
    }
    el.innerHTML = list
      .map(
        (r) => `
      <div class="admin-list-item" data-id="${esc(r.id)}">
        <div class="ali-body">
          <div class="ali-title">${esc(r.name)}</div>
          <div class="ali-meta">${esc(r.location || '')} · id: ${esc(r.id)}</div>
        </div>
        <div class="ali-actions">
          <button class="icon-btn danger" data-del-res="${esc(r.id)}" title="Удалить">🗑️</button>
        </div>
      </div>`,
      )
      .join('');

    qsa('[data-del-res]', el).forEach((btn) => {
      btn.addEventListener('click', async () => {
        if (!confirm(`Удалить водоём "${btn.dataset.delRes}"? Это действие необратимо.`)) return;
        try {
          await api(`/api/reservoirs/${btn.dataset.delRes}`, { method: 'DELETE' });
          showToast('Водоём удалён');
          loadReservoirs();
        } catch (e) {
          showToast(e.message, true);
        }
      });
    });
  } catch (e) {
    showToast(e.message, true);
  }
}

function initAddReservoirForm() {
  qs('#addResBtn').addEventListener('click', async () => {
    const id = qs('#newResId').value.trim();
    const name = qs('#newResName').value.trim();
    const short = qs('#newResShort').value.trim();
    const location = qs('#newResLocation').value.trim();
    const lat = parseFloat(qs('#newResLat').value);
    const lon = parseFloat(qs('#newResLon').value);
    const photo = qs('#newResPhoto').value.trim() || 'img/placeholder.jpg';

    if (!id || !name || Number.isNaN(lat) || Number.isNaN(lon)) {
      showToast('Заполните минимум: id, название, широту и долготу', true);
      return;
    }

    const payload = {
      id, name, short, location, lat, lon, photo,
      verified: false,
      hasInteractiveMap: false,
      facts: [],
      notes: [],
      rules: [],
      fish: [],
      spots: [],
      sources: [],
    };

    try {
      await api('/api/reservoirs', { method: 'POST', body: JSON.stringify(payload) });
      showToast('Водоём добавлен. Виды рыбы и точки удобнее дополнить напрямую в data/reservoirs.json');
      qs('#newResId').value = '';
      qs('#newResName').value = '';
      qs('#newResShort').value = '';
      qs('#newResLocation').value = '';
      qs('#newResLat').value = '';
      qs('#newResLon').value = '';
      qs('#newResPhoto').value = '';
      loadReservoirs();
    } catch (e) {
      showToast(e.message, true);
    }
  });
}

// ---------- Инициализация ----------

document.addEventListener('DOMContentLoaded', () => {
  qs('#loginBtn').addEventListener('click', doLogin);
  qs('#loginPassword').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') doLogin();
  });
  qs('#logoutBtn').addEventListener('click', doLogout);

  initAdminTabs();
  initSettingsForm();
  initReservoirAdForm();
  initAddReservoirForm();

  if (getToken()) {
    showApp();
  } else {
    showLogin();
  }
});