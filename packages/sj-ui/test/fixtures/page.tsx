import { Button, DatePicker, DepartureCard, Select, Switch } from "../../src";

export function Page() {
  return (
    <main>
      <Select label="Antal resenärer" options={[{ value: "1", label: "1 resenär" }, { value: "2", label: "2 resenärer" }]} defaultValue="2" />
      <DatePicker label="Utresa" defaultValue="2026-11-24" />
      <Switch label="Visa bara direkttåg" />
      <DepartureCard
        departureDate="2026-11-24T07:10:00+01:00"
        arrivalDate="2026-11-24T10:05:00+01:00"
        transportations={[{ producer: "SJ", productName: "Snabbtåg", id: "1" }]}
        price={495}
      />
      <Button>Fortsätt</Button>
    </main>
  );
}
