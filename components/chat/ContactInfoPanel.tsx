"use client";

import { useChatUI } from "./store";

export default function ContactInfoPanel() {
  const ui = useChatUI();

  return (
    <div className="w-[360px] border-l border-[#d1d7db] bg-white">
      <div className="h-14 px-3 bg-[#f0f2f5] flex items-center justify-between border-b border-[#d1d7db]">
        <div className="font-medium text-sm">Contact info</div>
        <button onClick={() => ui.set({ showContactInfo: false })} className="text-sm px-2 py-1 rounded hover:bg-black/5">
          ✕
        </button>
      </div>

      <div className="p-4 text-sm text-gray-600">
        Panel ke-3 (Contact Info) — bisa diisi avatar, username, media, dll (v2).
      </div>
    </div>
  );
}
