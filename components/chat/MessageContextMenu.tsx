"use client";

export default function MessageContextMenu({
  onClose,
  onReply,
  onEdit,
  onDelete,
}: {
  onClose: () => void;
  onReply: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const items = [
    { label: "Reply", onClick: onReply },
    { label: "React (v2)", onClick: () => alert("Emoji reactions v2") },
    { label: "Forward (v2)", onClick: () => alert("Forward v2") },
    { label: "Star (v2)", onClick: () => alert("Star v2") },
    { label: "Edit", onClick: onEdit },
    { label: "Delete", onClick: onDelete },
  ];

  return (
    <div className="absolute right-0 top-0 mt-2 w-44 bg-white border border-[#d1d7db] rounded-lg shadow-lg overflow-hidden z-50">
      {items.map((it) => (
        <button
          key={it.label}
          className="w-full px-3 py-2 text-left text-sm hover:bg-black/5"
          onClick={() => {
            onClose();
            it.onClick();
          }}
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}
