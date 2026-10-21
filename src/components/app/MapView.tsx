import { useState } from 'react'
import { Minus, Plus } from 'lucide-react'

import { FISH, SPOTS, type FishId, type Spot } from '@/data/reservoir'
import { haptic } from '@/lib/telegram'
import { cn } from '@/lib/utils'

const MAP_SRC = '/.netlify/images?url=/img/starobeshevo-map.jpg&w=600&fm=webp&q=90'
const ZOOMS = [1, 1.6, 2.4]

export function MapView({
  fishFilter,
  onFishFilter,
  onSelectSpot,
}: {
  fishFilter: FishId | null
  onFishFilter: (id: FishId | null) => void
  onSelectSpot: (s: Spot) => void
}) {
  const [zoom, setZoom] = useState(0)
  const matches = fishFilter ? SPOTS.filter((s) => s.fish.includes(fishFilter)) : SPOTS

  return (
    <div className="space-y-3">
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
        <Chip active={!fishFilter} onClick={() => onFishFilter(null)}>
          Все места
        </Chip>
        {FISH.map((f) => (
          <Chip key={f.id} active={fishFilter === f.id} onClick={() => onFishFilter(f.id)}>
            {f.name}
          </Chip>
        ))}
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-border bg-secondary shadow-2xl shadow-black/40">
        <div className="no-scrollbar max-h-[62vh] overflow-auto">
          <div
            className="relative transition-[width] duration-300"
            style={{ width: `${ZOOMS[zoom] * 100}%`, aspectRatio: '600 / 517' }}
          >
            <img
              src={MAP_SRC}
              alt="Карта рыболовных мест Старобешевского водохранилища"
              className="absolute inset-0 h-full w-full select-none"
              draggable={false}
            />
            {SPOTS.map((s) => {
              const active = !fishFilter || s.fish.includes(fishFilter)
              const top = fishFilter && s.fish[0] === fishFilter
              return (
                <button
                  key={s.id}
                  onClick={() => {
                    haptic('tap')
                    onSelectSpot(s)
                  }}
                  aria-label={`${s.id}. ${s.name}`}
                  className={cn(
                    'absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full font-bold shadow-lg ring-2 transition-all',
                    'size-6 text-[10px]',
                    active
                      ? 'z-10 bg-primary text-primary-foreground ring-background'
                      : 'bg-background/70 text-muted-foreground opacity-40 ring-transparent',
                    top && 'marker-pulse z-20 size-7 text-primary',
                  )}
                  style={{ left: `${s.x}%`, top: `${s.y}%` }}
                >
                  <span className={cn('relative', top && 'text-primary-foreground')}>{s.id}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="absolute right-2 bottom-2 flex flex-col overflow-hidden rounded-2xl border border-border bg-background/85 backdrop-blur">
          <button
            className="p-2.5 disabled:opacity-30"
            disabled={zoom === ZOOMS.length - 1}
            onClick={() => setZoom((z) => z + 1)}
            aria-label="Приблизить"
          >
            <Plus className="size-4" />
          </button>
          <div className="h-px bg-border" />
          <button
            className="p-2.5 disabled:opacity-30"
            disabled={zoom === 0}
            onClick={() => setZoom((z) => z - 1)}
            aria-label="Отдалить"
          >
            <Minus className="size-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-[11px] leading-tight text-muted-foreground">
        <Legend color="bg-[#2ecc40]">Хищник с лодки: ямы, свалы, перепады</Legend>
        <Legend color="bg-[#ffd400]">С берега: карп, карась, лещ, густера</Legend>
        <Legend color="bg-[#3b5bdb]">Опоры ЛЭП — осторожно</Legend>
      </div>

      <div>
        <div className="mb-2 flex items-baseline justify-between">
          <h2 className="font-display text-base font-bold">
            {fishFilter ? 'Где ловить' : 'Все места'}
          </h2>
          <span className="text-xs text-muted-foreground">{matches.length} мест</span>
        </div>
        <div className="space-y-2">
          {matches.map((s) => (
            <button
              key={s.id}
              onClick={() => onSelectSpot(s)}
              className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-3 text-left transition active:scale-[0.98]"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-secondary font-display text-sm font-bold text-primary">
                {s.id}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold">{s.name}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {s.depth} · {s.distance}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={() => {
        haptic()
        onClick()
      }}
      className={cn(
        'shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium whitespace-nowrap transition',
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-secondary/60 text-foreground',
      )}
    >
      {children}
    </button>
  )
}

function Legend({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-1.5 rounded-xl bg-secondary/50 p-2">
      <span className={cn('mt-0.5 size-2.5 shrink-0 rounded-full', color)} />
      <span>{children}</span>
    </div>
  )
}
