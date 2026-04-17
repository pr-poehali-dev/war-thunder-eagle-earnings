import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";

const WITHDRAW_URL = "https://functions.poehali.dev/a32193e6-9e21-42d9-8df2-0c6b58338b72";
const ADMIN_PASSWORD = "wtearn2024";

interface Request {
  id: number;
  nickname: string;
  amount: number;
  method: string;
  status: "pending" | "done" | "rejected";
  created_at: string;
}

const statusLabel: Record<string, { label: string; color: string; bg: string }> = {
  pending:  { label: "ОЖИДАЕТ",    color: "text-yellow-400", bg: "bg-yellow-600/15 border-yellow-600/40" },
  done:     { label: "ВЫПОЛНЕНО",  color: "text-green-400",  bg: "bg-green-600/15 border-green-600/40" },
  rejected: { label: "ОТКЛОНЕНО", color: "text-red-400",    bg: "bg-red-600/15 border-red-600/40" },
};

const methodLabel: Record<string, string> = {
  gaijin:     "Gaijin",
  pixelstorm: "Pixel Storm",
};

export default function Admin() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [pwError, setPwError] = useState(false);

  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "done" | "rejected">("all");
  const [updating, setUpdating] = useState<number | null>(null);

  const login = () => {
    if (password === ADMIN_PASSWORD) {
      setAuthed(true);
      setPwError(false);
    } else {
      setPwError(true);
    }
  };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch(WITHDRAW_URL);
      const raw = await res.json();
      const data = typeof raw === "string" ? JSON.parse(raw) : raw;
      setRequests(data.requests || []);
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authed) fetchRequests();
  }, [authed]);

  const updateStatus = async (id: number, status: string) => {
    setUpdating(id);
    try {
      const res = await fetch(WITHDRAW_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const raw = await res.json();
      const data = typeof raw === "string" ? JSON.parse(raw) : raw;
      if (data.success) {
        setRequests(prev => prev.map(r => r.id === id ? { ...r, status: status as Request["status"] } : r));
      }
    } finally {
      setUpdating(null);
    }
  };

  const filtered = filter === "all" ? requests : requests.filter(r => r.status === filter);

  const counts = {
    all: requests.length,
    pending: requests.filter(r => r.status === "pending").length,
    done: requests.filter(r => r.status === "done").length,
    rejected: requests.filter(r => r.status === "rejected").length,
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });
  };

  if (!authed) {
    return (
      <div className="min-h-screen camo-bg hud-grid flex items-center justify-center px-4">
        <div className="w-full max-w-sm animate-fade-in-up">
          <div className="border border-yellow-700/30 rounded-sm p-8 bg-black/60 gold-glow">
            <div className="text-center mb-6">
              <div className="text-3xl mb-2">⚡</div>
              <div className="font-oswald text-xl tracking-widest text-foreground">WT EARN</div>
              <div className="text-xs text-muted-foreground tracking-widest mt-1">ПАНЕЛЬ УПРАВЛЕНИЯ</div>
            </div>
            <label className="text-xs text-muted-foreground font-oswald tracking-widest block mb-2">ПАРОЛЬ ДОСТУПА</label>
            <input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setPwError(false); }}
              onKeyDown={e => e.key === "Enter" && login()}
              placeholder="Введите пароль..."
              className="w-full bg-muted/30 border border-border rounded-sm px-3 py-2.5 text-foreground font-rubik text-sm focus:outline-none focus:border-yellow-600/50 placeholder:text-muted-foreground mb-2"
            />
            {pwError && (
              <div className="flex items-center gap-1 text-xs text-red-400 mb-2">
                <Icon name="AlertCircle" size={12} /> Неверный пароль
              </div>
            )}
            <button
              onClick={login}
              className="w-full py-2.5 font-oswald text-sm tracking-widest bg-yellow-600 border border-yellow-500 text-black rounded-sm hover:bg-yellow-500 transition-all"
            >
              ВОЙТИ
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen camo-bg hud-grid text-foreground">
      {/* Header */}
      <div className="border-b border-yellow-700/25 bg-black/70 backdrop-blur-sm px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl">⚡</span>
          <div>
            <div className="font-oswald text-base tracking-widest">WT EARN — АДМИН</div>
            <div className="text-[10px] text-muted-foreground tracking-widest">УПРАВЛЕНИЕ ЗАЯВКАМИ</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchRequests}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-oswald tracking-widest border border-yellow-700/40 text-yellow-500 rounded-sm hover:bg-yellow-600/10 transition-all"
          >
            <Icon name="RefreshCw" size={13} className={loading ? "animate-spin" : ""} />
            ОБНОВИТЬ
          </button>
          <button
            onClick={() => setAuthed(false)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-oswald tracking-widest border border-border text-muted-foreground rounded-sm hover:border-red-700/40 hover:text-red-400 transition-all"
          >
            <Icon name="LogOut" size={13} />
            ВЫЙТИ
          </button>
        </div>
      </div>

      <div className="px-6 py-5">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-5">
          {([
            { key: "all",      label: "ВСЕГО",      color: "text-foreground",  icon: "List" },
            { key: "pending",  label: "ОЖИДАЮТ",    color: "text-yellow-400",  icon: "Clock" },
            { key: "done",     label: "ВЫПОЛНЕНО",  color: "text-green-400",   icon: "CheckCircle" },
            { key: "rejected", label: "ОТКЛОНЕНО",  color: "text-red-400",     icon: "XCircle" },
          ] as const).map(s => (
            <div
              key={s.key}
              onClick={() => setFilter(s.key)}
              className={`cursor-pointer p-4 border rounded-sm transition-all ${filter === s.key ? "border-yellow-600/50 bg-yellow-600/10" : "border-border bg-muted/20 hover:border-yellow-700/30"}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon name={s.icon} size={14} className={s.color} />
                <span className="text-[9px] font-oswald tracking-widest text-muted-foreground">{s.label}</span>
              </div>
              <div className={`font-oswald text-2xl ${s.color}`}>{counts[s.key]}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-muted-foreground">
            <Icon name="Loader" size={20} className="animate-spin" />
            <span className="font-oswald tracking-widest text-sm">ЗАГРУЗКА...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Icon name="Inbox" size={32} className="mx-auto mb-3 opacity-40" />
            <div className="font-oswald tracking-widest text-sm">ЗАЯВОК НЕТ</div>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Table header */}
            <div className="grid grid-cols-12 gap-3 px-4 py-2 text-[9px] font-oswald tracking-widest text-muted-foreground border-b border-border">
              <div className="col-span-1">#</div>
              <div className="col-span-3">НИКНЕЙМ</div>
              <div className="col-span-2">СУММА</div>
              <div className="col-span-2">МЕТОД</div>
              <div className="col-span-2">ДАТА</div>
              <div className="col-span-2">СТАТУС / ДЕЙСТВИЕ</div>
            </div>

            {filtered.map((req, i) => {
              const s = statusLabel[req.status];
              return (
                <div
                  key={req.id}
                  className={`grid grid-cols-12 gap-3 items-center px-4 py-3 border rounded-sm transition-all animate-fade-in-up ${i < 6 ? `delay-${i * 100}` : ""} border-border bg-muted/10 hover:border-yellow-700/20`}
                >
                  <div className="col-span-1 text-xs text-muted-foreground font-oswald">#{req.id}</div>
                  <div className="col-span-3">
                    <div className="text-sm font-rubik text-foreground truncate">{req.nickname}</div>
                  </div>
                  <div className="col-span-2">
                    <span className="font-oswald text-yellow-400 text-sm">{req.amount.toLocaleString("ru-RU")} 🦅</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-xs text-muted-foreground font-rubik">{methodLabel[req.method] || req.method}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[10px] text-muted-foreground">{formatDate(req.created_at)}</span>
                  </div>
                  <div className="col-span-2 flex items-center gap-1.5">
                    <span className={`text-[9px] font-oswald tracking-widest px-1.5 py-0.5 border rounded-sm ${s.bg} ${s.color}`}>
                      {s.label}
                    </span>
                    {req.status !== "done" && (
                      <button
                        onClick={() => updateStatus(req.id, "done")}
                        disabled={updating === req.id}
                        className="w-6 h-6 flex items-center justify-center border border-green-700/40 rounded-sm hover:bg-green-600/15 transition-all"
                        title="Выполнено"
                      >
                        {updating === req.id
                          ? <Icon name="Loader" size={11} className="animate-spin text-muted-foreground" />
                          : <Icon name="Check" size={11} className="text-green-400" />
                        }
                      </button>
                    )}
                    {req.status !== "rejected" && (
                      <button
                        onClick={() => updateStatus(req.id, "rejected")}
                        disabled={updating === req.id}
                        className="w-6 h-6 flex items-center justify-center border border-red-700/40 rounded-sm hover:bg-red-600/15 transition-all"
                        title="Отклонить"
                      >
                        <Icon name="X" size={11} className="text-red-400" />
                      </button>
                    )}
                    {req.status !== "pending" && (
                      <button
                        onClick={() => updateStatus(req.id, "pending")}
                        disabled={updating === req.id}
                        className="w-6 h-6 flex items-center justify-center border border-yellow-700/40 rounded-sm hover:bg-yellow-600/15 transition-all"
                        title="Вернуть в ожидание"
                      >
                        <Icon name="RotateCcw" size={11} className="text-yellow-500" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
