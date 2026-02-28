"use client";

import type { ChangeEvent } from "react";
import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { SearchBar, Button, ThemeToggle } from "@/components/ui";
import MessageComposer from "@/components/chat/MessageComposer";
import ConversationFilterTabs, {
  type ConversationFilterType,
} from "@/components/chat/ConversationFilterTabs";
import ConversationList, {
  type ConversationItem,
} from "@/components/chat/ConversationList";
import { users, messages, ACCESS_TOKEN_KEY, getWebSocketChatUrl, type UserResponse } from "@/lib/api";

export type ChatMessage = { senderId: number; content: string; isOwn: boolean };

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase().slice(0, 2);
  }
  return name.slice(0, 2).toUpperCase() || "?";
}

export default function Dashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserResponse | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [userError, setUserError] = useState<string | null>(null);

  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<ConversationFilterType>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messagesByUserId, setMessagesByUserId] = useState<Record<string, ChatMessage[]>>({});
  const [messagesLoading, setMessagesLoading] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!token) {
      router.replace("/login");
      return;
    }
    users.getMe().then((result) => {
      setUserLoading(false);
      if (!result.ok) {
        if (result.error.status === 401) {
          localStorage.removeItem(ACCESS_TOKEN_KEY);
          router.replace("/login");
          return;
        }
        setUserError(result.error.message);
        return;
      }
      setCurrentUser(result.data);
    });
  }, [router]);

  // Load users as conversation list (excluding current user)
  useEffect(() => {
    if (!currentUser) return;
    users.getAll().then((result) => {
      if (!result.ok) return;
      const others = result.data.filter((u) => u.id !== currentUser.id);
      setConversations(
        others.map((u) => ({
          id: String(u.id),
          title: u.name || u.email || `User ${u.id}`,
          preview: u.email || "Click to chat",
          time: "",
          kind: "direct" as const,
        }))
      );
    });
  }, [currentUser]);

  // WebSocket: connect when we have token and currentUser; receiver gets real-time updates
  useEffect(() => {
    if (typeof window === "undefined" || !currentUser) return;
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!token) return;
    const url = getWebSocketChatUrl(token);
    if (!url) return;
    const ws = new WebSocket(url);
    wsRef.current = ws;
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data as string);
        if (typeof data.sender_id === "number" && typeof data.content === "string") {
          const senderKey = String(data.sender_id);
          const newMsg: ChatMessage = {
            senderId: data.sender_id,
            content: data.content,
            isOwn: false,
          };
          setMessagesByUserId((prev) => {
            const existing = prev[senderKey] ?? [];
            return {
              ...prev,
              [senderKey]: [...existing, newMsg],
            };
          });
        }
      } catch {
        // ignore non-JSON or invalid
      }
    };
    ws.onclose = () => {
      wsRef.current = null;
    };
    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [currentUser]);

  // Load message history when user selects a conversation (so refresh shows messages)
  useEffect(() => {
    if (!currentUser || !selectedId) return;
    setMessagesLoading(true);
    messages
      .list({ with_user_id: Number(selectedId), limit: 200 })
      .then((result) => {
        if (!result.ok) return;
        const list = result.data;
        const fromApi: ChatMessage[] = list
          .map((m) => ({
            senderId: m.sender_id,
            content: m.content,
            isOwn: m.sender_id === currentUser.id,
          }))
          .reverse();
        setMessagesByUserId((prev) => {
          const existing = prev[selectedId] ?? [];
          const seen = new Set(fromApi.map((m) => `${m.senderId}:${m.content}`));
          const extra = existing.filter((m) => !seen.has(`${m.senderId}:${m.content}`));
          return { ...prev, [selectedId]: [...fromApi, ...extra] };
        });
      })
      .finally(() => setMessagesLoading(false));
  }, [currentUser?.id, selectedId]);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) =>
    setSearchQuery(e.target.value);
  const handleSearchClear = () => setSearchQuery("");

  const filteredConversations = useMemo(() => {
    let list = conversations;
    if (filter === "direct") list = list.filter((c) => c.kind === "direct");
    else if (filter === "groups") list = list.filter((c) => c.kind === "group");
    else if (filter === "calls") list = [];
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((c) => c.title.toLowerCase().includes(q) || c.preview.toLowerCase().includes(q));
    }
    return list;
  }, [conversations, filter, searchQuery]);

  const selectedConversation = useMemo(
    () => conversations.find((c) => c.id === selectedId) ?? null,
    [conversations, selectedId]
  );

  const selectedMessages = selectedId ? messagesByUserId[selectedId] ?? [] : [];

  // Scroll to bottom when new messages arrive (so receiver sees new message)
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedMessages.length]);

  const sendMessage = useCallback(
    (content: string) => {
      if (!selectedId || !currentUser) return;
      const ws = wsRef.current;
      if (ws?.readyState !== WebSocket.OPEN) return;
      const receiverId = Number(selectedId);
      ws.send(JSON.stringify({ receiver_id: receiverId, message: content }));
      setMessagesByUserId((prev) => ({
        ...prev,
        [selectedId]: [
          ...(prev[selectedId] || []),
          { senderId: currentUser.id, content, isOwn: true },
        ],
      }));
    },
    [selectedId, currentUser]
  );

  if (userLoading) {
    return (
      <div className="app-shell app-shell-full flex flex-col items-center justify-center min-h-screen bg-zinc-100 dark:bg-zinc-950">
        <p className="text-zinc-500 dark:text-zinc-400">Loading…</p>
      </div>
    );
  }

  if (userError) {
    return (
      <div className="app-shell app-shell-full flex flex-col items-center justify-center min-h-screen bg-zinc-100 dark:bg-zinc-950 gap-2">
        <p className="text-red-500 dark:text-red-400">{userError}</p>
        <Button variant="secondary" onClick={() => router.push("/login")}>
          Back to login
        </Button>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  const goBackToList = () => setSelectedId(null);

  return (
    <div className="app-shell app-shell-full flex flex-col">
      <div className="card-full flex flex-1 min-h-0 overflow-hidden relative">
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,320px)_minmax(0,1fr)] w-full flex-1 min-h-0">
          {/* Mobile: full-screen user list when no chat selected. Desktop: sidebar */}
          <aside
            className={[
              "flex flex-col gap-4 min-h-0 border-r border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 md:p-5",
              "w-full flex-1 min-h-0 md:relative md:w-full",
              selectedId ? "hidden md:flex" : "",
            ].join(" ")}
          >
            <header className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-emerald-600 flex items-center justify-center text-xs font-semibold text-white shrink-0">
                {initials(currentUser.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100 truncate">
                  {currentUser.name || "EchoChat"}
                </p>
              </div>
              <ThemeToggle />
              <Button variant="secondary" className="text-xs px-3 py-1 h-7 shrink-0">
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
              onSelect={(id) => setSelectedId(id)}
              emptyMessage="No conversations yet"
            />
          </aside>

          {/* Main area: on mobile hidden until a conversation is selected; then shows message container */}
          <section
            className={`flex flex-col bg-zinc-50 dark:bg-zinc-950 min-h-0 flex-1 min-w-0 ${!selectedId ? "hidden md:flex" : "flex"} order-first md:order-none`}
          >
            {/* Top bar: mobile = back to user list; desktop = selected chat name */}
            <header className="shrink-0 flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 px-4 py-3 bg-white dark:bg-zinc-900/80">
              <button
                type="button"
                aria-label="Back to chats"
                className="md:hidden flex items-center justify-center h-9 w-9 -ml-1 rounded-lg text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800"
                onClick={goBackToList}
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              {selectedConversation ? (
                <>
                  <div className="h-9 w-9 rounded-xl bg-emerald-600 flex items-center justify-center text-xs font-semibold text-white shrink-0">
                    {initials(selectedConversation.title)}
                  </div>
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                    {selectedConversation.title}
                  </span>
                </>
              ) : (
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  Messages
                </span>
              )}
              {/* <div className="ml-auto">
                <ThemeToggle />
              </div> */}
            </header>

            {selectedId ? (
              <>
                <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-3 custom-scroll">
                  {messagesLoading ? (
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm text-center py-4">
                      Loading messages…
                    </p>
                  ) : selectedMessages.length === 0 ? (
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm text-center py-4">
                      No messages yet. Say hello!
                    </p>
                  ) : (
                    selectedMessages.map((msg, i) => (
                      <div
                        key={i}
                        className={`flex ${msg.isOwn ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                            msg.isOwn
                              ? "bg-emerald-500 text-white"
                              : "bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    ))
                  )}
                <div ref={messagesEndRef} />
                </div>
                <div className="shrink-0 p-3 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80">
                  <MessageComposer
                    placeholder="Type a message…"
                    sendLabel="Send"
                    onSubmit={sendMessage}
                    showAttachment={false}
                  />
                </div>
              </>
            ) : (
              <div className="flex-1 min-h-0 flex flex-col items-center justify-center px-4 py-8">
                <p className="text-zinc-600 dark:text-zinc-300 text-center text-sm">
                  {filteredConversations.length === 0
                    ? "No users to chat with yet. Register another account to test."
                    : "Select a person from the list to start chatting."}
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}