"use client";

const EMOJIS = ["😀","😁","😂","😅","😍","😘","😎","😭","👍","🙏","🔥","❤️","🎉","✅","⭐"];

export default function EmojiPicker({
  onPick,
  onClose,
}: {
  onPick: (emoji: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="absolute bottom-12 left-0 w-56 bg-white border border-[#d1d7db] rounded-lg shadow-lg p-2 z-50">
      <div className="flex justify-between items-center mb-2">
        <div className="text-xs text-gray-600">Emoji</div>
        <button onClick={onClose} className="text-xs px-2 py-1 rounded hover:bg-black/5">✕</button>
      </div>

      <div className="grid grid-cols-8 gap-1">
        {EMOJIS.map((e) => (
          <button
            key={e}
            type="button"
            className="h-8 rounded hover:bg-black/5"
            onClick={() => onPick(e)}
          >
            {e}
          </button>
        ))}
      </div>
    </div>
  );
}
