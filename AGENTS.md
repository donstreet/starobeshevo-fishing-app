# AGENTS.md

## Обзор

Telegram mini app «Клёвое место» — справочник рыболова по Старобешевскому водохранилищу. Одна страница (`/`) с четырьмя вкладками и нижней навигацией; бэкенда и базы данных нет — все данные статические.

## Стек

TanStack Start + React 19, Tailwind CSS 4 (тема в `src/styles.css`), shadcn/ui в `src/components/ui`, lucide-react, деплой на Netlify через `@netlify/vite-plugin-tanstack-start`.

## Структура

```
public/img/starobeshevo-map.jpg   # Исходная карта мест (600×517), отдаётся через Netlify Image CDN
src/data/reservoir.ts             # ВСЕ данные: FISH, SPOTS (28 мест), RESERVOIR, rankSpots()
src/lib/telegram.ts               # Обёртка над window.Telegram.WebApp (ready/expand/haptic/BackButton)
src/components/app/
  MapView.tsx                     # Карта с метками (x/y в % от снимка), фильтр по рыбе, зум, Chip
  PickerView.tsx                  # Подбор: рыба + сезон + способ → рецепт и рейтинг мест
  FishView.tsx                    # Справочник рыбы (аккордеон)
  InfoView.tsx                    # Факты, цены, правила, источники
  SpotSheet.tsx                   # Нижняя шторка с деталями места
src/routes/__root.tsx             # <head>: заголовок, шрифты Unbounded/Manrope, скрипт telegram-web-app.js
src/routes/index.tsx              # Вкладки и общее состояние
tg-webapp/                        # Упрощённая статическая Mini App (HTML/JS + data.json), отдаётся по /tg/
tg-bot/                           # Бот на python-telegram-bot с кнопкой открытия /tg/
```

## Соглашения и решения

- Весь интерфейс на русском языке.
- Тема всегда тёмная («ночная вода»): `<html className="dark">`, цвета в блоке `.dark` в `src/styles.css`. Шапка Telegram окрашивается в `#0b1d26`.
- Координаты меток (`Spot.x`, `Spot.y`) — проценты от размеров `starobeshevo-map.jpg`. При замене карты их нужно пересчитать.
- Номера и названия мест совпадают с легендой на карте. Глубины, дистанции и насадки — ориентиры из отчётов рыбаков (fishmapia, orybe, donfish, rybalka.com) и общей практики; в интерфейсе об этом сказано явно.
- Цены — с карты и fishmapia на 2019 год, помечены как возможно устаревшие.
- Все вызовы Telegram SDK безопасно ничего не делают вне Telegram.
- Чтобы добавить место или рыбу, достаточно изменить `src/data/reservoir.ts`. Для `/tg/` данные лежат отдельно в `tg-webapp/data.json` (сделан из `reservoir.ts`, id рыб транслитом: `shuka` — щука и т. д.) — правки нужно вносить в оба файла.
- `tg-webapp/` копируется в `dist/client/tg` командой сборки в `netlify.toml`. `data.json` загружается по относительному пути, поэтому адрес открывается со слэшем на конце: `/tg/`.
