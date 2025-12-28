// app/chat/layout.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import ChatShell from "@/components/chat/ChatShell";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;

      if (!data.session) router.replace("/auth/login");
      else setReady(true);
    })();

    return () => {
      mounted = false;
    };
  }, [router]);

  if (!ready) return null;

  return <ChatShell>{children}</ChatShell>;
}
