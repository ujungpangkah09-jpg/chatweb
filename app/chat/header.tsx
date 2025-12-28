"use client";

import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function ChatHeader() {
  const router = useRouter();

  async function logout() {
    await supabase.auth.signOut();
    router.push("/auth/login");
  }

  return (
    <header className="h-14 border-b flex items-center justify-between px-4">
      <h1 className="font-semibold">Chat App</h1>
      <button
        onClick={logout}
        className="text-sm border rounded px-3 py-1"
      >
        Logout
      </button>
    </header>
  );
}
