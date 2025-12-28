"use client";

export default function AttachmentMenu({ onClose }: { onClose: () => void }) {
  const items = [
    { label: "Document", icon: "📄" },
    { label: "Photos & Videos", icon: "🖼️" },
    { label: "Camera", icon: "📷" },
    { label: "Contact", icon: "👤" },
    { label: "Poll", icon: "📊" },
  ];

  return (
    <div className="absolute bottom-12 left-0 w-48 bg-white border border-[#d1d7db] rounded-lg shadow-lg overflow-hidden z-50">
      {items.map((it) => (
        <button
          key={it.label}
          className="w-full px-3 py-2 text-left text-sm hover:bg-black/5 flex items-center gap-2"
          onClick={() => {
            onClose();
            alert(`${it.label} (v2)`);
          }}
        >
          <span>{it.icon}</span>
          <span>{it.label}</span>
        </button>
      ))}
    </div>
  );
}
