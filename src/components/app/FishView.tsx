import { FISH, SEASONS, SPOTS, type FishId } from '@/data/reservoir'
import { cn } from '@/lib/utils'

export function FishView({
  openFish,
  onToggle,
  onShowOnMap,
}: {
  openFish: FishId | null
  onToggle: (id: FishId | null) => void
  onShowOnMap: (id: FishId) => void
}) {
  return (
    <div className="space-y-6">
      {(['white', 'predator'] as const).map((kind) => (
        <section key={kind}>
          <h2 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <span
              className={cn('size-2 rounded-full', kind === 'white' ? 'bg-accent' : 'bg-chart-2')}
            />
            {kind === 'white' ? 'Мирная рыба' : 'Хищник'}
          </h2>
          <div className="space-y-2">
            {FISH.filter((f) => f.kind === kind).map((f) => {
              const open = openFish === f.id
              const spots = SPOTS.filter((s) => s.fish.slice(0, 2).includes(f.id))
              return (
                <article
                  key={f.id}
                  className={cn(
                    'overflow-hidden rounded-2xl border bg-card transition',
                    open ? 'border-primary/50' : 'border-border',
                  )}
                >
                  <button
                    onClick={() => onToggle(open ? null : f.id)}
                    className="flex w-full items-start gap-3 p-4 text-left"
                  >
                    <div className="flex-1">
                      <h3 className="font-display text-lg font-bold">{f.name}</h3>
                      <p className="text-sm text-muted-foreground">{f.short}</p>
                    </div>
                    <span className="mt-1 text-right text-xs leading-tight text-primary">
                      {f.depth}
                      <br />
                      <span className="text-muted-foreground">{f.distance}</span>
                    </span>
                  </button>
                  {open && (
                    <div className="space-y-3 border-t border-border px-4 pt-3 pb-4 text-sm">
                      <Row label="Насадки">{f.baits.join(', ')}</Row>
                      {f.groundbait && <Row label="Прикормка">{f.groundbait}</Row>}
                      <Row label="Снасти">{f.tackle.join(', ')}</Row>
                      <Row label="Лучшее время">{f.bestTime}</Row>
                      <Row label="Сезоны">{f.seasons.map((s) => SEASONS[s]).join(', ')}</Row>
                      <p className="rounded-xl bg-muted p-3">{f.tips}</p>
                      {spots.length > 0 && (
                        <Row label="Топ-места">
                          {spots.map((s) => `${s.id}. ${s.name}`).join(' · ')}
                        </Row>
                      )}
                      <button
                        onClick={() => onShowOnMap(f.id)}
                        className="w-full rounded-xl bg-primary py-2.5 font-semibold text-primary-foreground"
                      >
                        Показать места на карте
                      </button>
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        </section>
      ))}

      <p className="rounded-2xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
        Толстолоб: ловля на водоёме запрещена.
      </p>
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div>{children}</div>
    </div>
  )
}
