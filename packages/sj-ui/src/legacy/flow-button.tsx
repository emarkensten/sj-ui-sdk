/*
 * Legacy FlowButton: KB's props on top of the new Button (sj-button contract).
 * Drop-in for `@sj-ab/component-library.ui.flow-button`.
 */
import type { ButtonHTMLAttributes, ElementType, MouseEventHandler, ReactNode, Ref } from "react";
import { forwardRef } from "react";
import { Button, type ButtonColor, type ButtonSize, type ButtonType } from "../components/button/button";
import { cx } from "../lib/cx";
import { customAttr, legacyMarker, useLegacySx, type CustomAttribute, type LegacySx, type MuiButtonBaseCompat } from "./shared";

export interface FlowButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "color">, MuiButtonBaseCompat {
  color?: "green" | "blue" | "orange" | "black" | "white" | "critical" | "grey" | "frosted";
  colorVariant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg" | "xl";
  symbol?: ReactNode;
  symbolPosition?: "left" | "right" | "top";
  /** Shows a spinner in the symbol's place. As in KB, `onClick` is not called meanwhile. */
  shouldShowSpinner?: boolean;
  isLoading?: boolean;
  fullWidth?: boolean;
  href?: string;
  /** Routing link, rendered with `LinkComponent` like in KB. */
  to?: unknown;
  target?: string;
  rel?: string;
  reloadDocument?: boolean;
  LinkComponent?: ElementType;
  /** Root element, as MUI's `component`. */
  component?: ElementType;
  customAttribute?: CustomAttribute;
  sx?: LegacySx;
  /** KB passes it on to the DOM without using it, so it has no effect there either. */
  borderRadiusOverride?: string;
  /** Deprecated in KB and not applied there. */
  elevated?: boolean;
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
    to,
    target,
    rel,
    reloadDocument,
    LinkComponent,
    component,
    onClick,
    customAttribute,
    sx,
    className,
    style,
    children,
    borderRadiusOverride: _radius,
    elevated: _elevated,
    disableElevation: _disableElevation,
    action: _action,
    centerRipple: _centerRipple,
    classes: _classes,
    disableRipple: _disableRipple,
    disableTouchRipple: _disableTouchRipple,
    focusRipple: _focusRipple,
    focusVisibleClassName: _focusVisibleClassName,
    onFocusVisible: _onFocusVisible,
    TouchRippleProps: _touchRippleProps,
    touchRippleRef: _touchRippleRef,
    ...rest
  } = props;
  const resolved = useLegacySx(sx);
  const mapped = mapColor(color, colorVariant);

  if (isLoading) {
    return <span className="sj-legacy-skeleton" data-size={sizes[size]} data-full-width={fullWidth || undefined} aria-hidden="true" {...customAttr(customAttribute, "Skeleton")} />;
  }

  // KB renders LinkComponent (default <a>) when href or to is set. ui-sdk's Button renders the link
  // itself through `render`, so there is one focusable element with link semantics.
  const isLink = Boolean(href || to);
  const Link = LinkComponent ?? "a";
  const link = Link === "a" ? <a href={href} target={target} rel={rel} /> : <Link href={href} to={to} target={target} rel={rel} reloadDocument={reloadDocument} />;
  const Root = component;
  return (
    <Button
      {...rest}
      {...legacyMarker}
      {...customAttr(customAttribute)}
      ref={ref}
      type={mapped.type}
      htmlType={isLink ? undefined : type}
      color={mapped.color}
      size={sizes[size]}
      borderShape="capsule"
      data-legacy-top={symbolPosition === "top" && symbol ? "" : undefined}
      icon={symbol}
      iconPosition={symbolPosition}
      showSpinner={shouldShowSpinner}
      // KB does not mark the spinning button busy; VoiceOver would add "upptagen".
      aria-busy={rest["aria-busy"]}
      fullWidth={fullWidth}
      disabled={disabled}
      // MUI's ButtonBase always sets tabindex, and Safari only tabs to buttons that have one.
      tabIndex={rest.tabIndex ?? (disabled ? -1 : 0)}
      onClick={onClick && !shouldShowSpinner ? (event) => onClick(event as Parameters<MouseEventHandler<HTMLButtonElement>>[0]) : undefined}
      className={cx(resolved.className, className)}
      style={{ ...resolved.style, ...style }}
      data-legacy-color={mapped.legacy}
      data-legacy-flow=""
      render={isLink ? link : Root ? <Root /> : undefined}
    >
      {children}
    </Button>
  );
});

export default FlowButton;
