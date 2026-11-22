import { cx } from "../../lib/cx";

/** SJ's spinner: eight rays stepping round, the same drawing as KB's FlowButton spinner. */
export function Spinner({ className, size = "medium" }: { className?: string; size?: "small" | "medium" }) {
  return (
    <span className={cx("sj-spinner", className)} data-size={size} aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" focusable="false">
        <g fill="currentColor" opacity=".6">
          <rect height="7" opacity=".75" rx="1.5" transform="rotate(90 8 10.5)" width="3" x="8" y="10.5" />
          <rect height="7" opacity=".87" rx="1.5" transform="rotate(-45 3.16 5.282)" width="3" x="3.16" y="5.282" />
          <rect height="7" opacity=".51" rx="1.5" width="3" x="10.5" y="16" />
          <rect height="7" opacity=".63" rx="1.5" transform="rotate(45 8.11 13.768)" width="3" x="8.109" y="13.768" />
          <rect height="7" opacity=".39" rx="1.5" transform="rotate(-45 13.77 15.889)" width="3" x="13.77" y="15.889" />
          <rect height="7" opacity=".27" rx="1.5" transform="rotate(90 23 10.5)" width="3" x="23" y="10.5" />
          <rect height="7" opacity=".15" rx="1.5" transform="rotate(45 18.719 3.161)" width="3" x="18.719" y="3.161" />
          <rect height="7" rx="1.5" width="3" x="10.5" y="1" />
        </g>
      </svg>
    </span>
  );
}
