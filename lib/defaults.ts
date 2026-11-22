import { CITIES } from "./costs";
import { toPlace, type Place } from "./places";

const pick = (name: string): Place => toPlace(CITIES.find((c) => c.name === name) as Place);

/** What the weather and time pages start with before the user changes anything. */
export const DEFAULT_WEATHER_PLACES: Place[] = [pick("Lisbon"), pick("Bangkok")];
export const DEFAULT_TIME_PLACES: Place[] = [pick("New York"), pick("Bangkok")];
