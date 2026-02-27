"use client";

import type { ChangeEvent } from "react";
import { useMemo, useState } from "react";
import { SearchBar, Button } from "@/components/ui";
import MessageComposer from "@/components/chat/MessageComposer";
import ConversationFilterTabs, {
  type ConversationFilterType,
} from "@/components/chat/ConversationFilterTabs";
import ConversationList, {
  type ConversationItem,
} from "@/components/chat/ConversationList";

const CONVERSATIONS: ConversationItem[] = [
  { id: "design-squad", title: "Design squad", preview: "You: let's ship the typing indicator today.", time: "now", kind: "group" },
  { id: "infra-updates", title: "Infra updates", preview: "Last message preview goes here for quick scanning.", time: "3m", kind: "group" },
  { id: "product-feedback", title: "Product feedback", preview: "Last message preview goes here for quick scanning.", time: "4m", kind: "group" },
  { id: "alex", title: "1:1 · Alex", preview: "Last message preview goes here for quick scanning.", time: "5m", kind: "direct" },
  { id: "support-queue", title: "Support queue", preview: "Last message preview goes here for quick scanning.", time: "6m", kind: "group" },
];

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<ConversationFilterType>("all");
  const [selectedId, setSelectedId] = useState<string | null>("design-squad");

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) =>
    setSearchQuery(e.target.value);
  const handleSearchClear = () => setSearchQuery("");

  const filteredConversations = useMemo(() => {
    let list = CONVERSATIONS;
    if (filter === "direct") list = list.filter((c) => c.kind === "direct");
    else if (filter === "groups") list = list.filter((c) => c.kind === "group");
    else if (filter === "calls") list = [];
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((c) => c.title.toLowerCase().includes(q) || c.preview.toLowerCase().includes(q));
    }
    return list;
  }, [filter, searchQuery]);

  const selectedConversation = useMemo(
    () => CONVERSATIONS.find((c) => c.id === selectedId) ?? null,
    [selectedId]
  );

  return (
    <div className="app-shell app-shell-full flex flex-col">
      <div className="card-full flex flex-1 min-h-0 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,320px)_minmax(0,1fr)] w-full flex-1 min-h-0">
          {/* Sidebar: hidden on mobile when a chat is open */}
          <aside
            className={[
              "border-r border-slate-800/70 bg-slate-950/80 flex flex-col gap-4 min-h-0",
              "p-4 md:p-5",
              selectedId ? "hidden md:flex" : "flex",
            ].join(" ")}
          >
            <header className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-sky-400 flex items-center justify-center text-xs font-semibold text-slate-50">
                EC
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-slate-200">
                  EchoChat · Workspace
                </p>
                <p className="text-[0.7rem] text-slate-500">
                  Signed in as you@example.com
                </p>
              </div>
              <Button variant="secondary" className="text-xs px-3 py-1 h-7">
                New chat
              </Button>
            </header>

            <div className="space-y-3">
              <SearchBar
                placeholder="Search people, groups, messages…"
                size="sm"
                value={searchQuery}
                onChange={handleSearchChange}
                onClear={handleSearchClear}
              />

              <ConversationFilterTabs value={filter} onChange={setFilter} />
            </div>

            <ConversationList
              items={filteredConversations}
              selectedId={selectedId}
              onSelect={setSelectedId}
              emptyMessage="No data found"
            />
          </aside>

          {/* Main chat area: on mobile only when a channel is selected */}
          <section
            className={
              selectedId
                ? "flex flex-col bg-slate-950/40 min-h-0 flex-1"
                : "hidden md:flex flex-col bg-slate-950/40 min-h-0 flex-1"
            }
          >
            <header className="flex items-center justify-between border-b border-slate-800/70 px-4 py-3 md:px-5 md:py-4 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <button
                  type="button"
                  onClick={() => setSelectedId(null)}
                  className="md:hidden flex items-center justify-center h-9 w-9 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/80"
                  aria-label="Back to conversations"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="min-w-0">
                  <h1 className="text-sm md:text-base font-semibold text-slate-50 truncate">
                    {selectedConversation?.title ?? "Chat"}
                  </h1>
                  <p className="text-[0.7rem] text-slate-500 truncate">
                    4 people · Typing indicator, read receipts, presence
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button variant="secondary" className="h-8 px-3 text-[0.7rem]">
                  Start call
                </Button>
                <Button variant="icon" className="h-8 w-8" aria-label="More options">
                  ⋮
                </Button>
              </div>
            </header>

            <div className="flex-1 min-h-0 flex flex-col justify-between gap-3 px-3 pb-3 pt-2 md:px-5 md:pb-4 md:pt-3">
              <div className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-1 custom-scroll">
                <div className="flex justify-center">
                  <span className="rounded-full bg-slate-900/80 px-3 py-1 text-[0.7rem] text-slate-400 border border-slate-800/80">
                    Today · Product sync
                  </span>
                </div>

                <div className="flex flex-col gap-2.5 text-xs">
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5 h-7 w-7 rounded-xl bg-slate-800/90 flex items-center justify-center text-[0.65rem] text-slate-200">
                      AL
                    </div>
                    <div>
                      <p className="text-[0.7rem] text-slate-400 mb-0.5">
                        Alex · 09:32
                      </p>
                      <div className="rounded-2xl bg-slate-900/90 px-3 py-2 border border-slate-800/80">
                        Can we ship typing indicators with the first release? It
                        makes the app feel truly realtime.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 justify-end">
                    <div className="max-w-[72%] rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-500 px-3 py-2 text-slate-50 text-xs shadow-lg shadow-indigo-900/40">
                      Yes – the backend is ready. Let&apos;s wire the client and
                      we&apos;ll be good to go.
                      <div className="mt-1 flex items-center justify-end gap-1 text-[0.65rem] text-indigo-100/90">
                        <span>09:34</span>
                        <span>✓✓</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <div className="mt-0.5 h-7 w-7 rounded-xl bg-emerald-500/90 flex items-center justify-center text-[0.65rem] text-slate-900">
                      MJ
                    </div>
                    <div>
                      <p className="text-[0.7rem] text-slate-400 mb-0.5">
                        Maya · 09:36
                      </p>
                      <div className="rounded-2xl bg-slate-900/90 px-3 py-2 border border-slate-800/80">
                        I&apos;ll update the empty states for no messages,
                        loading, and connection lost today.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <MessageComposer
                placeholder="Message design squad…"
                sendLabel="Send"
                hint="This is a static preview of the chat experience. Wire it to your WebSocket and message APIs to go live."
                showAttachment
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}