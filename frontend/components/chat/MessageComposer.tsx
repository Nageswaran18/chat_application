"use client";

import {
  type FormEvent,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { Button, Textarea } from "@/components/ui";

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
  className = "",
}: MessageComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isControlled = controlledValue !== undefined;
  const minHeight = MIN_ROWS * ROW_HEIGHT_PX;
  const maxHeight = MAX_ROWS * ROW_HEIGHT_PX;

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
      <div className="flex items-end gap-2">
        {showAttachment && (
          <Button type="button" variant="icon" aria-label="Attach file">
            +
          </Button>
        )}
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
            textareaClassName="composer-textarea w-full min-w-0 pr-14 py-2.5 text-xs md:text-[0.8rem] resize-none overflow-y-auto min-h-[2.75rem]"
            style={
              {
                minHeight: `${minHeight}px`,
                maxHeight: `${maxHeight}px`,
              } as React.CSSProperties
            }
            aria-label="Message input"
          />
          <div className="pointer-events-none absolute right-2.5 bottom-2.5 flex items-center gap-2 text-[0.7rem] text-slate-500">
            <span>⏎ to send</span>
          </div>
        </div>
        <Button
          type="submit"
          variant="primary"
          className="h-9 min-h-[2.25rem] px-4 text-xs shrink-0"
        >
          {sendLabel}
        </Button>
      </div>
      {hint && (
        <p className="text-[0.65rem] text-slate-500 px-1">{hint}</p>
      )}
    </form>
  );
}
