"use client";

import type { ChangeEvent } from "react";
import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SearchBar, Button, ThemeToggle } from "@/components/ui";
import MessageComposer from "@/components/chat/MessageComposer";
import ConversationFilterTabs, {
  type ConversationFilterType,
} from "@/components/chat/ConversationFilterTabs";
import ConversationList, {
  type ConversationItem,
} from "@/components/chat/ConversationList";
import { users, ACCESS_TOKEN_KEY, type UserResponse } from "@/lib/api";

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

  const [conversations] = useState<ConversationItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<ConversationFilterType>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  /** On mobile: false = show main message screen; true = expand sidebar (conversations list) */
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
        // Only redirect to login when token is missing or expired (401)
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

  const closeSidebar = () => setSidebarOpen(false);
  const openSidebar = () => setSidebarOpen(true);

  return (
    <div className="app-shell app-shell-full flex flex-col">
      <div className="card-full flex flex-1 min-h-0 overflow-hidden relative">
        {/* Mobile: backdrop when sidebar is open; click to close */}
        <button
          type="button"
          aria-label="Close menu"
          className={`md:hidden fixed inset-0 z-30 bg-black/40 dark:bg-zinc-950/70 transition-opacity ${sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
          onClick={closeSidebar}
        />

        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,320px)_minmax(0,1fr)] w-full flex-1 min-h-0">
          {/* Sidebar: on mobile, overlay that slides in from left; on desktop always visible when no chat selected */}
          <aside
            className={[
              "flex flex-col gap-4 min-h-0 border-r border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 md:p-5",
              "md:flex md:relative",
              "fixed inset-y-0 left-0 z-40 w-[280px] max-w-[85vw] transform transition-transform duration-200 ease-out",
              selectedId ? "hidden md:flex" : "",
              sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
            ].join(" ")}
          >
            <header className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Close conversations"
                className="md:hidden shrink-0 flex items-center justify-center h-9 w-9 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800"
                onClick={closeSidebar}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="h-9 w-9 rounded-xl bg-emerald-600 flex items-center justify-center text-xs font-semibold text-white shrink-0">
                {initials(currentUser.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100 truncate">
                  {currentUser.name || "EchoChat"}
                </p>
                <p className="text-[0.7rem] text-zinc-500 truncate" title={currentUser.email}>
                  Signed in as {currentUser.email}
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
              onSelect={(id) => {
                setSelectedId(id);
                closeSidebar();
              }}
              emptyMessage="No conversations yet"
            />
          </aside>

          {/* Main area: on mobile this is the default view (message screen); empty state when no data */}
          <section className="flex flex-col bg-zinc-50 dark:bg-zinc-950 min-h-0 flex-1 min-w-0 order-first md:order-none">
            {/* Mobile: top bar with menu icon so user can expand sidebar */}
            <header className="md:hidden shrink-0 flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 px-4 py-3 bg-white dark:bg-zinc-900/80">
              <button
                type="button"
                aria-label="Open conversations"
                className="flex items-center justify-center h-9 w-9 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800"
                onClick={openSidebar}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Messages</span>
              <div className="ml-auto">
                <ThemeToggle />
              </div>
            </header>

            <div className="flex-1 min-h-0 flex flex-col items-center justify-center px-4 py-8">
              <p className="text-zinc-600 dark:text-zinc-300 text-center text-sm">
                {filteredConversations.length === 0
                  ? "No conversations yet"
                  : selectedId
                    ? "No messages yet"
                    : "Select a conversation"}
              </p>
              {filteredConversations.length === 0 && (
                <p className="text-zinc-500 text-center text-xs mt-1">
                  Start a new chat to get started.
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}