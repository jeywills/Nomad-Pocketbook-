# Nomad Pocketbook

A mobile-first travel companion for remote workers, built with Next.js and Tailwind. Plan where to base yourself and collect passport stamps as you explore.

## What it does

- **Weather by month**: compare a typical year (2019-2023 averages, live from [Open-Meteo](https://open-meteo.com)) for up to four cities, with days with rain, rain amount and a comfortable-months finder. Add cities by search or by browsing a country's biggest towns and cities (data from [GeoNames](https://www.geonames.org), CC BY 4.0).
- **Time zones**: line up your base with clients and teammates and see the working hours you all share.
- **Budget checker**: enter what you spend now and see what the same lifestyle costs in 37 cities, in your choice of 19 currencies. City costs are rough estimates (see `lib/costs.ts`); only the exchange-rate part is live ([ExchangeRate-API](https://www.exchangerate-api.com)).
- **Day tracker**: log stays per country, see days per tax year against a day limit (183 by default), follow the Schengen 90/180 rule, browse a calendar, and export a CSV. It is a personal log, not tax advice. Logging a stay also scratches that country off your passport map.
- **Passport and game layer**: XP, levels, daily streaks, stamps for every city you explore, badges and starter quests. Progress is stored in the browser (`localStorage`) only.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000. Use `npm run build` for a production build and `npm run lint` to lint.

## Project layout

- `app/`: pages (`/`, `/weather`, `/time`, `/budget`, `/passport`) and the web app manifest
- `components/`: shared UI (top bar, bottom nav, hero, banners, toasts, quests)
- `lib/game.ts`: XP, levels, badges, quests and the event system
- `lib/costs.ts`, `lib/fx.ts`, `lib/climate.ts`, `lib/tz.ts`: data and calculations

No API keys are needed.
