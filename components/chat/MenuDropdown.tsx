"use client";

export default function MenuDropdown({
  onClose,
  onLogout,
}: {
  onClose: () => void;
  onLogout: () => void;
}) {
  return (
    <div className="absolute right-0 top-12 w-56 bg-white border border-[#d1d7db] rounded-lg shadow-lg overflow-hidden z-50">
      {[
        "New Group",
        "Starred Messages",
        "Settings",
      ].map((x) => (
        <button
          key={x}
          className="w-full px-4 py-3 text-left text-sm hover:bg-black/5"
          onClick={() => {
            onClose();
            alert(`${x} (placeholder)`);
          }}
        >
          {x}
        </button>
      ))}

      <button
        className="w-full px-4 py-3 text-left text-sm hover:bg-black/5 text-red-600"
        onClick={async () => {
          onClose();
          await onLogout();
        }}
      >
        Log Out
      </button>
    </div>
  );
}
