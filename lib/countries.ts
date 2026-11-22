/**
 * The 195 sovereign states: 193 UN members plus the Holy See and Palestine.
 * The map also draws territories (Greenland, Puerto Rico...). They can be
 * scratched off too, but only these 195 count towards the total.
 */
export const SOVEREIGN: ReadonlySet<string> = new Set(
  (
    "AF AL DZ AD AO AG AR AM AU AT AZ BS BH BD BB BY BE BZ BJ BT BO BA BW BR BN BG BF BI " +
    "CV KH CM CA CF TD CL CN CO KM CG CD CR CI HR CU CY CZ DK DJ DM DO EC EG SV GQ ER EE " +
    "SZ ET FJ FI FR GA GM GE DE GH GR GD GT GN GW GY HT HN HU IS IN ID IR IQ IE IL IT JM " +
    "JP JO KZ KE KI KP KR KW KG LA LV LB LS LR LY LI LT LU MG MW MY MV ML MT MH MR MU MX " +
    "FM MD MC MN ME MA MZ MM NA NR NP NL NZ NI NE NG MK NO OM PK PW PA PG PY PE PH PL PT " +
    "QA RO RU RW KN LC VC WS SM ST SA SN RS SC SL SG SK SI SB SO ZA SS ES LK SD SR SE CH " +
    "SY TJ TZ TH TL TG TO TT TN TR TM TV UG UA AE GB US UY UZ VU VE VN YE ZM ZW VA PS"
  ).split(" "),
);

let names: Intl.DisplayNames | null | undefined;

/** English country name for an ISO alpha-2 code (falls back to the code). */
export function countryName(cc: string): string {
  if (names === undefined) {
    try {
      names = new Intl.DisplayNames(["en"], { type: "region" });
    } catch {
      names = null;
    }
  }
  try {
    return names?.of(cc) ?? cc;
  } catch {
    return cc;
  }
}

/** Every sovereign country as { cc, name }, sorted by name. */
export function sovereignList(): { cc: string; name: string }[] {
  return [...SOVEREIGN].map((cc) => ({ cc, name: countryName(cc) })).sort((a, b) => a.name.localeCompare(b.name));
}
