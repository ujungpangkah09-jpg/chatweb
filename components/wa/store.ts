// components/chat/store.ts
"use client";

import { create } from "zustand";

type UIState = {
  // overlay kiri
  showStatusOverlay: boolean;
  showNewChatOverlay: boolean;
  showMenuDropdown: boolean;

  // panel kanan
  showContactInfo: boolean;
  chatSearchOpen: boolean;
  chatSearchQuery: string;

  // composer states
  composerText: string;
  editingMessageId: string | null;
  replyingToMessageId: string | null;

  // sidebar filters
  sidebarQuery: string;
  unreadOnly: boolean;

  set: (patch: Partial<UIState>) => void;
  resetComposer: () => void;
};

export const useChatUI = create<UIState>((set) => ({
  showStatusOverlay: false,
  showNewChatOverlay: false,
  showMenuDropdown: false,

  showContactInfo: false,
  chatSearchOpen: false,
  chatSearchQuery: "",

  composerText: "",
  editingMessageId: null,
  replyingToMessageId: null,

  sidebarQuery: "",
  unreadOnly: false,

  set: (patch) => set(patch),
  resetComposer: () => set({ composerText: "", editingMessageId: null, replyingToMessageId: null }),
}));
