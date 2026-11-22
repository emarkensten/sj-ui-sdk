const seen = new Set<string>();

const isDev = (() => {
  try {
    return Boolean((import.meta as { env?: { DEV?: boolean } }).env?.DEV);
  } catch {
    return false;
  }
})();

export function warnOnce(component: string, message: string) {
  if (!isDev) return;
  const key = `${component}:${message}`;
  if (seen.has(key)) return;
  seen.add(key);
  console.warn(`[sj-ui] ${component}: ${message}`);
}

/** Warns once per prop that is passed but not supported, and returns nothing. */
export function warnUnsupported(component: string, props: Record<string, unknown>, names: readonly string[], hint?: string) {
  for (const name of names) {
    if (props[name] !== undefined) warnOnce(component, `prop \`${name}\` stöds inte och ignoreras.${hint ? ` ${hint}` : ""}`);
  }
}
