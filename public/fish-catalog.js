/* Общий фотокаталог рыб. Фотографии и лицензии указаны у каждой карточки. */
(function () {
  const fish = [
    { id:'carp', name:'Карп', latin:'Cyprinus carpio', group:'white', note:'Сильная осторожная рыба. Ищите бровки, ракушечник и участки с твёрдым дном.', tackle:['Карповое удилище 3,5 lb','Фидер 3,6–3,9 м','Монтаж метод / волосяная оснастка'], photo:'Common carp - Cyprinus carpio.jpg', author:'Bramans', license:'CC BY-SA 4.0', licenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/', source:'https://commons.wikimedia.org/wiki/File:Common_carp_-_Cyprinus_carpio.jpg' },
    { id:'amur', name:'Белый амур', latin:'Ctenopharyngodon idella', group:'white', note:'Растительноядная рыба. Чаще держится у камыша, травы и прогретых мелководий.', tackle:['Мощная поплавочная удочка','Карповое удилище','Прочная леска и надёжный поводок'], photo:'Ctenopharyngodon idella.jpg', author:'Dezidor', license:'CC BY 3.0', licenseUrl:'https://creativecommons.org/licenses/by/3.0/', source:'https://commons.wikimedia.org/wiki/File:Ctenopharyngodon_idella.jpg' },
    { id:'crucian', name:'Карась', latin:'Carassius gibelio', group:'white', note:'Часто встречается в заливах, у растительности и на илистых мелководьях.', tackle:['Поплавочная удочка 5–6 м','Пикер','Лёгкий фидер'], photo:'Carassius gibelio - Holbina Romania 2015.jpg', author:'David.mailland', license:'CC BY 4.0', licenseUrl:'https://creativecommons.org/licenses/by/4.0/', source:'https://commons.wikimedia.org/wiki/File:Carassius_gibelio_-_Holbina_Romania_2015.jpg' },
    { id:'bream', name:'Лещ', latin:'Abramis brama', group:'white', note:'Стайная донная рыба. Перспективны русловые бровки, ямы и глубокие поливы.', tackle:['Фидер 3,6–3,9 м','Кормушка по силе течения','Пикер на ближней дистанции'], photo:'Abramis brama - 2010-09-24 HBP.jpg', author:'Helge Busch-Paulick (Grand-Duc)', license:'CC BY-SA 3.0 DE', licenseUrl:'https://creativecommons.org/licenses/by-sa/3.0/de/', source:'https://commons.wikimedia.org/wiki/File:Abramis_brama_-_2010-09-24_HBP.jpg' },
    { id:'gustera', name:'Густера', latin:'Blicca bjoerkna', group:'white', note:'Стайная мирная рыба, часто держится рядом с лещом, но подходит на более мелкие участки.', tackle:['Поплавочная удочка','Пикер','Лёгкий фидер'], photo:'SilverBreamBliccaBjoerkna.JPG', author:'Viridiflavus', license:'CC BY-SA 3.0', licenseUrl:'https://creativecommons.org/licenses/by-sa/3.0/', source:'https://commons.wikimedia.org/wiki/File:SilverBreamBliccaBjoerkna.JPG' },
    { id:'roach', name:'Плотва / тарань', latin:'Rutilus rutilus', group:'white', note:'Подвижная стайная рыба. Ищите у камыша, на свалах и в местах с кормом.', tackle:['Поплавочная удочка','Матчевое удилище','Пикер'], photo:'RutilusRutilus.JPG', author:'Piet Spaans (Viridiflavus)', license:'CC BY-SA 2.5', licenseUrl:'https://creativecommons.org/licenses/by-sa/2.5/', source:'https://commons.wikimedia.org/wiki/File:RutilusRutilus.JPG' },
    { id:'zander', name:'Судак', latin:'Sander lucioperca', group:'predator', note:'Хищник с характерной клыкастой пастью. Ищите перепады глубин, каменистое дно и бровки.', tackle:['Джиговый спиннинг 10–35 г','Плетёный шнур','Поводок по условиям ловли'], photo:'Sandre (Sander lucioperca).jpg', author:'Tylwyth Eldar', license:'CC BY-SA 4.0', source:'https://commons.wikimedia.org/wiki/File:Sandre_(Sander_lucioperca).jpg' },
    { id:'pike', name:'Щука', latin:'Esox lucius', group:'predator', note:'Засадный хищник. Держится у травы, камыша, коряжника и границ чистой воды.', tackle:['Спиннинг 10–30 г','Металлический или титановый поводок','Катушка с надёжным фрикционом'], photo:'Esox lucius.jpg', author:'Spinsta', license:'Public domain', licenseUrl:'https://creativecommons.org/publicdomain/mark/1.0/', source:'https://commons.wikimedia.org/wiki/File:Esox_lucius.jpg' },
    { id:'perch', name:'Окунь', latin:'Perca fluviatilis', group:'predator', note:'Стайный хищник. Ищите малька, каменистые участки, бровки и прибрежные укрытия.', tackle:['Ультралайт 2–10 г','Микроджиг','Вращающиеся блёсны №0–2'], photo:'Perca fluviatilis - Perche commune - European perch.jpg', author:'Gilles San Martin', license:'CC BY-SA 2.0', licenseUrl:'https://creativecommons.org/licenses/by-sa/2.0/', source:'https://commons.wikimedia.org/wiki/File:Perca_fluviatilis_-_Perche_commune_-_European_perch.jpg' },
    { id:'catfish', name:'Сом', latin:'Silurus glanis', group:'predator', note:'Крупный ночной хищник. Основные точки — глубокие ямы, старое русло и укрытия.', tackle:['Мощное донное удилище','Силовая катушка','Прочная оснастка с запасом прочности'], photo:'Silurus glanis.jpg', author:'T. Voekler', license:'CC BY-SA 3.0', source:'https://commons.wikimedia.org/wiki/File:Silurus_glanis.jpg' },
    { id:'channelCatfish', name:'Канальный сомик', latin:'Ameiurus melas', group:'predator', note:'Небольшой теплолюбивый сомик. Может активно кормиться в тёплой воде.', tackle:['Фидер','Лёгкая донка','Короткий прочный поводок'], photo:'Ameiurus melas.jpg', author:'FOTO-ARDEIDAS', license:'CC BY-SA 3.0', source:'https://commons.wikimedia.org/wiki/File:Ameiurus_melas.jpg' },
    { id:'goby', name:'Бычок', latin:'Neogobius fluviatilis', group:'predator', note:'Донная рыба, держится на камнях, ракушечнике и возле насыпей.', tackle:['Лёгкая донка','Поплавочная удочка','Микроджиг'], photo:'NeogobiusFluviatilis.JPG', author:'Viridiflavus', license:'CC BY-SA 3.0', source:'https://commons.wikimedia.org/wiki/File:NeogobiusFluviatilis.JPG' }
  ];

  const labels = { spring:'Весна', summer:'Лето', autumn:'Осень', winter:'Зима' };
  const order = ['spring','summer','autumn','winter'];
  const esc = (value) => String(value == null ? '' : value).replace(/[&<>"]/g, (ch) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));
  const seasonNow = () => { const m = new Date().getMonth(); return m >= 2 && m <= 4 ? 'spring' : m >= 5 && m <= 7 ? 'summer' : m >= 8 && m <= 10 ? 'autumn' : 'winter'; };
  let activeFilter = 'all';
  let activeSeason = seasonNow();

  function photoUrl(file) { return 'https://commons.wikimedia.org/wiki/Special:FilePath/' + encodeURIComponent(file) + '?width=960'; }

  function card(item) {
    return '<article class="fish-catalog-card" data-fish-card="' + item.id + '" tabindex="0" role="button" aria-label="Подробнее: ' + esc(item.name) + '">' +
      '<div class="fish-catalog-photo"><img src="' + photoUrl(item.photo) + '" alt="' + esc(item.name) + '" loading="lazy"><span class="fish-catalog-kind ' + item.group + '">' + (item.group === 'white' ? 'Мирная рыба' : 'Хищник') + '</span></div>' +
      '<div class="fish-catalog-copy"><h4>' + esc(item.name) + '</h4><span class="fish-catalog-latin">' + esc(item.latin) + '</span><p>' + esc(item.note) + '</p><span class="fish-catalog-more">Открыть карточку <span aria-hidden="true">↗</span></span></div>' +
      '<div class="fish-photo-credit">Фото: ' + esc(item.author) + ' · ' + esc(item.license) + '</div></article>';
  }

  function renderList() {
    const grid = document.getElementById('fishCatalogGrid');
    const count = document.getElementById('fishCatalogCount');
    const query = (document.getElementById('fishCatalogSearch')?.value || '').trim().toLocaleLowerCase('ru');
    if (!grid) return;
    const shown = fish.filter((item) => (activeFilter === 'all' || item.group === activeFilter) && (!query || (item.name + ' ' + item.latin + ' ' + item.note).toLocaleLowerCase('ru').includes(query)));
    grid.innerHTML = shown.map(card).join('');
    if (count) count.textContent = shown.length + ' из ' + fish.length;
    grid.querySelectorAll('[data-fish-card]').forEach((el) => {
      const open = () => openFish(el.dataset.fishCard);
      el.addEventListener('click', open);
      el.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); open(); } });
    });
  }

  function seasonPanel(item, season) {
    const guide = window.FISH_GUIDE && window.FISH_GUIDE[item.id];
    const data = guide && guide.seasons && guide.seasons[season];
    if (!data) return '<p class="fish-modal-note">Сезонные рекомендации для этого периода ещё готовятся.</p>';
    const baits = (data.baits || []).map((bait) => '<span class="tag">' + esc(bait) + '</span>').join('');
    return '<div class="fish-modal-section"><h5>Насадки и приманки</h5>' + (baits ? '<div class="fish-modal-tags">' + baits + '</div>' : '<p>Специальные насадки не указаны.</p>') + '</div>' +
      '<div class="fish-modal-section"><h5>Прикормка и рецепт</h5><p>' + esc(data.groundbaitRecipe || 'Для этого вида прикормка не применяется.') + '</p></div>' +
      '<div class="fish-modal-tip">💡 ' + esc(data.tips || '') + '</div>';
  }

  function openFish(id) {
    const item = fish.find((entry) => entry.id === id);
    const modal = document.getElementById('fishCatalogModal');
    const content = document.getElementById('fishCatalogModalContent');
    if (!item || !modal || !content) return;
    activeSeason = seasonNow();
    content.innerHTML = '<div class="fish-modal-hero"><img src="' + photoUrl(item.photo) + '" alt="' + esc(item.name) + '"><div><span class="fish-catalog-kind ' + item.group + '">' + (item.group === 'white' ? 'Мирная рыба' : 'Хищник') + '</span><h3>' + esc(item.name) + '</h3><p class="fish-modal-latin">' + esc(item.latin) + '</p><p>' + esc(item.note) + '</p></div></div>' +
      '<div class="fish-modal-section"><h5>На какие снасти ловить</h5><div class="fish-modal-tags">' + item.tackle.map((t) => '<span class="tag">' + esc(t) + '</span>').join('') + '</div></div>' +
      '<div class="fish-season-tabs">' + order.map((s) => '<button type="button" class="fish-season-tab ' + (s === activeSeason ? 'active' : '') + '" data-season="' + s + '">' + labels[s] + '</button>').join('') + '</div>' +
      '<div id="fishModalSeasonContent">' + seasonPanel(item, activeSeason) + '</div>' +
      '<div class="fish-photo-source">Фотография: <a href="' + item.source + '" target="_blank" rel="noopener">' + esc(item.author) + '</a> · ' + esc(item.license) + ' · <a href="' + item.licenseUrl + '" target="_blank" rel="noopener">условия лицензии</a></div>';
    modal.hidden = false;
    document.body.classList.add('fish-modal-open');
    modal.querySelector('.fish-modal-close')?.focus();
    modal.querySelectorAll('[data-season]').forEach((button) => button.addEventListener('click', () => {
      activeSeason = button.dataset.season;
      modal.querySelectorAll('.fish-season-tab').forEach((tab) => tab.classList.toggle('active', tab === button));
      const target = document.getElementById('fishModalSeasonContent');
      if (target) target.innerHTML = seasonPanel(item, activeSeason);
    }));
  }

  function closeModal() {
    const modal = document.getElementById('fishCatalogModal');
    if (modal) modal.hidden = true;
    document.body.classList.remove('fish-modal-open');
  }

  function init() {
    if (!document.getElementById('fishCatalogGrid')) return;
    renderList();
    document.getElementById('fishCatalogSearch')?.addEventListener('input', renderList);
    document.querySelectorAll('[data-fish-filter]').forEach((button) => button.addEventListener('click', () => {
      activeFilter = button.dataset.fishFilter;
      document.querySelectorAll('[data-fish-filter]').forEach((b) => b.classList.toggle('active', b === button));
      renderList();
    }));
    document.querySelector('.fish-modal-close')?.addEventListener('click', closeModal);
    document.getElementById('fishCatalogModal')?.addEventListener('click', (event) => { if (event.target.id === 'fishCatalogModal') closeModal(); });
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeModal(); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();