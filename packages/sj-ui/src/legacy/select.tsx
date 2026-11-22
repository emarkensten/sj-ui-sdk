/*
 * Legacy Select: KB's MUI-style API (MenuItem children, onChange with event.target.value)
 * on the new Select. Drop-in for `@sj-ab/component-library.ui.select`.
 */
import type { ChangeEvent, CSSProperties, ReactElement, ReactNode } from "react";
import { Children, forwardRef, isValidElement, type Ref } from "react";
import { Select as NewSelect, type SelectOption } from "../components/select/select";
import { cx } from "../lib/cx";
import { warnOnce, warnUnsupported } from "../lib/warn";
import { syntheticChange } from "./events";
import { MenuItem, type MenuItemProps } from "./menu-item";
import { customAttr, legacyMarker, useLegacySx, type CustomAttribute, type LegacySx } from "./shared";

export interface SelectProps {
  labelId: string;
  labelText: string;
  value?: string | number | null;
  defaultValue?: string | number;
  onChange?: (event: ChangeEvent<HTMLInputElement>, child?: ReactNode) => void;
  children?: ReactNode;
  name?: string;
  id?: string;
  hasExternalLabel?: boolean;
  helperText?: string;
  error?: boolean;
  required?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  startIcon?: ReactElement;
  isOpen?: boolean;
  open?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  isLoading?: boolean;
  lang?: "sv" | "en";
  displayEmpty?: boolean;
  /** Accepted. The new field has one density and one shape, matching KB's defaults. */
  density?: string;
  menuDensity?: string;
  rounded?: boolean;
  borderRadius?: unknown;
  className?: string;
  style?: CSSProperties;
  sx?: LegacySx;
  customAttribute?: CustomAttribute;
  /** Not supported in the pilot. */
  multiple?: boolean;
  renderValue?: (value: unknown) => ReactNode;
  MenuProps?: unknown;
}

function textOf(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) return textOf(node.props.children);
  return "";
}

export const Select = forwardRef(function Select(props: SelectProps, _ref: Ref<HTMLDivElement>) {
  const {
    labelId,
    labelText,
    value,
    defaultValue,
    onChange,
    children,
    name,
    hasExternalLabel,
    helperText,
    error,
    required,
    disabled,
    fullWidth = true,
    startIcon,
    isOpen,
    open,
    onOpen,
    onClose,
    isLoading,
    className,
    style,
    sx,
    customAttribute,
  } = props;
  warnUnsupported("Select", props as unknown as Record<string, unknown>, ["multiple", "renderValue", "MenuProps"]);
  const resolved = useLegacySx(sx);

  let placeholder: string | undefined;
  const options: SelectOption[] = [];
  const childByValue = new Map<string, ReactNode>();
  Children.forEach(children, (child) => {
    if (!isValidElement<MenuItemProps>(child)) return;
    if (child.type !== MenuItem) warnOnce("Select", "Only MenuItem children become options.");
    const v = child.props.value == null ? "" : String(child.props.value);
    const label = textOf(child.props.children) || v;
    if (v === "") {
      placeholder = label;
      return;
    }
    options.push({ value: v, label, disabled: child.props.disabled });
    childByValue.set(v, child);
  });

  if (isLoading) {
    return <span className="sj-legacy-skeleton" data-full-width={fullWidth || undefined} style={{ borderRadius: "var(--sjse-border-radius-lg)" }} aria-hidden="true" {...customAttr(customAttribute, "Skeleton")} />;
  }

  const controlled = value !== undefined;
  return (
    <div {...legacyMarker} {...customAttr(customAttribute)} id={labelId ? `${labelId}-root` : undefined} className={cx(resolved.className, className)} style={{ ...resolved.style, ...style }}>
      <NewSelect
        label={labelText}
        externalLabel={hasExternalLabel}
        options={options}
        value={controlled ? (value === "" || value == null ? null : String(value)) : undefined}
        defaultValue={defaultValue == null ? null : String(defaultValue)}
        onValueChange={(next) => onChange?.(syntheticChange({ value: next ?? "", name }), next ? childByValue.get(next) : undefined)}
        placeholder={placeholder}
        helperText={helperText}
        error={error}
        required={required}
        disabled={disabled}
        name={name}
        fullWidth={fullWidth}
        startIcon={startIcon}
        open={isOpen ?? open}
        onOpenChange={onOpen || onClose ? (o) => (o ? onOpen?.() : onClose?.()) : undefined}
      />
    </div>
  );
});

export default Select;
