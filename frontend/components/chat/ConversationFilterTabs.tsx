"use client";

export type ConversationFilterType = "all" | "direct" | "groups" | "calls";

const FILTERS: { value: ConversationFilterType; label: string }[] = [
  { value: "all", label: "All" },
  { value: "direct", label: "Direct" },
  { value: "groups", label: "Groups" },
  { value: "calls", label: "Calls" },
];

export interface ConversationFilterTabsProps {
  value: ConversationFilterType;
  onChange: (filter: ConversationFilterType) => void;
  className?: string;
}

export default function ConversationFilterTabs({
  value,
  onChange,
  className = "",
}: ConversationFilterTabsProps) {
  return (
    <nav
      className={`flex flex-wrap gap-2 text-[0.7rem] font-medium text-zinc-500 ${className}`}
      role="tablist"
      aria-label="Conversation filter"
    >
      {FILTERS.map((filter) => {
        const isActive = value === filter.value;
        return (
          <button
            key={filter.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(filter.value)}
            className={
              isActive
                ? "rounded-full bg-emerald-500/15 text-zinc-900 dark:text-zinc-100 px-3 py-1 border border-emerald-500/50"
                : "rounded-full bg-zinc-200 dark:bg-zinc-800/70 px-3 py-1 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-200"
            }
          >
            {filter.label}
          </button>
        );
      })}
    </nav>
  );
}
