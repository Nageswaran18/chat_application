"use client";

export interface ConversationItem {
  id: string;
  title: string;
  preview: string;
  time: string;
  /** Used by Dashboard to filter All / Direct / Groups */
  kind?: "direct" | "group";
}

export interface ConversationListProps {
  items: ConversationItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  emptyMessage?: string;
  className?: string;
}

export default function ConversationList({
  items,
  selectedId,
  onSelect,
  emptyMessage = "No data found",
  className = "",
}: ConversationListProps) {
  return (
    <div
      className={`flex-1 overflow-y-auto space-y-2 pr-1 custom-scroll min-h-0 ${className}`}
    >
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
          <div className="rounded-full bg-slate-800/80 p-4 mb-3">
            <svg
              className="h-8 w-8 text-slate-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <p className="text-sm font-medium text-slate-300">{emptyMessage}</p>
          <p className="text-[0.7rem] text-slate-500 mt-1">
            Start a new conversation or try another filter
          </p>
        </div>
      ) : (
        items.map((item) => {
          const isActive = selectedId === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              className={
                isActive
                  ? "w-full rounded-xl px-3 py-2.5 text-left text-xs transition-colors bg-indigo-500/15 text-slate-100 border border-indigo-500/70"
                  : "w-full rounded-xl px-3 py-2.5 text-left text-xs transition-colors bg-slate-900/60 text-slate-200 border border-slate-800/80 hover:bg-slate-900"
              }
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium">{item.title}</span>
                <span className="text-[0.65rem] text-slate-500 shrink-0 ml-2">
                  {item.time}
                </span>
              </div>
              <p className="truncate text-[0.7rem] text-slate-400">{item.preview}</p>
            </button>
          );
        })
      )}
    </div>
  );
}
