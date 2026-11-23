# Nomad Pocketbook

A mobile-first travel companion for remote workers, built with Next.js and Tailwind. Plan where to base yourself and collect passport stamps as you explore.

## What it does

- **Weather by month**: compare a typical year (2019-2023 averages, live from [Open-Meteo](https://open-meteo.com)) for up to four cities, with days with rain, rain amount and a comfortable-months finder. Add cities by search or by browsing a country's biggest towns and cities (data from [GeoNames](https://www.geonames.org), CC BY 4.0).
- **Time zones**: line up your base with clients and teammates and see the working hours you all share.
- **Budget checker**: enter what you spend now and see what the same lifestyle costs in 37 cities, in your choice of 19 currencies. City costs are rough estimates (see `lib/costs.ts`); only the exchange-rate part is live ([ExchangeRate-API](https://www.exchangerate-api.com)).
- **Visa guide**: how long a British passport can stay on a tourist visa, and whether you can extend, for 79 countries in Europe, South-East Asia and Latin America. The facts were read from the UK government's FCDO travel advice pages (Open Government Licence v3.0) on 23 November 2026, with the review date and travel-advice level shown for each country. Anything those pages don't state is marked as unconfirmed. Visa rules change often, so always check the linked official page. Not legal advice.
- **Trip planner**: build a multi-country itinerary stop by stop (city plus dates). Each stop shows typical weather for those exact dates (average high and low, expected rainy days and rain), the visa picture for a UK passport (limit, last permitted day, extension needed and by when, shared Schengen and rolling limits including stays logged in the Day tracker), and its cost against what you spend now. A Key dates list puts visa applications, arrivals, extension deadlines and limits in order. Suggested application and extension dates are rules of thumb, not official deadlines. Stops without city cost data are priced like the nearest city we have.
- **Day tracker**: log stays per country, see days per tax year against a day limit (183 by default), follow the Schengen 90/180 rule, browse a calendar, and export a CSV. It also shows visa limits for the countries you log (days left, last permitted day, planned stays that would go over), using the visa guide data for a UK passport. It is a personal log, not tax advice. Logging a stay also scratches that country off your passport map.
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
