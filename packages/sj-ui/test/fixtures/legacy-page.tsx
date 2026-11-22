// KB's props on the legacy layer: the page a team gets after swapping the imports.
import { DatePicker } from "../../src/legacy/date-picker";
import { DepartureCard } from "../../src/legacy/departure-card";
import { FlowButton } from "../../src/legacy/flow-button";
import { FormControlLabel } from "../../src/legacy/form-control-label";
import { MenuItem } from "../../src/legacy/menu-item";
import { Select } from "../../src/legacy/select";
import { Switch } from "../../src/legacy/switch";

const leg = { concept: "", id: "1", producer: "SJ", productName: "Snabbtåg", serviceBrandName: "", transportMethod: "", transportMethodDescription: "" };

export function LegacyPage() {
  return (
    <main>
      <Select labelId="travellers" labelText="Antal resenärer" value={2} onChange={() => {}}>
        <MenuItem value={1}>1 resenär</MenuItem>
        <MenuItem value={2}>2 resenärer</MenuItem>
      </Select>
      <DatePicker id="outward" label="Utresa" value="2026-11-24" onAccept={() => {}} timeZone="Europe/Stockholm" />
      <FormControlLabel label="Visa bara direkttåg" control={<Switch name="direct" />} />
      <DepartureCard
        departureDate={new Date("2026-11-24T07:10:00+01:00")}
        arrivalDate={new Date("2026-11-24T10:05:00+01:00")}
        duration={{ days: "", hours: "2", minutes: "55" }}
        transportations={[leg]}
        transportInformations={[{ code: "BISTRO" }]}
        showPrice
        showPoints={false}
        price={495}
        timeZone="Europe/Stockholm"
        lang="sv"
        onClick={() => {}}
      />
      <FlowButton>Fortsätt</FlowButton>
    </main>
  );
}
