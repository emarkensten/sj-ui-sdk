import { useState } from "react";
import { Button, DatePicker, DepartureCard, Select, Switch, Typography } from "@sj-ui-sdk/sj-ui";
import { ArrowRight } from "@sj-ui-sdk/sj-ui/icons";
import { departures } from "./data";

const travellers = [
  { value: "1", label: "1 resenär" },
  { value: "2", label: "2 resenärer" },
  { value: "3", label: "3 resenärer" },
  { value: "4", label: "4 resenärer" },
];

export function NewApiPage() {
  const [direct, setDirect] = useState(false);
  const [count, setCount] = useState<string | null>("2");
  const [date, setDate] = useState<string | null>(null);
  const [chosen, setChosen] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const list = direct ? departures.filter((d) => d.transportations.length === 1) : departures;

  return (
    <div className="stack">
      <section className="stack" aria-labelledby="sok">
        <Typography as="h2" id="sok" variant="title2Emphasized">
          Sök resa
        </Typography>
        <Select label="Antal resenärer" options={travellers} value={count} onValueChange={setCount} name="travellers" />
        <DatePicker label="Utresa" value={date} onValueChange={setDate} name="date" helperText="Skriv datumet eller välj i kalendern" />
        <Switch label="Visa bara direkttåg" checked={direct} onCheckedChange={setDirect} name="direct" />
      </section>

      <section className="stack" aria-labelledby="avgangar">
        <Typography as="h2" id="avgangar" variant="title2Emphasized">
          Välj avgång
        </Typography>
        <div className="list">
          {list.map(({ id, ...d }) => (
            <DepartureCard key={id} {...d} selected={chosen === id} onClick={() => setChosen(id)} />
          ))}
        </div>
      </section>

      <section className="stack" aria-labelledby="knappar">
        <Typography as="h2" id="knappar" variant="title2Emphasized">
          Knappar
        </Typography>
        <div className="row">
          <Button>Fortsätt</Button>
          <Button type="tinted">Avbryt</Button>
          <Button size="medium" icon={<ArrowRight />} iconPosition="right">
            Medium
          </Button>
          <Button color="himmel2" size="large">
            Blå
          </Button>
          <Button type="outlined" size="large">
            Outlined
          </Button>
          <Button type="gray" size="small">
            Grå
          </Button>
          <Button type="plain" size="small">
            Plain
          </Button>
          <Button disabled>Inaktiv</Button>
        </div>
      </section>

      <Button
        fullWidth
        borderShape="capsule"
        disabled={!chosen}
        focusableWhenDisabled
        showSpinner={saving}
        onClick={async () => {
          setSaving(true);
          await new Promise((r) => setTimeout(r, 1200));
          setSaving(false);
        }}
      >
        {saving ? "Sparar…" : "Fortsätt till betalning"}
      </Button>
    </div>
  );
}
