/*
 * Legacy LocalizationProvider. KB's DatePicker needs it for MUI X and date-fns. The new picker
 * doesn't, so this only renders its children. Kept so existing code compiles unchanged.
 */
import type { ReactNode } from "react";

export interface LocalizationProviderProps {
  locale?: "sv" | "en";
  children?: ReactNode;
}

export function LocalizationProvider({ children }: LocalizationProviderProps) {
  return <>{children}</>;
}

export default LocalizationProvider;
