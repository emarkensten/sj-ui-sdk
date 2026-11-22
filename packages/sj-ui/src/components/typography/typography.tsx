import type { ElementType, HTMLAttributes, ReactNode } from "react";
import { cx } from "../../lib/cx";

/** The same variant names as KB's Typography, each backed by one `--sjse-typography-*` token. */
export const typographyVariants = {
  largeTitleRegular: "large-title",
  largeTitleEmphasized: "large-title-emphasized",
  title1Regular: "title-1",
  title1Emphasized: "title-1-emphasized",
  title2Regular: "title-2",
  title2Emphasized: "title-2-emphasized",
  title3Regular: "title-3",
  title3Emphasized: "title-3-emphasized",
  headline: "headline",
  bodyRegular: "body",
  bodyEmphasized: "body-emphasized",
  bodyItalic: "body-italic",
  subheadlineRegular: "subheadline",
  subheadlineEmphasized: "subheadline-emphasized",
  footnoteRegular: "footnote",
  footnoteEmphasized: "footnote-emphasized",
  caption1Regular: "caption-1",
  caption1Emphasized: "caption-1-emphasized",
  caption2Regular: "caption-2",
  caption2Emphasized: "caption-2-emphasized",
} as const;

export type TypographyVariant = keyof typeof typographyVariants;

export interface TypographyProps extends HTMLAttributes<HTMLElement> {
  variant?: TypographyVariant;
  /** The element. Set the heading level here, not with the variant. */
  as?: ElementType;
  color?: "primary" | "secondary" | "tertiary" | "error" | "inherit";
  srOnly?: boolean;
  children?: ReactNode;
}

export function Typography({ variant = "bodyRegular", as, color = "inherit", srOnly, className, ...rest }: TypographyProps) {
  const Component = as ?? (variant.startsWith("largeTitle") || variant.startsWith("title") ? "h2" : "p");
  return (
    <Component
      {...rest}
      className={cx("sj-typography", srOnly && "sj-visually-hidden", className)}
      data-variant={typographyVariants[variant]}
      data-color={color === "inherit" ? undefined : color}
    />
  );
}
