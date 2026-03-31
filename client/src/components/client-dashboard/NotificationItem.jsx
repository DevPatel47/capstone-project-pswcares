const NotificationItem = ({ item }) => {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-brand-100/60 bg-white px-3 py-2.5">
      <span className={`mt-0.5 h-2 w-2 rounded-full ${item.tone}`} />
      <div>
        {item.kind ? (
          <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {item.kind}
          </p>
        ) : null}
        <p className="text-sm text-slate-700">{item.text}</p>
        <p className="text-[11px] text-slate-400">{item.time}</p>
      </div>
    </div>
  );
};

export default NotificationItem;
