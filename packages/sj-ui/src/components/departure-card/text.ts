/* Texts from KB's departure-card translation, so statuses and classes read the same. */

export const unavailableReasons = ["unavailable","salesStop","soldOut","existingTicket","error","tooFewPrioPoints","POTENTIAL_MAINT","CANCELLED","NOT_RELEASED","DISTURBANCE","TEMP_SALES_STOP","NOT_CONFIRMED","POTENTIAL_CANCEL","SALES_STOP","SOLD_OUT","DEPARTURE_TIME_PASSED","NO_OFFERS","NO_DEPARTURE","WCHAIR_UNAVAILABLE","WCHAIR_COMP_UNAVAILABLE","PETS_UNAVAILABLE","PETS_NO_UNAVAILABLE","NOT_VALID_FOR_REBOOK","TOO_FEW_PRIO_POINTS","PASSENGER_NOT_VALID_FOR_EURO_NIGHT","OFFER_IN_CONFLICT_WITH_PREVIOUS_BOOKING_WITH_TRAVEL_PASS","UNAVAILABLE","ERROR","WCHAIR_NIGHT_TRAIN_HANDLED_BY_CUSTOMER_SERVICE","EQUIPMENT_MISSING"] as const;
export type UnavailableReason = (typeof unavailableReasons)[number];
export const comfortCategories = ["STANDARD","STANDARD_EXTENDED","COMFORT","COMPARTMENT","SEAT","SLEEPER","COUCHETTE","FIRST","SECOND","SECOND_CALM"] as const;
export type ComfortCategory = (typeof comfortCategories)[number];

export const departureCardText = {
  sv: {
    status: {"unavailable":"Inte valbar","salesStop":"Inga fler biljetter säljs","soldOut":"Slutsåld","existingTicket":"Din resa","error":"Kan inte visa pris","tooFewPrioPoints":"Fler SJ Prio-poäng behövs","POTENTIAL_MAINT":"Banarbete planeras","CANCELLED":"Inställd","NOT_RELEASED":"Släpps senare","DISTURBANCE":"Trafikstörning","TEMP_SALES_STOP":"Säljs inte just nu","NOT_CONFIRMED":"Preliminär","POTENTIAL_CANCEL":"Preliminär","SALES_STOP":"Fullbokad","SOLD_OUT":"Slutsåld","DEPARTURE_TIME_PASSED":"Avgått","NO_OFFERS":"Inte valbar","NO_DEPARTURE":"Inte valbar","WCHAIR_UNAVAILABLE":"Rullstolsplats saknas","WCHAIR_COMP_UNAVAILABLE":"Inte valbar","PETS_UNAVAILABLE":"Djurplats kan inte garanteras","PETS_NO_UNAVAILABLE":"Djurfri plats saknas","NOT_VALID_FOR_REBOOK":"Inte valbar","TOO_FEW_PRIO_POINTS":"Fler SJ Prio-poäng behövs","PASSENGER_NOT_VALID_FOR_EURO_NIGHT":"Inte valbar","OFFER_IN_CONFLICT_WITH_PREVIOUS_BOOKING_WITH_TRAVEL_PASS":"Samtidigt som annan bokning","UNAVAILABLE":"Inte valbar","ERROR":"Kan inte visa pris","WCHAIR_NIGHT_TRAIN_HANDLED_BY_CUSTOMER_SERVICE":"Bokas via Kundservice","EQUIPMENT_MISSING":"Säljs inte just nu"} as Record<UnavailableReason, string>,
    comfort: {"STANDARD":"2 klass","STANDARD_EXTENDED":"2 klass Lugn","COMFORT":"1 klass","COMPARTMENT":"Ligg- eller sovplats","SEAT":"Sittplats","SLEEPER":"Sovplats","COUCHETTE":"Liggplats","FIRST":"1 klass","SECOND":"2 klass","SECOND_CALM":"2 klass Lugn"} as Record<ComfortCategory, string>,
    travelTime: "Restid",
    hours: "tim",
    minutes: "min",
    separator: "–",
    classAvailable: "Tillgängliga reseklasser: ",
    loadingPrice: "Hämtar pris",
    loadingComfort: "Hämtar reseklasser",
    travelDetails: "resedetaljer",
  },
  en: {
    status: {"unavailable":"Unavailable","salesStop":"No more tickets are sold","soldOut":"Sold out","existingTicket":"Your journey","error":"Can't show price","tooFewPrioPoints":"More SJ Prio points needed","POTENTIAL_MAINT":"Track maintenance in planning","CANCELLED":"Cancelled","NOT_RELEASED":"Released later","DISTURBANCE":"Traffic disruption","TEMP_SALES_STOP":"Currently not sold","NOT_CONFIRMED":"Preliminary","POTENTIAL_CANCEL":"Preliminary","SALES_STOP":"Fully booked","SOLD_OUT":"Sold out","DEPARTURE_TIME_PASSED":"Departed","NO_OFFERS":"Unavailable","NO_DEPARTURE":"Unavailable","WCHAIR_UNAVAILABLE":"No wheelchair space","WCHAIR_COMP_UNAVAILABLE":"Unavailable","PETS_UNAVAILABLE":"Pet seat can't be guaranteed","PETS_NO_UNAVAILABLE":"No pet-free seats","NOT_VALID_FOR_REBOOK":"Unavailable","TOO_FEW_PRIO_POINTS":"More SJ Prio points needed","PASSENGER_NOT_VALID_FOR_EURO_NIGHT":"Unavailable","OFFER_IN_CONFLICT_WITH_PREVIOUS_BOOKING_WITH_TRAVEL_PASS":"Another booking at the same time","UNAVAILABLE":"Unavailable","ERROR":"Can't show price","WCHAIR_NIGHT_TRAIN_HANDLED_BY_CUSTOMER_SERVICE":"Book via Customer service","EQUIPMENT_MISSING":"Currently not sold"} as Record<UnavailableReason, string>,
    comfort: {"STANDARD":"2 class","STANDARD_EXTENDED":"2 class Calm","COMFORT":"1 class","COMPARTMENT":"Berth in couchette or sleeping compartment","SEAT":"Seat","SLEEPER":"Sleeping compartment","COUCHETTE":"Couchette","FIRST":"1 class","SECOND":"2 class","SECOND_CALM":"2 class Calm"} as Record<ComfortCategory, string>,
    travelTime: "Travel time",
    hours: "h",
    minutes: "min",
    separator: "–",
    classAvailable: "Available travel classes: ",
    loadingPrice: "Loading price",
    loadingComfort: "Loading travel classes",
    travelDetails: "travel details",
  },
};

export type DepartureCardText = (typeof departureCardText)["sv"];
