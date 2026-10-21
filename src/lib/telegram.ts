// Тонкая обёртка над Telegram WebApp SDK (скрипт подключается в __root.tsx).
// Вне Telegram все вызовы безопасно ничего не делают — приложение работает и в обычном браузере.

interface TelegramWebApp {
  ready: () => void
  expand: () => void
  setHeaderColor?: (color: string) => void
  setBackgroundColor?: (color: string) => void
  initDataUnsafe?: { user?: { first_name?: string } }
  HapticFeedback?: {
    selectionChanged: () => void
    impactOccurred: (style: 'light' | 'medium' | 'heavy') => void
  }
  BackButton?: {
    show: () => void
    hide: () => void
    onClick: (cb: () => void) => void
    offClick: (cb: () => void) => void
  }
}

declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp }
  }
}

export function tg(): TelegramWebApp | undefined {
  if (typeof window === 'undefined') return undefined
  return window.Telegram?.WebApp
}

export function initTelegram(bg: string) {
  const app = tg()
  if (!app) return
  app.ready()
  app.expand()
  app.setHeaderColor?.(bg)
  app.setBackgroundColor?.(bg)
}

export function haptic(kind: 'select' | 'tap' = 'select') {
  const h = tg()?.HapticFeedback
  if (!h) return
  if (kind === 'select') h.selectionChanged()
  else h.impactOccurred('light')
}

/** Показывает системную кнопку «Назад» Telegram, пока открыт оверлей. */
export function bindBackButton(onBack: () => void) {
  const bb = tg()?.BackButton
  if (!bb) return () => {}
  bb.show()
  bb.onClick(onBack)
  return () => {
    bb.offClick(onBack)
    bb.hide()
  }
}
