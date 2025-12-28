"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase/client";
import { useRouter } from "next/navigation";

type Profile = { id: string; username: string | null; avatar_url: string | null };
type Contact = { id: string; requester_id: string; addressee_id: string; status: string };

export default function ContactsPanel({ meId }: { meId: string | null }) {
  const router = useRouter();

  const [q, setQ] = useState("");
  const [results, setResults] = useState<Profile[]>([]);
  const [incoming, setIncoming] = useState<(Contact & { from?: Profile })[]>([]);
  const [friends, setFriends] = useState<(Profile)[]>([]);

  useEffect(() => {
    if (!meId) return;
    loadIncoming();
    loadFriends();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meId]);

  async function searchUser() {
    if (!q.trim()) return setResults([]);
    const { data } = await supabase
      .from("profiles")
      .select("id, username, avatar_url")
      .ilike("username", `%${q.trim()}%`)
      .limit(10);

    setResults((data ?? []).filter((u: any) => u.id !== meId));
  }

  async function sendRequest(toId: string) {
    const { error } = await supabase.from("contacts").insert({
      requester_id: meId,
      addressee_id: toId,
      status: "pending",
    });

    if (error) return alert(error.message);
    alert("Request terkirim ✅");
    setResults([]);
    setQ("");
  }

  async function loadIncoming() {
    const { data } = await supabase
      .from("contacts")
      .select("id, requester_id, addressee_id, status")
      .eq("addressee_id", meId!)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    const reqs = (data ?? []) as any[];

    const fromIds = Array.from(new Set(reqs.map((r) => r.requester_id)));
    const { data: profs } = await supabase
      .from("profiles")
      .select("id, username, avatar_url")
      .in("id", fromIds);

    const map: Record<string, Profile> = {};
    (profs ?? []).forEach((p: any) => (map[p.id] = p));

    setIncoming(reqs.map((r) => ({ ...r, from: map[r.requester_id] })));
  }

  async function accept(reqId: string) {
    const { error } = await supabase.rpc("accept_contact", { req_id: reqId });
    if (error) return alert(error.message);
    await loadIncoming();
    await loadFriends();
  }

  async function loadFriends() {
    // accepted rows yang melibatkan meId
    const { data } = await supabase
      .from("contacts")
      .select("requester_id, addressee_id, status")
      .or(`requester_id.eq.${meId},addressee_id.eq.${meId}`)
      .eq("status", "accepted");

    const rows = (data ?? []) as any[];
    const friendIds = Array.from(
      new Set(
        rows.map((r) => (r.requester_id === meId ? r.addressee_id : r.requester_id))
      )
    );

    if (!friendIds.length) return setFriends([]);

    const { data: profs } = await supabase
      .from("profiles")
      .select("id, username, avatar_url")
      .in("id", friendIds);

    setFriends((profs ?? []) as any);
  }

  async function chatWith(friendId: string) {
    const { data, error } = await supabase.rpc("find_or_create_conversation", {
      other_user: friendId,
    });
    if (error) return alert(error.message);
    router.push(`/chat/${data}`);
  }

  return (
    <div className="border-b border-[#d1d7db]">
      {/* Add friend */}
      <div className="p-2">
        <div className="flex gap-2">
          <input
            className="flex-1 bg-[#f0f2f5] rounded-full px-4 py-2 text-sm outline-none"
            placeholder="Tambah teman (username)"
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
              <div key={u.id} className="px-3 py-2 flex items-center gap-3 hover:bg-[#f5f6f6]">
                <Avatar url={u.avatar_url} name={u.username ?? "?"} />
                <div className="flex-1">
                  <div className="text-sm font-medium">{u.username ?? u.id}</div>
                </div>
                <button
                  className="text-xs border rounded px-2 py-1"
                  onClick={() => sendRequest(u.id)}
                >
                  Add
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Incoming requests */}
      {incoming.length > 0 && (
        <div className="px-2 pb-2">
          <div className="text-xs text-gray-500 px-2 mb-1">Request masuk</div>
          <div className="border rounded-md overflow-hidden">
            {incoming.map((r) => (
              <div key={r.id} className="px-3 py-2 flex items-center gap-3 hover:bg-[#f5f6f6]">
                <Avatar url={r.from?.avatar_url ?? null} name={r.from?.username ?? "?"} />
                <div className="flex-1">
                  <div className="text-sm font-medium">{r.from?.username ?? r.requester_id}</div>
                  <div className="text-xs text-gray-500">ingin berteman</div>
                </div>
                <button className="text-xs border rounded px-2 py-1" onClick={() => accept(r.id)}>
                  Accept
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friends list quick actions */}
      <div className="px-2 pb-2">
        <div className="text-xs text-gray-500 px-2 mb-1">Teman</div>
        {friends.length === 0 ? (
          <div className="text-sm text-gray-500 px-2 pb-2">Belum ada teman.</div>
        ) : (
          <div className="border rounded-md overflow-hidden">
            {friends.map((f) => (
              <button
                key={f.id}
                className="w-full px-3 py-2 flex items-center gap-3 hover:bg-[#f5f6f6] text-left"
                onClick={() => chatWith(f.id)}
              >
                <Avatar url={f.avatar_url} name={f.username ?? "?"} />
                <div className="text-sm font-medium">{f.username ?? f.id}</div>
                <div className="ml-auto text-xs text-gray-500">Chat</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Avatar({ url, name }: { url: string | null; name: string }) {
  const letter = (name?.[0] ?? "?").toUpperCase();
  return url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt="avatar" className="w-9 h-9 rounded-full object-cover" />
  ) : (
    <div className="w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center">
      <span className="text-sm font-semibold text-white">{letter}</span>
    </div>
  );
}
