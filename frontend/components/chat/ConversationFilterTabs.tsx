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
      className={`flex flex-wrap gap-2 text-[0.7rem] font-medium text-slate-500 ${className}`}
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
                ? "rounded-full bg-indigo-500/15 text-slate-100 px-3 py-1 border border-indigo-500/60"
                : "rounded-full bg-slate-900/70 px-3 py-1 border border-slate-800/80 hover:bg-slate-800/80 hover:text-slate-200"
            }
          >
            {filter.label}
          </button>
        );
      })}
    </nav>
  );
}
