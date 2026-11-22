import type { ComponentProps, ReactNode } from "react";
import { Button as UiButton } from "@ui-sdk/react/button";
import { cx } from "../../lib/cx";
import { Spinner } from "../spinner/spinner";

export type ButtonType = "filled" | "outlined" | "tinted" | "gray" | "plain";
export type ButtonColor = "lov" | "himmel2" | "himmel" | "gras" | "varning" | "raps";
export type ButtonSize = "small" | "medium" | "large" | "extraLarge";
type HtmlButtonType = "button" | "submit" | "reset";

export interface ButtonProps extends Omit<ComponentProps<typeof UiButton>, "type" | "color" | "className" | "children"> {
  className?: string;
  children?: ReactNode;
  /**
   * Visual style, the same values as SJ's `sj-button`. HTML types (`"submit"`, `"reset"`,
   * `"button"`) are accepted too, since the sets don't overlap, and give a filled button.
   */
  type?: ButtonType | HtmlButtonType;
  /** Explicit HTML type, for a submit button that isn't filled. */
  htmlType?: HtmlButtonType;
  color?: ButtonColor;
  size?: ButtonSize;
  iconPosition?: "left" | "right" | "top";
  borderShape?: "roundedSmall" | "roundedLarge" | "capsule";
  /** An icon element, like `<Bistro />` from `@sj-ui-sdk/sj-ui/icons`. */
  icon?: ReactNode;
  showSpinner?: boolean;
  /** Icon-only button. The children become the accessible name. */
  isSymbolButton?: boolean;
  fullWidth?: boolean;
  /** Selected state for outlined buttons. */
  selected?: boolean;
}

const htmlTypes = new Set<string>(["button", "submit", "reset"]);

export function Button({
  type = "filled",
  htmlType,
  color = "lov",
  size = "extraLarge",
  iconPosition = "left",
  borderShape,
  icon,
  showSpinner = false,
  isSymbolButton = false,
  fullWidth = false,
  selected,
  className,
  children,
  ...rest
}: ButtonProps) {
  const visual = htmlTypes.has(type) ? "filled" : type;
  const nativeType = htmlType ?? (htmlTypes.has(type) ? (type as HtmlButtonType) : "button");
  const hasSymbol = Boolean(icon) || showSpinner;

  return (
    <UiButton
      {...rest}
      type={nativeType}
      className={cx("sj-button", className)}
      data-type={visual}
      data-color={color}
      data-size={size}
      data-icon-position={iconPosition}
      data-border-shape={borderShape}
      data-symbol-button={isSymbolButton || undefined}
      data-full-width={fullWidth || undefined}
      data-spinner={showSpinner || undefined}
      data-selected={selected || undefined}
      aria-busy={"aria-busy" in rest ? rest["aria-busy"] : showSpinner || undefined}
    >
      <span className="sj-button__label" data-has-symbol={hasSymbol || undefined}>
        {hasSymbol && (
          <span className="sj-button__symbol">
            {showSpinner ? <Spinner size={size === "small" ? "small" : "medium"} /> : icon}
          </span>
        )}
        <span className={cx("sj-button__text", isSymbolButton && "sj-visually-hidden")}>{children}</span>
      </span>
    </UiButton>
  );
}
