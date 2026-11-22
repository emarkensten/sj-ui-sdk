// Made-up departures, relative to today, with one sold-out exception.
import type { DepartureCardProps } from "@sj-ui-sdk/sj-ui";

function at(dayOffset: number, hh: number, mm: number) {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  // Build the time in Stockholm by formatting the date part and adding an explicit offset-less time.
  const iso = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Stockholm", year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
  return `${iso}T${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:00+01:00`;
}

export type Departure = Omit<DepartureCardProps, "onClick" | "selected"> & { id: string };

export const departures: Departure[] = [
  {
    id: "d1",
    departureDate: at(2, 6, 10),
    arrivalDate: at(2, 9, 5),
    transportations: [{ producer: "SJ", productName: "Snabbtåg", id: "421", concept: "X2000" }],
    amenities: ["BISTRO", "WIFI"],
    price: 395,
  },
  {
    id: "d2",
    departureDate: at(2, 7, 10),
    arrivalDate: at(2, 10, 5),
    transportations: [{ producer: "SJ", productName: "Snabbtåg", id: "1", concept: "SJ3000" }],
    amenities: ["BISTRO", "WIFI", "WHEELCHAIR"],
    price: 495,
  },
  {
    id: "d3",
    departureDate: at(2, 8, 25),
    arrivalDate: at(2, 12, 2),
    transportations: [
      { producer: "SJ", productName: "Regional", id: "10561", concept: "REGINA" },
      { producer: "SJ", productName: "Snabbtåg", id: "435" },
    ],
    amenities: ["WIFI"],
    availability: "soldOut",
  },
  {
    id: "d4",
    departureDate: at(2, 22, 52),
    arrivalDate: at(3, 6, 40),
    transportations: [{ producer: "SJ", productName: "Nattåg", id: "10", concept: "GENERIC_NIGHT_TRAIN" }],
    amenities: ["WHEELCHAIR"],
    price: 645,
    caption: { text: "Ankommer nästa dag", icon: "moon" },
  },
];
