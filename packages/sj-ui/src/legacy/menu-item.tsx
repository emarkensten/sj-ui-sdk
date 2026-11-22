/*
 * Legacy MenuItem. Inside the legacy Select it describes one option and renders nothing itself:
 * the Select reads its props. Drop-in for `@sj-ab/component-library.ui.menu-item` in a Select.
 */
import type { ReactNode } from "react";
import { warnOnce } from "../lib/warn";
import type { CustomAttribute } from "./shared";

export interface MenuItemProps {
  value?: string | number;
  disabled?: boolean;
  children?: ReactNode;
  /** Only "standard" is supported in a Select. */
  variant?: "standard" | "checkbox" | "radio" | "switch" | "separator";
  customAttribute?: CustomAttribute;
  isLastChild?: boolean;
  customLayout?: boolean;
  onClick?: () => void;
}

export function MenuItem(_props: MenuItemProps): null {
  warnOnce("MenuItem", "MenuItem only works inside the legacy Select in this pilot. Menus are not ported yet.");
  return null;
}
MenuItem.displayName = "SjLegacyMenuItem";

export default MenuItem;
