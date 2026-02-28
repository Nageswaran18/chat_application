"use client";

import {
  forwardRef,
  type InputHTMLAttributes,
  useState,
  useId,
} from "react";

export type InputType = "text" | "email" | "password" | "search" | "url";

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "className"> {
  /** Field label (optional). */
  label?: string;
  /** Error message shown below the input. */
  error?: string;
  /** Right-side action (e.g. "Forgot?" link) when label is present. */
  rightAction?: React.ReactNode;
  /** Extra class for the wrapper div. */
  wrapperClassName?: string;
  /** Extra class for the input element. */
  inputClassName?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    error,
    rightAction,
    wrapperClassName = "",
    inputClassName = "",
    type = "text",
    id: idProp,
    ...rest
  },
  ref
) {
  const [showPassword, setShowPassword] = useState(false);
  const generatedId = useId();
  const id = idProp ?? generatedId;

  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div className={`space-y-1.5 ${wrapperClassName}`}>
      {(label || rightAction) && (
        <div className="flex items-center justify-between text-xs font-medium uppercase tracking-[0.12em] text-slate-400">
          {label && (
            <label htmlFor={id} className="block">
              {label}
            </label>
          )}
          {rightAction && <div className="ml-auto">{rightAction}</div>}
        </div>
      )}

      <div className="relative">
        <input
          ref={ref}
          id={id}
          type={inputType}
          className={`font-sans w-full rounded-xl border border-slate-300 dark:border-slate-500/50 bg-slate-50 dark:bg-slate-900/80 text-slate-900 dark:text-inherit px-3.5 py-2.5 text-[0.9375rem] outline-none transition placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 disabled:opacity-60 disabled:cursor-not-allowed ${isPassword ? "pr-10" : ""} ${inputClassName}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs font-medium"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        )}
      </div>

      {error && (
        <p id={`${id}-error`} className="text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

export default Input;
