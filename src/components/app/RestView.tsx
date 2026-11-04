import { useMemo, useState } from 'react'
import { ArrowUpRight, MapPin, Search, TentTree, Waves } from 'lucide-react'

type Place = {
  name: string
  area: string
  kind: string
  description: string
  fish: string[]
  features: string[]
  address: string
  status: 'База отдыха' | 'Рыболовный водоём' | 'Парк отдыха'
  source: string
}

const PLACES: Place[] = [
  {
    name: 'Кирша',
    area: 'Донецк, Кировский район',
    kind: 'Пруд и зона отдыха',
    description: 'Известный рыболовный пруд. В открытых описаниях упоминаются домики для проживания и отдельная оплата рыбалки. Актуальные тарифы и режим работы требуют подтверждения.',
    fish: ['Щука', 'Окунь', 'Судак', 'Карп'],
    features: ['Рыбалка', 'Отдых у воды', 'Домики (по старым описаниям)'],
    address: 'Пруд Кирша, Донецк, ДНР',
    status: 'Рыболовный водоём',
    source: 'https://i-don.ru/rybnye-mesta-v-dnr/',
  },
  {
    name: 'Зорянка',
    area: 'Донецкая область',
    kind: 'Рыболовный водоём',
    description: 'Водоём для рыбалки. По предоставленным материалам: в водоём специально запускали сазана весом примерно 2–5 кг. Условия посещения и инфраструктуру уточняем.',
    fish: ['Сазан', 'Карп'],
    features: ['Рыбалка', 'Зарыбление'],
    address: 'Водоём Зорянка, Донецкая область',
    status: 'Рыболовный водоём',
    source: '',
  },
  {
    name: 'Григоровка',
    area: 'Донецкая область',
    kind: 'Рыболовная локация',
    description: 'Добавляем в каталог как отдельное место для рыбалки. Точный водоём, правила доступа, перечень услуг и контакты необходимо подтвердить по первоисточникам.',
    fish: [],
    features: ['Рыбалка'],
    address: 'Григоровка, Донецкая область',
    status: 'Рыболовный водоём',
    source: '',
  },
  {
    name: 'Рыбацкий Хуторок',
    area: 'Село Доля, Волновахский район',
    kind: 'Рыболовный комплекс',
    description: 'В старых описаниях комплекса указаны водоём, рыбалка, домики и беседки. Есть сведения о карпе, амуре, карасе, соме, судаке и щуке. Перед поездкой обязательно уточнить, работает ли объект сейчас.',
    fish: ['Карп', 'Белый амур', 'Карась', 'Сом', 'Судак', 'Щука'],
    features: ['Рыбалка', 'Домики', 'Беседки'],
    address: 'Рыбацкий Хуторок, село Доля, ДНР',
    status: 'База отдыха',
    source: 'https://alldonetsk.com/place/kompleks-rybatskiy-hutorok.html',
  },
  {
    name: 'Пикник-парк «Роща»',
    area: 'Донецк, улица Сигова, 52',
    kind: 'Парк отдыха',
    description: 'В каталоге услуг указаны беседки, ресторан, баня, бассейн и рыбалка. Наличие рыбалки и условия посещения нужно перепроверить перед визитом.',
    fish: [],
    features: ['Рыбалка (по каталогу)', 'Беседки', 'Ресторан', 'Бассейн'],
    address: 'Пикник-парк Роща, улица Сигова 52, Донецк',
    status: 'Парк отдыха',
    source: 'https://more-dnr.ru/turbazy_dnr/otdyh_za_gorodom/piknik-park_rowa_makeevka/',
  },
  {
    name: 'Песчаный пруд',
    area: 'Донецк, микрорайон Широкий',
    kind: 'Пруд для рыбалки',
    description: 'Известная городская рыболовная локация. Это не подтверждённая база отдыха: наличие домиков, беседок и платных услуг не заявляем.',
    fish: [],
    features: ['Рыбалка'],
    address: 'Песчаный пруд, микрорайон Широкий, Донецк',
    status: 'Рыболовный водоём',
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
    const text = [place.name, place.area, place.description, ...place.fish].join(' ').toLowerCase()
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
            <Waves className="size-4" /> {PLACES.length} мест в первом списке
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
