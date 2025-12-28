// components/chat/ChatShell.tsx
"use client";

import SidebarWA from "./SidebarWA";
import ContactInfoPanel from "./ContactInfoPanel";
import { useChatUI } from "./store";

export default function ChatShell({ children }: { children: React.ReactNode }) {
  const ui = useChatUI();

  return (
    <div className="h-screen w-screen bg-[#0b141a] p-4">
      <div className="mx-auto h-full max-w-[1400px] rounded-lg overflow-hidden shadow-xl bg-white flex">
        {/* LEFT: Sidebar */}
        <SidebarWA />

        {/* MIDDLE: Chat content route */}
        <div className="flex-1 min-w-0 flex">
          <div className="flex-1 min-w-0">{children}</div>

          {/* RIGHT: Contact info (panel 3) */}
          {ui.showContactInfo && <ContactInfoPanel />}
        </div>
      </div>
    </div>
  );
}
