/*
 * Legacy DepartureCard: KB's props on the new DepartureCard, one to one.
 * Drop-in for `@sj-ab/component-library.ui.departure-card`.
 *
 * Deliberate difference: `disabled` stops clicks. In KB it never reached the CardActionArea,
 * so a disabled card could still be chosen. Unavailable departures stay clickable, as in KB.
 */
import type { ReactNode } from "react";
import {
  DepartureCard as NewDepartureCard,
  type Amenity,
  type BadgeColor,
  type ComfortCategory,
  type DepartureAvailability,
  type DepartureCardText,
  type PriceTextType,
} from "../components/departure-card/departure-card";
import { comfortCategories, unavailableReasons } from "../components/departure-card/text";
import { resolveLang } from "../lib/i18n";
import { customAttr, legacyMarker, type CustomAttribute } from "./shared";

type TransportationType = {
  concept?: string;
  id: string;
  producer?: string;
  productName?: string;
  serviceBrandName?: string;
  transportMethod?: string;
  transportMethodDescription?: string;
};
type ComfortAvailability = { category: ComfortCategory; isAvailable: boolean; soldOut: boolean };
type LinkProps = { href?: string; onClick?: () => void; component?: unknown; [key: string]: unknown };

export interface DepartureCardProps {
  departureDate: Date;
  arrivalDate: Date;
  duration?: { days?: string | number; hours?: string | number; minutes?: string | number };
  transportations: TransportationType[];
  transportInformations?: { code: string; id?: string }[];
  availability?: DepartureAvailability;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  showPrice: boolean;
  showPoints: boolean;
  price?: number;
  points?: number;
  pricePrefix?: "from" | "addFrom" | "add";
  hidePricePrefix?: boolean;
  priceType?: "standard" | "lowPrice";
  currency?: "SEK" | "EUR";
  disabledPrice?: boolean;
  isLoadingPrice?: boolean;
  priceText?: string;
  priceTextType?: PriceTextType;
  secondaryPriceText?: string;
  secondaryPriceTextType?: PriceTextType;
  hasComfortAvailabilities?: boolean;
  comfortAvailabilities?: ComfortAvailability[];
  captionText?: string;
  captionIcon?: "moon";
  captionSrText?: string;
  captionColor?: "textPrimary" | "highlighted";
  badgeLabel?: string;
  badgeColor?: BadgeColor;
  durationLink?: LinkProps;
  size?: "small" | "medium" | "large";
  borderRadiusOverride?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "default";
  adjustLeft?: boolean;
  translation?: Record<string, string>;
  timeZone?: string;
  lang?: string;
  className?: string;
  id?: string;
  customAttribute?: CustomAttribute;
  limitClickArea?: boolean;
  limitedClickAreaSlot?: ReactNode;
  children?: ReactNode;
  CardActionAreaProps?: Record<string, unknown>;
  ClickableCardProps?: Record<string, unknown>;
  /** Renders the time in this element. KB hides it from screen readers, so it only changes the tag. */
  timeLabelTypographyElement?: string;
  /** KB's card has no shadow at any elevation, so this has no visible effect there either. */
  elevation?: number;
  [key: string]: unknown;
}

/** KB's flat translation object, mapped onto the new component's texts. */
function toText(tr: Record<string, string> | undefined): Partial<DepartureCardText> | undefined {
  if (!tr) return undefined;
  const pick = <K extends string>(keys: readonly K[]) =>
    Object.fromEntries(keys.filter((k) => tr[k] !== undefined).map((k) => [k, tr[k]])) as Record<K, string>;
  const out: Partial<DepartureCardText> = {};
  const status = pick(unavailableReasons);
  const comfort = pick(comfortCategories);
  if (Object.keys(status).length) out.status = status;
  if (Object.keys(comfort).length) out.comfort = comfort;
  for (const [from, to] of [
    ["travelTime", "travelTime"],
    ["hours", "hours"],
    ["minutes", "minutes"],
    ["separator", "separator"],
    ["classAvailable", "classAvailable"],
    ["srLoadingPrice", "loadingPrice"],
    ["srLoadingComfortAvailability", "loadingComfort"],
    ["srTravelDetails", "travelDetails"],
  ] as const) {
    if (tr[from] !== undefined) out[to] = tr[from];
  }
  return out;
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
    showPoints,
    price,
    points,
    pricePrefix,
    hidePricePrefix,
    priceType,
    currency,
    disabledPrice,
    isLoadingPrice,
    priceText,
    priceTextType = "secondary",
    secondaryPriceText,
    secondaryPriceTextType,
    hasComfortAvailabilities,
    comfortAvailabilities,
    captionText,
    captionIcon,
    captionSrText,
    captionColor,
    badgeLabel,
    badgeColor,
    durationLink,
    size,
    borderRadiusOverride,
    adjustLeft,
    translation,
    timeZone,
    lang,
    className,
    id,
    customAttribute,
    limitClickArea,
    limitedClickAreaSlot,
    children,
    CardActionAreaProps,
    ClickableCardProps,
  } = props;

  const { component: _component, ...link } = durationLink ?? {};
  return (
    <NewDepartureCard
      {...(ClickableCardProps as Record<`data-${string}`, string>)}
      {...legacyMarker}
      {...customAttr(customAttribute)}
      id={id}
      className={className}
      departureDate={departureDate}
      arrivalDate={arrivalDate}
      duration={duration}
      transportations={transportations}
      amenities={transportInformations.map((t) => t.code as Amenity)}
      price={showPrice ? price : undefined}
      points={showPoints ? points : undefined}
      pricePrefix={hidePricePrefix ? false : (pricePrefix ?? "from")}
      priceType={priceType}
      currency={currency}
      priceDisabled={disabledPrice}
      priceLoading={isLoadingPrice}
      priceTexts={[
        ...(priceText ? [{ text: priceText, type: priceTextType }] : []),
        ...(secondaryPriceText ? [{ text: secondaryPriceText, type: secondaryPriceTextType }] : []),
      ]}
      comfort={hasComfortAvailabilities ? comfortAvailabilities : undefined}
      availability={availability}
      selected={active}
      disabled={disabled}
      onClick={onClick}
      caption={captionText ? { text: captionText, icon: captionIcon, srText: captionSrText, highlighted: captionColor === "highlighted" } : undefined}
      badge={badgeLabel && badgeColor ? { label: badgeLabel, color: badgeColor } : undefined}
      durationLink={durationLink ? (link as NonNullable<Parameters<typeof NewDepartureCard>[0]["durationLink"]>) : undefined}
      size={size}
      radius={borderRadiusOverride}
      alignVehiclesWithText={adjustLeft}
      lang={resolveLang(lang)}
      text={toText(translation)}
      timeZone={timeZone}
      buttonProps={CardActionAreaProps}
      footer={limitClickArea ? limitedClickAreaSlot : children}
    >
      {limitClickArea ? children : null}
    </NewDepartureCard>
  );
}

export default DepartureCard;
