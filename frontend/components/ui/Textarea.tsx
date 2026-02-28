"use client";

import {
  forwardRef,
  type TextareaHTMLAttributes,
  useId,
} from "react";

export interface TextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "className"> {
  /** Field label (optional). */
  label?: string;
  /** Error message shown below the textarea. */
  error?: string;
  /** Wrapper class. */
  wrapperClassName?: string;
  /** Textarea element class. */
  textareaClassName?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    {
      label,
      error,
      wrapperClassName = "",
      textareaClassName = "",
      id: idProp,
      ...rest
    },
    ref
  ) {
    const generatedId = useId();
    const id = idProp ?? generatedId;

    return (
      <div className={`space-y-1.5 ${wrapperClassName}`}>
        {label && (
          <label
            htmlFor={id}
            className="block text-xs font-medium uppercase tracking-[0.12em] text-slate-400"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          className={`font-sans w-full rounded-xl border border-slate-300 dark:border-slate-500/50 bg-slate-50 dark:bg-slate-900/80 text-slate-900 dark:text-inherit px-3.5 py-2.5 text-[0.9375rem] outline-none transition placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 disabled:opacity-60 disabled:cursor-not-allowed resize-none ${textareaClassName}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          {...rest}
        />
        {error && (
          <p id={`${id}-error`} className="text-sm text-red-400" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

export default Textarea;
