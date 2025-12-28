"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

type Profile = {
  id: string;
  username: string | null;
  avatar_url?: string | null;
};

export default function ChatList({ meId }: { meId: string | null }) {
  const router = useRouter();

  // UI search (WhatsApp style)
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);

  // debounce biar gak spam query
  useEffect(() => {
    const t = setTimeout(() => {
      void runSearch();
    }, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const canSearch = useMemo(() => q.trim().length > 0, [q]);

  async function runSearch() {
    if (!canSearch) {
      setResults([]);
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, avatar_url")
      .ilike("username", `%${q.trim()}%`)
      .limit(12);

    setLoading(false);

    if (error) {
      setResults([]);
      return;
    }

    setResults((data ?? []).filter((u) => u.id !== meId));
  }

  async function startChat(otherUserId: string) {
    const { data, error } = await supabase.rpc("find_or_create_conversation", {
      other_user: otherUserId,
    });

    if (error) {
      alert(error.message);
      return;
    }

    if (data) {
      router.push(`/chat/${data}`);
      setQ("");
      setResults([]);
    }
  }

  return (
    <div className="border-t border-[#d1d7db] bg-white">
      {/* Search bar persis WA (tanpa “Tanya Meta AI”) */}
      <div className="p-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-[#f0f2f5] rounded-xl px-3 py-2 flex items-center gap-2">
            <span className="text-[#54656f] text-sm">🔍</span>
            <input
              className="w-full bg-transparent outline-none text-sm text-black placeholder:text-[#54656f]"
              placeholder="Search or start new chat"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          {/* tombol kecil “Cari” (optional, biar mirip tombol WA) */}
          <button
            type="button"
            onClick={runSearch}
            className="text-xs px-3 py-2 rounded-xl bg-[#f0f2f5] hover:bg-black/5"
          >
            Cari
          </button>
        </div>

        {/* dropdown hasil search */}
        {(loading || results.length > 0) && (
          <div className="mt-2 border border-[#d1d7db] rounded-xl overflow-hidden bg-white shadow-sm">
            {loading && (
              <div className="px-3 py-2 text-xs text-[#54656f]">
                Mencari...
              </div>
            )}

            {!loading &&
              results.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => startChat(u.id)}
                  className="w-full text-left px-3 py-2 hover:bg-black/5 flex items-center gap-3"
                >
                  <AvatarMini name={u.username ?? "U"} url={u.avatar_url ?? null} />
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">
                      {u.username ?? u.id}
                    </div>
                    <div className="text-xs text-[#54656f] truncate">
                      Klik untuk mulai chat
                    </div>
                  </div>
                </button>
              ))}

            {!loading && results.length === 0 && q.trim() && (
              <div className="px-3 py-2 text-xs text-[#54656f]">
                Tidak ada user.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function AvatarMini({ name, url }: { name: string; url: string | null }) {
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
