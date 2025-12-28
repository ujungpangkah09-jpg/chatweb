"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase/client";
import { usePathname, useRouter } from "next/navigation";
import ChatRow from "./ChatRow";

type Profile = { id: string; username: string | null; avatar_url: string | null };
type Conv = { id: string; created_at: string };
type LastMsg = { body: string | null; created_at: string };

export default function ChatList({ meId }: { meId: string | null }) {
  const router = useRouter();
  const pathname = usePathname();
  const activeId = useMemo(() => {
    const m = pathname.match(/\/chat\/(.+)$/);
    return m?.[1] ?? null;
  }, [pathname]);

  // search user
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Profile[]>([]);

  // list
  const [convs, setConvs] = useState<Conv[]>([]);
  const [otherByConv, setOtherByConv] = useState<Record<string, string>>({});
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [last, setLast] = useState<Record<string, LastMsg>>({});

  useEffect(() => {
    if (!meId) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meId]);

  async function load() {
    const { data: mem } = await supabase
      .from("conversation_members")
      .select("conversation_id")
      .eq("user_id", meId!)
      .limit(200);

    const ids = (mem ?? []).map((x: any) => x.conversation_id);
    if (!ids.length) return setConvs([]);

    const { data: convData } = await supabase
      .from("conversations")
      .select("id, created_at")
      .in("id", ids)
      .order("created_at", { ascending: false });

    setConvs((convData ?? []) as Conv[]);

    const { data: members } = await supabase
      .from("conversation_members")
      .select("conversation_id, user_id")
      .in("conversation_id", ids);

    const mapOther: Record<string, string> = {};
    const otherIds: string[] = [];
    (members ?? []).forEach((m: any) => {
      if (m.user_id !== meId) {
        mapOther[m.conversation_id] = m.user_id;
        otherIds.push(m.user_id);
      }
    });
    setOtherByConv(mapOther);

    const unique = Array.from(new Set(otherIds));
    const { data: profs } = await supabase
      .from("profiles")
      .select("id, username, avatar_url")
      .in("id", unique);

    const pmap: Record<string, Profile> = {};
    (profs ?? []).forEach((p: any) => (pmap[p.id] = p));
    setProfiles(pmap);

    // last message simple (loop)
    const lm: Record<string, LastMsg> = {};
    for (const c of (convData ?? []).slice(0, 50) as any[]) {
      const { data: m } = await supabase
        .from("messages")
        .select("body, created_at")
        .eq("conversation_id", c.id)
        .order("created_at", { ascending: false })
        .limit(1);
      if (m?.[0]) lm[c.id] = m[0] as any;
    }
    setLast(lm);
  }

  async function searchUser() {
    if (!q.trim()) return setResults([]);

    const { data } = await supabase
      .from("profiles")
      .select("id, username, avatar_url")
      .ilike("username", `%${q.trim()}%`)
      .limit(10);

    setResults((data ?? []).filter((u: any) => u.id !== meId));
  }

  async function startChat(otherUserId: string) {
    const { data, error } = await supabase.rpc("find_or_create_conversation", {
      other_user: otherUserId,
    });
    if (error) return alert(error.message);

    setQ("");
    setResults([]);
    router.push(`/chat/${data}`);
    load();
  }

  return (
    <>
      {/* search like WA */}
      <div className="p-2 border-b border-[#d1d7db]">
        <div className="flex gap-2">
          <input
            className="flex-1 bg-[#f0f2f5] rounded-full px-4 py-2 text-sm outline-none"
            placeholder="Search or start new chat"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && searchUser()}
          />
          <button className="text-sm px-3" onClick={searchUser}>
            Cari
          </button>
        </div>

        {results.length > 0 && (
          <div className="mt-2 border rounded-md overflow-hidden">
            {results.map((u) => (
              <button
                key={u.id}
                onClick={() => startChat(u.id)}
                className="w-full text-left px-3 py-2 hover:bg-[#f5f6f6] text-sm flex items-center gap-3"
              >
                <Avatar url={u.avatar_url} name={u.username ?? "?"} />
                <div className="font-medium">{u.username ?? u.id}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* conversation list */}
      <div className="flex-1 overflow-auto">
        {convs.length === 0 ? (
          <div className="p-4 text-sm text-gray-500">Belum ada chat.</div>
        ) : (
          convs.map((c) => {
            const otherId = otherByConv[c.id];
            const p = otherId ? profiles[otherId] : null;
            const lm = last[c.id];

            return (
              <ChatRow
                key={c.id}
                active={activeId === c.id}
                title={p?.username ?? "Chat"}
                subtitle={lm?.body ?? "Mulai chat…"}
                time={lm?.created_at ?? null}
                avatarUrl={p?.avatar_url ?? null}
                onClick={() => router.push(`/chat/${c.id}`)}
              />
            );
          })
        )}
      </div>
    </>
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
