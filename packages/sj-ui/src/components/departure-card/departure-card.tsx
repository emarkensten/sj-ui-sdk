import type { ReactNode } from "react";
import { useId } from "react";
import { Button as UiButton } from "@ui-sdk/react/button";
import { Bistro, LongDistanceTrain, MoonSmall, Wheelchair, WiFi } from "../../icons";
import { cx } from "../../lib/cx";
import { durationBetween, formatDuration, formatPrice, formatTime, type Duration } from "../../lib/format";
import { joinList, resolveLang, t, type Lang } from "../../lib/i18n";

export type Amenity = "BISTRO" | "WIFI" | "WHEELCHAIR";

export interface Transportation {
  /** "SJ" */
  producer?: string;
  /** "Snabbtåg", not "SJ Snabbtåg": the producer is written before it. */
  productName: string;
  /** Stable key for the list. */
  id: string;
  /** Train number, like "421". Shown after the product name when given. */
  trainNumber?: string;
}

export type DepartureAvailability = "available" | "soldOut" | "unavailable" | "cancelled";

export interface DepartureCardProps {
  departureDate: Date | string;
  arrivalDate: Date | string;
  /** Computed from the dates when left out. */
  duration?: Duration;
  /** One per leg. Changes are the number of legs minus one. */
  transportations: Transportation[];
  amenities?: Amenity[];
  /** Price in whole kronor. Left out: no price is shown or read out. */
  price?: number;
  /** "Fr." before the price. Default true. */
  priceFrom?: boolean;
  availability?: DepartureAvailability;
  /** The departure the traveller has chosen. Sets `aria-pressed`. */
  selected?: boolean;
  /** Stops clicks too (unlike KB's DepartureCard, whose `disabled` let clicks through). */
  disabled?: boolean;
  onClick?: () => void;
  caption?: { text: string; icon?: "moon"; srText?: string };
  badge?: ReactNode;
  /** Heading level of the times. SJ lists use h2. */
  headingLevel?: 2 | 3 | 4;
  lang?: Lang;
  timeZone?: string;
  className?: string;
  /** Non-interactive content inside the click area, under the card's own content. */
  footer?: ReactNode;
  /** Rendered after the button, outside the click area, like an accordion with the stops. */
  children?: ReactNode;
  id?: string;
  /** Test ids and other data attributes land on the root. */
  [dataAttr: `data-${string}`]: string | undefined;
}

const amenityIcons: Record<Amenity, typeof Bistro> = { BISTRO: Bistro, WIFI: WiFi, WHEELCHAIR: Wheelchair };

const toDate = (d: Date | string) => (d instanceof Date ? d : new Date(d));

/**
 * One departure to choose in a list. The whole card is a button (ui-sdk Button, so agents see it),
 * with the times as its heading and everything else read out as a description.
 */
export function DepartureCard({
  departureDate,
  arrivalDate,
  duration,
  transportations,
  amenities = [],
  price,
  priceFrom = true,
  availability = "available",
  selected,
  disabled,
  onClick,
  caption,
  badge,
  headingLevel = 2,
  lang: langProp,
  timeZone = "Europe/Stockholm",
  className,
  footer,
  children,
  ...rest
}: DepartureCardProps) {
  const lang = resolveLang(langProp);
  const text = t(lang);
  const id = useId();
  const dep = toDate(departureDate);
  const arr = toDate(arrivalDate);
  const depTime = formatTime(dep, timeZone);
  const arrTime = formatTime(arr, timeZone);
  const durationText = formatDuration(duration ?? durationBetween(dep, arr), lang);
  const changes = Math.max(0, transportations.length - 1);
  const unavailable = availability !== "available";
  const blocked = disabled || unavailable;
  const H = `h${headingLevel}` as const;
  const statusText = availability === "soldOut" ? text.soldOut : availability === "cancelled" ? text.cancelled : availability === "unavailable" ? text.unavailable : null;
  const trains = transportations.map((tr) => `${[tr.producer, tr.productName].filter(Boolean).join(" ")}${tr.trainNumber ? `, ${text.train} ${tr.trainNumber}` : ""}`);
  const amenityText = amenities.length ? `${text.amenities}: ${joinList(amenities.map((a) => text.amenity[a] ?? a.toLowerCase()), lang)}` : null;

  return (
    <div {...rest} className={cx("sj-departure-card", className)} data-selected={selected || undefined} data-availability={availability}>
      <UiButton
        className="sj-departure-card__button"
        aria-pressed={selected ?? false}
        aria-labelledby={`${id}-time`}
        aria-describedby={`${id}-desc`}
        disabled={blocked}
        focusableWhenDisabled
        onClick={blocked ? undefined : onClick}
      >
        <span className="sj-departure-card__top">
          <H id={`${id}-time`} className="sj-departure-card__time">
            <span aria-hidden="true">{`${depTime}–${arrTime}`}</span>
            <span className="sj-visually-hidden">{`${text.departs} ${depTime}, ${text.arrives} ${arrTime}`}</span>
          </H>
          {price !== undefined && !unavailable && (
            <span className="sj-departure-card__price">
              {priceFrom && <span className="sj-departure-card__price-prefix">{text.from} </span>}
              <span className="sj-departure-card__price-value">{formatPrice(price, lang)}</span>
            </span>
          )}
          {statusText && <span className="sj-departure-card__status">{statusText}</span>}
        </span>
        <span id={`${id}-desc`} className="sj-departure-card__desc">
          <span className="sj-departure-card__duration">
            {`${text.travelTime} ${durationText}, ${text.changes(changes)}`}
          </span>
          <span className="sj-departure-card__meta">
            <LongDistanceTrain className="sj-departure-card__train" />
            {amenities.map((a) => {
              const Icon = amenityIcons[a];
              return Icon ? <Icon key={a} className="sj-departure-card__amenity" /> : null;
            })}
            {amenityText && <span className="sj-visually-hidden">{amenityText}.</span>}
          </span>
          <span className="sj-departure-card__trains">{trains.join(" · ")}</span>
          {caption && (
            <span className="sj-departure-card__caption">
              {caption.icon === "moon" && <MoonSmall size="1.25rem" />}
              <span aria-hidden={caption.srText ? true : undefined}>{caption.text}</span>
              {caption.srText && <span className="sj-visually-hidden">{caption.srText}</span>}
            </span>
          )}
          {badge && <span className="sj-departure-card__badge">{badge}</span>}
          {footer}
        </span>
      </UiButton>
      {children}
    </div>
  );
}
