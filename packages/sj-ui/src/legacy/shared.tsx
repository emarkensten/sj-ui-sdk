/*
 * Shared helpers for the legacy layer. The legacy layer keeps KB's names, exports and props so
 * existing code can switch with an import change. New components never import from here, so the
 * whole folder can be deleted once consumers have moved to the new API.
 */
import type { CSSProperties, ReactNode } from "react";
import { createContext, useContext } from "react";
import { warnOnce } from "../lib/warn";

export type CustomAttribute = { attribute: string; value: string | number };

/** KB's test-id contract: `customAttribute` becomes an attribute on the root, sub-parts get "-Name" suffixes. */
export function customAttr(ca: CustomAttribute | undefined, suffix?: string): Record<string, string> {
  if (!ca) return {};
  return { [ca.attribute]: suffix ? `${ca.value}-${suffix}` : String(ca.value) };
}

/** Marks legacy-rendered roots, so parity tests and audits can find them. */
export const legacyMarker = { "data-sj-legacy": "" } as const;

/* ---------------- sx ---------------- */

/**
 * KB's `sx`. Legacy components accept it and hand it to a resolver.
 *
 * - In SJ's own apps, plug in the design-system team's `useSjSx` from
 *   `@sj-ab/component-library.styles.sj-style-engine-provider` with `<LegacySxProvider resolver={useSjSx}>`.
 *   It already supports SJ's sx subset with SSR and streaming (see the team's RFC).
 * - Without it (Lovable, this demo), a small built-in resolver turns the common layout subset into
 *   inline styles and warns in development about everything else.
 */
export type LegacySx = Record<string, unknown> | ((theme: unknown) => Record<string, unknown>) | ReadonlyArray<unknown> | null | undefined;

export type SxResolver = (sx: LegacySx) => { className?: string; style?: CSSProperties };

const SPACING = new Set(["m", "mt", "mr", "mb", "ml", "mx", "my", "p", "pt", "pr", "pb", "pl", "px", "py", "gap"]);
const PASSTHROUGH = new Set(["width", "maxWidth", "minWidth", "height", "minHeight", "maxHeight", "display", "flex", "flexGrow", "flexShrink", "alignSelf", "justifySelf", "order"]);
const longhand: Record<string, string[]> = {
  m: ["margin"], mt: ["marginTop"], mr: ["marginRight"], mb: ["marginBottom"], ml: ["marginLeft"],
  mx: ["marginLeft", "marginRight"], my: ["marginTop", "marginBottom"],
  p: ["padding"], pt: ["paddingTop"], pr: ["paddingRight"], pb: ["paddingBottom"], pl: ["paddingLeft"],
  px: ["paddingLeft", "paddingRight"], py: ["paddingTop", "paddingBottom"], gap: ["gap"],
};

const space = (v: unknown) => (typeof v === "number" ? `calc(var(--sjse-spacing-default, 1rem) * ${v / 2})` : String(v));

/** The built-in resolver: spacing in theme units (1 = 8px) plus a few layout properties. */
export const builtinSxResolver: SxResolver = (sx) => {
  if (!sx) return {};
  if (typeof sx === "function" || Array.isArray(sx)) {
    warnOnce("sx", "Function and array sx need the SJ style engine. Wrap the app in <LegacySxProvider resolver={useSjSx}>.");
    return {};
  }
  const style: Record<string, string> = {};
  for (const [key, value] of Object.entries(sx as Record<string, unknown>)) {
    if (value == null || typeof value === "object") {
      warnOnce("sx", `sx.${key}: responsive and nested values need the SJ style engine.`);
    } else if (SPACING.has(key)) {
      for (const prop of longhand[key]) style[prop] = space(value);
    } else if (PASSTHROUGH.has(key)) {
      style[key] = typeof value === "number" && value <= 1 && key.endsWith("idth") ? `${value * 100}%` : String(value);
    } else {
      warnOnce("sx", `sx.${key} is not in the built-in subset and is ignored.`);
    }
  }
  return { style: style as CSSProperties };
};

const SxContext = createContext<SxResolver>(builtinSxResolver);

export function LegacySxProvider({ resolver, children }: { resolver: SxResolver | ((sx: LegacySx) => string | undefined); children: ReactNode }) {
  // Accept useSjSx directly: it returns a class name.
  const wrapped: SxResolver = (sx) => {
    const out = (resolver as (sx: LegacySx) => unknown)(sx);
    return typeof out === "string" || out === undefined ? { className: out as string | undefined } : (out as ReturnType<SxResolver>);
  };
  return <SxContext.Provider value={wrapped}>{children}</SxContext.Provider>;
}

/** Called unconditionally in every legacy component, so a hook-based resolver keeps hook order. */
export function useLegacySx(sx: LegacySx) {
  return useContext(SxContext)(sx);
}
