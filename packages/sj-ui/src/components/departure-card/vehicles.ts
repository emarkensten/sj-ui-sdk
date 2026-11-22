/* Which illustration a leg gets, and how wide each one may be. Same rules as KB's TransportImage and TransportDetails. */
import { vehicleUrls, type VehicleName } from "./vehicle-urls";

export type TransportMethod = "TRAIN" | "BUS" | "FERRY" | "TAXI" | "METRO";

const byMethod: Partial<Record<string, VehicleName>> = { BUS: "GenericBus", FERRY: "GenericBoat", TAXI: "GenericTaxi" };

const byConcept: Record<string, VehicleName> = {
  X2ORG: "X2000",
  X2000: "X2000",
  X2: "NewX2000",
  X55: "Sj3000",
  SJ3000: "Sj3000",
  TIBREGINA: "TibRegina",
  X51: "TibRegina",
  X40: "Dubbeldackaren",
  DUBBELDACKAREN: "Dubbeldackaren",
  X40MO: "X40Mo",
  EURONIGHT: "EuroNight",
  LOCO: "Lokvagn",
  LOK_VAGN: "Lokvagn",
  MALARTAG: "Malartag",
  REGINA: "Regina",
  X53: "Regina",
  REGINAX52: "ReginaX52",
  X52E: "ReginaX52",
  X14: "Tibx14",
  TIBX14: "Tibx14",
  X12: "X12",
  GENERIC_NIGHT_TRAIN: "GenericNightTrain",
  GENERIC_OLD_TRAIN: "GenericNightTrain",
};

export function vehicleFor({ concept, transportMethod }: { concept?: string; transportMethod?: string }) {
  const name = (transportMethod && byMethod[transportMethod]) || byConcept[concept?.toUpperCase() ?? ""] || "GenericTrain";
  return vehicleUrls[name];
}

/** Grid columns after the 16 px lead-in, one per leg. */
export function vehicleColumns(legs: { transportMethod?: string }[]) {
  const n = legs.length;
  return legs
    .map(({ transportMethod: m = "" }, i) => {
      if (n >= 4) return m === "TAXI" ? 0.3 : 1;
      switch (m) {
        case "TAXI":
          return i === 0 ? (n === 2 ? 12 : 22) : 36;
        case "BUS":
          return i === 0 ? (n === 2 ? 60 : 80) : 84;
        case "FERRY":
          return i === 0 ? (n === 2 ? 64 : 100) : 112;
        case "TRAIN":
        case "METRO":
          return n === 1 ? 0.9 : 154;
        default:
          return 1;
      }
    })
    .map((w) => `${w}fr`)
    .join(" ");
}
