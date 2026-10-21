import { useState } from 'react'
import { ChevronRight, Sparkles } from 'lucide-react'

import {
  FISH,
  FISH_BY_ID,
  METHODS,
  SEASONS,
  currentSeason,
  rankSpots,
  type FishId,
  type Method,
  type Season,
  type Spot,
} from '@/data/reservoir'
import { Chip } from './MapView'

export function PickerView({
  onSelectSpot,
  onShowOnMap,
}: {
  onSelectSpot: (s: Spot, fish: FishId) => void
  onShowOnMap: (fish: FishId) => void
}) {
  const [fishId, setFishId] = useState<FishId>('carp')
  const [season, setSeason] = useState<Season>(() => currentSeason())
  const [method, setMethod] = useState<Method | 'any'>('any')

  const fish = FISH_BY_ID[fishId]
  const results = rankSpots(fishId, season, method)
  const offSeason = !fish.seasons.includes(season)

  return (
    <div className="space-y-5">
      <section>
        <Label>Какую рыбу ловим</Label>
        <div className="grid grid-cols-3 gap-2">
          {FISH.map((f) => (
            <button
              key={f.id}
              onClick={() => setFishId(f.id)}
              className={`rounded-2xl border px-2 py-2.5 text-sm font-semibold transition active:scale-95 ${
                f.id === fishId
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-secondary/60'
              }`}
            >
              {f.name}
            </button>
          ))}
        </div>
      </section>

      <section>
        <Label>Сезон</Label>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(SEASONS) as Season[]).map((s) => (
            <Chip key={s} active={season === s} onClick={() => setSeason(s)}>
              {SEASONS[s]}
            </Chip>
          ))}
        </div>
      </section>

      <section>
        <Label>Как ловим</Label>
        <div className="flex flex-wrap gap-2">
          <Chip active={method === 'any'} onClick={() => setMethod('any')}>
            Любой
          </Chip>
          {(Object.keys(METHODS) as Method[]).map((m) => (
            <Chip key={m} active={method === m} onClick={() => setMethod(m)}>
              {METHODS[m]}
            </Chip>
          ))}
        </div>
      </section>

      <section className="contour relative overflow-hidden rounded-3xl border border-primary/30 bg-card p-4">
        <div className="mb-3 flex items-center gap-2 text-primary">
          <Sparkles className="size-4" />
          <span className="text-xs font-bold uppercase tracking-wider">Рецепт</span>
        </div>
        <h3 className="font-display text-2xl font-bold">{fish.name}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{fish.short}</p>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <Item label="Глубина" value={fish.depth} />
          <Item label="Дистанция" value={fish.distance} />
          <Item label="Время" value={fish.bestTime} />
          <Item label="Снасть" value={fish.tackle[0]} />
        </dl>
        <div className="mt-4">
          <div className="mb-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
            Насадка / приманка
          </div>
          <div className="flex flex-wrap gap-1.5">
            {fish.baits.map((b) => (
              <span
                key={b}
                className="rounded-full border border-accent/40 bg-accent/10 px-2.5 py-0.5 text-sm text-accent"
              >
                {b}
              </span>
            ))}
          </div>
        </div>
        {fish.groundbait && (
          <p className="mt-3 text-sm">
            <span className="text-muted-foreground">Прикормка: </span>
            {fish.groundbait}
          </p>
        )}
        {offSeason && (
          <p className="mt-3 rounded-xl bg-destructive/10 p-2.5 text-xs text-destructive">
            {SEASONS[season]} — не лучший сезон для этой рыбы. Клёв возможен, но слабее.
          </p>
        )}
      </section>

      <section>
        <div className="mb-2 flex items-baseline justify-between">
          <Label className="mb-0">Лучшие места</Label>
          <button
            onClick={() => onShowOnMap(fishId)}
            className="text-xs font-semibold text-primary"
          >
            Показать на карте
          </button>
        </div>
        {results.length === 0 ? (
          <p className="rounded-2xl bg-muted p-4 text-sm text-muted-foreground">
            Нет мест под этот способ ловли. Попробуйте «Любой».
          </p>
        ) : (
          <ol className="space-y-2">
            {results.map(({ spot }, i) => (
              <li key={spot.id}>
                <button
                  onClick={() => onSelectSpot(spot, fishId)}
                  className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-3 text-left transition active:scale-[0.98]"
                >
                  <span
                    className={`flex size-9 shrink-0 items-center justify-center rounded-xl font-display text-sm font-bold ${
                      i < 3 ? 'bg-primary text-primary-foreground' : 'bg-secondary text-primary'
                    }`}
                  >
                    {spot.id}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{spot.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {spot.depth} · {spot.distance}
                    </span>
                  </span>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </button>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  )
}

function Label({ children, className = 'mb-2' }: { children: React.ReactNode; className?: string }) {
  return (
    <h2
      className={`${className} text-xs font-semibold uppercase tracking-wider text-muted-foreground`}
    >
      {children}
    </h2>
  )
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  )
}
