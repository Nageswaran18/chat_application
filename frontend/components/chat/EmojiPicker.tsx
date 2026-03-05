"use client";

import { useState, type MouseEvent } from "react";

export interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  className?: string;
}

const DEFAULT_EMOJI_CATEGORIES: { id: string; label: string; emojis: string[] }[] = [
  {
    id: "recent",
    label: "Recent",
    emojis: ["😀", "😂", "😍", "😊", "😎", "😭", "👍", "🙏", "🎉", "❤️"],
  },
  {
    id: "people",
    label: "Smileys",
    emojis: ["😀", "😁", "😂", "🤣", "😅", "😊", "😍", "😘", "😎", "🤩"],
  },
];

export default function EmojiPicker({ onSelect, className = "" }: EmojiPickerProps) {
  const [activeCategoryId, setActiveCategoryId] = useState<string>(DEFAULT_EMOJI_CATEGORIES[0]?.id ?? "recent");

  const handleClick = (e: MouseEvent<HTMLButtonElement>, emoji: string) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect(emoji);
  };

  const activeCategory =
    DEFAULT_EMOJI_CATEGORIES.find((cat) => cat.id === activeCategoryId) ?? DEFAULT_EMOJI_CATEGORIES[0];

  return (
    <div
      className={[
        "rounded-lg border border-zinc-200 bg-white shadow-md p-2 flex flex-col gap-2 text-base",
        "dark:bg-zinc-900 dark:border-zinc-700",
        className,
      ].join(" ")}
    >
      <div className="flex gap-1 text-[0.7rem] text-zinc-500">
        {DEFAULT_EMOJI_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategoryId(cat.id)}
            className={[
              "px-2 py-1 rounded-md text-[0.65rem] transition-colors",
              cat.id === activeCategoryId
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200",
            ].join(" ")}
          >
            {cat.label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-1 max-w-[260px]">
        {activeCategory.emojis.map((emoji) => (
          <button
            key={emoji}
            type="button"
            className="h-7 w-7 flex items-center justify-center rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
            onClick={(e) => handleClick(e, emoji)}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}

