import { Link } from "react-router-dom";

const MessagePreview = ({ item }) => {
  return (
    <Link
      className="flex items-center justify-between gap-3 rounded-xl border border-brand-100/60 bg-white px-3 py-2.5 transition hover:bg-brand-50"
      to={`/client/chat?appointmentId=${encodeURIComponent(item.appointmentId)}`}
    >
      <div>
        <p className="text-sm font-semibold text-slate-900">{item.name}</p>
        <p className="text-xs text-slate-500 truncate max-w-[180px]">
          {item.preview}
        </p>
      </div>
      <span className="text-[11px] text-slate-400">{item.time}</span>
    </Link>
  );
};

export default MessagePreview;
