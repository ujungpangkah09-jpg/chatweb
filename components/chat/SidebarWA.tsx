// components/chat/SidebarWA.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useChatUI } from "./store";
import ChatThreadsList from "./ChatThreadsList";
import StatusOverlay from "./StatusOverlay";
import NewChatOverlay from "./NewChatOverlay";
import MenuDropdown from "./MenuDropdown";

type Profile = { id: string; username: string | null; avatar_url: string | null };

export default function SidebarWA() {
  const router = useRouter();
  const ui = useChatUI();
  const [me, setMe] = useState<Profile | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data } = await supabase.auth.getUser();
      const uid = data.user?.id;
      if (!uid || !mounted) return;

      const { data: p } = await supabase
        .from("profiles")
        .select("id, username, avatar_url")
        .eq("id", uid)
        .single();

      if (mounted) setMe((p ?? null) as any);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/auth/login");
  }

  return (
    <aside className="w-[380px] border-r border-[#d1d7db] flex flex-col bg-white relative">
      {/* Top Bar */}
      <div className="h-14 px-3 flex items-center justify-between bg-[#f0f2f5] border-b border-[#d1d7db]">
        <div className="flex items-center gap-2 min-w-0">
          <Avatar url={me?.avatar_url ?? null} name={me?.username ?? "Me"} />
          <div className="min-w-0">
            <div className="text-sm font-medium truncate">{me?.username ?? "User"}</div>
          </div>
        </div>

        <div className="flex items-center gap-2 relative">
          {/* Status */}
          <button
            className="w-9 h-9 rounded-full hover:bg-black/5 grid place-items-center"
            title="Status"
            onClick={() => ui.set({ showStatusOverlay: true, showMenuDropdown: false })}
          >
            ◯
          </button>

          {/* New Chat */}
          <button
            className="w-9 h-9 rounded-full hover:bg-black/5 grid place-items-center"
            title="New chat"
            onClick={() => ui.set({ showNewChatOverlay: true, showMenuDropdown: false })}
          >
            ＋
          </button>

          {/* Menu */}
          <button
            className="w-9 h-9 rounded-full hover:bg-black/5 grid place-items-center"
            title="Menu"
            onClick={() => ui.set({ showMenuDropdown: !ui.showMenuDropdown })}
          >
            ⋮
          </button>

          {ui.showMenuDropdown && (
            <MenuDropdown
              onLogout={logout}
              onClose={() => ui.set({ showMenuDropdown: false })}
            />
          )}
        </div>
      </div>

      {/* Search + Unread filter */}
      <div className="px-3 py-2 bg-white">
        <div className="flex gap-2 items-center">
          <div className="flex-1 bg-[#f0f2f5] rounded-lg px-3 py-2 flex items-center gap-2">
            <span className="text-gray-500">🔍</span>
            <input
              className="bg-transparent outline-none text-sm w-full"
              placeholder="Pencarian"
              value={ui.sidebarQuery}
              onChange={(e) => ui.set({ sidebarQuery: e.target.value })}
            />
          </div>

          <button
            className={[
              "h-10 px-3 rounded-lg text-sm border",
              ui.unreadOnly ? "bg-[#d9fdd3] border-[#25d366]" : "bg-white border-[#d1d7db]",
            ].join(" ")}
            onClick={() => ui.set({ unreadOnly: !ui.unreadOnly })}
            title="Unread filter"
          >
            Unread
          </button>
        </div>

        {/* Archived section */}
        <button
          className="mt-2 w-full flex items-center justify-between px-2 py-2 rounded-lg hover:bg-black/5 text-sm"
          onClick={() => alert("Archived v2 (placeholder)")}
        >
          <span className="flex items-center gap-2">
            <span>🗄️</span>
            <span>Diarsipkan</span>
          </span>
          <span className="text-xs text-gray-500">0</span>
        </button>
      </div>

      {/* Threads List */}
      <ChatThreadsList />

      {/* Overlays */}
      {ui.showStatusOverlay && <StatusOverlay onClose={() => ui.set({ showStatusOverlay: false })} />}
      {ui.showNewChatOverlay && <NewChatOverlay onClose={() => ui.set({ showNewChatOverlay: false })} />}
    </aside>
  );
}

function Avatar({ url, name }: { url: string | null; name: string }) {
  const letter = (name?.[0] ?? "?").toUpperCase();
  return url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
  ) : (
    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
      <span className="text-sm font-semibold text-white">{letter}</span>
    </div>
  );
}
