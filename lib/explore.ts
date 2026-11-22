"use client";

import { DEFAULT_WEATHER_PLACES } from "./defaults";
import { trigger } from "./game";
import { readStored, writeStored } from "./hooks";
import { toPlace, type Place } from "./places";

const MAX_WEATHER = 4;

/** Put a city on the weather comparison (replacing the last one if it is full). */
export function addCityToWeather(city: Place): void {
  const place = toPlace(city);
  const list = readStored<Place[]>("np.weather", DEFAULT_WEATHER_PLACES);
  if (list.some((p) => p.id === place.id)) return;
  const next = list.length >= MAX_WEATHER ? [...list.slice(0, MAX_WEATHER - 1), place] : [...list, place];
  writeStored("np.weather", next);
  trigger({ type: "weather_add" });
}
