import { useSyncExternalStore } from "react";

/** A media query as state. The server, and the first client render, see `false`. */
export function useMedia(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** KB's `theme.breakpoints.down("sm")`: below 600 px, where KB opens menus and calendars as sheets. */
export const kbMobileQuery = "(max-width: 599.95px)";
