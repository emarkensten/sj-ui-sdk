/*
 * Legacy DepartureCard: KB's props on the new DepartureCard, one to one.
 * Drop-in for `@sj-ab/component-library.ui.departure-card`.
 *
 * Deliberate difference: `disabled` stops clicks. In KB it never reached the CardActionArea,
 * so a disabled card could still be chosen. Unavailable departures stay clickable, as in KB.
 */
import type { ElementType, ReactNode } from "react";
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
/** KB's LinkProps plus what MUI's Link takes; the duration link renders as `<a>` or `<button>`. */
type LinkProps = { href?: string; rel?: string; target?: string; reloadDocument?: boolean; to?: unknown; onClick?: (event: never) => void; component?: unknown; sx?: unknown; "aria-describedby"?: string };
type KbRadius = "capsule" | "circle" | "default" | "large" | "lg" | "md" | "medium" | "sm" | "small" | "xl";
const radii: Record<KbRadius, NonNullable<Parameters<typeof NewDepartureCard>[0]["radius"]>> = {
  capsule: "capsule", circle: "capsule", default: "default", large: "lg", lg: "lg", md: "md", medium: "md", sm: "sm", small: "sm", xl: "xl",
};

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
  borderRadiusOverride?: KbRadius;
  adjustLeft?: boolean;
  /** KB's DepartureCardTranslations: a flat object of texts. */
  translation?: object;
  timeZone?: string;
  lang?: string;
  className?: string;
  id?: string;
  customAttribute?: CustomAttribute;
  limitClickArea?: boolean;
  limitedClickAreaSlot?: ReactNode;
  children?: ReactNode;
  /** Props for the clickable area (the card's button). */
  CardActionAreaProps?: object;
  /** Props for the card's root. */
  ClickableCardProps?: object;
  /** Renders the time in this element. KB hides it from screen readers, so it only changes the tag. */
  timeLabelTypographyElement?: ElementType;
  /** KB's card has no shadow at any elevation, so this has no visible effect there either. */
  elevation?: number;
  /*
   * KB's types inherit these from TransportDetails and Card, but DepartureCard never reads them,
   * so they have no effect in KB either.
   */
  sx?: unknown;
  isLoading?: boolean;
  placements?: unknown;
  showTransportImage?: boolean;
  dynamicTrainSize?: boolean;
  applyGradient?: boolean;
  hasMarginTop?: boolean;
  hasMarginBottom?: boolean;
  transportStatus?: unknown;
}

/** KB's flat translation object, mapped onto the new component's texts. */
function toText(translation: object | undefined): Partial<DepartureCardText> | undefined {
  if (!translation) return undefined;
  const tr = translation as Record<string, string>;
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
    timeLabelTypographyElement,
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
      radius={borderRadiusOverride && radii[borderRadiusOverride]}
      alignVehiclesWithText={adjustLeft}
      lang={resolveLang(lang)}
      text={toText(translation)}
      timeZone={timeZone}
      buttonProps={CardActionAreaProps as Record<string, unknown>}
      footer={limitClickArea ? limitedClickAreaSlot : children}
      timeAs={timeLabelTypographyElement}
    >
      {limitClickArea ? children : null}
    </NewDepartureCard>
  );
}

export default DepartureCard;
