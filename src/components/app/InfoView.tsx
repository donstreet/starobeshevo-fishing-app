import { ExternalLink, ShieldAlert } from 'lucide-react'

import { RESERVOIR } from '@/data/reservoir'

export function InfoView() {
  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm text-muted-foreground">{RESERVOIR.location}</p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {RESERVOIR.facts.map((f) => (
            <div key={f.label} className="rounded-2xl border border-border bg-card p-3">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {f.label}
              </div>
              <div className="font-display text-sm font-bold text-primary">{f.value}</div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <H>Особенности водоёма</H>
        <ul className="space-y-2">
          {RESERVOIR.notes.map((n) => (
            <li key={n} className="flex gap-2 text-sm">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
              {n}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <H>Стоимость</H>
        <div className="overflow-hidden rounded-2xl border border-border">
          {RESERVOIR.prices.map((p) => (
            <div
              key={p.label}
              className="flex items-center justify-between gap-3 border-b border-border bg-card p-3 last:border-b-0"
            >
              <span className="text-sm">{p.label}</span>
              <span className="font-display font-bold whitespace-nowrap text-accent">{p.value}</span>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">{RESERVOIR.pricesNote}</p>
      </section>

      <section>
        <H>Правила</H>
        <div className="space-y-2 rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
          {RESERVOIR.rules.map((r) => (
            <div key={r} className="flex gap-2 text-sm">
              <ShieldAlert className="mt-0.5 size-4 shrink-0 text-destructive" />
              {r}
            </div>
          ))}
        </div>
      </section>

      <section>
        <H>Источники</H>
        <ul className="space-y-1.5 text-sm">
          {RESERVOIR.sources.map((s) => (
            <li key={s.title}>
              {s.url ? (
                <a
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-primary underline-offset-2 hover:underline"
                >
                  {s.title}
                  <ExternalLink className="size-3" />
                </a>
              ) : (
                <span>{s.title}</span>
              )}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted-foreground">
          Глубины и дистанции ориентировочные: сводка отчётов рыбаков. Перед ловлей простучите дно
          маркерным грузом или проверьте эхолотом.
        </p>
      </section>
    </div>
  )
}

function H({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </h2>
  )
}
