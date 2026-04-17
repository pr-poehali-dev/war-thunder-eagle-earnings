import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";

type Tab = "home" | "tasks" | "video" | "apps" | "history" | "profile" | "withdraw" | "rating";

const HERO_BG = "https://cdn.poehali.dev/projects/443c2020-4607-4cb2-9b58-3f9bc1cb5cc3/files/9f80724b-b710-467e-911f-2d8bbdbda345.jpg";

const mockTasks = [
  { id: 1, title: "Уничтожить 5 самолётов", reward: 150, progress: 3, total: 5, icon: "Crosshair", diff: "ЛЕГКО", timeLeft: "23ч" },
  { id: 2, title: "Сыграть 10 боёв в танках", reward: 320, progress: 7, total: 10, icon: "Shield", diff: "СРЕДНЕ", timeLeft: "47ч" },
  { id: 3, title: "Победить 3 раза подряд", reward: 500, progress: 1, total: 3, icon: "Trophy", diff: "СЛОЖНО", timeLeft: "72ч" },
  { id: 4, title: "Потопить 2 корабля", reward: 200, progress: 0, total: 2, icon: "Anchor", diff: "ЛЕГКО", timeLeft: "12ч" },
  { id: 5, title: "Набрать 1000 очков опыта", reward: 450, progress: 670, total: 1000, icon: "Zap", diff: "СРЕДНЕ", timeLeft: "36ч" },
  { id: 6, title: "Участвовать в командном бою", reward: 180, progress: 0, total: 1, icon: "Users", diff: "ЛЕГКО", timeLeft: "5ч" },
];

const mockVideos = [
  { id: 1, title: "Обзор танка T-72", reward: 25, duration: "0:30", watched: false },
  { id: 2, title: "Тактика воздушного боя", reward: 30, duration: "0:45", watched: false },
  { id: 3, title: "Морской бой: гайд", reward: 20, duration: "0:30", watched: true },
  { id: 4, title: "Лучшие нации War Thunder", reward: 35, duration: "1:00", watched: false },
  { id: 5, title: "Как прокачать самолёты", reward: 28, duration: "0:30", watched: true },
];

const mockApps = [
  { id: 1, name: "War Thunder Mobile", reward: 2000, platform: "iOS/Android", category: "Игра", installed: false },
  { id: 2, name: "Gaijin Tracker", reward: 800, platform: "Android", category: "Утилита", installed: false },
  { id: 3, name: "Tank Skins Catalog", reward: 500, platform: "iOS/Android", category: "Справочник", installed: true },
  { id: 4, name: "Battle Stats Pro", reward: 1200, platform: "iOS", category: "Статистика", installed: false },
];

const mockHistory = [
  { id: 1, action: "Задача выполнена: Уничтожить 5 самолётов", reward: 150, date: "17 апр, 18:22", type: "task" },
  { id: 2, action: "Просмотр рекламы", reward: 25, date: "17 апр, 16:45", type: "video" },
  { id: 3, action: "Установка приложения: Tank Skins Catalog", reward: 500, date: "16 апр, 11:30", type: "app" },
  { id: 4, action: "Просмотр рекламы", reward: 30, date: "16 апр, 09:15", type: "video" },
  { id: 5, action: "Задача выполнена: Командный бой", reward: 180, date: "15 апр, 21:00", type: "task" },
  { id: 6, action: "Вывод орлов", reward: -1000, date: "14 апр, 14:00", type: "withdraw" },
];

const mockRating = [
  { rank: 1, name: "SteelPanzer_RU", eagles: 58420, badge: "🥇" },
  { rank: 2, name: "Кот_в_Танке", eagles: 49100, badge: "🥈" },
  { rank: 3, name: "AeroBomber_77", eagles: 42300, badge: "🥉" },
  { rank: 4, name: "IvanTheGreat", eagles: 38750, badge: null },
  { rank: 5, name: "Волк_Стальной", eagles: 34200, badge: null },
  { rank: 6, name: "Вы (Commander_X)", eagles: 12480, badge: null, isMe: true },
  { rank: 7, name: "PanzerLord_88", eagles: 11900, badge: null },
  { rank: 8, name: "Sky_Ace_Pro", eagles: 10350, badge: null },
];

const diffColor: Record<string, string> = {
  "ЛЕГКО": "text-green-400",
  "СРЕДНЕ": "text-yellow-400",
  "СЛОЖНО": "text-red-400",
};

export default function Index() {
  const [tab, setTab] = useState<Tab>("home");
  const [eagles, setEagles] = useState(12480);
  const [watchingId, setWatchingId] = useState<number | null>(null);
  const [watchProgress, setWatchProgress] = useState(0);
  const [videos, setVideos] = useState(mockVideos);
  const [apps, setApps] = useState(mockApps);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawMethod, setWithdrawMethod] = useState("steam");
  const [botScore, setBotScore] = useState(0);
  const [clicks, setClicks] = useState<{ x: number; y: number; t: number }[]>([]);
  const videosRef = useRef(videos);
  useEffect(() => { videosRef.current = videos; }, [videos]);

  const trackClick = (e: React.MouseEvent) => {
    const now = Date.now();
    const newClick = { x: e.clientX, y: e.clientY, t: now };
    const updated = [...clicks.slice(-9), newClick];
    setClicks(updated);
    if (updated.length >= 5) {
      const times = updated.slice(-5).map((c) => c.t);
      const intervals = times.slice(1).map((t, i) => t - times[i]);
      const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const variance = intervals.reduce((a, b) => a + Math.abs(b - avg), 0) / intervals.length;
      const suspicious = variance < 50 && avg < 300;
      setBotScore(suspicious ? Math.min(botScore + 20, 100) : Math.max(botScore - 5, 0));
    }
  };

  useEffect(() => {
    if (watchingId === null) return;
    setWatchProgress(0);
    const interval = setInterval(() => {
      setWatchProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          const vid = videosRef.current.find((v) => v.id === watchingId);
          if (vid && !vid.watched) {
            setEagles((prev) => prev + vid.reward);
            setVideos((prev) =>
              prev.map((v) => (v.id === watchingId ? { ...v, watched: true } : v))
            );
          }
          setWatchingId(null);
          return 100;
        }
        return p + 2;
      });
    }, 60);
    return () => clearInterval(interval);
  }, [watchingId]);

  const navItems: { id: Tab; icon: string; label: string }[] = [
    { id: "home", icon: "Home", label: "База" },
    { id: "tasks", icon: "Crosshair", label: "Задачи" },
    { id: "video", icon: "Play", label: "Видео" },
    { id: "apps", icon: "Download", label: "Игры" },
    { id: "history", icon: "Clock", label: "История" },
    { id: "withdraw", icon: "Banknote", label: "Вывод" },
    { id: "rating", icon: "BarChart2", label: "Рейтинг" },
    { id: "profile", icon: "User", label: "Профиль" },
  ];

  return (
    <div className="min-h-screen camo-bg hud-grid text-foreground flex flex-col" onClick={trackClick}>
      {/* TICKER */}
      <div className="bg-black/60 border-b border-yellow-700/30 overflow-hidden h-7 flex items-center">
        <div className="flex animate-ticker whitespace-nowrap">
          {[...Array(2)].map((_, i) => (
            <span key={i} className="text-xs font-oswald text-yellow-600/80 tracking-widest mr-16">
              ⚔ ОПЕРАЦИЯ СТАЛЬНОЙ ГОМ ⚔ &nbsp;•&nbsp; ЗОЛОТЫЕ ОРЛЫ АКТИВИРОВАНЫ &nbsp;•&nbsp; КОМАНДИР, К БОЮ ГОТОВ &nbsp;•&nbsp; ВЫПОЛНЯЙ ЗАДАНИЯ — ПОЛУЧАЙ ОРЛОВ &nbsp;•&nbsp; ЗАЩИТА ОТ БОТОВ АКТИВНА &nbsp;•&nbsp;
            </span>
          ))}
        </div>
      </div>

      {/* HEADER */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-25" style={{ backgroundImage: `url(${HERO_BG})` }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-background/90" />
        <div className="relative z-10 flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-sm bg-yellow-600/20 border border-yellow-600/50 flex items-center justify-center">
              <span className="text-lg">⚡</span>
            </div>
            <div>
              <div className="font-oswald text-base tracking-widest leading-none">WT EARN</div>
              <div className="text-[10px] text-muted-foreground tracking-widest">КОМАНДНЫЙ ЦЕНТР</div>
            </div>
          </div>
          <div className="corner-bracket px-3 py-1.5 bg-black/50 border border-yellow-700/40 rounded-sm flex items-center gap-2 gold-glow">
            <span className="text-yellow-400 animate-pulse-gold text-base">🦅</span>
            <div>
              <div className="font-oswald text-lg text-yellow-400 leading-none">{eagles.toLocaleString("ru-RU")}</div>
              <div className="text-[9px] text-yellow-600 tracking-widest">ЗОЛОТЫХ ОРЛОВ</div>
            </div>
          </div>
        </div>
        {botScore > 40 && (
          <div className="relative z-10 mx-4 mb-2 px-3 py-1.5 bg-red-900/40 border border-red-700/50 rounded-sm flex items-center gap-2 animate-slide-in">
            <Icon name="AlertTriangle" size={14} className="text-red-400" />
            <span className="text-xs text-red-400 font-oswald tracking-wider">
              {botScore > 70 ? "⚠ ПОДОЗРИТЕЛЬНАЯ АКТИВНОСТЬ" : "Анализ активности..."}
            </span>
            <div className="ml-auto w-16 h-1 bg-red-900 rounded">
              <div className="h-1 bg-red-500 rounded transition-all" style={{ width: `${botScore}%` }} />
            </div>
          </div>
        )}
      </header>

      {/* CONTENT */}
      <main className="flex-1 overflow-y-auto px-4 pb-24 pt-2">
        {tab === "home" && <HomeTab eagles={eagles} />}
        {tab === "tasks" && <TasksTab />}
        {tab === "video" && (
          <VideoTab videos={videos} watchingId={watchingId} watchProgress={watchProgress} onWatch={setWatchingId} />
        )}
        {tab === "apps" && (
          <AppsTab
            apps={apps}
            onInstall={(id) => {
              const app = apps.find((a) => a.id === id);
              if (app && !app.installed) {
                setEagles((prev) => prev + app.reward);
                setApps((prev) => prev.map((a) => (a.id === id ? { ...a, installed: true } : a)));
              }
            }}
          />
        )}
        {tab === "history" && <HistoryTab />}
        {tab === "withdraw" && (
          <WithdrawTab
            eagles={eagles}
            amount={withdrawAmount}
            setAmount={setWithdrawAmount}
            method={withdrawMethod}
            setMethod={setWithdrawMethod}
          />
        )}
        {tab === "rating" && <RatingTab eagles={eagles} />}
        {tab === "profile" && <ProfileTab eagles={eagles} />}
      </main>

      {/* NAV */}
      <nav className="fixed bottom-0 inset-x-0 bg-black/85 border-t border-yellow-700/25 backdrop-blur-sm z-50">
        <div className="flex justify-around items-center h-16 px-1">
          {navItems.map((item) => (
            <button key={item.id} className={`nav-btn ${tab === item.id ? "active" : ""}`} onClick={() => setTab(item.id)}>
              <Icon name={item.icon as string} size={18} />
              <span className="text-[9px] tracking-widest">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

function SectionHeader({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex items-center gap-2 pb-2 border-b border-yellow-700/20">
      <Icon name={icon} size={16} className="text-yellow-500" />
      <span className="font-oswald text-sm tracking-widest uppercase">{label}</span>
      <div className="flex-1 h-px bg-gradient-to-r from-yellow-700/20 to-transparent ml-2" />
    </div>
  );
}

function HomeTab({ eagles }: { eagles: number }) {
  const activeTasks = mockTasks.filter((t) => t.progress < t.total);
  return (
    <div className="space-y-5">
      <div className="relative rounded-sm overflow-hidden border border-yellow-700/30 animate-fade-in-up">
        <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: `url(${HERO_BG})` }} />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        <div className="relative z-10 p-5">
          <div className="text-xs text-yellow-600 tracking-widest font-oswald mb-1">СТАТУС КОМАНДИРА</div>
          <div className="font-oswald text-3xl text-yellow-400 mb-0.5">{eagles.toLocaleString("ru-RU")}</div>
          <div className="text-xs text-muted-foreground mb-4">золотых орлов на счету</div>
          <div className="flex gap-3">
            {[
              { val: activeTasks.length, label: "АКТИВНЫХ", color: "text-green-400" },
              { val: 2, label: "ВЫПОЛНЕНО", color: "text-yellow-400" },
              { val: 6, label: "РАНГ", color: "text-blue-400" },
            ].map((s, i) => (
              <div key={i} className="bg-black/50 border border-yellow-700/30 rounded-sm px-3 py-2 text-center">
                <div className={`font-oswald text-xl ${s.color}`}>{s.val}</div>
                <div className="text-[9px] text-muted-foreground tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <SectionHeader icon="Crosshair" label="Активные задания" />
        <div className="space-y-2 mt-2">
          {activeTasks.slice(0, 3).map((task, i) => (
            <div key={task.id} className={`task-card p-3 animate-fade-in-up delay-${(i + 1) * 100}`}>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-sm bg-yellow-600/15 border border-yellow-700/30 flex items-center justify-center shrink-0">
                  <Icon name={task.icon as string} size={16} className="text-yellow-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-sm font-rubik leading-tight">{task.title}</span>
                    <span className="text-yellow-400 font-oswald text-sm shrink-0">+{task.reward} 🦅</span>
                  </div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`text-[9px] font-oswald tracking-widest ${diffColor[task.diff]}`}>{task.diff}</span>
                    <span className="text-[9px] text-muted-foreground">• {task.timeLeft} осталось</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${(task.progress / task.total) * 100}%` }} />
                  </div>
                  <div className="text-[9px] text-muted-foreground mt-1">{task.progress} / {task.total}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="animate-fade-in-up delay-400">
        <SectionHeader icon="Gift" label="Ежедневный бонус" />
        <div className="mt-2 grid grid-cols-7 gap-1.5">
          {[50, 80, 120, 200, 150, 300, 500].map((val, i) => (
            <div key={i} className={`rounded-sm border p-1.5 text-center ${i < 2 ? "bg-yellow-600/20 border-yellow-600/50" : "bg-muted/30 border-border"}`}>
              <div className="text-[8px] text-muted-foreground font-oswald">Д{i + 1}</div>
              <div className={`text-xs font-oswald ${i < 2 ? "text-yellow-400" : "text-muted-foreground"}`}>{val}</div>
              {i < 2 && <div className="text-[8px]">✓</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TasksTab() {
  const [filter, setFilter] = useState<"all" | "active" | "done">("all");
  const filtered =
    filter === "all" ? mockTasks : filter === "active" ? mockTasks.filter((t) => t.progress < t.total) : mockTasks.filter((t) => t.progress >= t.total);
  return (
    <div>
      <SectionHeader icon="Crosshair" label="Боевые задания" />
      <div className="flex gap-2 mt-3 mb-4">
        {(["all", "active", "done"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 text-xs font-oswald tracking-widest rounded-sm border transition-all ${filter === f ? "bg-yellow-600/20 border-yellow-600/50 text-yellow-400" : "border-border text-muted-foreground hover:border-yellow-700/40"}`}
          >
            {f === "all" ? "ВСЕ" : f === "active" ? "АКТИВНЫЕ" : "ВЫПОЛНЕНЫ"}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {filtered.map((task, i) => {
          const done = task.progress >= task.total;
          return (
            <div key={task.id} className={`task-card p-3 animate-fade-in-up delay-${Math.min(i * 100 + 100, 600)}`}>
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-sm border flex items-center justify-center shrink-0 ${done ? "bg-green-600/20 border-green-600/40" : "bg-yellow-600/10 border-yellow-700/30"}`}>
                  <Icon name={task.icon as string} size={18} className={done ? "text-green-400" : "text-yellow-500"} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-sm font-rubik">{task.title}</span>
                    <span className="text-yellow-400 font-oswald text-sm ml-2 shrink-0">+{task.reward} 🦅</span>
                  </div>
                  <div className="flex gap-3 mb-2 text-[9px]">
                    <span className={`font-oswald tracking-widest ${diffColor[task.diff]}`}>{task.diff}</span>
                    <span className="text-muted-foreground">⏱ {task.timeLeft}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${Math.min((task.progress / task.total) * 100, 100)}%` }} />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[9px] text-muted-foreground">{task.progress} / {task.total}</span>
                    {done && <span className="text-[9px] text-green-400 font-oswald tracking-wider">ВЫПОЛНЕНО ✓</span>}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function VideoTab({ videos, watchingId, watchProgress, onWatch }: {
  videos: typeof mockVideos;
  watchingId: number | null;
  watchProgress: number;
  onWatch: (id: number) => void;
}) {
  const unwatched = videos.filter((v) => !v.watched).length;
  return (
    <div>
      <SectionHeader icon="Play" label="Видеореклама" />
      <div className="mt-1 mb-4 px-3 py-2 bg-yellow-600/10 border border-yellow-700/30 rounded-sm flex items-center gap-2">
        <Icon name="Info" size={14} className="text-yellow-500 shrink-0" />
        <span className="text-xs text-yellow-600">Доступно {unwatched} видео для просмотра</span>
      </div>
      {watchingId !== null && (
        <div className="mb-4 p-4 bg-black/60 border border-yellow-700/40 rounded-sm animate-fade-in-up">
          <div className="text-xs text-yellow-600 font-oswald tracking-widest mb-2">ТРАНСЛЯЦИЯ...</div>
          <div className="w-full bg-muted/20 h-32 rounded-sm flex items-center justify-center mb-3 border border-border">
            <Icon name="Play" size={32} className="text-yellow-500 animate-pulse-gold" />
          </div>
          <div className="progress-bar h-2 mb-1">
            <div className="progress-fill h-2" style={{ width: `${watchProgress}%` }} />
          </div>
          <div className="text-xs text-muted-foreground">{watchProgress}%</div>
        </div>
      )}
      <div className="space-y-2">
        {videos.map((video, i) => (
          <div key={video.id} className={`task-card p-3 animate-fade-in-up delay-${Math.min(i * 100 + 100, 600)} ${video.watched ? "opacity-60" : ""}`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-sm border flex items-center justify-center shrink-0 ${video.watched ? "bg-muted/20 border-border" : "bg-blue-600/15 border-blue-700/30"}`}>
                {video.watched ? <Icon name="CheckCircle" size={18} className="text-green-500" /> : <Icon name="PlayCircle" size={18} className="text-blue-400" />}
              </div>
              <div className="flex-1">
                <div className="text-sm font-rubik mb-0.5">{video.title}</div>
                <div className="text-[9px] text-muted-foreground">⏱ {video.duration}</div>
              </div>
              <div className="text-right">
                <div className="text-yellow-400 font-oswald mb-1">+{video.reward} 🦅</div>
                <button
                  onClick={() => !video.watched && watchingId === null && onWatch(video.id)}
                  disabled={video.watched || watchingId !== null}
                  className={`text-[10px] font-oswald tracking-widest px-2 py-1 rounded-sm border transition-all ${
                    video.watched ? "border-border text-muted-foreground cursor-default" : watchingId !== null ? "border-border text-muted-foreground cursor-not-allowed opacity-50" : "border-yellow-600/50 text-yellow-500 hover:bg-yellow-600/10"
                  }`}
                >
                  {video.watched ? "ПРОСМОТРЕНО" : "СМОТРЕТЬ"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AppsTab({ apps, onInstall }: { apps: typeof mockApps; onInstall: (id: number) => void }) {
  return (
    <div>
      <SectionHeader icon="Download" label="Установка приложений" />
      <div className="space-y-2 mt-3">
        {apps.map((app, i) => (
          <div key={app.id} className={`task-card p-4 animate-fade-in-up delay-${Math.min(i * 100 + 100, 600)}`}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-sm bg-olive/20 border border-olive/30 flex items-center justify-center shrink-0">
                <Icon name="Smartphone" size={22} className="text-yellow-600" />
              </div>
              <div className="flex-1">
                <div className="font-oswald text-sm tracking-wide mb-0.5">{app.name}</div>
                <div className="text-[9px] text-muted-foreground mb-1">{app.platform} • {app.category}</div>
                <div className="text-yellow-400 font-oswald text-sm">+{app.reward.toLocaleString("ru-RU")} 🦅</div>
              </div>
              <button
                onClick={() => onInstall(app.id)}
                disabled={app.installed}
                className={`px-3 py-2 text-xs font-oswald tracking-widest rounded-sm border transition-all ${
                  app.installed ? "bg-green-900/20 border-green-700/40 text-green-500 cursor-default" : "bg-yellow-600/15 border-yellow-600/50 text-yellow-400 hover:bg-yellow-600/25"
                }`}
              >
                {app.installed ? "УСТАНОВЛЕНО" : "УСТАНОВИТЬ"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HistoryTab() {
  return (
    <div>
      <SectionHeader icon="Clock" label="История операций" />
      <div className="space-y-2 mt-3">
        {mockHistory.map((item, i) => (
          <div key={item.id} className={`task-card p-3 animate-fade-in-up delay-${Math.min(i * 100 + 100, 600)}`}>
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-sm border flex items-center justify-center shrink-0 ${item.type === "withdraw" ? "bg-red-900/20 border-red-700/30" : item.type === "task" ? "bg-yellow-600/15 border-yellow-700/30" : "bg-blue-900/20 border-blue-700/30"}`}>
                <Icon
                  name={item.type === "withdraw" ? "ArrowUpRight" : item.type === "task" ? "Crosshair" : "Play"}
                  size={14}
                  className={item.type === "withdraw" ? "text-red-400" : item.type === "task" ? "text-yellow-500" : "text-blue-400"}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-rubik leading-tight">{item.action}</div>
                <div className="text-[9px] text-muted-foreground mt-0.5">{item.date}</div>
              </div>
              <div className={`font-oswald text-sm shrink-0 ${item.reward < 0 ? "text-red-400" : "text-yellow-400"}`}>
                {item.reward > 0 ? "+" : ""}{item.reward} 🦅
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WithdrawTab({ eagles, amount, setAmount, method, setMethod }: {
  eagles: number;
  amount: string;
  setAmount: (v: string) => void;
  method: string;
  setMethod: (v: string) => void;
}) {
  const [nickname, setNickname] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const methods = [
    { id: "gaijin", label: "War Thunder (Gaijin)", icon: "Crosshair" },
    { id: "pixelstorm", label: "War Thunder Pixel Storm", icon: "Zap" },
  ];
  const num = parseInt(amount) || 0;
  const nicknameOk = nickname.trim().length >= 3;
  const canWithdraw = num >= 150 && num <= eagles && nicknameOk;

  if (submitted) {
    return (
      <div>
        <SectionHeader icon="Banknote" label="Вывод орлов" />
        <div className="mt-6 flex flex-col items-center text-center gap-4 animate-fade-in-up p-6 bg-green-900/20 border border-green-700/40 rounded-sm">
          <div className="w-14 h-14 rounded-sm bg-green-600/20 border border-green-600/40 flex items-center justify-center text-3xl">✅</div>
          <div>
            <div className="font-oswald text-lg text-green-400 tracking-widest mb-1">ЗАЯВКА ПРИНЯТА</div>
            <div className="text-sm text-muted-foreground">
              Зачисление <span className="text-yellow-400 font-oswald">{num.toLocaleString("ru-RU")} 🦅</span> на аккаунт
            </div>
            <div className="mt-1 text-sm font-oswald text-foreground tracking-wide">{nickname}</div>
            <div className="text-xs text-muted-foreground mt-2">Обработка заявки: до 24 часов</div>
          </div>
          <button
            onClick={() => { setSubmitted(false); setAmount(""); setNickname(""); }}
            className="px-4 py-2 text-xs font-oswald tracking-widest border border-border text-muted-foreground rounded-sm hover:border-yellow-700/40 transition-all"
          >
            НОВАЯ ЗАЯВКА
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SectionHeader icon="Banknote" label="Вывод орлов" />
      <div className="mt-3 p-4 bg-yellow-600/10 border border-yellow-600/30 rounded-sm animate-fade-in-up">
        <div className="text-xs text-yellow-600 font-oswald tracking-widest mb-1">ДОСТУПНО ДЛЯ ВЫВОДА</div>
        <div className="font-oswald text-3xl text-yellow-400">{eagles.toLocaleString("ru-RU")} 🦅</div>
        <div className="text-xs text-muted-foreground mt-1">Минимальная сумма вывода: 150 орлов</div>
      </div>

      <div className="mt-4 space-y-3 animate-fade-in-up delay-100">
        <div className="text-xs text-muted-foreground font-oswald tracking-widest mb-2">СПОСОБ ВЫВОДА</div>
        {methods.map((m) => (
          <div key={m.id} onClick={() => setMethod(m.id)} className={`task-card p-3 flex items-center gap-3 cursor-pointer ${method === m.id ? "border-yellow-600/60 bg-yellow-600/10" : ""}`}>
            <Icon name={m.icon as string} size={18} className={method === m.id ? "text-yellow-400" : "text-muted-foreground"} />
            <span className={`text-sm font-rubik ${method === m.id ? "text-foreground" : "text-muted-foreground"}`}>{m.label}</span>
            {method === m.id && <Icon name="CheckCircle" size={14} className="text-yellow-400 ml-auto" />}
          </div>
        ))}
      </div>

      {method === "gaijin" && (
        <div className="mt-4 animate-fade-in-up">
          <div className="p-4 bg-yellow-900/15 border border-yellow-700/30 rounded-sm space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Icon name="Crosshair" size={15} className="text-yellow-500" />
              <span className="font-oswald text-sm text-yellow-500 tracking-widest">ИНСТРУКЦИЯ GAIJIN</span>
            </div>
            {[
              { step: "1", text: "Запусти War Thunder и войди в свой аккаунт" },
              { step: "2", text: "Твой никнейм отображается в правом верхнем углу главного экрана — это имя над иконкой профиля" },
              { step: "3", text: "Также никнейм можно найти в «Профиль» → «Личные данные» → поле «Позывной»" },
              { step: "4", text: "Скопируй точный позывной (с учётом регистра и символов) и введи его ниже" },
              { step: "5", text: "После отправки заявки орлы поступят на твой Gaijin-аккаунт в течение 24 часов" },
            ].map((s) => (
              <div key={s.step} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-sm bg-yellow-700/20 border border-yellow-600/30 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[10px] font-oswald text-yellow-500">{s.step}</span>
                </div>
                <span className="text-xs text-muted-foreground leading-relaxed">{s.text}</span>
              </div>
            ))}
            <div className="flex items-start gap-2 pt-1 border-t border-yellow-700/20 mt-2">
              <Icon name="AlertTriangle" size={13} className="text-yellow-600 shrink-0 mt-0.5" />
              <span className="text-xs text-yellow-600">Указывай именно <span className="text-yellow-400 font-oswald">никнейм (позывной)</span> игрока, а не почту или логин от аккаунта</span>
            </div>
          </div>
        </div>
      )}

      {method === "pixelstorm" && (
        <div className="mt-4 animate-fade-in-up">
          <div className="p-4 bg-blue-900/20 border border-blue-700/40 rounded-sm space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Icon name="Zap" size={15} className="text-blue-400" />
              <span className="font-oswald text-sm text-blue-400 tracking-widest">ИНСТРУКЦИЯ PIXEL STORM</span>
            </div>
            {[
              { step: "1", text: "Запусти War Thunder и войди в свой аккаунт" },
              { step: "2", text: "Твой никнейм виден в правом верхнем углу главного экрана над иконкой профиля" },
              { step: "3", text: "Также найти его можно в «Профиль» → «Личные данные» → поле «Позывной»" },
              { step: "4", text: "Введи точный никнейм ниже и выбери сумму для вывода" },
              { step: "5", text: "Нажми «Вывести орлов» — зачисление через Pixel Storm произойдёт в течение 24 часов" },
            ].map((s) => (
              <div key={s.step} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-sm bg-blue-700/30 border border-blue-600/40 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[10px] font-oswald text-blue-400">{s.step}</span>
                </div>
                <span className="text-xs text-muted-foreground leading-relaxed">{s.text}</span>
              </div>
            ))}
            <div className="flex items-start gap-2 pt-1 border-t border-blue-700/30 mt-2">
              <Icon name="AlertTriangle" size={13} className="text-yellow-600 shrink-0 mt-0.5" />
              <span className="text-xs text-yellow-600">Указывай именно <span className="text-yellow-400 font-oswald">никнейм (позывной)</span> игрока, а не почту или логин от аккаунта</span>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 animate-fade-in-up delay-200">
        <label className="text-xs text-muted-foreground font-oswald tracking-widest block mb-2">
          НИКНЕЙМ В WAR THUNDER
        </label>
        <div className="relative">
          <Icon name="User" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Например: Commander_X"
            className="w-full bg-muted/30 border border-border rounded-sm pl-9 pr-3 py-2.5 text-foreground font-rubik text-sm focus:outline-none focus:border-yellow-600/50 placeholder:text-muted-foreground"
          />
        </div>
        {nickname.length > 0 && nickname.trim().length < 3 && (
          <div className="text-xs text-red-400 mt-1 flex items-center gap-1">
            <Icon name="AlertCircle" size={12} /> Минимум 3 символа
          </div>
        )}
        {nicknameOk && (
          <div className="text-xs text-green-400 mt-1 flex items-center gap-1">
            <Icon name="CheckCircle" size={12} /> Орлы будут зачислены на: <span className="font-oswald ml-1">{nickname}</span>
          </div>
        )}
      </div>

      <div className="mt-4 animate-fade-in-up delay-300">
        <label className="text-xs text-muted-foreground font-oswald tracking-widest block mb-2">СУММА ВЫВОДА</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Минимум 150 орлов..."
          className="w-full bg-muted/30 border border-border rounded-sm px-3 py-2.5 text-foreground font-rubik text-sm focus:outline-none focus:border-yellow-600/50 placeholder:text-muted-foreground"
        />
        {num > 0 && num < 150 && (
          <div className="text-xs text-red-400 mt-1 flex items-center gap-1">
            <Icon name="AlertCircle" size={12} /> Минимум 150 орлов
          </div>
        )}
        {num > eagles && (
          <div className="text-xs text-red-400 mt-1 flex items-center gap-1">
            <Icon name="AlertCircle" size={12} /> Недостаточно орлов на счету
          </div>
        )}
      </div>

      <button
        disabled={!canWithdraw}
        onClick={() => canWithdraw && setSubmitted(true)}
        className={`mt-4 w-full py-3 font-oswald text-sm tracking-widest rounded-sm border transition-all animate-fade-in-up delay-400 ${canWithdraw ? "bg-yellow-600 border-yellow-500 text-black hover:bg-yellow-500" : "bg-muted/20 border-border text-muted-foreground cursor-not-allowed"}`}
      >
        ВЫВЕСТИ ОРЛОВ
      </button>
    </div>
  );
}

function RatingTab({ eagles }: { eagles: number }) {
  return (
    <div>
      <SectionHeader icon="BarChart2" label="Рейтинг командиров" />
      <div className="mt-3 space-y-2">
        {mockRating.map((player, i) => (
          <div key={player.rank} className={`task-card p-3 flex items-center gap-3 animate-fade-in-up delay-${Math.min(i * 100, 600)} ${player.isMe ? "border-yellow-600/50 bg-yellow-600/10" : ""}`}>
            <div className={`font-oswald text-base w-7 text-center shrink-0 ${player.rank <= 3 ? "text-yellow-400" : "text-muted-foreground"}`}>
              {player.badge || `#${player.rank}`}
            </div>
            <div className="flex-1 min-w-0">
              <span className={`text-sm font-rubik ${player.isMe ? "text-yellow-400" : "text-foreground"}`}>
                {player.name} {player.isMe && <span className="text-[9px] text-yellow-600">(ВЫ)</span>}
              </span>
            </div>
            <div className="font-oswald text-sm text-yellow-500 shrink-0">{player.eagles.toLocaleString("ru-RU")} 🦅</div>
          </div>
        ))}
      </div>
      <div className="mt-4 p-3 bg-muted/20 border border-border rounded-sm text-center animate-fade-in-up delay-600">
        <div className="text-xs text-muted-foreground font-oswald tracking-wider">ВАША ПОЗИЦИЯ</div>
        <div className="font-oswald text-2xl text-yellow-400 mt-1">#6 из 1 247</div>
        <div className="text-xs text-muted-foreground mt-1">До топ-5 осталось: {(mockRating[4].eagles - eagles).toLocaleString("ru-RU")} орлов</div>
      </div>
    </div>
  );
}

function ProfileTab({ eagles }: { eagles: number }) {
  return (
    <div>
      <SectionHeader icon="User" label="Личный кабинет" />
      <div className="mt-3 animate-fade-in-up">
        <div className="flex items-center gap-4 p-4 bg-muted/20 border border-border rounded-sm mb-4">
          <div className="w-16 h-16 rounded-sm bg-yellow-600/20 border border-yellow-600/40 flex items-center justify-center text-3xl">🎖️</div>
          <div>
            <div className="font-oswald text-lg tracking-wide">Commander_X</div>
            <div className="text-xs text-muted-foreground">Звание: Лейтенант</div>
            <div className="text-xs text-yellow-500 mt-1">Участник с: Январь 2024</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {[
            { label: "Всего заработано", value: "14 880 🦅", icon: "TrendingUp" },
            { label: "Задач выполнено", value: "47", icon: "CheckSquare" },
            { label: "Видео просмотрено", value: "128", icon: "Play" },
            { label: "Приложений устан.", value: "3", icon: "Download" },
          ].map((stat, i) => (
            <div key={i} className={`p-3 bg-muted/20 border border-border rounded-sm animate-fade-in-up delay-${i * 100 + 100}`}>
              <Icon name={stat.icon as string} size={14} className="text-muted-foreground mb-1" />
              <div className="font-oswald text-base">{stat.value}</div>
              <div className="text-[9px] text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
        <div className="space-y-1">
          {["Настройки уведомлений", "Привязать аккаунт War Thunder", "Политика конфиденциальности", "Выйти из аккаунта"].map((item, i) => (
            <div key={i} className={`task-card p-3 flex items-center justify-between animate-fade-in-up delay-${Math.min(i * 100 + 300, 600)}`}>
              <span className="text-sm font-rubik">{item}</span>
              <Icon name="ChevronRight" size={16} className="text-muted-foreground" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}