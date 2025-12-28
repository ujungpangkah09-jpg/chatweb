"use client";

export default function ChatRow({
  active,
  title,
  subtitle,
  time,
  avatarUrl,
  onClick,
}: {
  active: boolean;
  title: string;
  subtitle: string;
  time: string | null;
  avatarUrl: string | null;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "w-full px-3 py-3 border-b border-[#f0f2f5] flex items-center gap-3 hover:bg-[#f5f6f6]",
        active ? "bg-[#f0f2f5]" : "",
      ].join(" ")}
    >
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatarUrl} className="w-10 h-10 rounded-full object-cover" alt="avatar" />
      ) : (
        <div className="w-10 h-10 rounded-full bg-gray-300" />
      )}

      <div className="min-w-0 flex-1 text-left">
        <div className="text-sm font-medium truncate">{title}</div>
        <div className="text-xs text-gray-500 truncate">{subtitle}</div>
      </div>

      <div className="text-[11px] text-gray-500">
        {time
          ? new Date(time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          : ""}
      </div>
    </button>
  );
}
