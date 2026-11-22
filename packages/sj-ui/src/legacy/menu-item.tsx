/*
 * Legacy MenuItem. Drop-in for `@sj-ab/component-library.ui.menu-item`.
 * Inside the legacy Select it describes one option: the Select reads its props and renders the
 * option itself. Anywhere else it renders KB's menu row: an `<li>` (or `component`, or a link with
 * `href`/`to`) with the text, the variant's icon and an inset divider after it.
 */
import type { ElementType, HTMLAttributes, Key, ReactNode, Ref } from "react";
import { CheckboxChecked, CheckboxUnchecked, Done, RadioButtonChecked, RadioButtonUnchecked } from "../icons";
import { cx } from "../lib/cx";
import { customAttr, legacyMarker, useLegacySx, type CustomAttribute, type LegacySx, type MuiButtonBaseCompat } from "./shared";

export type MenuItemVariant = "standard" | "checkbox" | "radio" | "switch" | "separator";

export interface MenuItemProps extends Omit<HTMLAttributes<HTMLElement>, "color">, MuiButtonBaseCompat {
  /** The option's value inside a Select. Any value: a number stays a number in onChange. */
  value?: unknown;
  disabled?: boolean;
  selected?: boolean;
  children?: ReactNode;
  variant?: MenuItemVariant;
  /** Renders the children as they are, without KB's text and icon layout. */
  customLayout?: boolean;
  /** Leaves out the divider after the row. The Select sets it on its last option. */
  isLastChild?: boolean;
  /** `false` leaves out the divider. */
  divider?: boolean;
  /** Root element, `li` by default. */
  component?: ElementType;
  href?: string;
  to?: unknown;
  target?: string;
  rel?: string;
  reloadDocument?: boolean;
  LinkComponent?: ElementType;
  autoFocus?: boolean;
  /** MUI's dense rows and gutters. KB sets its own padding per density, so they have no effect there. */
  dense?: boolean;
  disableGutters?: boolean;
  customAttribute?: CustomAttribute;
  sx?: LegacySx;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- MUI's type
  ref?: Ref<any>;
  key?: Key | null;
  /** HTML color attribute, as MUI's types allow. No effect. */
  color?: string;
}

export const menuItemRoles: Record<MenuItemVariant, string> = {
  standard: "menuitem",
  radio: "menuitemradio",
  checkbox: "menuitemcheckbox",
  switch: "menuitemcheckbox",
  separator: "separator",
};

/** KB's row layout for a variant: text, and the icon that shows the state. */
export function MenuItemLayout({ variant = "standard", selected, children, indicator }: { variant?: MenuItemVariant; selected?: boolean; children?: ReactNode; indicator?: ReactNode }) {
  const text = <span className="sj-legacy-menu-item__text">{children}</span>;
  switch (variant) {
    case "radio":
    case "checkbox": {
      const Icon = variant === "radio" ? (selected ? RadioButtonChecked : RadioButtonUnchecked) : selected ? CheckboxChecked : CheckboxUnchecked;
      return (
        <>
          <span className="sj-legacy-menu-item__state" data-selected={selected || undefined}>
            <Icon />
          </span>
          {text}
        </>
      );
    }
    case "switch":
      return (
        <>
          {text}
          <input type="checkbox" role="switch" className="sj-switch" data-sj-legacy="" data-in-menu="" checked={Boolean(selected)} readOnly inert tabIndex={-1} />
        </>
      );
    case "separator":
      return text;
    default:
      return (
        <>
          {text}
          {indicator ?? (selected && (
            <span className="sj-legacy-menu-item__check">
              <Done />
            </span>
          ))}
        </>
      );
  }
}

export function MenuItem(props: MenuItemProps) {
  const {
    value: _value, disabled, selected, children, variant = "standard", customLayout, isLastChild, divider, component = "li", href, to, target, rel,
    reloadDocument, LinkComponent, autoFocus, color: _color, dense: _dense, disableGutters: _disableGutters, customAttribute, sx, className, style,
    action: _action, centerRipple: _centerRipple, classes: _classes, disableRipple: _disableRipple, disableTouchRipple: _disableTouchRipple,
    focusRipple: _focusRipple, focusVisibleClassName: _focusVisibleClassName, onFocusVisible: _onFocusVisible, TouchRippleProps: _touchRippleProps,
    touchRippleRef: _touchRippleRef, ...rest
  } = props;
  const resolved = useLegacySx(sx);
  const isLink = Boolean(href || to);
  const Root: ElementType = variant === "separator" ? "li" : isLink ? (LinkComponent ?? "a") : component;
  const linkProps = isLink ? (Root === "a" ? { href, target, rel } : { href, to, target, rel, reloadDocument }) : {};
  return (
    <>
      <Root
        {...rest}
        {...linkProps}
        {...legacyMarker}
        {...customAttr(customAttribute)}
        role={isLink ? undefined : menuItemRoles[variant]}
        aria-checked={variant !== "standard" && variant !== "separator" ? Boolean(selected) : undefined}
        aria-disabled={disabled || undefined}
        tabIndex={variant === "separator" ? undefined : (rest.tabIndex ?? (disabled ? undefined : -1))}
        autoFocus={autoFocus}
        className={cx("sj-legacy-menu-item", resolved.className, className)}
        style={{ ...resolved.style, ...style }}
        data-variant={variant}
        data-selected={selected || undefined}
        data-disabled={disabled || undefined}
      >
        {customLayout ? children : <MenuItemLayout variant={variant} selected={selected}>{children}</MenuItemLayout>}
      </Root>
      {divider !== false && !isLastChild && variant !== "separator" && <li role="presentation" className="sj-legacy-menu-divider" />}
    </>
  );
}
MenuItem.displayName = "MenuItem";

export default MenuItem;
