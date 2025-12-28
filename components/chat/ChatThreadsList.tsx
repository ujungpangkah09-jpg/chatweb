// components/chat/ChatThreadsList.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useChatUI } from "./store";

type Thread = {
  conversation_id: string;
  other_id: string;
  other_username: string | null;
  other_avatar_url: string | null;
  last_body: string | null;
  last_at: string | null;
  unread_count: number;
};

export default function ChatThreadsList() {
  const router = useRouter();
  const pathname = usePathname();
  const ui = useChatUI();

  const [meId, setMeId] = useState<string | null>(null);
  const [threads, setThreads] = useState<Thread[]>([]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setMeId(data.user?.id ?? null));
  }, []);

  useEffect(() => {
    if (!meId) return;

    let mounted = true;

    (async () => {
      // MVP query sederhana:
      // ambil semua conversation_id milik saya
      const { data: cms } = await supabase
        .from("conversation_members")
        .select("conversation_id")
        .eq("user_id", meId);

      const convIds = (cms ?? []).map((x: any) => x.conversation_id);
      if (!convIds.length) return setThreads([]);

      // ambil peer user untuk tiap conversation (via RPC one-by-one sederhana v1)
      // (kalau mau cepat/rapi: nanti bikin SQL view)
      const out: Thread[] = [];

      for (const cid of convIds) {
        const { data: peerId } = await supabase.rpc("get_conversation_peer", { conv_id: cid });
        if (!peerId) continue;

        const { data: peer } = await supabase
          .from("profiles")
          .select("id, username, avatar_url")
          .eq("id", peerId)
          .single();

        const { data: lastMsg } = await supabase
          .from("messages")
          .select("body, created_at, sender_id, read_at")
          .eq("conversation_id", cid)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        // unread (simple): pesan dari lawan yang read_at masih null
        const { count } = await supabase
          .from("messages")
          .select("id", { count: "exact", head: true })
          .eq("conversation_id", cid)
          .neq("sender_id", meId)
          .is("read_at", null);

        out.push({
          conversation_id: cid,
          other_id: peer?.id ?? peerId,
          other_username: peer?.username ?? null,
          other_avatar_url: peer?.avatar_url ?? null,
          last_body: lastMsg?.body ?? null,
          last_at: lastMsg?.created_at ?? null,
          unread_count: count ?? 0,
        });
      }

      // sort by last_at desc
      out.sort((a, b) => (b.last_at ?? "").localeCompare(a.last_at ?? ""));

      if (mounted) setThreads(out);
    })();

    return () => {
      mounted = false;
    };
  }, [meId]);

  // filter realtime
  const filtered = useMemo(() => {
    const q = ui.sidebarQuery.trim().toLowerCase();
    return threads.filter((t) => {
      if (ui.unreadOnly && t.unread_count <= 0) return false;
      if (!q) return true;
      const name = (t.other_username ?? "").toLowerCase();
      const last = (t.last_body ?? "").toLowerCase();
      return name.includes(q) || last.includes(q);
    });
  }, [threads, ui.sidebarQuery, ui.unreadOnly]);

  return (
    <div className="flex-1 overflow-auto">
      {filtered.map((t) => {
        const active = pathname?.includes(t.conversation_id);

        return (
          <button
            key={t.conversation_id}
            onClick={() => router.push(`/chat/${t.conversation_id}`)}
            className={[
              "w-full px-3 py-3 flex items-center gap-3 border-b border-[#f0f2f5] hover:bg-black/5 text-left",
              active ? "bg-black/5" : "bg-white",
            ].join(" ")}
          >
            <Avatar url={t.other_avatar_url} name={t.other_username ?? "?"} />

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <div className="font-medium text-sm truncate">
                  {t.other_username ?? "Unknown"}
                </div>
                <div className="text-[11px] text-gray-500 whitespace-nowrap">
                  {t.last_at ? fmtClock(t.last_at) : ""}
                </div>
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className="text-sm text-gray-600 truncate">
                  {t.last_body ?? "—"}
                </div>

                {t.unread_count > 0 && (
                  <div className="min-w-[20px] h-5 px-2 rounded-full bg-[#25d366] text-white text-[11px] grid place-items-center">
                    {t.unread_count}
                  </div>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function Avatar({ url, name }: { url: string | null; name: string }) {
  const letter = (name?.[0] ?? "?").toUpperCase();
  return url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt="avatar" className="w-12 h-12 rounded-full object-cover" />
  ) : (
    <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
      <span className="text-sm font-semibold text-white">{letter}</span>
    </div>
  );
}

function fmtClock(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
