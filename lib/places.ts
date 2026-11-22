export type Place = {
  id: string;
  name: string;
  /** Region + country, or just country for built-in cities. */
  country: string;
  lat: number;
  lon: number;
  /** IANA time zone, e.g. "Europe/Lisbon". */
  tz: string;
  /** ISO 3166-1 alpha-2 country code, used for passport stamps. */
  cc?: string;
};

export function makePlace(
  name: string,
  country: string,
  lat: number,
  lon: number,
  tz: string,
  cc?: string,
): Place {
  return { id: `${lat.toFixed(2)},${lon.toFixed(2)}`, name, country, lat, lon, tz, cc };
}

/** A plain Place with only its own fields (drops extras such as city costs). */
export function toPlace({ id, name, country, lat, lon, tz, cc }: Place): Place {
  return { id, name, country, lat, lon, tz, cc };
}

type GeoResult = {
  name: string;
  country?: string;
  country_code?: string;
  admin1?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
};

/** City search via Open-Meteo geocoding (free, no API key). */
export async function searchPlaces(query: string): Promise<Place[]> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    query,
  )}&count=6&language=en&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Search failed");
  const json = (await res.json()) as { results?: GeoResult[] };
  return (json.results ?? [])
    .filter((r) => r.timezone)
    .map((r) =>
      makePlace(
        r.name,
        [r.admin1, r.country].filter(Boolean).join(", "),
        r.latitude,
        r.longitude,
        r.timezone as string,
        r.country_code,
      ),
    );
}
