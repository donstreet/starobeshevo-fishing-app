import { useMemo, useState } from 'react'
import { ArrowUpRight, MapPin, Search, TentTree, Waves } from 'lucide-react'

type Place = {
  name: string
  area: string
  description: string
  fish: string[]
  features: string[]
  address: string
  status: 'База отдыха' | 'Рыболовный водоём' | 'Парк отдыха'
  access: 'Платная рыбалка' | 'Свободная рыбалка' | 'Условия уточняются'
  source: string
}

const PLACES: Place[] = [
  {
    name: 'Пикник-парк «Роща»',
    area: 'Донецк, Калининский район, ул. Сигова, 52',
    description: 'На территории есть отдельный рыболовный комплекс площадью около 6 га, мостики для ловли и подъезд к берегу. На сайте комплекса указаны круглогодичный доступ и платная рыбалка. Перед поездкой уточните действующий режим работы и тарифы.',
    fish: ['Карп', 'Белый амур', 'Карась', 'Щука', 'Судак', 'Баффало'],
    features: ['Рыболовный комплекс', 'Мостики', 'Подъезд к берегу', 'Тел. +7 (949) 313-00-03'],
    address: 'Пикник-парк Роща, улица Сигова 52, Донецк',
    status: 'Парк отдыха',
    access: 'Платная рыбалка',
    source: 'https://park-rosha.com/fishing.html',
  },
  {
    name: 'Кирша',
    area: 'Донецк, микрорайон Широкий',
    description: 'Известный городской пруд для рыбалки. В открытых описаниях упоминаются карась, карп и белый амур. Сведения о домиках и оплате встречаются в старых публикациях, поэтому наличие услуг нужно уточнить.',
    fish: ['Карась', 'Карп', 'Белый амур', 'Уклейка', 'Краснопёрка'],
    features: ['Рыбалка', 'Отдых у воды'],
    address: 'Пруд Кирша, микрорайон Широкий, Донецк',
    status: 'Рыболовный водоём',
    access: 'Условия уточняются',
    source: 'https://i-don.ru/rybnye-mesta-v-dnr/',
  },
  {
    name: 'Зорянка',
    area: 'Донецкая область, точное расположение уточняется',
    description: 'Отдельный водоём из рыболовных материалов пользователя. Сазан весом примерно 2–5 кг запускался специально для рыбалки. Не объединять с водоёмом «Зорянский» у Орловки: это название требует отдельной проверки.',
    fish: ['Сазан 2–5 кг', 'Карп'],
    features: ['Целевое зарыбление сазаном'],
    address: 'Водоём Зорянка, Донецкая область',
    status: 'Рыболовный водоём',
    access: 'Условия уточняются',
    source: '',
  },
  {
    name: 'Григоровка',
    area: 'Донецкая область, точный водоём уточняется',
    description: 'Место встречается в рыболовных отчётах. Рыбаки сообщали о поимках карпа и белого амура. Правила доступа, точное расположение и услуги пока не подтверждены.',
    fish: ['Карп', 'Белый амур'],
    features: ['Рыболовные отчёты'],
    address: 'Рыбалка Григоровка, Донецкая область',
    status: 'Рыболовный водоём',
    access: 'Условия уточняются',
    source: 'https://t.me/rybalka_dnr',
  },
  {
    name: 'Рыбацкий Хуторок',
    area: 'Село Доля, Волновахский район',
    description: 'В старых каталогах описан как рыболовный комплекс с водоёмом, домиками и беседками. Есть сведения о карпе, амуре, карасе, соме, судаке и щуке. Актуальную работу объекта и контакты подтвердить не удалось.',
    fish: ['Карп', 'Белый амур', 'Карась', 'Сом', 'Судак', 'Щука'],
    features: ['Рыбалка', 'Домики (по старым описаниям)', 'Беседки (по старым описаниям)'],
    address: 'Рыбацкий Хуторок, село Доля, Волновахский район',
    status: 'База отдыха',
    access: 'Условия уточняются',
    source: 'https://alldonetsk.com/place/kompleks-rybatskiy-hutorok.html',
  },
  {
    name: 'Песчаный пруд',
    area: 'Донецк, микрорайон Широкий',
    description: 'Городская рыболовная локация. В справочниках отмечается как место для ловли, но подтверждений базы отдыха, домиков или организованного сервиса нет.',
    fish: [],
    features: ['Рыбалка'],
    address: 'Песчаный пруд, микрорайон Широкий, Донецк',
    status: 'Рыболовный водоём',
    access: 'Условия уточняются',
    source: 'https://i-don.ru/rybnye-mesta-v-dnr/',
  },
  {
    name: 'Донецкое море',
    area: 'Донецк, Ленинский район',
    description: 'Крупное водохранилище на южной окраине города. В справочниках указаны карповые и хищные виды. Это природная рыболовная локация, не база отдыха.',
    fish: ['Щука', 'Окунь', 'Карп', 'Лещ', 'Плотва', 'Карась', 'Толстолобик', 'Белый амур'],
    features: ['Большой водоём', 'Рыбалка'],
    address: 'Донецкое море, Донецк',
    status: 'Рыболовный водоём',
    access: 'Условия уточняются',
    source: 'https://i-don.ru/rybnye-mesta-v-dnr/',
  },
  {
    name: 'Нижнекальмиусское водохранилище',
    area: 'Донецк, центральная часть города',
    description: 'Городское водохранилище. В справочниках среди возможных трофеев отмечены судак, щука, карась, карп и голавль. Конкретные места ловли и ограничения нужно уточнять на месте.',
    fish: ['Судак', 'Щука', 'Карась', 'Карп', 'Голавль'],
    features: ['Рыбалка в черте города'],
    address: 'Нижнекальмиусское водохранилище, Донецк',
    status: 'Рыболовный водоём',
    access: 'Условия уточняются',
    source: 'https://i-don.ru/rybnye-mesta-v-dnr/',
  },
  {
    name: 'Медвежка',
    area: 'Около 5 км от Харцызска',
    description: 'Водоём, известный среди любителей спортивной ловли. В публикациях отмечены соревнования и наличие карпа с белым амуром. Условия доступа и актуальные ограничения не подтверждены.',
    fish: ['Карп', 'Белый амур', 'Карась', 'Краснопёрка'],
    features: ['Спортивная ловля (по публикациям)'],
    address: 'Водоём Медвежка, Харцызск, ДНР',
    status: 'Рыболовный водоём',
    access: 'Условия уточняются',
    source: 'https://i-don.ru/rybnye-mesta-v-dnr/',
  },
  {
    name: 'Ханженковское водохранилище',
    area: 'Между Нижней Крынкой и Зуевкой',
    description: 'Крупный водоём, популярный у рыбаков. В открытых материалах упоминаются сазан, карась, окунь и другие виды. На берегах исторически располагались базы отдыха, часть объектов могла прекратить работу или быть заброшена.',
    fish: ['Сазан', 'Карась', 'Окунь', 'Карп', 'Щука'],
    features: ['Рыбалка', 'Береговые зоны отдыха'],
    address: 'Ханженковское водохранилище, ДНР',
    status: 'Рыболовный водоём',
    access: 'Условия уточняются',
    source: 'https://donrctk.ru/erc/po_okrestnostjam_zuevki-2020_g-opisanie_marshruta.pdf',
  },
  {
    name: 'Зуевское водохранилище',
    area: 'Район посёлка Зуевка',
    description: 'Загородная локация для отдыха у воды и рыбалки. Инфраструктуру, разрешённые участки ловли и доступ к берегу следует проверять отдельно.',
    fish: [],
    features: ['Природный отдых', 'Рыбалка'],
    address: 'Зуевское водохранилище, Зуевка, ДНР',
    status: 'Рыболовный водоём',
    access: 'Условия уточняются',
    source: 'https://i-don.ru/rybnye-mesta-v-dnr/',
  },
  {
    name: 'Ольховское водохранилище',
    area: 'Восточнее посёлка Зуевка',
    description: 'Водоём в районе Зуевки. Поблизости известны природные скальные участки. Не является подтверждённой коммерческой базой отдыха.',
    fish: [],
    features: ['Отдых на природе', 'Рыбалка'],
    address: 'Ольховское водохранилище, ДНР',
    status: 'Рыболовный водоём',
    access: 'Условия уточняются',
    source: 'https://i-don.ru/rybnye-mesta-v-dnr/',
  },
  {
    name: 'Старобешевское водохранилище',
    area: 'Посёлок Новый Свет, Старобешевский район',
    description: 'Большой водоём, который упоминается в региональных обзорах как место для рыбалки и отдыха у воды. Наличие оборудованных пляжей, баз и разрешённых участков нужно уточнять.',
    fish: [],
    features: ['Рыбалка', 'Отдых у воды'],
    address: 'Старобешевское водохранилище, Новый Свет, ДНР',
    status: 'Рыболовный водоём',
    access: 'Условия уточняются',
    source: 'https://i-don.ru/rybnye-mesta-v-dnr/',
  },
]

const FILTERS = ['Все места', 'Базы отдыха', 'Водоёмы', 'Парки']

export function RestView() {
  const [filter, setFilter] = useState('Все места')
  const [query, setQuery] = useState('')
  const visible = useMemo(() => PLACES.filter((place) => {
    const matchesFilter = filter === 'Все места'
      || (filter === 'Базы отдыха' && place.status === 'База отдыха')
      || (filter === 'Водоёмы' && place.status === 'Рыболовный водоём')
      || (filter === 'Парки' && place.status === 'Парк отдыха')
    const text = [place.name, place.area, place.description, place.access, ...place.fish].join(' ').toLowerCase()
    return matchesFilter && text.includes(query.toLowerCase())
  }), [filter, query])

  return (
    <section className="space-y-4 pb-4">
      <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-emerald-950 via-slate-900 to-cyan-950 p-5 text-white shadow-xl">
        <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-emerald-400/10 blur-2xl" />
        <div className="relative">
          <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-emerald-200">
            <TentTree className="size-4" /> Рыболовный гид
          </div>
          <h2 className="font-display text-3xl font-extrabold leading-tight">Где отдохнуть</h2>
          <p className="mt-2 max-w-[280px] text-sm leading-relaxed text-slate-200">
            Базы, водоёмы и места для отдыха с удочкой. Выбирай точку и прокладывай маршрут.
          </p>
          <div className="mt-4 flex items-center gap-2 text-xs text-emerald-100">
            <Waves className="size-4" /> {PLACES.length} мест в каталоге
          </div>
        </div>
      </div>

      <label className="flex items-center gap-2 rounded-2xl border border-border bg-card px-3 py-3">
        <Search className="size-4 text-muted-foreground" />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Найти базу или водоём..." className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
      </label>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((item) => (
          <button key={item} onClick={() => setFilter(item)} className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition ${filter === item ? 'bg-primary text-primary-foreground shadow' : 'border border-border bg-card text-muted-foreground'}`}>
            {item}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {visible.map((place, index) => (
          <article key={place.name} className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
            <div className={`relative flex h-36 items-end overflow-hidden p-4 ${index % 3 === 0 ? 'bg-gradient-to-br from-teal-800 via-emerald-900 to-slate-950' : index % 3 === 1 ? 'bg-gradient-to-br from-sky-800 via-cyan-950 to-slate-950' : 'bg-gradient-to-br from-lime-900 via-green-950 to-slate-950'}`}>
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, white 1px, transparent 1px)', backgroundSize: '18px 18px' }} />
              <div className="relative flex w-full items-end justify-between">
                <div>
                  <span className="mb-2 inline-flex rounded-full border border-white/20 bg-black/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-100 backdrop-blur">
                    {place.status}
                  </span>
                  <h3 className="font-display text-2xl font-extrabold text-white">{place.name}</h3>
                  <p className="mt-1 flex items-center gap-1 text-xs text-white/80"><MapPin className="size-3" />{place.area}</p>
                </div>
                <Waves className="mb-1 size-9 text-white/70" />
              </div>
            </div>
            <div className="space-y-3 p-4">
              <div className="flex flex-wrap gap-1.5">
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">{place.access}</span>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">{place.description}</p>
              {place.fish.length > 0 && <div className="flex flex-wrap gap-1.5">{place.fish.map((fish) => <span key={fish} className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">{fish}</span>)}</div>}
              <div className="flex flex-wrap gap-1.5">{place.features.map((feature) => <span key={feature} className="rounded-lg bg-secondary px-2 py-1 text-[10px] text-secondary-foreground">{feature}</span>)}</div>
              <div className="flex gap-2 pt-1">
                <a href={`https://yandex.ru/maps/?text=${encodeURIComponent(place.address)}`} target="_blank" rel="noreferrer" className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-3 py-3 text-sm font-bold text-primary-foreground">
                  <MapPin className="size-4" /> Поехали
                </a>
                {place.source && <a href={place.source} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-xl border border-border px-3 py-3 text-xs font-semibold text-muted-foreground">Источник <ArrowUpRight className="size-3.5" /></a>}
              </div>
              <p className="text-[10px] leading-relaxed text-muted-foreground">Данные собраны из открытых публикаций. Перед поездкой проверь актуальность работы, доступ и правила рыбалки.</p>
            </div>
          </article>
        ))}
        {visible.length === 0 && <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">Ничего не найдено. Попробуй изменить запрос.</p>}
      </div>
    </section>
  )
}
