const tg = window.Telegram && window.Telegram.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
  const p = tg.themeParams || {};
  const root = document.documentElement.style;
  if (p.bg_color) root.setProperty('--tg-bg', p.bg_color);
  if (p.text_color) root.setProperty('--tg-text', p.text_color);
  if (p.hint_color) root.setProperty('--tg-hint', p.hint_color);
  if (p.secondary_bg_color) root.setProperty('--tg-secondary', p.secondary_bg_color);
  if (p.button_color) root.setProperty('--tg-accent', p.button_color);
  if (p.button_text_color) root.setProperty('--tg-btn-text', p.button_text_color);
}

const MONTHS = ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'];
const KIND = {
  boat_pred: 'Перспектива с лодки',
  shore: 'Ловля с берега',
  hazard: 'Гидротехника, не ловить в охранной зоне',
  restricted: 'Ограничение (запретка/нерест)',
  unknown: 'Тип уточнить на месте'
};

const state = {
  tab: 'advice',
  mode: 'shore',
  fish: null,
  month: new Date().getMonth() + 1,
  temp: 15,
  search: ''
};

const $ = (id) => document.getElementById(id);

function el(tag, attrs = {}, children = []) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') n.className = v;
    else if (k === 'text') n.textContent = v;
    else n.setAttribute(k, v);
  }
  for (const c of children) n.append(c);
  return n;
}

function restrictions(month, fishId) {
  const out = [];
  if (month === 4 || month === 5) out.push({ text: 'Нерестовый запрет: ловля запрещена (с 1 апреля по 10 июня).', cls: 'bad' });
  if (month === 6) out.push({ text: 'До 10 июня включительно действует нерестовый запрет.', cls: 'bad' });
  if ([11, 12, 1, 2, 3].includes(month))
    out.push({ text: 'С 15 ноября по 31 марта запрещена ловля в зимовальной яме «Старобешевская» (10 га).', cls: 'warn' });
  if (fishId === 'shuka' && month >= 1 && month <= 4)
    out.push({ text: 'Щука: запрет с 15 января по 15 апреля.', cls: 'bad' });
  out.push({ text: 'Не ловить в охранных зонах ТЭС, сброса, шлюза, моста, водозабора.', cls: 'warn' });
  out.push({ text: 'Не более 5 крючков на удочку, сети запрещены.', cls: 'warn' });
  return out;
}

function tempAdvice(t) {
  if (t < 8) return 'Очень холодно: медленная проводка, мелкие приманки, рыба на глубине.';
  if (t < 15) return 'Прохладно: ищите 3–6 м, клёв чаще днём.';
  if (t < 22) return 'Тепло: мельче, утро и вечер, отмели.';
  return 'Жара: ранний и поздний клёв, тень и глубина.';
}

function renderChips(container, items, selectedValue, onPick) {
  container.replaceChildren(...items.map(([value, label]) => {
    const btn = el('button', { class: 'chip' + (value === selectedValue ? ' on' : ''), text: label });
    btn.addEventListener('click', () => {
      onPick(value);
      tg && tg.HapticFeedback && tg.HapticFeedback.selectionChanged();
    });
    return btn;
  }));
}

function renderAdvice(data) {
  const fish = data.fish.find(f => f.id === state.fish);
  const cfg = fish[state.mode];

  $('alerts').replaceChildren(...restrictions(state.month, state.fish).map(a =>
    el('div', { class: 'alert ' + a.cls, text: a.text })
  ));

  $('advice-card').replaceChildren(
    el('div', { class: 'card' }, [
      el('div', { class: 'row' }, [el('b', { text: fish.name }),
        el('span', { class: 'hint', text: `  мин. размер: ${fish.minSize}; норма: ${fish.dailyLimit}` })]),
      el('div', { class: 'row', text: `Глубина: ${cfg.depth}` }),
      el('div', { class: 'row', text: `Дистанция / тактика: ${cfg.dist}` }),
      el('div', { class: 'row', text: `Приманка / наживка: ${cfg.bait}` }),
      el('div', { class: 'alert ok', text: (state.temp < 12 ? fish.cold : fish.warm) + ' ' + tempAdvice(state.temp) })
    ])
  );
}

function renderSpots(data) {
  const q = state.search.trim().toLowerCase();
  const list = data.spots.filter(s => !q || s.name.toLowerCase().includes(q) || String(s.id) === q);
  $('spot-list').replaceChildren(...list.map(s =>
    el('div', { class: 'card' }, [
      el('b', { text: `${s.id}. ${s.name}` }),
      el('div', {}, [el('span', { class: `tag t-${s.kind}`, text: KIND[s.kind] || s.kind })]),
      s.note ? el('div', { class: 'row', text: s.note }) : el('span'),
      el('div', { class: 'hint', text: 'Глубину уточнить эхолотом.' })
    ])
  ));
}

function renderControls(data) {
  document.querySelectorAll('#mode button').forEach(b =>
    b.classList.toggle('on', b.dataset.mode === state.mode));
  document.querySelectorAll('#tabs button').forEach(b =>
    b.classList.toggle('on', b.dataset.tab === state.tab));
  $('advice').hidden = state.tab !== 'advice';
  $('spots').hidden = state.tab !== 'spots';

  renderChips($('fish'), data.fish.map(f => [f.id, f.name]), state.fish, v => { state.fish = v; render(); });
  renderChips($('month'), MONTHS.map((m, i) => [i + 1, m]), state.month, v => { state.month = v; render(); });
  $('tempVal').textContent = state.temp;
}

let DATA = null;

function render() {
  renderControls(DATA);
  if (state.tab === 'advice') renderAdvice(DATA);
  else renderSpots(DATA);
}

async function init() {
  const res = await fetch('data.json', { cache: 'no-cache' });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  DATA = await res.json();

  state.fish = DATA.fish[0].id;
  $('title').textContent = DATA.lake;
  $('disclaimer').textContent = DATA.disclaimer;

  document.querySelectorAll('#tabs button').forEach(b =>
    b.addEventListener('click', () => { state.tab = b.dataset.tab; render(); }));
  document.querySelectorAll('#mode button').forEach(b =>
    b.addEventListener('click', () => { state.mode = b.dataset.mode; render(); }));

  $('temp').addEventListener('input', e => { state.temp = +e.target.value; $('tempVal').textContent = state.temp; renderAdvice(DATA); });
  $('search').addEventListener('input', e => { state.search = e.target.value; renderSpots(DATA); });

  render();
}

init().catch(err => {
  $('alerts').replaceChildren(el('div', { class: 'alert bad', text: 'Не удалось загрузить данные: ' + err.message }));
});
