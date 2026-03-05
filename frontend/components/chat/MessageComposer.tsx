"use client";

import {
  type FormEvent,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Textarea } from "@/components/ui";
import { Paperclip, Smile, Send } from "lucide-react";
import EmojiPicker from "./EmojiPicker";

const MIN_ROWS = 1;
const MAX_ROWS = 4;
const ROW_HEIGHT_PX = 28;

export interface MessageComposerProps {
  placeholder?: string;
  sendLabel?: string;
  hint?: string;
  onSubmit?: (message: string) => void;
  onKeyDown?: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
  /** Controlled value (optional). */
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  /** Show attachment button. */
  showAttachment?: boolean;
  /** Called when user clicks the attach button (e.g. to open image picker). */
  onAttachClick?: () => void;
  className?: string;
}

export default function MessageComposer({
  placeholder = "Type a message…",
  sendLabel = "Send",
  hint,
  onSubmit,
  onKeyDown,
  value: controlledValue,
  onChange,
  disabled = false,
  showAttachment = true,
  onAttachClick,
  className = "",
}: MessageComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiWrapperRef = useRef<HTMLDivElement>(null);
  const isControlled = controlledValue !== undefined;
  const minHeight = MIN_ROWS * ROW_HEIGHT_PX;
  const maxHeight = MAX_ROWS * ROW_HEIGHT_PX;
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "0";
    el.style.overflowY = "hidden";
    const capped = Math.min(Math.max(el.scrollHeight, minHeight), maxHeight);
    el.style.height = `${capped}px`;
    el.style.overflowY = el.scrollHeight > maxHeight ? "auto" : "hidden";
  }, [minHeight, maxHeight]);

  useEffect(() => {
    adjustHeight();
  }, [controlledValue, adjustHeight]);

  // Close emoji picker when clicking outside of the emoji area
  useEffect(() => {
    if (!showEmojiPicker) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const wrapper = emojiWrapperRef.current;
      if (!wrapper) return;
      const target = event.target as Node | null;
      if (target && wrapper.contains(target)) {
        return;
      }
      setShowEmojiPicker(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [showEmojiPicker]);

  const handleEmojiInsert = useCallback(
    (emoji: string) => {
      const el = textareaRef.current;
      if (!el) return;

      if (isControlled) {
        const current = controlledValue ?? "";
        const next = current + emoji;
        onChange?.(next);
      } else {
        const value = el.value;
        const start = el.selectionStart ?? value.length;
        const end = el.selectionEnd ?? value.length;
        el.value = value.slice(0, start) + emoji + value.slice(end);
      }

      adjustHeight();
      el.focus();
    },
    [adjustHeight, controlledValue, isControlled, onChange]
  );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const el = textareaRef.current;
    const text = isControlled ? controlledValue : el?.value ?? "";
    const trimmed = text.trim();
    if (trimmed && onSubmit) {
      onSubmit(trimmed);
      if (!isControlled && el) {
        el.value = "";
        adjustHeight();
      }
      if (onChange && isControlled) onChange("");
    }
  };

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const val = e.target.value;
      onChange?.(val);
      adjustHeight();
    },
    [onChange, adjustHeight]
  );

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent);
    }
    onKeyDown?.(e);
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2">
        {/* Left: emoji button outside message container */}
        <div className="relative" ref={emojiWrapperRef}>
          {showEmojiPicker && (
            <div className="absolute bottom-full left-0 mb-2 z-20">
              <EmojiPicker onSelect={handleEmojiInsert} />
            </div>
          )}

          <button
            type="button"
            aria-label="Insert emoji"
            className="h-9 w-9 flex items-center justify-center text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
            onClick={() => setShowEmojiPicker((open) => !open)}
          >
            <Smile className="h-5 w-5" />
          </button>
        </div>

        {/* Middle: message container with only attachment icon inside */}
        <div className="flex-1 relative min-w-0 w-full">
          <Textarea
            ref={textareaRef}
            rows={MIN_ROWS}
            placeholder={placeholder}
            value={isControlled ? controlledValue : undefined}
            onChange={isControlled ? handleChange : undefined}
            onInput={!isControlled ? adjustHeight : undefined}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            wrapperClassName="mb-0 w-full"
            textareaClassName="composer-textarea w-full min-w-0 pr-10 py-2.5 text-xs md:text-[0.8rem] resize-none overflow-y-auto min-h-[2.75rem]"
            style={
              {
                minHeight: `${minHeight}px`,
                maxHeight: `${maxHeight}px`,
              } as React.CSSProperties
            }
            aria-label="Message input"
          />

          {/* Attachment icon aligned inside right corner */}
          {showAttachment && (
            <div className="absolute inset-y-0 right-2 flex items-center">
              <button
                type="button"
                aria-label="Attach image"
                className="h-7 w-7 flex items-center justify-center text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                onClick={onAttachClick}
              >
                <Paperclip className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Right: send icon button outside message container */}
        <button
          type="submit"
          aria-label={sendLabel || "Send message"}
          className="h-9 w-9 flex items-center justify-center text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
        >
          <Send className="h-5 w-5" fill="currentColor"/>
        </button>
      </div>
      {hint && (
        <p className="text-[0.65rem] text-slate-500 px-1">{hint}</p>
      )}
    </form>
  );
}
