"use client";

export default function StatusOverlay({ onClose }: { onClose: () => void }) {
  return (
    <div className="absolute inset-0 bg-black/40 z-40 flex">
      <div className="w-[380px] bg-white h-full border-r border-[#d1d7db]">
        <div className="h-14 px-3 bg-[#f0f2f5] flex items-center justify-between border-b border-[#d1d7db]">
          <div className="font-medium text-sm">Status</div>
          <button onClick={onClose} className="text-sm px-2 py-1 rounded hover:bg-black/5">✕</button>
        </div>

        <div className="p-4 text-sm text-gray-600">
          Overlay Status (placeholder). Nanti bisa dibuat stories list.
        </div>
      </div>

      <button className="flex-1" onClick={onClose} />
    </div>
  );
}
