"use client";

export interface LoadingIndicatorProps {
  /** Optional text shown under the loader. Omit for icon-only. */
  label?: string;
  className?: string;
}

export default function LoadingIndicator({
  label,
  className = "",
}: LoadingIndicatorProps) {
  return (
    <div
      className={[
        "inline-flex flex-col items-center justify-center gap-2 text-zinc-500 dark:text-zinc-400 text-sm",
        className,
      ].join(" ")}
    >
      {/* Diamond of four animated dots */}
      <span className="relative inline-flex h-8 w-8">
        <span className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.3s]" />
        <span className="absolute right-0 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.15s]" />
        <span className="absolute left-1/2 bottom-0 h-2 w-2 -translate-x-1/2 rounded-full bg-emerald-500 animate-bounce" />
        <span className="absolute left-0 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.45s]" />
      </span>
      {label && <span className="text-xs text-center">{label}</span>}
    </div>
  );
}

