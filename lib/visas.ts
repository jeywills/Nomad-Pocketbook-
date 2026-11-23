// Visa rules for a British citizen passport on a tourist stay, for Europe, South-East Asia and Latin America.
// Facts were taken from the UK government's FCDO "Entry requirements" pages, read on 2026-11-23.
// Anything the FCDO page does not state is marked `typical` / `typicalStay` and must be confirmed.
// Rules change often. Always check the linked FCDO page and the country's own authorities.
export type Region = "europe" | "sea" | "latam";
export type EntryType = "visa-free" | "visa-on-arrival" | "e-visa" | "visa-needed";
export type ExtensionCan = "yes" | "no" | "unclear" | "not-needed";

export type Visa = {
  /** ISO 3166-1 alpha-2 country code. */
  cc: string;
  region: Region;
  /** Schengen members share one 90 days in any 180. */
  group?: "schengen";
  entry: EntryType;
  /** How long you can stay on arrival, as people say it. */
  stay: string;
  /** The headline number of days, or null when there is no single figure. */
  days: number | null;
  /** True if the stay figure is a common one the FCDO page does not state. Confirm it. */
  typicalStay?: boolean;
  /** True if the limit is counted across a rolling window (for example 90 days in any 180). */
  rolling?: boolean;
  extension: {
    can: ExtensionCan;
    text: string;
    /** A commonly reported detail the FCDO page does not state. Confirm it. */
    typical?: string;
  };
  /** Things to do or carry before you arrive. */
  before?: string[];
  notes?: string[];
  /** Slug of the FCDO travel advice page. */
  fcdo: string;
  /** When the FCDO last reviewed that page (YYYY-MM-DD). */
  reviewed: string;
  /** FCDO travel advice level: "all" = advises against all travel to the whole country, "essential" = against all but essential travel to the whole country, "parts" = against travel to some areas. */
  advice?: "all" | "essential" | "parts";
};

/** The day the data was read from the FCDO pages. */
export const VISAS_CHECKED = "2026-11-23";

export const VISAS: Visa[] = [
  {
    "cc": "AT",
    "region": "europe",
    "group": "schengen",
    "entry": "visa-free",
    "stay": "90 days in any 180",
    "days": 90,
    "rolling": true,
    "extension": {
      "can": "no",
      "text": "Tourist stays can't be extended. To stay longer you need a visa or residence permit arranged in advance."
    },
    "before": [
      "Passport valid for at least 3 months after you leave"
    ],
    "notes": [],
    "fcdo": "austria",
    "reviewed": "2026-08-11"
  },
  {
    "cc": "BE",
    "region": "europe",
    "group": "schengen",
    "entry": "visa-free",
    "stay": "90 days in any 180",
    "days": 90,
    "rolling": true,
    "extension": {
      "can": "no",
      "text": "Tourist stays can't be extended. To stay longer you need a visa or residence permit arranged in advance."
    },
    "before": [
      "Passport valid for at least 3 months after you leave"
    ],
    "notes": [],
    "fcdo": "belgium",
    "reviewed": "2026-10-17"
  },
  {
    "cc": "BG",
    "region": "europe",
    "group": "schengen",
    "entry": "visa-free",
    "stay": "90 days in any 180",
    "days": 90,
    "rolling": true,
    "extension": {
      "can": "no",
      "text": "Tourist stays can't be extended. To stay longer you need a visa or residence permit arranged in advance."
    },
    "before": [
      "Passport valid for at least 3 months after you leave"
    ],
    "notes": [],
    "fcdo": "bulgaria",
    "reviewed": "2026-08-11"
  },
  {
    "cc": "HR",
    "region": "europe",
    "group": "schengen",
    "entry": "visa-free",
    "stay": "90 days in any 180",
    "days": 90,
    "rolling": true,
    "extension": {
      "can": "no",
      "text": "Tourist stays can't be extended. To stay longer you need a visa or residence permit arranged in advance."
    },
    "before": [
      "Passport valid for at least 3 months after you leave"
    ],
    "notes": [
      "Your accommodation must register you with the police within 48 hours. Hotels normally do this for you."
    ],
    "fcdo": "croatia",
    "reviewed": "2026-08-11"
  },
  {
    "cc": "CZ",
    "region": "europe",
    "group": "schengen",
    "entry": "visa-free",
    "stay": "90 days in any 180",
    "days": 90,
    "rolling": true,
    "extension": {
      "can": "no",
      "text": "Tourist stays can't be extended. To stay longer you need a visa or residence permit arranged in advance."
    },
    "before": [
      "Passport valid for at least 3 months after you leave"
    ],
    "notes": [
      "Register your address with the foreign police within 3 days unless your hotel does it. The fine can be up to 3,000 koruna."
    ],
    "fcdo": "czechia",
    "reviewed": "2026-08-11"
  },
  {
    "cc": "DK",
    "region": "europe",
    "group": "schengen",
    "entry": "visa-free",
    "stay": "90 days in any 180",
    "days": 90,
    "rolling": true,
    "extension": {
      "can": "no",
      "text": "Tourist stays can't be extended. To stay longer you need a visa or residence permit arranged in advance."
    },
    "before": [
      "Passport valid for at least 3 months after you leave"
    ],
    "notes": [
      "Greenland and the Faroe Islands are outside the EU and Schengen. No visa is needed for tourism there."
    ],
    "fcdo": "denmark",
    "reviewed": "2026-08-11"
  },
  {
    "cc": "EE",
    "region": "europe",
    "group": "schengen",
    "entry": "visa-free",
    "stay": "90 days in any 180",
    "days": 90,
    "rolling": true,
    "extension": {
      "can": "no",
      "text": "Tourist stays can't be extended. To stay longer you need a visa or residence permit arranged in advance."
    },
    "before": [
      "Passport valid for at least 3 months after you leave"
    ],
    "notes": [],
    "fcdo": "estonia",
    "reviewed": "2026-08-11"
  },
  {
    "cc": "FI",
    "region": "europe",
    "group": "schengen",
    "entry": "visa-free",
    "stay": "90 days in any 180",
    "days": 90,
    "rolling": true,
    "extension": {
      "can": "no",
      "text": "Tourist stays can't be extended. To stay longer you need a visa or residence permit arranged in advance."
    },
    "before": [
      "Passport valid for at least 3 months after you leave"
    ],
    "notes": [],
    "fcdo": "finland",
    "reviewed": "2026-11-17"
  },
  {
    "cc": "FR",
    "region": "europe",
    "group": "schengen",
    "entry": "visa-free",
    "stay": "90 days in any 180",
    "days": 90,
    "rolling": true,
    "extension": {
      "can": "no",
      "text": "Tourist stays can't be extended. To stay longer you need a visa or residence permit arranged in advance."
    },
    "before": [
      "Passport valid for at least 3 months after you leave"
    ],
    "notes": [
      "If you can't leave before your limit, contact the local prefecture."
    ],
    "fcdo": "france",
    "reviewed": "2026-10-22"
  },
  {
    "cc": "DE",
    "region": "europe",
    "group": "schengen",
    "entry": "visa-free",
    "stay": "90 days in any 180",
    "days": 90,
    "rolling": true,
    "extension": {
      "can": "no",
      "text": "Tourist stays can't be extended. To stay longer you need a visa or residence permit arranged in advance."
    },
    "before": [
      "Passport valid for at least 3 months after you leave"
    ],
    "notes": [],
    "fcdo": "germany",
    "reviewed": "2026-08-11"
  },
  {
    "cc": "GR",
    "region": "europe",
    "group": "schengen",
    "entry": "visa-free",
    "stay": "90 days in any 180",
    "days": 90,
    "rolling": true,
    "extension": {
      "can": "no",
      "text": "Tourist stays can't be extended. To stay longer you need a visa or residence permit arranged in advance."
    },
    "before": [
      "Passport valid for at least 3 months after you leave"
    ],
    "notes": [],
    "fcdo": "greece",
    "reviewed": "2026-11-03"
  },
  {
    "cc": "HU",
    "region": "europe",
    "group": "schengen",
    "entry": "visa-free",
    "stay": "90 days in any 180",
    "days": 90,
    "rolling": true,
    "extension": {
      "can": "no",
      "text": "Tourist stays can't be extended. To stay longer you need a visa or residence permit arranged in advance."
    },
    "before": [
      "Passport valid for at least 3 months after you leave"
    ],
    "notes": [],
    "fcdo": "hungary",
    "reviewed": "2026-09-23"
  },
  {
    "cc": "IS",
    "region": "europe",
    "group": "schengen",
    "entry": "visa-free",
    "stay": "90 days in any 180",
    "days": 90,
    "rolling": true,
    "extension": {
      "can": "no",
      "text": "Tourist stays can't be extended. To stay longer you need a visa or residence permit arranged in advance."
    },
    "before": [
      "Passport valid for at least 3 months after you leave"
    ],
    "notes": [],
    "fcdo": "iceland",
    "reviewed": "2026-08-11"
  },
  {
    "cc": "IT",
    "region": "europe",
    "group": "schengen",
    "entry": "visa-free",
    "stay": "90 days in any 180",
    "days": 90,
    "rolling": true,
    "extension": {
      "can": "no",
      "text": "Tourist stays can't be extended. To stay longer you need a visa or residence permit arranged in advance."
    },
    "before": [
      "Passport valid for at least 3 months after you leave"
    ],
    "notes": [
      "If you are not in a hotel and arrive from another Schengen country, declare your presence to the questura within 8 days."
    ],
    "fcdo": "italy",
    "reviewed": "2026-11-03"
  },
  {
    "cc": "LV",
    "region": "europe",
    "group": "schengen",
    "entry": "visa-free",
    "stay": "90 days in any 180",
    "days": 90,
    "rolling": true,
    "extension": {
      "can": "no",
      "text": "Tourist stays can't be extended. To stay longer you need a visa or residence permit arranged in advance."
    },
    "before": [
      "Passport valid for at least 3 months after you leave"
    ],
    "notes": [],
    "fcdo": "latvia",
    "reviewed": "2026-08-11"
  },
  {
    "cc": "LI",
    "region": "europe",
    "group": "schengen",
    "entry": "visa-free",
    "stay": "90 days in any 180",
    "days": 90,
    "rolling": true,
    "extension": {
      "can": "no",
      "text": "Tourist stays can't be extended. To stay longer you need a visa or residence permit arranged in advance."
    },
    "before": [
      "Passport valid for at least 3 months after you leave"
    ],
    "notes": [],
    "fcdo": "liechtenstein",
    "reviewed": "2026-08-11"
  },
  {
    "cc": "LT",
    "region": "europe",
    "group": "schengen",
    "entry": "visa-free",
    "stay": "90 days in any 180",
    "days": 90,
    "rolling": true,
    "extension": {
      "can": "no",
      "text": "Tourist stays can't be extended. To stay longer you need a visa or residence permit arranged in advance."
    },
    "before": [
      "Passport valid for at least 3 months after you leave"
    ],
    "notes": [],
    "fcdo": "lithuania",
    "reviewed": "2026-08-11"
  },
  {
    "cc": "LU",
    "region": "europe",
    "group": "schengen",
    "entry": "visa-free",
    "stay": "90 days in any 180",
    "days": 90,
    "rolling": true,
    "extension": {
      "can": "no",
      "text": "Tourist stays can't be extended. To stay longer you need a visa or residence permit arranged in advance."
    },
    "before": [
      "Passport valid for at least 3 months after you leave"
    ],
    "notes": [],
    "fcdo": "luxembourg",
    "reviewed": "2026-08-11"
  },
  {
    "cc": "MT",
    "region": "europe",
    "group": "schengen",
    "entry": "visa-free",
    "stay": "90 days in any 180",
    "days": 90,
    "rolling": true,
    "extension": {
      "can": "no",
      "text": "Tourist stays can't be extended. To stay longer you need a visa or residence permit arranged in advance."
    },
    "before": [
      "Passport valid for at least 3 months after you leave"
    ],
    "notes": [],
    "fcdo": "malta",
    "reviewed": "2026-08-11"
  },
  {
    "cc": "MC",
    "region": "europe",
    "group": "schengen",
    "entry": "visa-free",
    "stay": "90 days in any 180",
    "days": 90,
    "rolling": true,
    "extension": {
      "can": "no",
      "text": "Tourist stays can't be extended. To stay longer you need a visa or residence permit arranged in advance."
    },
    "before": [
      "Passport valid for at least 3 months after you leave"
    ],
    "notes": [
      "Monaco has no border checks with France. The UK government's page applies Schengen rules."
    ],
    "fcdo": "monaco",
    "reviewed": "2025-12-10"
  },
  {
    "cc": "NL",
    "region": "europe",
    "group": "schengen",
    "entry": "visa-free",
    "stay": "90 days in any 180",
    "days": 90,
    "rolling": true,
    "extension": {
      "can": "no",
      "text": "Tourist stays can't be extended. To stay longer you need a visa or residence permit arranged in advance."
    },
    "before": [
      "Passport valid for at least 3 months after you leave"
    ],
    "notes": [],
    "fcdo": "netherlands",
    "reviewed": "2026-08-11"
  },
  {
    "cc": "NO",
    "region": "europe",
    "group": "schengen",
    "entry": "visa-free",
    "stay": "90 days in any 180",
    "days": 90,
    "rolling": true,
    "extension": {
      "can": "no",
      "text": "Tourist stays can't be extended. To stay longer you need a visa or residence permit arranged in advance."
    },
    "before": [
      "Passport valid for at least 3 months after you leave"
    ],
    "notes": [],
    "fcdo": "norway",
    "reviewed": "2026-08-25"
  },
  {
    "cc": "PL",
    "region": "europe",
    "group": "schengen",
    "entry": "visa-free",
    "stay": "90 days in any 180",
    "days": 90,
    "rolling": true,
    "extension": {
      "can": "no",
      "text": "Tourist stays can't be extended. To stay longer you need a visa or residence permit arranged in advance."
    },
    "before": [
      "Passport valid for at least 3 months after you leave"
    ],
    "notes": [],
    "fcdo": "poland",
    "reviewed": "2026-11-11"
  },
  {
    "cc": "PT",
    "region": "europe",
    "group": "schengen",
    "entry": "visa-free",
    "stay": "90 days in any 180",
    "days": 90,
    "rolling": true,
    "extension": {
      "can": "no",
      "text": "Only for exceptional reasons such as a medical emergency, by applying to AIMA. Not for ordinary tourist stays."
    },
    "before": [
      "Passport valid for at least 3 months after you leave"
    ],
    "notes": [],
    "fcdo": "portugal",
    "reviewed": "2026-11-12"
  },
  {
    "cc": "RO",
    "region": "europe",
    "group": "schengen",
    "entry": "visa-free",
    "stay": "90 days in any 180",
    "days": 90,
    "rolling": true,
    "extension": {
      "can": "no",
      "text": "Tourist stays can't be extended. To stay longer you need a visa or residence permit arranged in advance."
    },
    "before": [
      "Passport valid for at least 3 months after you leave"
    ],
    "notes": [],
    "fcdo": "romania",
    "reviewed": "2026-09-18"
  },
  {
    "cc": "SK",
    "region": "europe",
    "group": "schengen",
    "entry": "visa-free",
    "stay": "90 days in any 180",
    "days": 90,
    "rolling": true,
    "extension": {
      "can": "no",
      "text": "Tourist stays can't be extended. To stay longer you need a visa or residence permit arranged in advance."
    },
    "before": [
      "Passport valid for at least 3 months after you leave"
    ],
    "notes": [
      "Overstaying can mean a fine of up to 1,600 euros."
    ],
    "fcdo": "slovakia",
    "reviewed": "2026-08-28"
  },
  {
    "cc": "SI",
    "region": "europe",
    "group": "schengen",
    "entry": "visa-free",
    "stay": "90 days in any 180",
    "days": 90,
    "rolling": true,
    "extension": {
      "can": "no",
      "text": "Tourist stays can't be extended. To stay longer you need a visa or residence permit arranged in advance."
    },
    "before": [
      "Passport valid for at least 3 months after you leave"
    ],
    "notes": [
      "Register with the police within 3 days. Hotels and guest houses do this for you; for self-catering, ask your host."
    ],
    "fcdo": "slovenia",
    "reviewed": "2026-08-11"
  },
  {
    "cc": "ES",
    "region": "europe",
    "group": "schengen",
    "entry": "visa-free",
    "stay": "90 days in any 180",
    "days": 90,
    "rolling": true,
    "extension": {
      "can": "no",
      "text": "Only for exceptional reasons such as a medical emergency, through the immigration office (Extranjería). Not for ordinary tourist stays."
    },
    "before": [
      "Passport valid for at least 3 months after you leave"
    ],
    "notes": [],
    "fcdo": "spain",
    "reviewed": "2026-11-10"
  },
  {
    "cc": "SE",
    "region": "europe",
    "group": "schengen",
    "entry": "visa-free",
    "stay": "90 days in any 180",
    "days": 90,
    "rolling": true,
    "extension": {
      "can": "no",
      "text": "Tourist stays can't be extended. To stay longer you need a visa or residence permit arranged in advance."
    },
    "before": [
      "Passport valid for at least 3 months after you leave"
    ],
    "notes": [],
    "fcdo": "sweden",
    "reviewed": "2026-08-11"
  },
  {
    "cc": "CH",
    "region": "europe",
    "group": "schengen",
    "entry": "visa-free",
    "stay": "90 days in any 180",
    "days": 90,
    "rolling": true,
    "extension": {
      "can": "no",
      "text": "Tourist stays can't be extended. To stay longer you need a visa or residence permit arranged in advance."
    },
    "before": [
      "Passport valid for at least 3 months after you leave"
    ],
    "notes": [],
    "fcdo": "switzerland",
    "reviewed": "2026-08-11"
  },
  {
    "cc": "SM",
    "region": "europe",
    "group": "schengen",
    "entry": "visa-free",
    "stay": "90 days in any 180",
    "days": 90,
    "rolling": true,
    "extension": {
      "can": "no",
      "text": "To stay longer you need a visa or permit arranged in advance."
    },
    "notes": [
      "The UK government counts San Marino within the same 90 days as the Schengen area."
    ],
    "fcdo": "san-marino",
    "reviewed": "2025-12-10"
  },
  {
    "cc": "AD",
    "region": "europe",
    "entry": "visa-free",
    "stay": "Up to 3 months",
    "days": 90,
    "extension": {
      "can": "no",
      "text": "For more than 3 months you need a work or residence permit from the Andorran immigration department."
    },
    "notes": [
      "You reach Andorra through France or Spain, so Schengen entry rules apply on the way, and that time counts."
    ],
    "fcdo": "andorra",
    "reviewed": "2025-12-10"
  },
  {
    "cc": "AL",
    "region": "europe",
    "entry": "visa-free",
    "stay": "90 days in any 180",
    "days": 90,
    "rolling": true,
    "extension": {
      "can": "no",
      "text": "For longer you must apply in advance for a long-stay visa, or apply for a residence permit from inside Albania."
    },
    "fcdo": "albania",
    "reviewed": "2026-10-15"
  },
  {
    "cc": "AM",
    "region": "europe",
    "entry": "visa-free",
    "stay": "180 days in a year",
    "days": 180,
    "rolling": true,
    "extension": {
      "can": "yes",
      "text": "Contact the passport and visa department (OVIR) in Yerevan."
    },
    "fcdo": "armenia",
    "reviewed": "2026-03-01",
    "advice": "parts"
  },
  {
    "cc": "AZ",
    "region": "europe",
    "entry": "e-visa",
    "stay": "30 days (e-visa)",
    "days": 30,
    "extension": {
      "can": "yes",
      "text": "Apply to the State Migration Service at least 3 days before your 30 days end."
    },
    "before": [
      "Get an e-visa from ASAN Visa at least 3 days ahead and print it",
      "Passport valid for at least 6 months after you arrive"
    ],
    "notes": [
      "Register online or in person if you stay more than 15 days. Hotels often do this for you; you must do it yourself in an apartment.",
      "Entering by land or sea is restricted. Air entry is unrestricted."
    ],
    "fcdo": "azerbaijan",
    "reviewed": "2026-10-23",
    "advice": "parts"
  },
  {
    "cc": "BY",
    "region": "europe",
    "entry": "visa-free",
    "stay": "30 days per visit, 90 days per calendar year",
    "days": 30,
    "extension": {
      "can": "no",
      "text": "For more than 30 days a visit, or 90 days a year, you need a visa."
    },
    "notes": [
      "This visa-free arrangement is announced only until 31 December 2026.",
      "It does not apply if you travel directly from or to Russia.",
      "Accommodation must register guests who stay more than 10 days."
    ],
    "fcdo": "belarus",
    "reviewed": "2026-09-10",
    "advice": "all"
  },
  {
    "cc": "BA",
    "region": "europe",
    "entry": "visa-free",
    "stay": "90 days in any 6 months",
    "days": 90,
    "rolling": true,
    "extension": {
      "can": "no",
      "text": "For longer you must apply for a residence permit, which needs a UK criminal record check."
    },
    "notes": [
      "Register with the police within 72 hours. Hotels and some hostels do this for you."
    ],
    "fcdo": "bosnia-and-herzegovina",
    "reviewed": "2026-08-13"
  },
  {
    "cc": "CY",
    "region": "europe",
    "entry": "visa-free",
    "stay": "90 days in any 180",
    "days": 90,
    "rolling": true,
    "extension": {
      "can": "unclear",
      "text": "Check with the Cyprus High Commission."
    },
    "notes": [
      "Cyprus is not in Schengen. Its 90 days are counted separately from the Schengen 90.",
      "Time in the north of Cyprus counts towards your 90 days."
    ],
    "fcdo": "cyprus",
    "reviewed": "2026-08-14"
  },
  {
    "cc": "GE",
    "region": "europe",
    "entry": "visa-free",
    "stay": "Up to 1 year",
    "days": 365,
    "extension": {
      "can": "not-needed",
      "text": "For longer than a year, apply for a longer-term visa."
    },
    "before": [
      "Health and accident insurance of at least 30,000 Georgian lari, covering your whole stay"
    ],
    "notes": [
      "Since 1 March 2026 a foreign national who wants to work in Georgia, including working remotely or running a business, must have a work permit.",
      "If you stay more than 183 days and do any paid employment, you are liable for Georgian income tax and must tell the Revenue Service."
    ],
    "fcdo": "georgia",
    "reviewed": "2026-11-12",
    "advice": "parts"
  },
  {
    "cc": "IE",
    "region": "europe",
    "entry": "visa-free",
    "stay": "No limit",
    "days": null,
    "extension": {
      "can": "not-needed",
      "text": "British nationals can live, work and study in Ireland under the Common Travel Area."
    },
    "notes": [
      "Ireland is in the EU but not in Schengen, so Schengen rules and EES don't apply."
    ],
    "fcdo": "ireland",
    "reviewed": "2026-09-04"
  },
  {
    "cc": "XK",
    "region": "europe",
    "entry": "visa-free",
    "stay": "90 days",
    "days": 90,
    "extension": {
      "can": "yes",
      "text": "The 90-day entry stamp is renewable for longer stays. For longer than that you need a residence permit."
    },
    "notes": [
      "Officials may ask for proof of why you are visiting or that you have enough money."
    ],
    "fcdo": "kosovo",
    "reviewed": "2026-09-23"
  },
  {
    "cc": "MD",
    "region": "europe",
    "entry": "visa-free",
    "stay": "90 days in any 6 months",
    "days": 90,
    "rolling": true,
    "extension": {
      "can": "no",
      "text": "For more than 90 days you need a work or residence permit."
    },
    "before": [
      "Proof of return or onward travel, such as an onward flight"
    ],
    "fcdo": "moldova",
    "reviewed": "2026-11-04",
    "advice": "parts"
  },
  {
    "cc": "ME",
    "region": "europe",
    "entry": "visa-free",
    "stay": "90 days in any 180",
    "days": 90,
    "rolling": true,
    "extension": {
      "can": "no",
      "text": "For longer you must meet Montenegro's entry requirements for a visa or work permit, in advance."
    },
    "notes": [
      "Montenegro is not in Schengen. Its 90 days are counted separately from the Schengen 90.",
      "Register with the local tourism office or police within 24 hours. Hotels and some holiday lets do this for you."
    ],
    "fcdo": "montenegro",
    "reviewed": "2026-08-13"
  },
  {
    "cc": "MK",
    "region": "europe",
    "entry": "visa-free",
    "stay": "Up to 3 months",
    "days": 90,
    "extension": {
      "can": "unclear",
      "text": "Contact the Macedonian Embassy if you plan to stay longer."
    },
    "fcdo": "north-macedonia",
    "reviewed": "2026-08-13"
  },
  {
    "cc": "RU",
    "region": "europe",
    "entry": "visa-needed",
    "stay": "Visa needed, length set by your visa",
    "days": null,
    "extension": {
      "can": "unclear",
      "text": "Depends on your visa type. Check with the Russian Embassy."
    },
    "before": [
      "Get your visa before you travel. UK applicants aged 12 or over give fingerprints at a visa application centre"
    ],
    "fcdo": "russia",
    "reviewed": "2026-09-18",
    "advice": "all"
  },
  {
    "cc": "RS",
    "region": "europe",
    "entry": "visa-free",
    "stay": "90 days in any 6 months",
    "days": 90,
    "rolling": true,
    "extension": {
      "can": "yes",
      "text": "Apply at the police station where you are registered, at least 30 days before your 90 days end."
    },
    "fcdo": "serbia",
    "reviewed": "2026-10-22"
  },
  {
    "cc": "TR",
    "region": "europe",
    "entry": "visa-free",
    "stay": "90 days in any 180",
    "days": 90,
    "rolling": true,
    "extension": {
      "can": "unclear",
      "text": "The UK government page doesn't cover extensions. Ask the Turkish authorities."
    },
    "notes": [
      "This applies to a full British citizen passport. Other types of British passport need a visa."
    ],
    "fcdo": "turkey",
    "reviewed": "2026-11-18",
    "advice": "parts"
  },
  {
    "cc": "UA",
    "region": "europe",
    "entry": "visa-free",
    "stay": "90 days in any 180",
    "days": 90,
    "rolling": true,
    "extension": {
      "can": "unclear",
      "text": "Check with Ukraine's State Migration Service."
    },
    "notes": [
      "Ukraine has confirmed this visa-free policy for British citizens until 30 January 2027.",
      "If you overstay you will be fined and may be unable to return for 90 days."
    ],
    "fcdo": "ukraine",
    "reviewed": "2026-10-02",
    "advice": "parts"
  },
  {
    "cc": "BN",
    "region": "sea",
    "entry": "visa-free",
    "stay": "90 days",
    "days": 90,
    "extension": {
      "can": "unclear",
      "text": "The UK government page doesn't cover extensions. Ask Brunei immigration."
    },
    "notes": [
      "Get your passport stamped on entry. Overstaying can mean detention and caning."
    ],
    "fcdo": "brunei",
    "reviewed": "2026-03-19"
  },
  {
    "cc": "KH",
    "region": "sea",
    "entry": "visa-on-arrival",
    "stay": "30 days",
    "days": 30,
    "extension": {
      "can": "yes",
      "text": "Tourist visas can be extended while you are in Cambodia.",
      "typical": "Usually one extra month. This detail isn't stated by the UK government page."
    },
    "before": [
      "e-visa at least 4 days ahead, or a visa on arrival (bring a photo and pay in US dollars)",
      "Free e-Arrival card within 7 days before arrival if you fly into Phnom Penh, Siem Reap or Sihanoukville"
    ],
    "notes": [
      "Overstay fines have no upper limit. After 30 days overstayed you must leave Cambodia and pay the fine."
    ],
    "fcdo": "cambodia",
    "reviewed": "2026-11-18",
    "advice": "parts"
  },
  {
    "cc": "ID",
    "region": "sea",
    "entry": "visa-on-arrival",
    "stay": "30 days (visa on arrival)",
    "days": 30,
    "extension": {
      "can": "yes",
      "text": "Once, for another 30 days, at any immigration office in Indonesia, or online if you applied online. Do it within your first 30 days."
    },
    "before": [
      "Visa on arrival costs 500,000 rupiah (cash or card), single entry",
      "Proof of onward or return travel",
      "Or apply online at least a week ahead for options such as a 60-day or multiple-entry visa"
    ],
    "notes": [
      "The visa on arrival is not suitable for influencer work or making commercial online content.",
      "Overstaying costs 1 million rupiah a day."
    ],
    "fcdo": "indonesia",
    "reviewed": "2026-09-18"
  },
  {
    "cc": "LA",
    "region": "sea",
    "entry": "visa-on-arrival",
    "stay": "30 days",
    "days": 30,
    "extension": {
      "can": "yes",
      "text": "Twice while in Laos, for a total of 60 more days. Without an extension within 90 days the penalty is a 2,000 US dollar fine, deportation and a ban."
    },
    "before": [
      "e-visa at least 5 days ahead, or a single-entry visa on arrival at many entry points",
      "Lao Digital Immigration Form within 3 days before arrival and before departure"
    ],
    "fcdo": "laos",
    "reviewed": "2026-11-19",
    "advice": "parts"
  },
  {
    "cc": "MY",
    "region": "sea",
    "entry": "visa-free",
    "stay": "90 days (normally)",
    "days": 90,
    "extension": {
      "can": "unclear",
      "text": "The UK government page says to apply for a visa before you travel if you want more than 90 days. It doesn't mention extending once there."
    },
    "before": [
      "Submit the online arrival card before you travel"
    ],
    "notes": [
      "Even a few days of overstay can mean fines, detention, deportation or a ban."
    ],
    "fcdo": "malaysia",
    "reviewed": "2026-11-18",
    "advice": "parts"
  },
  {
    "cc": "MM",
    "region": "sea",
    "entry": "e-visa",
    "stay": "About 28 days (tourist e-visa)",
    "days": 28,
    "typicalStay": true,
    "extension": {
      "can": "unclear",
      "text": "The UK government page doesn't cover extensions."
    },
    "before": [
      "Apply for and receive your tourist e-visa before you travel. There is no visa on arrival"
    ],
    "fcdo": "myanmar",
    "reviewed": "2026-08-04",
    "advice": "parts"
  },
  {
    "cc": "PH",
    "region": "sea",
    "entry": "visa-free",
    "stay": "30 days",
    "days": 30,
    "extension": {
      "can": "yes",
      "text": "Apply for an extension in the Philippines before your 30 days end."
    },
    "before": [
      "Free eTravel registration and QR code within the 72 hours before arrival",
      "Proof of return or onward travel"
    ],
    "fcdo": "philippines",
    "reviewed": "2026-07-15",
    "advice": "parts"
  },
  {
    "cc": "SG",
    "region": "sea",
    "entry": "visa-free",
    "stay": "Normally 30 to 90 days",
    "days": 30,
    "extension": {
      "can": "unclear",
      "text": "The officer decides your stay. Ask the Immigration and Checkpoints Authority before it ends."
    },
    "before": [
      "SG Arrival Card within the 3 days before you arrive"
    ],
    "notes": [
      "The permitted period is at the immigration officer's discretion."
    ],
    "fcdo": "singapore",
    "reviewed": "2026-03-19"
  },
  {
    "cc": "TH",
    "region": "sea",
    "entry": "visa-free",
    "stay": "30 days (from 15 Sep 2026)",
    "days": 30,
    "extension": {
      "can": "yes",
      "text": "Possible through Thai immigration if you are eligible. Get it before your permission expires.",
      "typical": "Usually 30 more days for a fee of about 1,900 baht. This isn't stated by the UK government page."
    },
    "before": [
      "Digital arrival card online, up to 3 days before arrival",
      "Be ready to show at least 10,000 baht (20,000 per family) and onward or return travel"
    ],
    "notes": [
      "Visa-free entry over a land border is normally limited to 2 entries a calendar year. Air arrivals are not usually limited.",
      "Frequent tourist entries can lead officers to ask for proof and refuse entry.",
      "If you entered before 15 September 2026 you usually keep the period you were given then.",
      "Overstay fine: 500 baht a day, up to 20,000 baht, and possible detention, deportation and a ban of up to 10 years."
    ],
    "fcdo": "thailand",
    "reviewed": "2026-10-12",
    "advice": "parts"
  },
  {
    "cc": "TL",
    "region": "sea",
    "entry": "visa-on-arrival",
    "stay": "30 days",
    "days": 30,
    "extension": {
      "can": "yes",
      "text": "Apply to extend for another 30 days, ideally at least 15 days before your visa ends."
    },
    "before": [
      "Single-entry tourism visa on arrival at Dili airport or seaport: 30 US dollars, cash only"
    ],
    "fcdo": "timor-leste",
    "reviewed": "2025-12-10"
  },
  {
    "cc": "VN",
    "region": "sea",
    "entry": "visa-free",
    "stay": "45 days",
    "days": 45,
    "extension": {
      "can": "no",
      "text": "Not routine. To stay up to 90 days, get an e-visa (multiple entry) or other visa. The British Embassy can't help with extensions."
    },
    "before": [
      "Digital arrival card is encouraged at Ho Chi Minh City airport and may become mandatory at short notice"
    ],
    "notes": [
      "Check that your exit date is 45 days from your arrival: officials won't change it once you've left the airport or border."
    ],
    "fcdo": "vietnam",
    "reviewed": "2026-09-21"
  },
  {
    "cc": "AR",
    "region": "latam",
    "entry": "visa-free",
    "stay": "90 days",
    "days": 90,
    "extension": {
      "can": "yes",
      "text": "Another 90 days. Ask the Argentine Migration Office before your stay ends."
    },
    "notes": [
      "Passports are no longer stamped on entry. Ask the Migration Office for proof of your entry or exit."
    ],
    "fcdo": "argentina",
    "reviewed": "2026-05-07"
  },
  {
    "cc": "BZ",
    "region": "latam",
    "entry": "visa-free",
    "stay": "30 days",
    "days": 30,
    "extension": {
      "can": "yes",
      "text": "200 Belize dollars for each extra 30 days. Go to a Belize Immigration office and ask for a new stamp."
    },
    "fcdo": "belize",
    "reviewed": "2026-11-05"
  },
  {
    "cc": "BO",
    "region": "latam",
    "entry": "visa-free",
    "stay": "90 days in any year",
    "days": 90,
    "rolling": true,
    "extension": {
      "can": "unclear",
      "text": "For longer, check with the Bolivian Embassy or the immigration department."
    },
    "notes": [
      "Officials stamp 30 days, but you can stay 90 without a new stamp.",
      "Get an entry stamp or you will be fined when you leave. You may be asked for proof of your first night's accommodation."
    ],
    "fcdo": "bolivia",
    "reviewed": "2026-09-22",
    "advice": "parts"
  },
  {
    "cc": "BR",
    "region": "latam",
    "entry": "visa-free",
    "stay": "90 days",
    "days": 90,
    "extension": {
      "can": "yes",
      "text": "Contact the Federal Police before your stay expires.",
      "typical": "Usually up to 90 more days, with no more than 180 days in a year. This isn't stated by the UK government page."
    },
    "notes": [
      "Make sure your passport is stamped, or you may be fined when you leave."
    ],
    "fcdo": "brazil",
    "reviewed": "2026-11-17",
    "advice": "parts"
  },
  {
    "cc": "CL",
    "region": "latam",
    "entry": "visa-free",
    "stay": "90 days",
    "days": 90,
    "extension": {
      "can": "unclear",
      "text": "The UK government page doesn't cover extensions.",
      "typical": "Usually possible once for up to 90 days through the immigration police. Confirm before relying on it."
    },
    "notes": [
      "Keep your tourist card (a white A5 form) safe and hand it in when you leave."
    ],
    "fcdo": "chile",
    "reviewed": "2026-11-09"
  },
  {
    "cc": "CO",
    "region": "latam",
    "entry": "visa-free",
    "stay": "Up to 90 days",
    "days": 90,
    "extension": {
      "can": "yes",
      "text": "At Migración Colombia. The UK government page says by up to 120 days, but a visitor can't stay more than 180 days in any 12 months."
    },
    "before": [
      "Onward or return ticket valid within the 90 days",
      "The Check-Mig form is optional (72 hours to 1 hour before you travel)"
    ],
    "notes": [
      "The officer on arrival decides the length of stay."
    ],
    "fcdo": "colombia",
    "reviewed": "2026-11-23",
    "advice": "parts"
  },
  {
    "cc": "CR",
    "region": "latam",
    "entry": "visa-free",
    "stay": "Up to 180 days",
    "days": 180,
    "extension": {
      "can": "unclear",
      "text": "The UK government page doesn't cover extensions. Check with the Costa Rican Embassy."
    },
    "notes": [
      "The officer decides the exact period. Overstaying costs 100 US dollars a month and can affect future entry."
    ],
    "fcdo": "costa-rica",
    "reviewed": "2026-05-19"
  },
  {
    "cc": "CU",
    "region": "latam",
    "entry": "visa-needed",
    "stay": "About 30 days (tourist card)",
    "days": 30,
    "typicalStay": true,
    "extension": {
      "can": "unclear",
      "text": "The UK government page doesn't cover extensions.",
      "typical": "Usually one 30-day extension inside Cuba. Confirm before relying on it."
    },
    "before": [
      "Get a tourist visa (tourist card) before you travel, from the Cuban Embassy or the eVisa-Cuba site",
      "D'Viajeros online form within 72 hours before you enter",
      "Proof of onward or return travel"
    ],
    "fcdo": "cuba",
    "reviewed": "2026-09-25",
    "advice": "essential"
  },
  {
    "cc": "DO",
    "region": "latam",
    "entry": "visa-free",
    "stay": "30 days",
    "days": 30,
    "extension": {
      "can": "yes",
      "text": "Pay to extend up to 120 days through the Dominican Republic Immigration Service."
    },
    "before": [
      "Entry and exit form (QR code) up to 7 days before you arrive, and again when you leave",
      "Proof of onward or return travel"
    ],
    "fcdo": "dominican-republic",
    "reviewed": "2026-08-07"
  },
  {
    "cc": "EC",
    "region": "latam",
    "entry": "visa-free",
    "stay": "90 days in any 12 months",
    "days": 90,
    "rolling": true,
    "extension": {
      "can": "yes",
      "text": "Pay for an extra 90 days. Apply before your first 90 days end or you could be fined."
    },
    "notes": [
      "Entering by land from Peru or Colombia needs an apostilled criminal record certificate, or a check by border officials. Flying in has no restriction."
    ],
    "fcdo": "ecuador",
    "reviewed": "2026-11-20",
    "advice": "parts"
  },
  {
    "cc": "SV",
    "region": "latam",
    "entry": "visa-free",
    "stay": "Up to 180 days",
    "days": 180,
    "extension": {
      "can": "yes",
      "text": "Contact the General Directorate of Migration and Immigration."
    },
    "fcdo": "el-salvador",
    "reviewed": "2026-11-05"
  },
  {
    "cc": "GT",
    "region": "latam",
    "entry": "visa-free",
    "stay": "90 days",
    "days": 90,
    "extension": {
      "can": "yes",
      "text": "Apply to the Institute of Migration."
    },
    "before": [
      "Online immigration declaration form before you enter or leave (terminals are at the airport)"
    ],
    "notes": [
      "Get your passport stamped on entry or you'll be fined.",
      "Guatemala, Honduras and Nicaragua are in a Central America border agreement that can share one 90-day period between countries. The UK government page doesn't cover this, so check before you cross."
    ],
    "fcdo": "guatemala",
    "reviewed": "2026-11-16",
    "advice": "parts"
  },
  {
    "cc": "HN",
    "region": "latam",
    "entry": "visa-free",
    "stay": "90 days (new from 31 Oct 2026)",
    "days": 90,
    "extension": {
      "can": "yes",
      "text": "Apply at an immigration office."
    },
    "notes": [
      "Visa exemption for British citizens took effect on 31 October 2026.",
      "You may get a 30-day entry stamp. Get the right stamp and ask about extending.",
      "Land borders may charge a 3 US dollar fee in cash."
    ],
    "fcdo": "honduras",
    "reviewed": "2026-11-05"
  },
  {
    "cc": "MX",
    "region": "latam",
    "entry": "visa-free",
    "stay": "Up to 180 days (officer decides)",
    "days": 180,
    "typicalStay": true,
    "extension": {
      "can": "unclear",
      "text": "The UK government page doesn't cover extensions."
    },
    "before": [
      "Land arrivals: fill in the online immigration form"
    ],
    "notes": [
      "Your passport stamp or e-gate ticket shows the number of days you are allowed. Check it.",
      "You may be asked for a return ticket, proof of accommodation and proof of funds.",
      "Visiting Quintana Roo (Cancún and the Riviera Maya) means paying an entry tax, online before or during your stay."
    ],
    "fcdo": "mexico",
    "reviewed": "2026-10-20",
    "advice": "parts"
  },
  {
    "cc": "NI",
    "region": "latam",
    "entry": "visa-free",
    "stay": "90 days",
    "days": 90,
    "extension": {
      "can": "unclear",
      "text": "The UK government page doesn't cover extensions."
    },
    "before": [
      "Onward ticket",
      "10 US dollars arrival tax in cash; the 35 dollar departure tax is usually in your air fare"
    ],
    "notes": [
      "Nicaragua is in the Central America border agreement with Guatemala and Honduras. Check whether your 90 days are shared."
    ],
    "fcdo": "nicaragua",
    "reviewed": "2026-11-05"
  },
  {
    "cc": "PA",
    "region": "latam",
    "entry": "visa-free",
    "stay": "Up to 3 months (by land or air)",
    "days": 90,
    "extension": {
      "can": "no",
      "text": "Not normally possible unless you apply to change your immigration status within the 3 months. Leaving and re-entering to reset can get you detained."
    },
    "notes": [
      "You may be asked for your accommodation address, an onward ticket and proof of 1,000 US dollars or a credit card."
    ],
    "fcdo": "panama",
    "reviewed": "2026-10-09"
  },
  {
    "cc": "PY",
    "region": "latam",
    "entry": "visa-free",
    "stay": "90 days (normally)",
    "days": 90,
    "extension": {
      "can": "yes",
      "text": "Another 90 days. Check with the Paraguayan Immigration Department."
    },
    "fcdo": "paraguay",
    "reviewed": "2026-11-03"
  },
  {
    "cc": "PE",
    "region": "latam",
    "entry": "visa-free",
    "stay": "Normally 90 days in any 180",
    "days": 90,
    "rolling": true,
    "extension": {
      "can": "unclear",
      "text": "Immigration can grant at most 183 days in 365 as a visitor. The UK government page doesn't describe how to extend."
    },
    "notes": [
      "The 180-day period is counted from your first entry."
    ],
    "fcdo": "peru",
    "reviewed": "2026-11-06",
    "advice": "parts"
  },
  {
    "cc": "UY",
    "region": "latam",
    "entry": "visa-free",
    "stay": "90 days",
    "days": 90,
    "extension": {
      "can": "unclear",
      "text": "The UK government page doesn't cover extensions.",
      "typical": "Usually possible for up to 90 more days through the immigration office. Confirm before relying on it."
    },
    "fcdo": "uruguay",
    "reviewed": "2025-12-10"
  },
  {
    "cc": "VE",
    "region": "latam",
    "entry": "visa-free",
    "stay": "90 days (arriving by air)",
    "days": 90,
    "extension": {
      "can": "yes",
      "text": "Up to 90 more days. Apply and pay at an immigration (SAIME) office before your tourist card expires."
    },
    "before": [
      "Proof of accommodation, enough funds, and a return or onward ticket"
    ],
    "notes": [
      "Arriving overland or by sea you may need a visa in advance."
    ],
    "fcdo": "venezuela",
    "reviewed": "2026-11-18",
    "advice": "parts"
  }
];

export const VISA_BY_CC: Record<string, Visa> = Object.fromEntries(VISAS.map((v) => [v.cc, v]));

export const fcdoUrl = (v: Visa) => `https://www.gov.uk/foreign-travel-advice/${v.fcdo}/entry-requirements`;
