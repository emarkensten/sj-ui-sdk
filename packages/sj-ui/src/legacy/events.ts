import type { ChangeEvent } from "react";

/**
 * KB components hand MUI's ChangeEvent to onChange. ui-sdk reports values instead.
 * This builds an event with what consumers read: target.value, target.checked and target.name.
 */
export function syntheticChange(target: { value?: string | number; checked?: boolean; name?: string }, native?: Event): ChangeEvent<HTMLInputElement> {
  const t = { value: target.value ?? "", checked: target.checked ?? false, name: target.name ?? "" } as unknown as HTMLInputElement;
  return {
    target: t,
    currentTarget: t,
    nativeEvent: native ?? new Event("change"),
    type: "change",
    bubbles: true,
    defaultPrevented: false,
    preventDefault() {},
    stopPropagation() {},
    persist() {},
    isDefaultPrevented: () => false,
    isPropagationStopped: () => false,
  } as unknown as ChangeEvent<HTMLInputElement>;
}
