export type Lang = "sv" | "en";

export function resolveLang(lang?: string): Lang {
  return lang?.toLowerCase().startsWith("en") ? "en" : "sv";
}

export const locales: Record<Lang, string> = { sv: "sv-SE", en: "en-GB" };

const dictionaries = {
  sv: {
    chooseDate: "Välj datum",
    previousMonth: "Föregående månad",
    nextMonth: "Nästa månad",
    calendar: "Kalender",
    loading: "Laddar",
    selectPlaceholder: "Välj",
    from: "Fr.",
    soldOut: "Slutsåld",
    unavailable: "Ej bokningsbar",
    cancelled: "Inställd",
    travelTime: "Restid",
    changes: (n: number) => `${n} ${n === 1 ? "byte" : "byten"}`,
    changesWord: (n: number): string => (n === 1 ? "byte" : "byten"),
    status: { soldOut: "Slutsåld", cancelled: "Inställd", unavailable: "Inte valbar" } as Record<string, string>,
    priceSr: "pris",
    fromSr: "från",
    currencySr: "svenska kronor",
    travelTimeSr: "Restiden är",
    spokenUnits: { day: ["dag", "dagar"], hour: ["timme", "timmar"], minute: ["minut", "minuter"] },
    symbols: "Symboler:",
    pointsSr: "poäng",
    then: "sedan",
    first: "först",
    departs: "Avgår",
    arrives: "ankommer",
    train: "tåg",
    operatedBy: "körs med",
    amenities: "Symboler",
    amenity: { BIKE: "cykelplats", BISTRO: "bistro", CATERING: "servering", FAMILY: "familjevagn", PETS: "djur tillåtna", NOPETS: "djur inte tillåtna", POWEROUTLET: "eluttag", WHEELCHAIR: "rullstolslyft", WIFI: "wifi", WIFIPLUS: "satellit-wifi", KOMREA: "rullstolslyft", KOMREP: "plant insteg" } as Record<string, string>,
    and: "och",
    hours: "tim",
    minutes: "min",
    days: "d",
    currency: ":-",
    nextDay: "nästa dag",
    today: "Idag",
    tomorrow: "Imorgon",
    daySeparator: "",
  },
  en: {
    chooseDate: "Choose date",
    previousMonth: "Previous month",
    nextMonth: "Next month",
    calendar: "Calendar",
    loading: "Loading",
    selectPlaceholder: "Choose",
    from: "From",
    soldOut: "Sold out",
    unavailable: "Not bookable",
    cancelled: "Cancelled",
    travelTime: "Travel time",
    changes: (n: number) => `${n} ${n === 1 ? "change" : "changes"}`,
    changesWord: (n: number): string => (n === 1 ? "change" : "changes"),
    status: { soldOut: "Sold out", cancelled: "Cancelled", unavailable: "Not selectable" } as Record<string, string>,
    priceSr: "price",
    fromSr: "from",
    currencySr: "Swedish kronor",
    travelTimeSr: "The travel time is",
    spokenUnits: { day: ["day", "days"], hour: ["hour", "hours"], minute: ["minute", "minutes"] },
    symbols: "Symbols:",
    pointsSr: "points",
    then: "then",
    first: "first",
    departs: "Departs",
    arrives: "arrives",
    train: "train",
    operatedBy: "operated by",
    amenities: "Symbols",
    amenity: { BIKE: "bicycle area", BISTRO: "bistro", CATERING: "serving", FAMILY: "family carriage", PETS: "pets allowed", NOPETS: "no pets allowed", POWEROUTLET: "power outlet", WHEELCHAIR: "wheelchair lift", WIFI: "wifi", WIFIPLUS: "satellite wifi", KOMREA: "wheelchair lift", KOMREP: "level boarding" } as Record<string, string>,
    and: "and",
    hours: "h",
    minutes: "min",
    days: "d",
    currency: " SEK",
    nextDay: "next day",
    today: "Today",
    tomorrow: "Tomorrow",
    daySeparator: ",",
  },
};

export type Dictionary = (typeof dictionaries)["sv"];

export function t(lang?: string): Dictionary {
  return dictionaries[resolveLang(lang)];
}

export function joinList(items: string[], lang?: string) {
  return new Intl.ListFormat(locales[resolveLang(lang)], { type: "conjunction" }).format(items);
}
