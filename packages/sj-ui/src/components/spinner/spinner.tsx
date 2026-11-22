import { cx } from "../../lib/cx";

export function Spinner({ className, size = "medium" }: { className?: string; size?: "small" | "medium" }) {
  return <span className={cx("sj-spinner", className)} data-size={size} aria-hidden="true" />;
}
