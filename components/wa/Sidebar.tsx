"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase/client";
import ChatList from "./ChatList";
import { useRouter } from "next/navigation";
import ContactsPanel from "./ContactsPanel";

type Profile = {
  id: string;
  username: string | null;
  avatar_url: string | null;
};

export default function Sidebar() {
  const router = useRouter();
  const [meId, setMeId] = useState<string | null>(null);
  const [me, setMe] = useState<Profile | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadMe() {
      const { data } = await supabase.auth.getUser();
      const uid = data.user?.id ?? null;
      if (!mounted) return;

      setMeId(uid);
      if (!uid) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("id, username, avatar_url")
        .eq("id", uid)
        .single();

      if (!mounted) return;
      setMe((profile ?? null) as any);
    }

    loadMe();
    return () => {
      mounted = false;
    };
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/auth/login");
  }

  return (
    <aside className="w-[360px] border-r border-[#d1d7db] flex flex-col bg-white">
      {/* top bar WA */}
      <div className="h-14 px-3 flex items-center justify-between bg-[#f0f2f5]">
        <div className="flex items-center gap-2 min-w-0">
          <Avatar url={me?.avatar_url ?? null} name={me?.username ?? "Me"} />
          <div className="min-w-0">
            <div className="text-sm font-medium truncate">
              {me?.username ?? "User"}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push("/profile")}
            className="text-xs border rounded px-2 py-1"
            title="Edit profile"
          >
            Profile
          </button>

          <button
            onClick={logout}
            className="text-xs border rounded px-2 py-1"
          >
            Logout
          </button>
        </div>
      </div>

      <ContactsPanel meId={meId} />
      <ChatList meId={meId} />
    </aside>
  );
}

function Avatar({ url, name }: { url: string | null; name: string }) {
  const letter = (name?.[0] ?? "?").toUpperCase();
  return url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt="avatar"
      className="w-9 h-9 rounded-full object-cover"
    />
  ) : (
    <div className="w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center">
      <span className="text-sm font-semibold text-white">{letter}</span>
    </div>
  );
}
