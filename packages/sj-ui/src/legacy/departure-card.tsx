/*
 * Legacy DepartureCard: KB's props on the new DepartureCard.
 * Drop-in for `@sj-ab/component-library.ui.departure-card`.
 *
 * Behaviour change on purpose: `disabled` (and an unavailable departure) now stops clicks.
 * In KB, disabled never reached the CardActionArea, so sold-out departures could be chosen.
 */
import type { ReactNode } from "react";
import { DepartureCard as NewDepartureCard, type Amenity, type DepartureAvailability } from "../components/departure-card/departure-card";
import { cx } from "../lib/cx";
import { resolveLang } from "../lib/i18n";
import { warnOnce, warnUnsupported } from "../lib/warn";
import { customAttr, legacyMarker, type CustomAttribute } from "./shared";

type TransportationType = { concept?: string; id: string; producer?: string; productName: string; serviceBrandName?: string; transportMethod?: string; transportMethodDescription?: string };
type TransportInformationType = { code: string; id?: string };

export interface DepartureCardProps {
  departureDate: Date;
  arrivalDate: Date;
  duration?: { days: string; hours: string; minutes: string };
  transportations: TransportationType[];
  transportInformations?: TransportInformationType[];
  availability?: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  showPrice: boolean;
  showPoints: boolean;
  price?: number;
  points?: number;
  pricePrefix?: "from" | "addFrom" | "add";
  hidePricePrefix?: boolean;
  captionText?: string;
  captionIcon?: "moon";
  captionSrText?: string;
  badgeLabel?: string;
  badgeColor?: string;
  timeLabelTypographyElement?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | string;
  timeZone?: string;
  lang?: string;
  className?: string;
  id?: string;
  customAttribute?: CustomAttribute;
  limitClickArea?: boolean;
  limitedClickAreaSlot?: ReactNode;
  children?: ReactNode;
  /** Accepted, no visual effect in the pilot. */
  size?: "small" | "medium" | "large";
  elevation?: number;
  CardActionAreaProps?: Record<string, unknown>;
  ClickableCardProps?: Record<string, unknown>;
  /** Not supported in the pilot. */
  durationLink?: unknown;
  translation?: unknown;
  isLoadingPrice?: boolean;
  priceText?: string;
  secondaryPriceText?: string;
  hasComfortAvailabilities?: boolean;
  comfortAvailabilities?: unknown[];
  disabledPrice?: boolean;
  captionColor?: string;
  [key: string]: unknown;
}

const supportedAmenities = new Set<Amenity>(["BISTRO", "WIFI", "WHEELCHAIR"]);

function mapAvailability(a?: string): DepartureAvailability {
  if (!a || a === "available" || a === "AVAILABLE") return "available";
  if (a === "soldOut" || a === "SOLD_OUT") return "soldOut";
  if (a === "CANCELLED" || a === "POTENTIAL_CANCEL") return "cancelled";
  return "unavailable";
}

function headingLevel(el?: string): 2 | 3 | 4 {
  const n = Number(el?.replace(/^h/, ""));
  return n === 3 || n === 4 ? n : 2;
}

export function DepartureCard(props: DepartureCardProps) {
  const {
    departureDate,
    arrivalDate,
    duration,
    transportations,
    transportInformations = [],
    availability,
    active,
    disabled,
    onClick,
    showPrice,
    price,
    hidePricePrefix,
    pricePrefix,
    captionText,
    captionIcon,
    captionSrText,
    badgeLabel,
    timeLabelTypographyElement,
    timeZone,
    lang,
    className,
    id,
    customAttribute,
    limitedClickAreaSlot,
    children,
  } = props;
  warnUnsupported("DepartureCard", props, ["durationLink", "translation", "isLoadingPrice", "priceText", "secondaryPriceText", "comfortAvailabilities"]);
  if (props.showPoints) warnOnce("DepartureCard", "showPoints is not supported in the pilot.");

  const amenities = transportInformations
    .map((t) => t.code as Amenity)
    .filter((code) => {
      if (supportedAmenities.has(code)) return true;
      warnOnce("DepartureCard", `amenity ${code} has no icon in the pilot and is left out.`);
      return false;
    });

  return (
    <NewDepartureCard
      {...legacyMarker}
      {...customAttr(customAttribute)}
      id={id}
      className={cx(className)}
      departureDate={departureDate}
      arrivalDate={arrivalDate}
      duration={duration}
      transportations={transportations.map((t) => ({ producer: t.producer, productName: t.productName, id: t.id }))}
      amenities={amenities}
      price={showPrice ? price : undefined}
      priceFrom={!hidePricePrefix && (pricePrefix ?? "from") === "from"}
      availability={mapAvailability(availability)}
      selected={active}
      disabled={disabled}
      onClick={onClick}
      caption={captionText ? { text: captionText, icon: captionIcon, srText: captionSrText } : undefined}
      badge={badgeLabel ? <span className="sj-legacy-badge">{badgeLabel}</span> : undefined}
      headingLevel={headingLevel(timeLabelTypographyElement)}
      lang={resolveLang(lang)}
      timeZone={timeZone}
      footer={limitedClickAreaSlot}
    >
      {children}
    </NewDepartureCard>
  );
}

export default DepartureCard;
