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
    departs: "Avgår",
    arrives: "ankommer",
    train: "tåg",
    operatedBy: "körs med",
    amenities: "Symboler",
    amenity: { BISTRO: "bistro", WIFI: "wifi", WHEELCHAIR: "rullstolsplats" } as Record<string, string>,
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
    departs: "Departs",
    arrives: "arrives",
    train: "train",
    operatedBy: "operated by",
    amenities: "Symbols",
    amenity: { BISTRO: "bistro", WIFI: "wifi", WHEELCHAIR: "wheelchair space" } as Record<string, string>,
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
