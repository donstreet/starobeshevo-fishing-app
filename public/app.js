// ============================================================
// КЛЁВОЕ МЕСТО — общая логика сайта.
// Версия 4: платные объявления с ручным подтверждением оплаты,
// загрузка фото к объявлению, кнопка связи с администратором.
// ============================================================

const TELEGRAM_CHAT_URL_DEFAULT = 'https://t.me/ribalka_chat/1';
const ADMIN_CONTACT_URL_DEFAULT = 'https://t.me/Vollkofff';
const SEASON_LABELS = { spring: 'Весна', summer: 'Лето', autumn: 'Осень', winter: 'Зима' };
const SEASON_ORDER = ['spring', 'summer', 'autumn', 'winter'];

let STATE = {
  reservoirs: [],
  ads: [],
  settings: { telegramChatUrl: TELEGRAM_CHAT_URL_DEFAULT, adminContactUrl: ADMIN_CONTACT_URL_DEFAULT },
  adPricing: { price: 100, durationHours: 24 },
  apiAvailable: false,
};

// ---------- Утилиты ----------

function qs(sel, root) { return (root || document).querySelector(sel); }
function qsa(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }
function esc(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function yandexMapsUrl(lat, lon, label) {
  const ll = `${lon},${lat}`;
  const text = encodeURIComponent(label || '');
  return `https://yandex.ru/maps/?pt=${ll}&z=15&l=map&text=${text}`;
}

function methodIcon(m) {
  if (m === 'shore') return '🏖️';
  if (m === 'boat') return '🚤';
  if (m === 'spinning') return '🎣';
  return '•';
}
function methodLabel(m) {
  if (m === 'shore') return 'С берега';
  if (m === 'boat') return 'С лодки';
  if (m === 'spinning') return 'Спиннинг';
  return m;
}

function findReservoir(id) {
  return STATE.reservoirs.find((r) => r.id === id);
}

function resolveFishName(reservoir, fishId) {
  const f = (reservoir.fish || []).find((x) => x.id === fishId);
  if (f) return f.name;
  return fishId;
}

function currentSeason() {
  const m = new Date().getMonth();
  if (m >= 2 && m <= 4) return 'spring';
  if (m >= 5 && m <= 7) return 'summer';
  if (m >= 8 && m <= 10) return 'autumn';
  return 'winter';
}

function handleImgError(imgEl, fallbackText, fallbackClass) {
  imgEl.addEventListener('error', function onErr() {
    imgEl.removeEventListener('error', onErr);
    const holder = document.createElement('div');
    holder.className = fallbackClass || 'noimg';
    holder.textContent = fallbackText || 'Фото не добавлено';
    if (imgEl.parentNode) imgEl.parentNode.replaceChild(holder, imgEl);
  });
}

// ---------- Загрузка данных: API, с откатом на статичные файлы ----------

async function loadAppData() {
  try {
    const res = await fetch('/api/public/bootstrap');
    if (!res.ok) throw new Error('bootstrap failed');
    const data = await res.json();
    STATE.reservoirs = data.reservoirs || [];
    STATE.ads = data.ads || [];
    STATE.settings = data.settings || STATE.settings;
    if (data.adPricing) STATE.adPricing = data.adPricing;
    STATE.apiAvailable = true;
  } catch (e) {
    STATE.reservoirs = window.RESERVOIRS || [];
    STATE.ads = window.ADS || [];
    STATE.apiAvailable = false;
  }
}

// ---------- Погода (open-meteo.com, без ключа API) ----------

function weatherCodeToIcon(code) {
  if (code === 0) return { ico: '☀️', text: 'Ясно' };
  if ([1, 2, 3].includes(code)) return { ico: '⛅', text: 'Облачно' };
  if ([45, 48].includes(code)) return { ico: '🌫️', text: 'Туман' };
  if ([51, 53, 55, 56, 57].includes(code)) return { ico: '🌦️', text: 'Морось' };
  if ([61, 63, 65, 66, 67].includes(code)) return { ico: '🌧️', text: 'Дождь' };
  if ([71, 73, 75, 77].includes(code)) return { ico: '❄️', text: 'Снег' };
  if ([80, 81, 82].includes(code)) return { ico: '🌧️', text: 'Ливень' };
  if ([85, 86].includes(code)) return { ico: '🌨️', text: 'Снегопад' };
  if ([95, 96, 99].includes(code)) return { ico: '⛈️', text: 'Гроза' };
  return { ico: '🌊', text: 'Погода' };
}

async function fetchWeather(lat, lon) {
  const url =
    `/weather/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,weather_code,wind_speed_10m&wind_speed_unit=ms&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('weather fetch failed');
  const data = await res.json();
  return {
    temp: Math.round(data.current.temperature_2m),
    code: data.current.weather_code,
    wind: Math.round(data.current.wind_speed_10m),
  };
}

function renderWeatherWidget(el, lat, lon, label) {
  el.innerHTML = `<span class="ico">🌊</span><span><span class="t">···</span><span class="d">${esc(label || 'Погода')}</span></span>`;
  fetchWeather(lat, lon)
    .then((w) => {
      const meta = weatherCodeToIcon(w.code);
      el.innerHTML = `<span class="ico">${meta.ico}</span><span><span class="t">${w.temp}°C</span><span class="d">${esc(label || meta.text)} · ветер ${w.wind} м/с</span></span>`;
    })
    .catch(() => {
      el.innerHTML = `<span class="ico">🌊</span><span><span class="t">—</span><span class="d">Погода недоступна</span></span>`;
    });
}

// ---------- Объявления ----------

function adStatusLabel(ad) {
  if (ad.type === 'reservoir_admin') return '';
  return '';
}

function renderAds() {
  const list = qs('#adsList');
  if (!list) return;

  const all = STATE.ads; // бэкенд уже отдаёт только опубликованные и не истёкшие

  if (all.length === 0) {
    list.innerHTML = `<div class="ad-empty">Пока объявлений нет.<br>Будьте первым — заполните форму ниже.</div>`;
    return;
  }

  list.innerHTML = all
    .slice()
    .reverse()
    .map((ad) => {
      const photoHtml = ad.photo
        ? `<img class="ad-photo" src="/uploads/ads/${esc(ad.photo)}" alt="${esc(ad.title)}" loading="lazy">`
        : '';
      const badge =
        ad.type === 'reservoir_admin'
          ? `<span class="ad-badge-admin">Администрация водоёма</span><br>`
          : '';
      return `
      <div class="ad-item">
        ${photoHtml}
        ${badge}
        <div class="ad-title">${esc(ad.title)}</div>
        <div>${esc(ad.text)}</div>
        <div class="ad-meta">${esc(ad.contact || '')}${ad.publishedAt ? ' · ' + esc(new Date(ad.publishedAt).toLocaleDateString('ru-RU')) : ''}</div>
      </div>`;
    })
    .join('');
}

// Предпросмотр выбранного фото в форме
function initAdPhotoPreview() {
  const input = qs('#adPhoto');
  const preview = qs('#adPhotoPreview');
  const previewImg = qs('#adPhotoPreviewImg');
  const removeBtn = qs('#adPhotoRemove');
  const label = qs('#adPhotoLabelText');
  if (!input) return;

  input.addEventListener('change', () => {
    const file = input.files && input.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Файл слишком большой. Максимум 5 МБ.');
      input.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      previewImg.src = e.target.result;
      preview.classList.remove('hidden');
      if (label) label.textContent = '📷 ' + file.name;
    };
    reader.readAsDataURL(file);
  });

  removeBtn?.addEventListener('click', () => {
    input.value = '';
    preview.classList.add('hidden');
    if (label) label.textContent = '📷 Прикрепить фото (необязательно)';
  });
}

function initAdsForm() {
  const form = qs('#adForm');
  if (!form) return;

  const msgEl = qs('#adSubmitMsg');
  const submitBtn = qs('#adSubmitBtn');

  if (!STATE.apiAvailable) {
    // Без бэкенда платные объявления технически невозможны —
    // честно предупреждаем и отключаем форму.
    if (msgEl) {
      msgEl.className = 'ad-submit-msg error';
      msgEl.textContent = 'Бэкенд недоступен — отправка объявлений сейчас не работает. Обратитесь к администратору сайта.';
    }
    if (submitBtn) submitBtn.disabled = true;
    return;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (msgEl) { msgEl.className = 'ad-submit-msg'; msgEl.textContent = ''; }

    const title = qs('#adTitle', form).value.trim();
    const text = qs('#adText', form).value.trim();
    if (!title || !text) return;

    const formData = new FormData(form);
    submitBtn.disabled = true;
    submitBtn.textContent = 'Отправка…';

    try {
      const res = await fetch('/api/ads/submit', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка отправки');

      form.reset();
      qs('#adPhotoPreview')?.classList.add('hidden');
      const label = qs('#adPhotoLabelText');
      if (label) label.textContent = '📷 Прикрепить фото (необязательно)';

      if (msgEl) {
        msgEl.className = 'ad-submit-msg success';
        msgEl.innerHTML =
          '✅ Объявление отправлено и ожидает оплаты. Свяжитесь с администратором, чтобы оплатить размещение — ' +
          'кнопка выше. После подтверждения оплаты объявление появится в списке на ' +
          (STATE.adPricing.durationHours || 24) + ' часа.';
      }
      if (window.TGApp) window.TGApp.haptic('success');
    } catch (err) {
      if (msgEl) {
        msgEl.className = 'ad-submit-msg error';
        msgEl.textContent = '❌ ' + err.message;
      }
      if (window.TGApp) window.TGApp.haptic('error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = `Отправить объявление за ${STATE.adPricing.price || 100} ₽`;
    }
  });
}

function initAdPricingUI() {
  const priceEl = qs('#adPriceText');
  const durationEl = qs('#adDurationText');
  const submitBtn = qs('#adSubmitBtn');
  const adminBtn = qs('#contactAdminBtn');

  if (priceEl) priceEl.textContent = `${STATE.adPricing.price || 100} ₽`;
  if (durationEl) {
    const h = STATE.adPricing.durationHours || 24;
    durationEl.textContent = h === 24 ? '1 сутки' : `${h} ч.`;
  }
  if (submitBtn) submitBtn.textContent = `Отправить объявление за ${STATE.adPricing.price || 100} ₽`;

  const adminUrl = STATE.settings.adminContactUrl || ADMIN_CONTACT_URL_DEFAULT;
  qsa('a[href="https://t.me/Vollkofff"]').forEach((a) => (a.href = adminUrl));
  if (adminBtn) {
    adminBtn.addEventListener('click', (e) => {
      if (window.TGApp && window.TGApp.isTelegram()) {
        e.preventDefault();
        window.TGApp.openTelegramLink(adminUrl);
      }
    });
  }
}

// ============================================================
// ГЛАВНАЯ СТРАНИЦА
// ============================================================

function renderReservoirCard(r) {
  const fishTags = (r.fish || [])
    .slice(0, 4)
    .map((f) => `<span class="tag">${esc(f.name)}</span>`)
    .join('');
  const badge = r.hasInteractiveMap ? 'Интерактивная карта' : 'Карточка водоёма';
  const url = `reservoir.html?id=${encodeURIComponent(r.id)}`;
  const mapsUrl = yandexMapsUrl(r.lat, r.lon, r.name);

  const card = document.createElement('article');
  card.className = 'rcard';
  card.innerHTML = `
      <a href="${url}">
        <div class="thumb">
          <span class="badge">${badge}</span>
        </div>
      </a>
      <div class="body">
        <a href="${url}"><h4>${esc(r.name)}</h4></a>
        <div class="loc">📍 ${esc(r.location)}</div>
        <p class="desc">${esc(r.short)}</p>
        <div class="fish-tags">${fishTags}</div>
        <div class="actions">
          <a class="btn btn-primary btn-sm" href="${mapsUrl}" target="_blank" rel="noopener">🚗 Поехали</a>
          <a class="btn btn-ghost btn-sm" href="${url}">Подробнее</a>
        </div>
      </div>`;

  const thumb = card.querySelector('.thumb');
  const img = document.createElement('img');
  img.src = r.photo;
  img.alt = r.name;
  handleImgError(img, `📍 ${r.name} — фото не добавлено`, 'noimg');
  thumb.insertBefore(img, thumb.firstChild);

  card.querySelector('.btn-primary')?.addEventListener('click', (e) => e.stopPropagation());
  return card;
}

function initIndexPage() {
  const grid = qs('#reservoirGrid');
  if (!grid) return;

  const list = STATE.reservoirs;
  grid.innerHTML = '';
  list.forEach((r) => grid.appendChild(renderReservoirCard(r)));

  const countEl = qs('#reservoirCount');
  if (countEl) countEl.textContent = `${list.length} водоёмов`;

  const heroTitleEl = qs('#heroTitle');
  const heroSubEl = qs('#heroSubtitle');
  if (heroTitleEl && STATE.settings.heroTitle) heroTitleEl.textContent = STATE.settings.heroTitle;
  if (heroSubEl && STATE.settings.heroSubtitle) heroSubEl.textContent = STATE.settings.heroSubtitle;

  const chatUrl = STATE.settings.telegramChatUrl || TELEGRAM_CHAT_URL_DEFAULT;
  qsa('a[data-chat-link]').forEach((a) => (a.href = chatUrl));

  const heroWeather = qs('#heroWeather');
  if (heroWeather) renderWeatherWidget(heroWeather, 48.015883, 37.80285, 'Донецк');

  initAdPricingUI();
  renderAds();
  initAdPhotoPreview();
  initAdsForm();
}

// ============================================================
// СТРАНИЦА ВОДОЁМА (без изменений логики, см. предыдущую версию)
// ============================================================

let currentFishFilter = null;

function renderFactsRow(r) {
  if (!r.facts || r.facts.length === 0) return '';
  return `<div class="facts-row">${r.facts
    .map((f) => `<div class="fact-chip"><span class="fl">${esc(f.label)}</span><span class="fv">${esc(f.value)}</span></div>`)
    .join('')}</div>`;
}

function renderSeasonGuide(fishId, uid) {
  const guide = window.FISH_GUIDE && window.FISH_GUIDE[fishId];
  if (!guide) return '';

  const chips = SEASON_ORDER.map(
    (s) => `<button class="season-chip" data-season="${s}" data-uid="${uid}">${SEASON_LABELS[s]}</button>`,
  ).join('');

  const panels = SEASON_ORDER.map((s) => {
    const d = guide.seasons[s];
    if (!d) return '';
    const baitsChips = (d.baits || []).map((b) => `<span class="tag">${esc(b)}</span>`).join('');
    return `
      <div class="season-panel" data-season-panel="${s}" data-uid="${uid}">
        <div class="sp-recipe"><b>Прикормка:</b> ${esc(d.groundbaitRecipe || 'Не применяется для этого вида.')}</div>
        ${baitsChips ? `<div class="chips mb-10">${baitsChips}</div>` : ''}
        ${d.tips ? `<div class="sp-tip">💡 ${esc(d.tips)}</div>` : ''}
      </div>`;
  }).join('');

  return `
    <div class="season-guide" data-guide-uid="${uid}">
      <div class="sg-title">🧪 Прикормка и насадки по сезонам · общая практика</div>
      <div class="season-switcher">${chips}</div>
      ${panels}
    </div>`;
}

function initSeasonGuides(root) {
  qsa('.season-guide', root).forEach((guideEl) => {
    const uid = guideEl.dataset.guideUid;
    const chips = qsa(`.season-chip[data-uid="${uid}"]`, guideEl);
    const panels = qsa(`.season-panel[data-uid="${uid}"]`, guideEl);

    function activate(season) {
      chips.forEach((c) => c.classList.toggle('active', c.dataset.season === season));
      panels.forEach((p) => p.classList.toggle('active', p.dataset.seasonPanel === season));
    }
    chips.forEach((chip) => chip.addEventListener('click', (e) => { e.preventDefault(); activate(chip.dataset.season); }));
    activate(currentSeason());
  });
}

function renderFishAccordion(r) {
  if (!r.fish || r.fish.length === 0) {
    return '<p style="color:var(--text-dim);font-size:13.5px;">Данные по видам рыбы пока не добавлены.</p>';
  }
  return `<div class="fish-list">${r.fish
    .map((f, idx) => {
      const uid = `${r.id}-${f.id}-${idx}`;
      return `
    <details class="fish-item">
      <summary>
        <span class="fname">${esc(f.name)}</span>
        <span class="fkind ${f.kind}">${f.kind === 'white' ? 'мирная' : 'хищник'}</span>
      </summary>
      <div class="fbody">
        <p>${esc(f.short)}</p>
        <div class="frow">
          <div class="fcell"><b>${esc(f.depth || '—')}</b>Глубина</div>
          <div class="fcell"><b>${esc(f.distance || '—')}</b>Дистанция</div>
          <div class="fcell"><b>${esc(f.bestTime || '—')}</b>Время</div>
        </div>
        ${f.baits && f.baits.length ? `<div class="chips">${f.baits.map((b) => `<span class="tag">${esc(b)}</span>`).join('')}</div>` : ''}
        ${f.groundbait ? `<p class="mt-10"><b>Прикормка (для водоёма):</b> ${esc(f.groundbait)}</p>` : ''}
        ${f.tackle && f.tackle.length ? `<div class="chips mt-10">${f.tackle.map((t) => `<span class="tag">${esc(t)}</span>`).join('')}</div>` : ''}
        <p class="mt-10" style="color:var(--text-dim)">${esc(f.tips || '')}</p>
        ${renderSeasonGuide(f.id, uid)}
      </div>
    </details>`;
    })
    .join('')}</div>`;
}

function renderInfoTab(r) {
  const verifyBadge = r.verified
    ? `<span class="verify-badge ok">✓ Координата подтверждена источником</span>`
    : `<span class="verify-badge warn">⚠ Координата ориентировочная — уточните на месте</span>`;

  const notes = (r.notes || []).map((n) => `<li>${esc(n)}</li>`).join('');
  const rules = (r.rules || []).map((n) => `<li>${esc(n)}</li>`).join('');
  const sources = (r.sources || [])
    .map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a>`)
    .join('');

  return `
    ${verifyBadge}
    ${renderFactsRow(r)}
    ${notes ? `<h3 style="margin:16px 0 8px;font-size:14px;">Особенности</h3><ul class="info-list">${notes}</ul>` : ''}
    ${rules ? `<h3 style="margin:16px 0 8px;font-size:14px;">Правила</h3><ul class="info-list">${rules}</ul>` : ''}
    ${sources ? `<h3 style="margin:16px 0 8px;font-size:14px;">Источники</h3><div class="sources-list">${sources}</div>` : ''}
  `;
}

function renderMapTab(r) {
  if (!r.hasInteractiveMap || !r.spots || r.spots.length === 0) {
    return `
      <div class="map-wrap">
        <div class="noimg-hero">Интерактивная карта мест пока не добавлена для этого водоёма</div>
      </div>
      <p style="color:var(--text-dim);font-size:12.5px;margin-top:10px;">
        Точки ловли можно добавить позже в data/reservoirs.json, когда появятся проверенные координаты.
      </p>`;
  }

  const fishIds = Array.from(new Set(r.spots.flatMap((s) => s.fish || [])));
  const chips = fishIds
    .map((fid) => `<button class="filter-chip" data-fish="${esc(fid)}">${esc(resolveFishName(r, fid))}</button>`)
    .join('');

  const pins = r.spots
    .map((s) => `<div class="map-pin" style="left:${s.x}%;top:${s.y}%;" data-spot-id="${s.id}" title="${esc(s.name)}">${s.id}</div>`)
    .join('');

  return `
    <div class="map-filter">
      <button class="filter-chip active" data-fish="all">Все</button>
      ${chips}
    </div>
    <div class="map-wrap" id="mapWrap">
      <img src="${esc(r.mapImage || r.photo)}" alt="Карта ${esc(r.name)}" id="mapImg">
      ${pins}
    </div>
    <div class="map-legend">
      <div class="lg-item"><span class="dot" style="background:var(--accent)"></span>Точка ловли — нажмите для подробностей</div>
    </div>`;
}

function initMapInteractions(r) {
  const wrap = qs('#mapWrap');
  if (!wrap) return;

  const mapImg = qs('#mapImg', wrap);
  if (mapImg) handleImgError(mapImg, 'Карта водоёма не добавлена — положите файл в img/', 'noimg-hero');

  qsa('.map-pin', wrap).forEach((pin) => {
    pin.addEventListener('click', () => {
      const spotId = Number(pin.dataset.spotId);
      const spot = r.spots.find((s) => s.id === spotId);
      if (spot) openSpotSheet(r, spot);
      if (window.TGApp) window.TGApp.haptic('light');
    });
  });

  qsa('.filter-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      qsa('.filter-chip').forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      const fid = chip.dataset.fish;
      currentFishFilter = fid === 'all' ? null : fid;
      qsa('.map-pin', wrap).forEach((pin) => {
        const spotId = Number(pin.dataset.spotId);
        const spot = r.spots.find((s) => s.id === spotId);
        const match = !currentFishFilter || (spot.fish || []).includes(currentFishFilter);
        pin.classList.toggle('dim', !match);
      });
    });
  });
}

function openSpotSheet(r, spot) {
  const backdrop = qs('#sheetBackdrop');
  const sheet = qs('#spotSheet');
  if (!backdrop || !sheet) return;

  const fishChips = (spot.fish || []).map((fid) => `<span class="tag">${esc(resolveFishName(r, fid))}</span>`).join('');
  const methodChips = (spot.methods || []).map((m) => `<span class="tag">${methodIcon(m)} ${esc(methodLabel(m))}</span>`).join('');

  sheet.innerHTML = `
    <div class="handle"></div>
    <button class="sheet-close" id="sheetCloseBtn">✕</button>
    <h4>№${spot.id} · ${esc(spot.name)}</h4>
    <div class="sub">${esc(spot.bottom || '')}</div>
    <div class="frow" style="margin-bottom:10px;">
      <div class="fcell"><b>${esc(spot.depth || '—')}</b>Глубина</div>
      <div class="fcell"><b>${esc(spot.distance || '—')}</b>Дистанция</div>
    </div>
    <div class="chips mb-10">${methodChips}</div>
    <div class="chips mb-10">${fishChips}</div>
    <p style="font-size:13px;color:var(--text-dim);">${esc(spot.tips || '')}</p>
    ${spot.restricted ? `<p style="margin-top:10px;color:var(--red);font-size:12.5px;">⚠ ${esc(spot.restricted)}</p>` : ''}
  `;

  qs('#sheetCloseBtn', sheet)?.addEventListener('click', closeSpotSheet);
  backdrop.classList.add('open');
  sheet.classList.add('open');
}

function closeSpotSheet() {
  qs('#sheetBackdrop')?.classList.remove('open');
  qs('#spotSheet')?.classList.remove('open');
}

function initTabs() {
  const tabs = qsa('.tab-btn');
  tabs.forEach((btn) => {
    btn.addEventListener('click', () => {
      tabs.forEach((b) => b.classList.remove('active'));
      qsa('.tab-panel').forEach((p) => p.classList.remove('active'));
      btn.classList.add('active');
      qs(`#tab-${btn.dataset.tab}`)?.classList.add('active');
    });
  });
}

function initReservoirPage() {
  const root = qs('#resDetail');
  if (!root) return;

  const id = getParam('id');
  const r = findReservoir(id);

  if (!r) {
    root.innerHTML = `<div class="panel"><h3>Водоём не найден</h3><p style="color:var(--text-dim)">Проверьте ссылку или вернитесь на <a href="index.html" style="color:var(--accent)">главную</a>.</p></div>`;
    return;
  }

  document.title = `${r.name} — Клёвое место`;
  const mapsUrl = yandexMapsUrl(r.lat, r.lon, r.name);
  const chatUrl = STATE.settings.telegramChatUrl || TELEGRAM_CHAT_URL_DEFAULT;

  root.innerHTML = `
    <div class="detail-hero" id="detailHero">
      <div class="overlay">
        <h2>${esc(r.name)}</h2>
        <div class="loc">📍 ${esc(r.location)}</div>
      </div>
    </div>

    <div class="detail-actions">
      <a class="btn btn-primary" href="${mapsUrl}" target="_blank" rel="noopener" id="goBtn">🚗 Поехали (Яндекс.Карты)</a>
      <a class="btn btn-ghost" href="${chatUrl}" target="_blank" rel="noopener" id="chatBtnDetail">💬 Чат рыбаков</a>
      <a class="btn btn-ghost" href="index.html">← Все водоёмы</a>
    </div>

    <div class="tabs">
      <button class="tab-btn active" data-tab="map">Карта</button>
      <button class="tab-btn" data-tab="fish">Рыба и прикормка</button>
      <button class="tab-btn" data-tab="info">Инфо</button>
    </div>

    <div class="tab-panel active" id="tab-map">${renderMapTab(r)}</div>
    <div class="tab-panel" id="tab-fish">${renderFishAccordion(r)}</div>
    <div class="tab-panel" id="tab-info">${renderInfoTab(r)}</div>
  `;

  const hero = qs('#detailHero');
  const heroImg = document.createElement('img');
  heroImg.src = r.photo;
  heroImg.alt = r.name;
  handleImgError(heroImg, 'Фото не добавлено — положите файл в img/', 'noimg-hero');
  hero.insertBefore(heroImg, hero.firstChild);

  initTabs();
  initMapInteractions(r);
  initSeasonGuides(qs('#tab-fish'));

  qs('#goBtn')?.addEventListener('click', (e) => { if (window.TGApp && window.TGApp.isTelegram()) { e.preventDefault(); window.TGApp.openLink(mapsUrl); } });
  qs('#chatBtnDetail')?.addEventListener('click', (e) => { if (window.TGApp && window.TGApp.isTelegram()) { e.preventDefault(); window.TGApp.openTelegramLink(chatUrl); } });

  if (window.TGApp) window.TGApp.showBack(() => { window.location.href = 'index.html'; });
}

// ============================================================
// Общая инициализация
// ============================================================

function initChatButton() {
  const btn = qs('#chatBtn');
  if (!btn) return;
  btn.addEventListener('click', (e) => {
    const chatUrl = STATE.settings.telegramChatUrl || TELEGRAM_CHAT_URL_DEFAULT;
    if (window.TGApp && window.TGApp.isTelegram()) { e.preventDefault(); window.TGApp.openTelegramLink(chatUrl); }
  });
}

function initSheetClose() {
  qs('#sheetBackdrop')?.addEventListener('click', closeSpotSheet);
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadAppData();
  initIndexPage();
  initReservoirPage();
  initChatButton();
  initSheetClose();
});