// app/profile/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

type Profile = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
};

export default function ProfilePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [meId, setMeId] = useState<string | null>(null);

  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const [toast, setToast] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Validasi username: 3-20, lowercase + angka
  const usernameOk = useMemo(() => {
    const u = username.trim();
    return /^[a-z0-9]{3,20}$/.test(u);
  }, [username]);

  const initials = useMemo(() => {
    const base = (username || fullName || "U").trim();
    return (base[0] ?? "U").toUpperCase();
  }, [username, fullName]);

  useEffect(() => {
    let mounted = true;

    async function boot() {
      setLoading(true);
      setErrorMsg(null);

      const { data: u } = await supabase.auth.getUser();
      const uid = u.user?.id ?? null;

      if (!uid) {
        router.replace("/auth/login");
        return;
      }

      if (!mounted) return;
      setMeId(uid);

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url")
        .eq("id", uid)
        .single();

      if (!mounted) return;

      if (error) {
        setErrorMsg(error.message);
      } else if (profile) {
        const p = profile as Profile;
        setUsername(p.username ?? "");
        setFullName(p.full_name ?? "");
        setAvatarUrl(p.avatar_url ?? "");
      }

      setLoading(false);
    }

    boot();
    return () => {
      mounted = false;
    };
  }, [router]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    if (!meId) return;
    if (!usernameOk) {
      setErrorMsg("Username tidak valid. Gunakan 3-20 karakter: huruf kecil & angka.");
      return;
    }

    setSaving(true);

    const payload = {
      id: meId,
      username: username.trim(),
      full_name: fullName.trim() || null,
      avatar_url: avatarUrl.trim() || null,
      last_seen_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("profiles").upsert(payload);

    setSaving(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    showToast("Profil berhasil disimpan ✅");
  }

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-[#f0f2f5] p-4 font-['Segoe_UI',system-ui]">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
          <div className="rounded-xl bg-black/85 text-white px-4 py-2 text-sm shadow-lg">
            {toast}
          </div>
        </div>
      )}

      <div className="w-full max-w-md">
        <div className="relative bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          {/* Back / Cancel */}
          <button
            type="button"
            onClick={() => router.push("/chat")}
            className="absolute left-4 top-4 text-sm text-[#54656f] hover:text-black"
            title="Kembali"
          >
            ← Kembali
          </button>

          <h1 className="text-xl font-semibold text-black text-center mb-6">
            Edit Profile
          </h1>

          {/* Avatar preview */}
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              {avatarUrl?.trim() ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl.trim()}
                  alt="avatar"
                  className="w-28 h-28 rounded-full object-cover border border-black/10"
                />
              ) : (
                <div className="w-28 h-28 rounded-full bg-[#dfe5e7] flex items-center justify-center border border-black/10">
                  <span className="text-3xl font-bold text-[#54656f]">
                    {initials}
                  </span>
                </div>
              )}

              {/* camera icon */}
              <div
                className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-[#00a884] flex items-center justify-center shadow-md"
                title="Change Profile Picture (simulasi)"
              >
                <span className="text-white text-lg">📷</span>
              </div>
            </div>
          </div>

          {loading ? (
            <p className="text-center text-sm text-[#54656f]">Memuat...</p>
          ) : (
            <form onSubmit={saveProfile} className="space-y-4">
              {/* Username */}
              <div>
                <label className="block text-xs font-semibold text-[#54656f] mb-2">
                  Username
                </label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="contoh: udin09"
                  className={[
                    "w-full rounded-lg border px-3 py-2 text-sm outline-none",
                    "border-black/10",
                    "focus:border-[#00a884] focus:ring-2 focus:ring-[#00a884]/20",
                  ].join(" ")}
                />
                <div className="mt-1 text-[12px] text-[#54656f]">
                  3-20 karakter, huruf kecil/angka (a-z, 0-9).
                </div>
                {!usernameOk && username.trim().length > 0 && (
                  <div className="mt-1 text-[12px] text-red-600">
                    Username tidak valid.
                  </div>
                )}
              </div>

              {/* Full name */}
              <div>
                <label className="block text-xs font-semibold text-[#54656f] mb-2">
                  Nama Lengkap
                </label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nama kamu"
                  className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-[#00a884] focus:ring-2 focus:ring-[#00a884]/20"
                />
              </div>

              {/* Avatar URL */}
              <div>
                <label className="block text-xs font-semibold text-[#54656f] mb-2">
                  Avatar URL
                </label>
                <input
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-[#00a884] focus:ring-2 focus:ring-[#00a884]/20"
                />
              </div>

              {errorMsg && (
                <div className="text-sm text-red-600">{errorMsg}</div>
              )}

              {/* Actions */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className={[
                    "flex-1 rounded-lg px-4 py-2 text-white text-sm font-semibold",
                    "bg-[#00a884] hover:bg-[#019d7b]",
                    "active:scale-[0.98] transition",
                    saving ? "opacity-80 cursor-not-allowed" : "",
                  ].join(" ")}
                >
                  {saving ? "Menyimpan..." : "Simpan"}
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/chat")}
                  className="text-sm text-[#54656f] hover:text-black"
                >
                  Batal
                </button>
              </div>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-[#54656f] mt-4">
          Tip: Avatar URL isi link gambar (jpg/png/webp).
        </p>
      </div>
    </main>
  );
}
