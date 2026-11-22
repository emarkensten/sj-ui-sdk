/*
 * Legacy FlowButton: KB's props on top of the new Button (sj-button contract).
 * Drop-in for `@sj-ab/component-library.ui.flow-button`.
 */
import type { ComponentType, CSSProperties, MouseEventHandler, ReactNode, Ref } from "react";
import { forwardRef } from "react";
import { Button, type ButtonColor, type ButtonSize, type ButtonType } from "../components/button/button";
import { cx } from "../lib/cx";
import { warnUnsupported } from "../lib/warn";
import { customAttr, legacyMarker, useLegacySx, type CustomAttribute, type LegacySx } from "./shared";

export interface FlowButtonProps {
  color?: "green" | "blue" | "orange" | "black" | "white" | "critical" | "grey" | "frosted";
  colorVariant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg" | "xl";
  symbol?: ReactNode;
  symbolPosition?: "left" | "right" | "top";
  shouldShowSpinner?: boolean;
  isLoading?: boolean;
  fullWidth?: boolean;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  href?: string;
  LinkComponent?: ComponentType<{ href?: string; to?: string; className?: string; children?: ReactNode }>;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  customAttribute?: CustomAttribute;
  sx?: LegacySx;
  className?: string;
  style?: CSSProperties;
  id?: string;
  children?: ReactNode;
  "aria-label"?: string;
  "aria-describedby"?: string;
  /** Not supported: MUI elevation and ripple. */
  elevated?: boolean;
  disableRipple?: boolean;
  disableElevation?: boolean;
  [dataAttr: `data-${string}`]: string | undefined;
}

const sizes: Record<NonNullable<FlowButtonProps["size"]>, ButtonSize> = { sm: "small", md: "medium", lg: "large", xl: "extraLarge" };

/** KB color + colorVariant → sj-button type + color. Colors sj-button lacks get a legacy color class. */
function mapColor(color: FlowButtonProps["color"] = "green", variant: FlowButtonProps["colorVariant"] = "primary"): { type: ButtonType; color: ButtonColor; legacy?: string } {
  const tinted = variant === "secondary";
  switch (color) {
    case "blue":
      return { type: tinted ? "tinted" : "filled", color: "himmel2" };
    case "critical":
      return { type: tinted ? "tinted" : "filled", color: "varning" };
    case "grey":
      return { type: "gray", color: "lov" };
    case "orange":
    case "black":
    case "white":
    case "frosted":
      return { type: tinted ? "tinted" : "filled", color: "lov", legacy: `${color}-${variant}` };
    default:
      return { type: tinted ? "tinted" : "filled", color: "lov" };
  }
}

export const FlowButton = forwardRef(function FlowButton(props: FlowButtonProps, ref: Ref<HTMLButtonElement>) {
  const {
    color,
    colorVariant,
    size = "xl",
    symbol,
    symbolPosition = "left",
    shouldShowSpinner,
    isLoading,
    fullWidth,
    disabled,
    type = "button",
    href,
    LinkComponent,
    onClick,
    customAttribute,
    sx,
    className,
    style,
    children,
    elevated: _elevated,
    disableRipple: _disableRipple,
    disableElevation: _disableElevation,
    ...rest
  } = props;
  warnUnsupported("FlowButton", props as Record<string, unknown>, ["elevated"]);
  const resolved = useLegacySx(sx);
  const mapped = mapColor(color, colorVariant);

  if (isLoading) {
    return <span className="sj-legacy-skeleton" data-size={sizes[size]} data-full-width={fullWidth || undefined} aria-hidden="true" {...customAttr(customAttribute, "Skeleton")} />;
  }

  // KB renders a link when href is set. ui-sdk's Button renders the link itself through `render`,
  // so there is one focusable element with link semantics, not a button nested in an anchor.
  const Link = LinkComponent ?? "a";
  return (
    <Button
      {...rest}
      {...legacyMarker}
      {...customAttr(customAttribute)}
      ref={ref}
      type={mapped.type}
      htmlType={type}
      color={mapped.color}
      size={sizes[size]}
      borderShape="capsule"
      icon={symbol}
      iconPosition={symbolPosition}
      showSpinner={shouldShowSpinner}
      fullWidth={fullWidth}
      disabled={disabled}
      onClick={onClick ? (event) => onClick(event as Parameters<MouseEventHandler<HTMLButtonElement>>[0]) : undefined}
      className={cx(resolved.className, className)}
      style={{ ...resolved.style, ...style }}
      data-legacy-color={mapped.legacy}
      data-legacy-flow=""
      render={href ? <Link href={href} /> : undefined}
    >
      {children}
    </Button>
  );
});

export default FlowButton;
