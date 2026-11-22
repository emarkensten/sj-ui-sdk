/*
 * Legacy Select: KB's Select (MUI Select with MenuItem children) on ui-sdk's Select parts.
 * Drop-in for `@sj-ab/component-library.ui.select`.
 *
 * As in KB: onChange gets `event.target.value` with the MenuItem's own value (a number stays a
 * number, `multiple` gives a list) and the chosen MenuItem as second argument. Below 600 px the
 * list opens as a bottom sheet with the label as title and a close button; above, as a menu under
 * the field. Arrow keys stop at the ends of the list. The label has no asterisk: KB marks
 * `required` (default true) only with aria-required.
 */
import type { ChangeEvent, CSSProperties, ElementType, FocusEvent, FormEvent, HTMLAttributes, KeyboardEvent, ReactElement, ReactNode, Ref, SyntheticEvent } from "react";
import { Children, forwardRef, isValidElement, useEffect, useRef, useState } from "react";
import { Select as UiSelect, SelectContent, SelectItem, SelectList, SelectSeparator, SelectTrigger } from "@ui-sdk/react/select";
import { OutlinedField } from "../components/field/field";
import { Cancel, ChevronDown } from "../icons";
import { cx } from "../lib/cx";
import { kbMobileQuery, useMedia } from "../lib/use-media";
import { MenuItem, MenuItemLayout, type MenuItemProps } from "./menu-item";
import { customAttr, kbRadii, legacyMarker, useLegacySx, type CustomAttribute, type KbRadius, type LegacySx, assignRef, hideOthers, type Density } from "./shared";

/** MUI's SelectChangeEvent: what onChange reads is `event.target.value` and `event.target.name`. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- MUI types the value as any
export type SelectChangeEvent<T = any> = Event & { target: { value: T; name: string } };

type InputEvents = "onFocus" | "onBlur" | "onInvalid" | "onKeyDown" | "onKeyUp";

export interface SelectProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue" | "color" | InputEvents> {
  labelId: string;
  labelText: string;
  value?: unknown;
  defaultValue?: unknown;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- MUI's signature
  onChange?: (event: SelectChangeEvent<any>, child: ReactNode) => void;
  children?: ReactNode;
  multiple?: boolean;
  renderValue?: (value: never) => ReactNode;
  /** Shows the display (renderValue or the empty option's text) also when the value is empty. */
  displayEmpty?: boolean;
  name?: string;
  hasExternalLabel?: boolean;
  helperText?: string;
  error?: boolean;
  /** Default true, as in KB: sets aria-required. */
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  fullWidth?: boolean;
  startIcon?: ReactElement;
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
  /** Replaces the chevron. Gets KB's chevron class and `data-open`. */
  IconComponent?: ElementType;
  isOpen?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpen?: (event: SyntheticEvent) => void;
  onClose?: (event: SyntheticEvent) => void;
  isLoading?: boolean;
  lang?: "sv" | "en";
  density?: Density;
  menuDensity?: Density;
  rounded?: boolean;
  borderRadiusOverride?: KbRadius;
  /** The menu takes the width of its options instead of the field's. */
  autoWidth?: boolean;
  /** A native `<select>` with the options as `<option>`. */
  native?: boolean;
  autoFocus?: boolean;
  /** Attributes for the hidden input that holds the value in a form. */
  inputProps?: object;
  /** MUI's handle: `{ node, value, focus() }`, where node is the hidden input. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- MUI's type
  inputRef?: Ref<any>;
  /** Attributes for the element that shows the value (the combobox). */
  SelectDisplayProps?: object;
  /** Menu options. `className`, `style`, `PaperProps` and `slotProps.paper` (className, style) reach the menu. */
  MenuProps?: object;
  /** MUI types these for an input; here they fire from the field (focus and keys bubble up from the combobox). */
  onFocus?: (event: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur?: (event: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onInvalid?: (event: FormEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onKeyUp?: (event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  sx?: LegacySx;
  customAttribute?: CustomAttribute;
  /*
   * MUI InputBase props that KB's types inherit. A select has no text input, so they have no
   * effect in KB's Select either, or they are MUI's styling hooks: accepted and ignored.
   */
  label?: ReactNode;
  input?: ReactElement;
  type?: string;
  color?: string;
  margin?: string;
  autoComplete?: string;
  classes?: unknown;
  components?: unknown;
  componentsProps?: unknown;
  slots?: unknown;
  slotProps?: unknown;
  disableInjectingGlobalStyles?: boolean;
  disableUnderline?: boolean;
  inputComponent?: ElementType;
  multiline?: boolean;
  rows?: number | string;
  minRows?: number | string;
  maxRows?: number | string;
  renderSuffix?: unknown;
}

const closeLabel = { sv: "Stäng", en: "Close" };

/** MUI's areEqualValues: objects by identity, everything else by its string. */
const equal = (a: unknown, b: unknown) => (b !== null && typeof b === "object" ? a === b : String(a) === String(b));
const filled = (v: unknown) => v != null && v !== "" && !(Array.isArray(v) && v.length === 0);

function textOf(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) return textOf(node.props.children);
  return "";
}

const synthetic = (native: Event | undefined, target: Element | null) =>
  ({ nativeEvent: native, type: native?.type ?? "change", target, currentTarget: target, preventDefault() {}, stopPropagation() {}, persist() {} }) as unknown as SyntheticEvent;

export const Select = forwardRef(function Select(props: SelectProps, ref: Ref<HTMLDivElement>) {
  const {
    labelId, labelText, value, defaultValue, onChange, children, multiple = false, renderValue, displayEmpty, name, hasExternalLabel = false,
    helperText, error, required = true, disabled, readOnly, fullWidth, startIcon, startAdornment, endAdornment, IconComponent, isOpen, open,
    defaultOpen, onOpen, onClose, isLoading = false, lang = "sv", density = "comfortable", menuDensity = density, rounded = false,
    borderRadiusOverride, autoWidth, native, autoFocus, inputProps, inputRef, SelectDisplayProps, MenuProps, sx, customAttribute, className,
    style, id, label: _label, input: _input, type: _type, color: _color, margin: _margin, autoComplete: _autoComplete, classes: _classes,
    components: _components, componentsProps: _componentsProps, slots: _slots, slotProps: _slotProps, disableInjectingGlobalStyles: _dig,
    disableUnderline: _du, inputComponent: _ic, multiline: _ml, rows: _rows, minRows: _minRows, maxRows: _maxRows, renderSuffix: _rs,
    "aria-describedby": describedBy, ...rest
  } = props;
  const resolved = useLegacySx(sx);
  const mobile = useMedia(kbMobileQuery);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [innerValue, setInnerValue] = useState<unknown>(defaultValue ?? (multiple ? [] : ""));
  const [innerOpen, setInnerOpen] = useState(Boolean(defaultOpen));
  const current = value !== undefined ? value : innerValue;
  const isOpenNow = Boolean(isOpen || (open ?? innerOpen));

  // MenuItem children become options; anything else is rendered as it is, in place.
  type Option = { key: string; element: ReactElement<MenuItemProps>; value: unknown; label: string };
  const options: Option[] = [];
  const nodes: ({ option: Option } | { other: ReactNode })[] = [];
  Children.toArray(children).forEach((child, i) => {
    if (isValidElement<MenuItemProps>(child) && (child.type === MenuItem || (child.type as { displayName?: string }).displayName === "MenuItem")) {
      const option = { key: `o${i}`, element: child, value: child.props.value, label: textOf(child.props.children) };
      options.push(option);
      nodes.push({ option });
    } else nodes.push({ other: child });
  });
  const keyOf = (v: unknown) => options.find((o) => o.value !== undefined && equal(o.value, v))?.key ?? null;
  const selectedKeys = multiple ? (Array.isArray(current) ? current.map(keyOf).filter((k): k is string => k != null) : []) : keyOf(current);
  const isSelected = (o: Option) => (multiple ? (selectedKeys as string[]).includes(o.key) : selectedKeys === o.key);

  // MUI's imperative handle on inputRef, and KB's test id and inputProps on the hidden input.
  useEffect(() => {
    const node = rootRef.current?.querySelector<HTMLInputElement>("input[aria-hidden]") ?? null;
    if (node) {
      for (const [k, v] of Object.entries({ ...customAttr(customAttribute, "Input"), ...(inputProps as Record<string, string> | undefined) })) {
        if (typeof v === "string" || typeof v === "number") node.setAttribute(k, String(v));
      }
    }
    if (!inputRef) return;
    const trigger = rootRef.current?.querySelector<HTMLElement>("[role=combobox]");
    const handle = { node, value: current, focus: () => trigger?.focus() };
    if (typeof inputRef === "function") inputRef(handle);
    else (inputRef as { current: unknown }).current = handle;
  });

  // KB's sheet moves focus to the selected row (or the first) with its focus ring, as MUI's menu
  // does. ui-sdk focuses the sheet itself, so we move it once the sheet is up.
  useEffect(() => {
    if (!isOpenNow || !mobile) return;
    const frame = requestAnimationFrame(() => requestAnimationFrame(() => {
      const menu = rootRef.current?.querySelector(".sj-legacy-menu");
      const row = menu?.querySelector<HTMLElement>("[role=option][aria-selected=true]:not([aria-disabled=true])") ?? menu?.querySelector<HTMLElement>("[role=option]:not([aria-disabled=true])");
      row?.focus({ preventScroll: false, focusVisible: true } as FocusOptions);
    }));
    return () => cancelAnimationFrame(frame);
  }, [isOpenNow, mobile]);

  // While open, only the menu is reachable for assistive tech, as in KB (see hideOthers).
  useEffect(() => {
    if (!isOpenNow) return;
    let undo = () => {};
    const frame = requestAnimationFrame(() => {
      const menu = rootRef.current?.querySelector(".sj-legacy-menu");
      if (menu) undo = hideOthers(menu);
    });
    return () => { cancelAnimationFrame(frame); undo(); };
  }, [isOpenNow]);

  const setRefs = (el: HTMLDivElement | null) => {
    rootRef.current = el;
    assignRef(ref, el);
  };

  if (isLoading) {
    return (
      <span {...legacyMarker} className="sj-legacy-select-skeleton" data-external-label={hasExternalLabel || undefined} data-full-width={fullWidth || undefined}>
        {hasExternalLabel && <span className="sj-legacy-select-skeleton__label" />}
        <span className="sj-legacy-select-skeleton__box" data-density={density} data-rounded={rounded || undefined} data-radius={borderRadiusOverride && kbRadii[borderRadiusOverride]}>
          <span className="sj-legacy-select-skeleton__bar" />
          <ChevronDown />
        </span>
      </span>
    );
  }

  const emit = (nextValue: unknown, child: ReactNode) => {
    if (value === undefined) setInnerValue(nextValue);
    const target = { value: nextValue, name: name ?? "" };
    const event = Object.defineProperty(new Event("change"), "target", { value: target, writable: true }) as SelectChangeEvent;
    onChange?.(event, child);
  };

  const helperId = helperText ? `${labelId}-helper` : undefined;
  const displayNode = (() => {
    if (!filled(current) && !displayEmpty) return null;
    if (renderValue) return renderValue(current as never);
    const chosen = options.filter(isSelected);
    if (multiple) return chosen.map((o) => o.element.props.children).reduce<ReactNode[]>((acc, c, i) => (i ? [...acc, ", ", c] : [c]), []);
    return chosen[0]?.element.props.children ?? null;
  })();
  const menu = MenuProps as { className?: string; style?: CSSProperties; PaperProps?: { className?: string; style?: CSSProperties }; slotProps?: { paper?: { className?: string; style?: CSSProperties } } } | undefined;
  const Icon = IconComponent ?? ChevronDown;
  const start = startAdornment ?? startIcon;

  const field = (
    <OutlinedField
      label={labelText}
      labelId={labelId}
      externalLabel={hasExternalLabel}
      filled={filled(current) || Boolean(displayNode)}
      helperText={helperText}
      error={error}
      disabled={disabled}
      fullWidth={fullWidth}
      start={start}
      end={endAdornment}
      rootProps={{ "data-legacy-select": "", "data-density": density, "data-rounded": rounded ? "" : undefined, "data-radius": borderRadiusOverride && kbRadii[borderRadiusOverride] }}
    >
      {native ? (
        <select
          className="sj-select__trigger sj-legacy-native-select"
          id={id ?? `${labelId}-select`}
          name={name}
          disabled={disabled}
          aria-labelledby={labelId}
          aria-required={required}
          aria-describedby={cx(describedBy, helperId)}
          value={multiple ? undefined : String(current ?? "")}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => emit(e.target.value, null)}
        >
          {options.map((o) => (
            <option key={o.key} value={String(o.value ?? "")} disabled={o.element.props.disabled}>
              {o.label}
            </option>
          ))}
        </select>
      ) : (
        <UiSelect
          items={options.map((o) => ({ value: o.key, label: o.label, disabled: o.element.props.disabled }))}
          multiple={multiple as false}
          value={selectedKeys as string | null}
          onValueChange={(next: unknown) => {
            if (multiple) {
              const keys = (next as unknown as string[]) ?? [];
              const before = selectedKeys as string[];
              const toggled = options.find((o) => keys.includes(o.key) !== before.includes(o.key));
              if (!toggled) return;
              // As MUI: the clicked value is appended to (or removed from) the current array, in click order.
              const values = Array.isArray(current) ? [...current] : [];
              const at = values.findIndex((v) => equal(v, toggled.value));
              if (at === -1) values.push(toggled.value);
              else values.splice(at, 1);
              emit(values, toggled.element);
            } else {
              const option = options.find((o) => o.key === next);
              emit(option ? option.value : "", option?.element);
            }
          }}
          name={name}
          disabled={disabled}
          readOnly={readOnly}
          loop={false}
          presentation={mobile ? "sheet" : "popover"}
          open={isOpenNow}
          onOpenChange={(next, details) => {
            if (open === undefined) setInnerOpen(next);
            const e = synthetic(details?.event as Event | undefined, rootRef.current);
            (next ? onOpen : onClose)?.(e);
          }}
        >
          <SelectTrigger
            {...(SelectDisplayProps as Record<string, unknown>)}
            className="sj-select__trigger"
            id={id ?? `${labelId}-select`}
            aria-labelledby={labelId}
            aria-required={required}
            aria-describedby={cx(describedBy, helperId)}
            autoFocus={autoFocus}
          >
            <span className="sj-select__value">{displayNode}</span>
            <Icon className="sj-select__chevron" data-open={isOpenNow || undefined} />
          </SelectTrigger>
          <SelectContent
            className={cx("sj-legacy-menu", menu?.className, menu?.PaperProps?.className, menu?.slotProps?.paper?.className)}
            style={{ ...menu?.style, ...menu?.PaperProps?.style, ...menu?.slotProps?.paper?.style }}
            data-density={menuDensity}
            data-auto-width={autoWidth || undefined}
            role={mobile ? undefined : "presentation"}
          >
            <div className="sj-legacy-menu__header">
              <h1 className="sj-legacy-menu__title">{labelText}</h1>
              <button type="button" className="sj-legacy-menu__close" aria-label={closeLabel[lang]} onClick={(e) => {
                if (open === undefined) setInnerOpen(false);
                onClose?.(e);
              }}>
                <Cancel />
              </button>
            </div>
            <SelectList className="sj-legacy-menu__list" tabIndex={-1} aria-label={mobile ? labelText : ""}>
              {nodes.map((n, i) => {
                if ("other" in n) return <div key={`x${i}`} role="presentation">{n.other}</div>;
                const o = n.option;
                const p = o.element.props;
                const last = o === options[options.length - 1];
                const selected = isSelected(o);
                return [
                  <SelectItem
                    key={o.key}
                    value={o.key}
                    label={o.label}
                    disabled={p.disabled}
                    className={cx("sj-legacy-menu-item", p.className)}
                    style={p.style}
                    data-variant={p.variant ?? "standard"}
                    {...customAttr(p.customAttribute)}
                  >
                    {p.customLayout ? p.children : <MenuItemLayout variant={p.variant} selected={selected}>{p.children}</MenuItemLayout>}
                  </SelectItem>,
                  !last && p.divider !== false && !p.isLastChild ? <SelectSeparator key={`${o.key}-d`} className="sj-legacy-menu-divider" /> : null,
                ];
              })}
            </SelectList>
          </SelectContent>
        </UiSelect>
      )}
    </OutlinedField>
  );

  return (
    <div
      {...(rest as HTMLAttributes<HTMLDivElement>)}
      {...legacyMarker}
      {...customAttr(customAttribute)}
      ref={setRefs}
      className={cx("sj-legacy-select", resolved.className, className)}
      style={{ ...resolved.style, ...style }}
      data-full-width={fullWidth || undefined}
    >
      {field}
    </div>
  );
});

export default Select;
