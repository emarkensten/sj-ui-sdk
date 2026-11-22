// The same SJ components as Web Components, without React. Behaviour from @ui-sdk/web,
// styles from the very same sj-ui CSS files the React components use.
import "@sj-ui-sdk/sj-ui/styles.css";
import "./demo.css";
import "@ui-sdk/web/switch";
import "@ui-sdk/web/date-picker";

const root = document.getElementById("root")!;
const calendarIcon = `<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path fill="currentColor" d="M7 16.5v-2h2v2zm4-2h2v2h-2zm6 2v-2h-2v2z"/><path fill="currentColor" fill-rule="evenodd" d="M18 5.5h1a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-12a2 2 0 0 1 2-2h1v-3h2v3h5a1 1 0 1 1 0 2H5v2h14v-2h-3v-5h2zm-13 14h14v-8H5z"/></svg>`;
const chevron = (d: string) => `<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path fill="currentColor" d="${d}"/></svg>`;
const left = chevron("M14 17a1 1 0 0 0 .707-1.707L11.414 12l3.293-3.293a1 1 0 1 0-1.414-1.414l-4 4a1 1 0 0 0 0 1.414l4 4A1 1 0 0 0 14 17");
const right = chevron("M10 17a1 1 0 0 1-.707-1.707L12.586 12 9.293 8.707a1 1 0 1 1 1.414-1.414l4 4a1 1 0 0 1 0 1.414l-4 4A1 1 0 0 1 10 17");

root.innerHTML = `
  <h1 class="sj-typography" data-variant="large-title-emphasized">Web Components</h1>
  <p class="sj-typography" data-variant="body">Samma beteende och samma CSS som React-versionen, utan React.</p>

  <label class="sj-switch-row" data-label-placement="start">
    <span class="sj-switch-row__text"><span class="sj-switch-row__label">Visa bara direkttåg</span></span>
    <ui-switch class="sj-switch" name="direct"><ui-switch-thumb class="sj-switch__thumb"></ui-switch-thumb></ui-switch>
  </label>

  <div class="sj-field" data-full-width id="date-field">
    <label class="sj-field__label" for="wc-date">Utresa</label>
    <div class="sj-field__box">
      <ui-date-picker class="sj-date-picker" locale="sv-SE" time-zone="Europe/Stockholm" weekday-format="short" presentation="auto" close-on-select>
        <span class="sj-date-picker__control">
          <ui-date-picker-input><input id="wc-date" class="sj-date-picker__input" /></ui-date-picker-input>
          <span class="sj-date-picker__display" aria-hidden="true" hidden></span>
        </span>
        <ui-date-picker-trigger><button class="sj-date-picker__trigger" aria-label="Välj datum">${calendarIcon}</button></ui-date-picker-trigger>
        <ui-date-picker-content class="sj-date-picker__content" hidden>
          <div class="sj-calendar__header">
            <ui-calendar-heading class="sj-calendar__heading"></ui-calendar-heading>
            <ui-calendar-previous><button class="sj-calendar__nav" aria-label="Föregående månad">${left}</button></ui-calendar-previous>
            <ui-calendar-next><button class="sj-calendar__nav" aria-label="Nästa månad">${right}</button></ui-calendar-next>
          </div>
          <ui-calendar-grid class="sj-calendar__grid">
            <ui-calendar-weekdays><template><ui-calendar-weekday class="sj-calendar__weekday"></ui-calendar-weekday></template></ui-calendar-weekdays>
            <ui-calendar-weeks><template><ui-calendar-day class="sj-calendar__day"></ui-calendar-day></template></ui-calendar-weeks>
          </ui-calendar-grid>
        </ui-date-picker-content>
      </ui-date-picker>
      <fieldset class="sj-field__outline" aria-hidden="true"><legend><span>Utresa</span></legend></fieldset>
    </div>
  </div>
  <p class="sj-typography" data-variant="footnote" id="out">Inget datum valt</p>
`;

// The friendly date display ("Tisdag 24 november"), same helper idea as the React version.
const picker = root.querySelector("ui-date-picker")!;
const display = root.querySelector<HTMLElement>(".sj-date-picker__display")!;
const field = root.querySelector<HTMLElement>("#date-field")!;
picker.addEventListener("valuechange", (event) => {
  const value = (event as CustomEvent<{ value: string | null }>).detail?.value ?? (picker as unknown as { value: string | null }).value;
  const text = value
    ? new Intl.DateTimeFormat("sv-SE", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`))
    : "";
  display.textContent = text.charAt(0).toUpperCase() + text.slice(1);
  display.hidden = !value;
  field.toggleAttribute("data-filled", Boolean(value));
  root.querySelector("#out")!.textContent = value ? `Valt datum: ${value}` : "Inget datum valt";
});
