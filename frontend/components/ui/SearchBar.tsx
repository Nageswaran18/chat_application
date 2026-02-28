"use client";

import { forwardRef, type InputHTMLAttributes, useId } from "react";

export interface SearchBarProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "className" | "size"> {
  /** Placeholder when empty. */
  placeholder?: string;
  /** Optional label for accessibility. */
  "aria-label"?: string;
  /** Size variant. */
  size?: "default" | "sm";
  /** Optional clear button callback; if provided, clear button is shown when value is non-empty. */
  onClear?: () => void;
  /** Wrapper class. */
  className?: string;
  /** Input element class. */
  inputClassName?: string;
}

const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  function SearchBar(
    {
      placeholder = "Search…",
      size = "default",
      onClear,
      className = "",
      inputClassName = "",
      value,
      ...rest
    },
    ref
  ) {
    const id = useId();
    const hasValue =
      value !== undefined && value !== null && String(value).length > 0;

    return (
      <div className={`relative w-full ${className}`}>
        <span
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 select-none flex items-center justify-center w-5"
          aria-hidden
        >
          <svg
            className={size === "sm" ? "h-3.5 w-3.5 shrink-0" : "h-4 w-4 shrink-0"}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </span>
        <input
          ref={ref}
          id={id}
          type="search"
          role="searchbox"
          autoComplete="off"
          placeholder={placeholder}
          value={value}
          className={`search-bar-input font-sans w-full min-w-0 rounded-xl border border-slate-300 dark:border-slate-500/50 bg-slate-50 dark:bg-slate-900/80 text-slate-900 dark:text-inherit pl-12 pr-10 py-2.5 text-[0.9375rem] outline-none transition placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 disabled:opacity-60 disabled:cursor-not-allowed ${size === "sm" ? "py-2 text-xs" : ""} ${inputClassName}`}
          aria-label={rest["aria-label"] ?? placeholder}
          {...rest}
        />
        {onClear && hasValue && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6 rounded text-slate-500 hover:text-slate-300 hover:bg-slate-700/50"
            aria-label="Clear search"
          >
            <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    );
  }
);

export default SearchBar;
