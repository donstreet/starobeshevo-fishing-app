import { useEffect } from 'react'
import { Anchor, Fish as FishIcon, Ruler, TriangleAlert, Waves } from 'lucide-react'

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { AREAS, FISH_BY_ID, METHODS, SEASONS, type FishId, type Spot } from '@/data/reservoir'
import { bindBackButton } from '@/lib/telegram'
import { cn } from '@/lib/utils'

export function SpotSheet({
  spot,
  highlightFish,
  onClose,
  onOpenFish,
}: {
  spot: Spot | null
  highlightFish?: FishId | null
  onClose: () => void
  onOpenFish: (id: FishId) => void
}) {
  useEffect(() => {
    if (!spot) return
    return bindBackButton(onClose)
  }, [spot, onClose])

  return (
    <Sheet open={!!spot} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="bottom"
        className="mx-auto max-h-[85vh] w-full max-w-md overflow-y-auto rounded-t-3xl border-border bg-popover px-0 pb-safe"
      >
        {spot && (
          <>
            <div className="mx-auto mt-2 h-1.5 w-10 rounded-full bg-border" />
            <SheetHeader className="px-5 pt-2 text-left">
              <div className="flex items-center gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary font-display text-lg font-bold text-primary-foreground">
                  {spot.id}
                </span>
                <div>
                  <SheetTitle className="font-display text-xl leading-tight">
                    {spot.name}
                  </SheetTitle>
                  <SheetDescription className="text-xs">{AREAS[spot.area]}</SheetDescription>
                </div>
              </div>
            </SheetHeader>

            <div className="space-y-5 px-5 pb-4">
              <div className="grid grid-cols-2 gap-2">
                <Stat icon={<Waves className="size-4" />} label="Глубина" value={spot.depth} />
                <Stat icon={<Ruler className="size-4" />} label="Дистанция" value={spot.distance} />
                <Stat icon={<Anchor className="size-4" />} label="Дно" value={spot.bottom} />
                <Stat
                  icon={<FishIcon className="size-4" />}
                  label="Как ловить"
                  value={spot.methods.map((m) => METHODS[m]).join(' · ')}
                />
              </div>

              {spot.restricted && (
                <div className="flex gap-2 rounded-2xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                  <TriangleAlert className="mt-0.5 size-4 shrink-0" />
                  {spot.restricted}
                </div>
              )}

              <section>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Что ловится
                </h3>
                <div className="space-y-2">
                  {spot.fish.map((id, i) => {
                    const f = FISH_BY_ID[id]
                    return (
                      <button
                        key={id}
                        onClick={() => onOpenFish(id)}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-2xl border border-border bg-secondary/60 p-3 text-left transition active:scale-[0.98]',
                          highlightFish === id && 'border-primary bg-primary/10',
                        )}
                      >
                        <span
                          className={cn(
                            'size-2.5 shrink-0 rounded-full',
                            f.kind === 'predator' ? 'bg-chart-2' : 'bg-accent',
                          )}
                        />
                        <span className="flex-1">
                          <span className="block font-semibold">
                            {f.name}
                            {i === 0 && (
                              <span className="ml-2 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold uppercase text-primary">
                                основная
                              </span>
                            )}
                          </span>
                          <span className="block text-xs text-muted-foreground">
                            {f.baits.slice(0, 3).join(', ')}
                          </span>
                        </span>
                        <span className="text-xs text-muted-foreground">›</span>
                      </button>
                    )
                  })}
                </div>
              </section>

              <section>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  На что
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {spot.baits.map((b) => (
                    <span
                      key={b}
                      className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-sm text-accent"
                    >
                      {b}
                    </span>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl bg-muted p-4">
                <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Совет
                </h3>
                <p className="text-sm leading-relaxed">{spot.tips}</p>
                <p className="mt-3 text-xs text-muted-foreground">
                  Лучшие сезоны: {spot.bestSeasons.map((s) => SEASONS[s]).join(', ')}
                </p>
              </section>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-secondary/50 p-3">
      <div className="mb-1 flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="text-sm font-semibold leading-snug">{value}</div>
    </div>
  )
}
