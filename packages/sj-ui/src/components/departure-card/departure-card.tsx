import type { AnchorHTMLAttributes, ElementType, ReactNode } from "react";
import { useId } from "react";
import { Button as UiButton } from "@ui-sdk/react/button";
import {
  BicycleSmall,
  BistroSmall,
  CateringSmall,
  ChevronRight,
  HeartOutlinedSmall,
  KomreaSmall,
  KomrepSmall,
  MoonSmall,
  PetsOffSmall,
  PetsSmall,
  PowerOutletSmall,
  WheelchairSmall,
  WiFiPlusSmall,
  WiFiSmall,
} from "../../icons";
import { cx } from "../../lib/cx";
import { durationBetween, formatDuration, formatTime, spokenDuration, type Duration } from "../../lib/format";
import { joinList, resolveLang, t, type Lang } from "../../lib/i18n";
import { departureCardText, type ComfortCategory, type DepartureCardText, type UnavailableReason } from "./text";
import { vehicleColumns, vehicleFor, type TransportMethod } from "./vehicles";

export type { ComfortCategory, DepartureCardText, UnavailableReason } from "./text";

export type Amenity =
  | "BIKE"
  | "BISTRO"
  | "CATERING"
  | "FAMILY"
  | "NOPETS"
  | "PETS"
  | "POWEROUTLET"
  | "WHEELCHAIR"
  | "WIFI"
  | "WIFIPLUS"
  | "KOMREP"
  | "KOMREA";

export interface Transportation {
  /** Stable key for the list. */
  id: string;
  /** "SJ" */
  producer?: string;
  /** "Snabbtåg", not "SJ Snabbtåg": the producer is written before it. */
  productName?: string;
  /** Written after the name on journeys with one or two legs, like "SJ Snabbtåg, Vy Nattåg". */
  serviceBrandName?: string;
  /** "Tåg", "Buss": with one leg, written as "tåg 421" after the name, using `id` as the number. */
  transportMethodDescription?: string;
  /** Train model, like "X2000", "SJ3000" or "REGINA". Picks the illustration. Unknown: a generic train. */
  concept?: string;
  /** "BUS", "FERRY" and "TAXI" get their own illustration. Default: a train. */
  transportMethod?: TransportMethod | (string & {});
}

export type DepartureAvailability = "available" | "AVAILABLE" | UnavailableReason;
export type BadgeColor = "green" | "lightGreen" | "blue" | "yellow" | "orange" | "red" | "grey" | "placeholder" | "lightGrey" | "outlined";
export type PriceTextType = "standard" | "secondary" | "lowPrice";

export interface DepartureCardProps {
  departureDate: Date | string;
  arrivalDate: Date | string;
  /** Computed from the dates when left out. */
  duration?: Duration;
  /** One per leg. Changes are the number of legs minus one. */
  transportations: Transportation[];
  /** Symbols for the train, shown after the picture when the journey has a single leg. */
  amenities?: Amenity[];

  /** Price in kronor (or euro with `currency="EUR"`). Left out: no price. */
  price?: number;
  /** SJ Prio points, shown above the price. */
  points?: number;
  /** "Fr.", "Lägg till fr." or "Lägg till" before the price. `false` hides it. Default "from". */
  pricePrefix?: "from" | "addFrom" | "add" | false;
  /** "lowPrice" colours the price orange. */
  priceType?: "standard" | "lowPrice";
  currency?: "SEK" | "EUR";
  /** Greys out the price. */
  priceDisabled?: boolean;
  /** Shows a placeholder while the price loads. */
  priceLoading?: boolean;
  /** Up to two lines under the price, like "Endast 2 platser kvar". */
  priceTexts?: { text: string; type?: PriceTextType }[];
  /** Travel classes. Only the available ones are listed; sold-out ones are struck through. */
  comfort?: { category: ComfortCategory; isAvailable: boolean; soldOut?: boolean }[];

  /** "available", or one of SJ's reasons a departure can't be chosen, like "soldOut" or "CANCELLED". */
  availability?: DepartureAvailability;
  /** The departure the traveller has chosen. Sets `aria-pressed` and a green frame. */
  selected?: boolean;
  /**
   * Greys out and stops clicks (unlike KB's DepartureCard, whose `disabled` let clicks through).
   * An unavailable departure stays clickable, as in KB, so the page can explain why.
   */
  disabled?: boolean;
  onClick?: () => void;
  /** Extra attributes for the card's button, like `aria-describedby`. */
  buttonProps?: Record<string, unknown>;

  caption?: { text: string; icon?: "moon"; srText?: string; highlighted?: boolean };
  badge?: { label: string; color?: BadgeColor };
  /**
   * Makes "Restid …, 0 byten" a link of its own, for example to the stops. The card then has two
   * targets side by side, never one inside the other.
   */
  durationLink?: AnchorHTMLAttributes<HTMLAnchorElement> & { onClick?: () => void };

  /**
   * Layout. Left out: follows the window like KB, "small" under 360 px, "medium" under 600 px,
   * "large" from 600 px.
   */
  size?: "small" | "medium" | "large";
  /** Corner radius token. Default "default" (16 px). */
  radius?: "none" | "sm" | "md" | "lg" | "xl" | "capsule" | "default";
  /** Pull the vehicle pictures to the card's edge (default) or keep them in line with the text. */
  alignVehiclesWithText?: boolean;
  lang?: Lang;
  /** Replaces any of the built-in texts. */
  text?: Partial<DepartureCardText>;
  timeZone?: string;
  className?: string;
  /** Non-interactive content inside the click area, under the card's own content. */
  footer?: ReactNode;
  /** Element for the times, like "h3". The times are hidden from screen readers, so this only changes the tag. */
  timeAs?: ElementType;
  /** Rendered after the button, outside the click area, like an accordion with the stops. */
  children?: ReactNode;
  id?: string;
  /** Test ids and other data attributes land on the root. */
  [dataAttr: `data-${string}`]: string | undefined;
}

const amenityIcons: Record<Amenity, typeof BistroSmall> = {
  BIKE: BicycleSmall,
  BISTRO: BistroSmall,
  CATERING: CateringSmall,
  FAMILY: HeartOutlinedSmall,
  NOPETS: PetsOffSmall,
  PETS: PetsSmall,
  POWEROUTLET: PowerOutletSmall,
  WHEELCHAIR: WheelchairSmall,
  WIFI: WiFiSmall,
  WIFIPLUS: WiFiPlusSmall,
  KOMREP: KomrepSmall,
  KOMREA: KomreaSmall,
};

const prefixes = {
  sv: { from: ["Fr.", "från"], addFrom: ["Lägg till fr.", "lägg till från"], add: ["Lägg till", "lägg till"] },
  en: { from: ["Fr.", "from"], addFrom: ["Add fr.", "add from"], add: ["Add", "add"] },
} as const;
const currencies = {
  SEK: { sv: [":-", "svenska kronor"], en: ["SEK", "Swedish kronor"] },
  EUR: { sv: ["€", "euro"], en: ["EUR", "euros"] },
} as const;

// KB treats these as unavailable (dimmed, with a heading). The lower-case tooFewPrioPoints is not in KB's list.
const isUnavailable = (a: DepartureAvailability) => a !== "available" && a !== "AVAILABLE" && a !== "tooFewPrioPoints";
const showsPrice = (a: DepartureAvailability) => !isUnavailable(a) || a === "TOO_FEW_PRIO_POINTS";

function amount(n: number, lang: Lang, currency: "SEK" | "EUR") {
  const decimals = currency === "EUR" && n % 1 !== 0 ? 2 : undefined;
  return n.toLocaleString(lang === "en" ? "en-US" : "sv-SE", { minimumFractionDigits: decimals });
}

const toDate = (d: Date | string) => (d instanceof Date ? d : new Date(d));

/**
 * One departure to choose in a list, laid out like SJ's DepartureCard in all its variants.
 *
 * The whole card is one button (a ui-sdk Button, so agents see it). Its name is one spoken
 * sentence, like KB's: "Avgår 08:10, ankommer 11:05, pris från 495 svenska kronor, restiden är
 * 2 timmar och 55 minuter, 0 byten, körs med SJ Snabbtåg, symboler: bistro och wifi". The visible
 * text is hidden from screen readers so nothing is read twice.
 */
export function DepartureCard({
  departureDate,
  arrivalDate,
  duration,
  transportations,
  amenities = [],
  price,
  points,
  pricePrefix = "from",
  priceType = "standard",
  currency = "SEK",
  priceDisabled,
  priceLoading,
  priceTexts = [],
  comfort,
  availability = "available",
  selected,
  disabled,
  onClick,
  buttonProps,
  caption,
  badge,
  durationLink,
  size,
  radius,
  alignVehiclesWithText,
  lang: langProp,
  text: textProp,
  timeZone = "Europe/Stockholm",
  className,
  footer,
  timeAs: Time = "span",
  children,
  ...rest
}: DepartureCardProps) {
  const lang = resolveLang(langProp);
  const uid = useId();
  const base = t(lang);
  const copy = { ...departureCardText[lang], ...textProp };
  const dep = toDate(departureDate);
  const arr = toDate(arrivalDate);
  const depTime = formatTime(dep, timeZone);
  const arrTime = formatTime(arr, timeZone);
  const dur = duration ?? durationBetween(dep, arr);
  const changes = Math.max(0, transportations.length - 1);
  const unavailable = isUnavailable(availability);
  const blocked = Boolean(disabled);
  const statusText = unavailable ? copy.status[availability as UnavailableReason] : null;
  const showPriceObject = showsPrice(availability) && (price !== undefined || points !== undefined);
  const hasPrice = showPriceObject && price !== undefined;
  const hasPoints = showPriceObject && points !== undefined;
  const singleLeg = transportations.length === 1;
  const shownAmenities = singleLeg ? amenities.filter((a) => amenityIcons[a]) : [];
  const availableComfort = comfort?.filter((c) => c.isAvailable) ?? [];
  const [prefixText, prefixSpoken] = pricePrefix ? prefixes[lang][pricePrefix] : ["", ""];
  const [suffixText, suffixSpoken] = currencies[currency][lang];
  const priceText = hasPrice ? `${amount(price, lang, currency)}${suffixText === ":-" ? suffixText : ` ${suffixText}`}` : "";
  const pointsText = hasPoints ? `${amount(points, "sv", "SEK")} p` : "";
  const durationText = `${copy.travelTime} ${formatDuration(dur, lang, copy).replace(/(\d) /g, "$1 ")}, ${changes} ${base.changesWord(changes)}`;

  // The spoken sentence follows KB's ScreenReaderOnlyDepartureCard word for word, including its
  // commas and the train number from `id`. Two deliberate differences: times are read in
  // `timeZone` (KB reads the browser's), and the price in its own currency (KB always says kronor).
  const spokenPrice = () => {
    if (priceLoading) return copy.loadingPrice;
    const both = hasPrice && hasPoints;
    const parts = [hasPrice ? `${amount(price, lang, currency)} ${suffixSpoken}` : "", hasPoints ? `${both ? "+ " : ""}${amount(points, "sv", "SEK")} ${base.pointsSr}` : ""].filter(Boolean);
    const intro = pricePrefix === "add" || pricePrefix === "addFrom" ? "" : `${base.priceSr} `;
    return `${intro}${prefixSpoken ? `${prefixSpoken} ` : ""}${parts.join(" ")}`;
  };
  const statusSpoken = (copy.status as Record<string, string | undefined>)[availability];
  const availabilitySpoken = statusSpoken ?? (showPriceObject || priceLoading ? spokenPrice() : "");
  const [priceText1, priceText2] = priceTexts.map((p) => p.text);
  const comfortSpoken = priceLoading && comfort
    ? `${copy.loadingComfort},`
    : availableComfort.some((c) => !c.soldOut)
      ? `${copy.classAvailable}${availableComfort.filter((c) => !c.soldOut).map((c) => copy.comfort[c.category]).join(", ")},`
      : "";
  const transportSpoken = singleLeg
    ? `${base.operatedBy} ${[
        transportations[0].producer,
        transportations[0].productName,
        transportations[0].serviceBrandName,
        transportations[0].transportMethodDescription ? `${transportations[0].transportMethodDescription.toLowerCase()} ${transportations[0].id}` : transportations[0].id,
      ].filter(Boolean).join(", ")}`
    : transportations.length
      ? `${base.first} ${transportations
          .map((tr) => [tr.transportMethod && tr.transportMethod !== "TRAIN" && tr.transportMethodDescription ? `${tr.transportMethodDescription},` : "", tr.producer, tr.productName, tr.serviceBrandName].filter(Boolean).join(" "))
          .join(`, ${base.then} `)}`
      : "";
  const symbolsSpoken = singleLeg && amenities.length ? `${base.symbols} ${joinList(amenities.map((a) => base.amenity[a] ?? a), lang)}` : "";
  const captionSpoken = caption ? (caption.srText ?? `${caption.text},`) : "";
  const spoken = [
    captionSpoken,
    `${copy.departureTime} ${depTime},`,
    `${copy.arrivalTime} ${arrTime},`,
    `${availabilitySpoken ? `${availabilitySpoken},` : ""}${priceText1 ? ` ${priceText1}, ${priceText2 ? `${priceText2}, ` : ""}` : ""}`,
    `${spokenDuration(dur, lang)},`,
    `${changes} ${base.changesWord(changes)},`,
    comfortSpoken,
    transportSpoken,
    `${symbolsSpoken ? `, ${symbolsSpoken}` : ""}${badge?.label ? `, ${badge.label}` : ""}`,
  ]
    .join(" ")
    .replace(/ +/g, " ")
    .trim();

  // KB moves the transport details and the classes between sizes; each placement is rendered and CSS shows one.
  const details = (at: "small" | "medium" | "large") => (
    <span aria-hidden="true" className="sj-departure-card__details sj-departure-card__dim" data-at={at}>
      <span
        className="sj-departure-card__vehicles"
        data-align-text={alignVehiclesWithText || undefined}
        style={{ gridTemplateColumns: `16px ${vehicleColumns(transportations)}` }}
      >
        {transportations.map((tr, i) => (
          <img key={tr.id} className="sj-departure-card__vehicle" src={vehicleFor(tr)} alt="" draggable={false} data-first={i === 0 || undefined} />
        ))}
        {shownAmenities.length > 0 && (
          <span className="sj-departure-card__amenities">
            {shownAmenities.map((a) => {
              const Icon = amenityIcons[a];
              return <Icon key={a} size="1.25rem" />;
            })}
          </span>
        )}
      </span>
      <span className="sj-departure-card__trains">{transportLabel(transportations)}</span>
    </span>
  );

  const comfortLine = (at: "large" | "compact") =>
    availableComfort.length > 0 && (
    <span aria-hidden="true" className="sj-departure-card__comfort" data-at={at}>
      {priceLoading ? (
        <span className="sj-skeleton" style={{ width: "10rem" }} />
      ) : (
        <span className="sj-departure-card__comfort-text">
          {availableComfort.map((c, i) => (
            <span key={c.category}>
              <span data-sold-out={c.soldOut || undefined}>{copy.comfort[c.category]}</span>
              {i < availableComfort.length - 1 ? ", " : ""}
            </span>
          ))}
        </span>
      )}
    </span>
  );

  const visual = (
    <span className="sj-departure-card__visual" aria-hidden={durationLink ? undefined : true}>
      {caption && (
        <span aria-hidden="true" className="sj-departure-card__caption sj-departure-card__dim" data-highlighted={caption.highlighted || undefined}>
          {caption.icon === "moon" && <MoonSmall size="1.25rem" />}
          <span>{caption.text}</span>
        </span>
      )}
      <span className="sj-departure-card__row">
        <span className="sj-departure-card__main">
          <Time aria-hidden="true" className="sj-departure-card__time sj-departure-card__dim">
            <span>{`${depTime}${copy.separator}`}</span>
            <span>{arrTime}</span>
          </Time>
          <span aria-hidden={durationLink ? undefined : true} className="sj-departure-card__duration sj-departure-card__dim">
            {durationLink ? <DurationLink {...durationLink} describedBy={`${uid}-desc`} label={durationText} /> : durationText}
          </span>
          {badge && (
            <span aria-hidden="true" className="sj-departure-card__badge sj-departure-card__dim" data-color={badge.color ?? "green"}>
              <span className="sj-departure-card__badge-dot" />
              <span className="sj-departure-card__badge-label">{badge.label}</span>
            </span>
          )}
          {details("large")}
        </span>
        {details("small")}
        <span aria-hidden="true" className="sj-departure-card__divider" />
        <span aria-hidden="true" className="sj-departure-card__side">
          <span className="sj-departure-card__prices">
            {priceLoading ? (
              <span className="sj-departure-card__price-loading">
                <span className="sj-skeleton" style={{ width: "5.9375rem" }} />
              </span>
            ) : (
              showPriceObject && (
                <span className="sj-departure-card__price sj-departure-card__dim" data-type={priceType} data-disabled={(!disabled && priceDisabled) || undefined}>
                  {hasPoints && (
                    <span>
                      {prefixText && <span className="sj-departure-card__price-prefix">{`${prefixText} `}</span>}
                      <span className="sj-departure-card__price-value">{pointsText}</span>
                    </span>
                  )}
                  {hasPrice && (
                    <span data-secondary={hasPoints || undefined}>
                      {prefixText && !hasPoints && <span className="sj-departure-card__price-prefix">{`${prefixText} `}</span>}
                      {hasPoints && <span>+ </span>}
                      <span className="sj-departure-card__price-value">{priceText}</span>
                    </span>
                  )}
                </span>
              )
            )}
            {!priceLoading &&
              showPriceObject &&
              priceTexts.slice(0, 2).map((p) => (
                <span key={p.text} className="sj-departure-card__price-text" data-type={p.type ?? "secondary"} data-disabled={unavailable || undefined}>
                  {p.text}
                </span>
              ))}
            {statusText && <span className="sj-departure-card__status">{statusText}</span>}
          </span>
          <ChevronRight className="sj-departure-card__chevron sj-departure-card__dim" />
          {comfortLine("large")}
        </span>
      </span>
      {details("medium")}
      {comfortLine("compact")}
    </span>
  );
  // Inside the click area and read out after the card, like KB's children.
  const footerEl = footer && (
    <span className="sj-departure-card__footer sj-departure-card__dim">
      <span className="sj-visually-hidden">. </span>
      {footer}
    </span>
  );

  return (
    <div
      {...rest}
      className={cx("sj-departure-card", className)}
      data-selected={selected || undefined}
      data-unavailable={unavailable || undefined}
      data-size={size}
      data-radius={radius}
      data-duration-link={durationLink ? "" : undefined}
    >
      <UiButton
        {...buttonProps}
        className="sj-departure-card__button"
        aria-pressed={selected ?? false}
        disabled={blocked}
        focusableWhenDisabled
        // Safari skips buttons on Tab unless they have a tabindex. KB's buttons have one too.
        tabIndex={0}
        onClick={blocked ? undefined : onClick}
      >
        <span className="sj-visually-hidden">{spoken}</span>
        {!durationLink && visual}
        {!durationLink && footerEl}
      </UiButton>
      {durationLink && visual}
      {durationLink && footerEl}
      {durationLink && (
        <span id={`${uid}-desc`} className="sj-visually-hidden">{`${spoken}, ${copy.travelDetails}`}</span>
      )}
      {children}
    </div>
  );
}

/** "SJ Snabbtåg", "SJ Snabbtåg, tåg 421", or the legs joined with " + ", like KB's TransportDetails. */
function transportLabel(legs: Transportation[]) {
  const name = (tr: Transportation) => [tr.producer, tr.productName].filter(Boolean).join(" ");
  if (legs.length > 2) return legs.map(name).join(" + ");
  if (legs.length === 2) return legs.map((tr) => [name(tr), tr.serviceBrandName].filter(Boolean).join(", ")).join(" + ");
  const [tr] = legs;
  if (!tr) return "";
  return [name(tr), tr.serviceBrandName, tr.transportMethodDescription ? `${tr.transportMethodDescription.toLowerCase()} ${tr.id}` : null].filter(Boolean).join(", ");
}

function DurationLink({
  describedBy,
  label,
  onClick,
  href,
  ...rest
}: AnchorHTMLAttributes<HTMLAnchorElement> & { onClick?: () => void; describedBy: string; label: string }) {
  // The description repeats the card, so the link is told apart when several cards are listed.
  if (href) {
    return (
      <a {...rest} href={href} onClick={onClick} className="sj-departure-card__link" aria-describedby={describedBy}>
        {label}
      </a>
    );
  }
  return (
    <button type="button" tabIndex={0} onClick={onClick} className="sj-departure-card__link" aria-describedby={describedBy}>
      {label}
    </button>
  );
}
