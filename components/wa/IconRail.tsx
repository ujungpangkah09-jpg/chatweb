"use client";

export default function IconRail() {
  // versi simple (tanpa icon library)
  return (
    <div className="w-[64px] bg-[#f0f2f5] border-r border-[#d1d7db] flex flex-col items-center py-3 gap-3">
      <div className="w-10 h-10 rounded-full bg-gray-300" title="Profile" />
      <div className="w-10 h-10 rounded-full bg-white border" title="Chats" />
      <div className="w-10 h-10 rounded-full bg-white border" title="Status" />
      <div className="w-10 h-10 rounded-full bg-white border" title="Community" />

      <div className="flex-1" />

      <div className="w-10 h-10 rounded-full bg-white border" title="Settings" />
    </div>
  );
}
