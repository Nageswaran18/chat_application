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
    "rounded-lg bg-indigo-500 text-slate-50 hover:bg-indigo-400 active:bg-indigo-500/90 border border-transparent shadow-sm shadow-indigo-900/40 disabled:bg-indigo-500/60 disabled:text-slate-200",
  secondary:
    "rounded-lg bg-slate-900/70 text-slate-100 border border-slate-700/80 hover:bg-slate-800/80 hover:border-slate-600/80 disabled:opacity-70",
  ghost:
    "bg-transparent text-slate-300 hover:bg-slate-800/80 hover:text-slate-100 border border-transparent",
  icon:
    "rounded-full bg-slate-900/80 border border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/90 flex items-center justify-center",
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
      ? "h-9 w-9 text-xs"
      : "inline-flex items-center justify-center";
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
