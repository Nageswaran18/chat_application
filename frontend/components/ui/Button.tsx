"use client";

import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "icon";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  /** Show loading state (disables button and optional label change). */
  loading?: boolean;
  /** When loading, optionally override children. */
  loadingLabel?: ReactNode;
  /** Full width. */
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 active:bg-emerald-600/90 border border-transparent shadow-sm shadow-emerald-900/30 disabled:bg-emerald-600/60 disabled:text-zinc-200",
  secondary:
    "rounded-lg bg-zinc-200 text-zinc-900 border border-zinc-300 hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-700 dark:hover:border-zinc-600 disabled:opacity-70",
  ghost:
    "bg-transparent text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 border border-transparent",
  icon:
    "rounded-full bg-zinc-200 border border-zinc-300 text-zinc-600 hover:bg-zinc-300 hover:text-zinc-900 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-700 flex items-center justify-center",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    loading = false,
    loadingLabel,
    fullWidth,
    className = "",
    disabled,
    children,
    ...rest
  },
  ref
) {
  const base =
    variant === "icon"
      ? "h-9 w-9 text-xs font-sans"
      : "inline-flex items-center justify-center font-sans";
  const variantClass = variantClasses[variant];
  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button
      ref={ref}
      type={rest.type ?? "button"}
      className={`${base} ${variantClass} ${widthClass} ${className}`}
      disabled={disabled ?? loading}
      aria-busy={loading}
      {...rest}
    >
      {loading && loadingLabel != null ? loadingLabel : children}
    </button>
  );
});

export default Button;
