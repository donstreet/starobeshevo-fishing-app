import { useCallback, useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { BookOpen, Compass, Info, Map as MapIcon } from 'lucide-react'

import { FishView } from '@/components/app/FishView'
import { InfoView } from '@/components/app/InfoView'
import { MapView } from '@/components/app/MapView'
import { PickerView } from '@/components/app/PickerView'
import { SpotSheet } from '@/components/app/SpotSheet'
import { RESERVOIR, SEASONS, currentSeason, type FishId, type Spot } from '@/data/reservoir'
import { haptic, initTelegram, tg } from '@/lib/telegram'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/')({
  component: Home,
})

type Tab = 'picker' | 'map' | 'fish' | 'info'

const TABS: { id: Tab; label: string; icon: typeof MapIcon }[] = [
  { id: 'picker', label: 'Подбор', icon: Compass },
  { id: 'map', label: 'Карта', icon: MapIcon },
  { id: 'fish', label: 'Рыба', icon: BookOpen },
  { id: 'info', label: 'Водоём', icon: Info },
]

const TITLES: Record<Tab, string> = {
  picker: 'Что, где и на что',
  map: 'Карта мест',
  fish: 'Справочник рыбы',
  info: 'О водоёме',
}

function Home() {
  const [tab, setTab] = useState<Tab>('picker')
  const [spot, setSpot] = useState<Spot | null>(null)
  const [spotFish, setSpotFish] = useState<FishId | null>(null)
  const [mapFish, setMapFish] = useState<FishId | null>(null)
  const [openFish, setOpenFish] = useState<FishId | null>(null)
  const [userName, setUserName] = useState<string | null>(null)

  useEffect(() => {
    initTelegram('#0b1d26')
    setUserName(tg()?.initDataUnsafe?.user?.first_name ?? null)
  }, [])

  const go = (t: Tab) => {
    haptic()
    setTab(t)
    window.scrollTo({ top: 0 })
  }

  const showOnMap = (id: FishId) => {
    setSpot(null)
    setMapFish(id)
    go('map')
  }

  const closeSpot = useCallback(() => setSpot(null), [])

  return (
    <div className="water-bg min-h-screen text-foreground">
      <header className="contour mx-auto max-w-md px-4 pt-5 pb-4">
        <p className="text-xs font-semibold tracking-wider text-primary uppercase">
          {userName ? `${userName}, ни хвоста!` : 'Ни хвоста, ни чешуи!'} · {SEASONS[currentSeason()]}
        </p>
        <h1 className="mt-1 font-display text-[26px] leading-tight font-extrabold">
          {TITLES[tab]}
        </h1>
        <p className="text-sm text-muted-foreground">{RESERVOIR.name}</p>
      </header>

      <main className="mx-auto max-w-md px-4 pb-28">
        {tab === 'picker' && (
          <PickerView
            onSelectSpot={(s, f) => {
              setSpotFish(f)
              setSpot(s)
            }}
            onShowOnMap={showOnMap}
          />
        )}
        {tab === 'map' && (
          <MapView
            fishFilter={mapFish}
            onFishFilter={setMapFish}
            onSelectSpot={(s) => {
              setSpotFish(mapFish)
              setSpot(s)
            }}
          />
        )}
        {tab === 'fish' && (
          <FishView openFish={openFish} onToggle={setOpenFish} onShowOnMap={showOnMap} />
        )}
        {tab === 'info' && <InfoView />}
      </main>

      <nav className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/90 px-2 pt-2 backdrop-blur-lg">
        <div className="mx-auto grid max-w-md grid-cols-4">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => go(id)}
              className={cn(
                'flex flex-col items-center gap-1 rounded-2xl py-1.5 text-[11px] font-semibold transition',
                tab === id ? 'text-primary' : 'text-muted-foreground',
              )}
            >
              <span
                className={cn(
                  'flex h-7 w-12 items-center justify-center rounded-full transition',
                  tab === id && 'bg-primary/15',
                )}
              >
                <Icon className="size-5" />
              </span>
              {label}
            </button>
          ))}
        </div>
      </nav>

      <SpotSheet
        spot={spot}
        highlightFish={spotFish}
        onClose={closeSpot}
        onOpenFish={(id) => {
          setSpot(null)
          setOpenFish(id)
          go('fish')
        }}
      />
    </div>
  )
}
