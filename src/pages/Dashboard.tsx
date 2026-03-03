// src/pages/Dashboard.tsx
// Full-width bento-grid layout — Linear / Modern design system
// Fully responsive: mobile → tablet → desktop
// Perfect dark AND light mode via explicit Tailwind dark: classes

import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Play, ChevronRight, Sparkles, Clock, TrendingUp,
  Key, BarChart3, Zap, Target, Activity, Trophy, BookOpen,
  ArrowUpRight, CheckCircle2, XCircle, AlertTriangle,
  Flame, TrendingDown, ArrowRight,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
} from "recharts";

import { useUser }                        from "@/api/auth.query";
import { useMyAssessments }               from "@/api/assessment.query";
import { useMyResults }                   from "@/api/results.query";
import { Spinner }                        from "@/components/ui/spinner";
import type { Assessment, ResultSummary } from "@/types";
import Navbar from "./components/Navbar";

// ─────────────────────────────────────────────────────────────────────────────
// Design tokens / helpers
// ─────────────────────────────────────────────────────────────────────────────

const accColor = (n: number) =>
  n >= 70 ? "#22c55e" : n >= 50 ? "#f59e0b" : "#ef4444";

// Explicit, non-transparent card surface for both modes
const CARD =
  "relative overflow-hidden rounded-2xl " +
  "bg-white border border-black/[0.07] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.06)] " +
  "dark:bg-[#0d0d10] dark:border-white/[0.07] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.055),0_4px_32px_rgba(0,0,0,0.5)]";

const STATUS_CFG = {
  PENDING:   { label: "Draft",   dot: "bg-yellow-400", pill: "border-yellow-500/30 bg-yellow-500/[0.08] text-yellow-600 dark:text-yellow-400" },
  ACTIVE:    { label: "Ready",   dot: "bg-blue-400",   pill: "border-blue-500/30 bg-blue-500/[0.08] text-blue-600 dark:text-blue-400"         },
  COMPLETED: { label: "Done",    dot: "bg-emerald-400",pill: "border-emerald-500/30 bg-emerald-500/[0.08] text-emerald-700 dark:text-emerald-400" },
  EXPIRED:   { label: "Expired", dot: "bg-red-400",    pill: "border-red-500/30 bg-red-500/[0.08] text-red-600 dark:text-red-400"              },
};

// 1-px shimmer top edge — dark mode only
const EdgeGlow = () => (
  <div className="hidden dark:block absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.13] to-transparent pointer-events-none z-10" />
);

// Chart tooltip
function ChartTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-xl px-3 py-2 text-xs bg-white dark:bg-[#111116] border border-black/[0.09] dark:border-white/[0.10] shadow-lg dark:shadow-[0_4px_24px_rgba(0,0,0,0.7)]">
      <p className="text-gray-500 dark:text-[#8A8F98] mb-0.5 truncate max-w-[160px]">{d.title}</p>
      <p className="font-bold text-sm" style={{ color: accColor(d.accuracy) }}>{d.accuracy}%</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard
// ─────────────────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const navigate = useNavigate();
  const [banner, setBanner] = useState(true);

  const { user }                                         = useUser();
  const { data: assessments, isLoading: assessLoading } = useMyAssessments();
  const { data: rd }                                     = useMyResults();

  const results      = rd?.results      ?? [];
  const graphData    = rd?.graphData    ?? [];
  const sectionStats = rd?.sectionStats ?? [];
  const overallAcc   = rd?.overallAccuracy ?? 0;
  const totalTests   = rd?.totalTests   ?? 0;
  const needsKey     = user && !user.hasGroqApiKey;

  const streak = useMemo(() => {
    if (!results.length) return 0;
    const sorted = [...results].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    let count = 0, prev = new Date(); prev.setHours(0,0,0,0);
    for (const r of sorted) {
      const d = new Date(r.createdAt); d.setHours(0,0,0,0);
      if ((prev.getTime() - d.getTime()) / 86400000 <= 1) { count++; prev = d; } else break;
    }
    return count;
  }, [results]);

  const bestScore = useMemo(() => results.reduce((m, r) => Math.max(m, r.accuracy), 0), [results]);

  const trend = useMemo(() => {
    if (graphData.length < 2) return null;
    return graphData[graphData.length - 1].accuracy - graphData[graphData.length - 2].accuracy;
  }, [graphData]);

  const radarData = useMemo(() =>
    [...sectionStats].sort((a, b) => b.attempts - a.attempts).slice(0, 6).map((s) => ({
      subject: s.name.split(" ").slice(0, 2).join(" "),
      value: s.avgAccuracy,
      fullMark: 100,
    })),
    [sectionStats]
  );

  const handleAssessmentClick = (a: Assessment) => {
    if (a.status === "PENDING") return navigate(`/assessment/${a.id}/plan`);
    if (a.status === "ACTIVE")  return navigate(`/assessment/${a.id}/test`);
    if (a.status === "COMPLETED" || a.status === "EXPIRED") {
      const r = results.find((x) => x.assessmentId === a.id);
      if (r) navigate(`/results/${r.id}`);
    }
  };

  const kpis = [
    { label: "Tests Taken",    value: String(totalTests), icon: BookOpen, color: "#5E6AD2",
      sub: `${assessments?.filter(a => a.status === "COMPLETED").length ?? 0} completed` },
    { label: "Overall Accuracy", value: `${overallAcc}%`, icon: Target, color: accColor(overallAcc),
      sub: trend !== null ? `${trend >= 0 ? "+" : ""}${trend.toFixed(0)}% vs last` : "no trend yet",
      trend },
    { label: "Best Score",     value: `${bestScore}%`,   icon: Trophy,   color: "#f59e0b", sub: "personal best" },
    { label: "Day Streak",     value: String(streak),    icon: Flame,    color: streak >= 3 ? "#f97316" : "#6b7280",
      sub: streak >= 3 ? "🔥 On fire!" : "practice daily" },
  ];

  return (
    <div className="min-h-screen bg-[#f4f4f7] dark:bg-[#050506] transition-colors duration-300">

      {/* ── Atmospheric background (fixed, behind everything) ────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Light mode tint */}
        <div className="dark:hidden absolute inset-0 bg-[radial-gradient(ellipse_100%_40%_at_50%_0%,rgba(99,102,241,0.09),transparent_70%)]" />
        {/* Dark base */}
        <div className="hidden dark:block absolute inset-0 bg-[#050506]" />
        <div className="hidden dark:block absolute inset-0 bg-[radial-gradient(ellipse_at_top,#0d0d18_0%,transparent_55%)]" />

        {/* Noise grain */}
        <div className="absolute inset-0 opacity-[0.018]"
          style={{ backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize:"128px 128px" }} />

        {/* 64px grid */}
        <div className="absolute inset-0 opacity-[0.022] dark:opacity-[0.032]"
          style={{ backgroundImage:"linear-gradient(rgba(94,106,210,0.3) 1px,transparent 1px),linear-gradient(90deg,rgba(94,106,210,0.3) 1px,transparent 1px)", backgroundSize:"64px 64px" }} />

        {/* Dark animated blobs */}
        <motion.div animate={{ y:[0,-26,0],rotate:[-3,3,-3] }} transition={{ duration:14,repeat:Infinity,ease:"easeInOut" }}
          className="hidden dark:block absolute -top-64 left-1/2 -translate-x-1/2 w-[1400px] h-[800px] rounded-full bg-[#5E6AD2]/[0.14] blur-[180px]" />
        <motion.div animate={{ y:[0,20,0],x:[0,-14,0] }} transition={{ duration:13,repeat:Infinity,ease:"easeInOut",delay:2 }}
          className="hidden dark:block absolute bottom-0 right-0 w-[800px] h-[700px] rounded-full bg-purple-700/[0.09] blur-[160px]" />
        <motion.div animate={{ y:[0,-14,0] }} transition={{ duration:11,repeat:Infinity,ease:"easeInOut",delay:5 }}
          className="hidden dark:block absolute top-1/2 -left-64 w-[600px] h-[500px] rounded-full bg-indigo-600/[0.06] blur-[130px]" />

        {/* Light blobs */}
        <div className="dark:hidden absolute -top-32 left-1/2 -translate-x-1/2 w-250 h-[500px] rounded-full bg-indigo-200/[0.28] blur-[140px]" />
        <div className="dark:hidden absolute bottom-0 right-0 w-[600px] h-[500px] rounded-full bg-violet-200/[0.20] blur-[120px]" />
      </div>

      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <Navbar />

      {/* ── Page body ──────────────────────────────────────────────────────── */}
      <main className="relative z-10  w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-6 lg:py-8 space-y-6 lg:space-y-8">

        {/* ── API key banner ── */}
        <AnimatePresence>
          {needsKey && banner && (
            <motion.div initial={{ opacity:0,y:-10,height:0 }} animate={{ opacity:1,y:0,height:"auto" }}
              exit={{ opacity:0,y:-10,height:0 }} transition={{ duration:0.3,ease:[0.16,1,0.3,1] }} className="overflow-hidden">
              <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 dark:bg-amber-500/[0.07] dark:border-amber-500/[0.22]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-500/[0.15] border border-amber-200 dark:border-amber-500/[0.25] flex items-center justify-center shrink-0">
                    <Key className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    Add a <strong>Groq API key</strong> in Settings to generate AI-powered tests.
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
                    onClick={() => navigate("/settings")}
                    className="text-xs px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors shadow-[0_2px_8px_rgba(245,158,11,0.35)]">
                    Add Key
                  </motion.button>
                  <button onClick={() => setBanner(false)} className="text-sm px-2 py-1.5 text-gray-400 dark:text-[#8A8F98] hover:text-gray-700 dark:hover:text-[#EDEDEF] transition-colors">✕</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Hero row: Welcome + CTA ── */}
        <motion.div initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} transition={{ duration:0.45,ease:[0.16,1,0.3,1] }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-[#EDEDEF]">
              {user?.firstName ? `Hey, ${user.firstName} 👋` : "Dashboard"}
            </h1>
            <p className="text-sm text-gray-400 dark:text-[#8A8F98] mt-1">
              {totalTests > 0
                ? `${totalTests} test${totalTests !== 1 ? "s" : ""} completed · overall accuracy ${overallAcc}%`
                : "Create your first AI-powered assessment to get started."}
            </p>
          </div>
          <motion.button whileHover={{ scale:1.02,y:-1 }} whileTap={{ scale:0.98 }}
            transition={{ duration:0.2,ease:[0.16,1,0.3,1] }}
            onClick={() => navigate("/assessment/new")}
            className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-[#5E6AD2] text-white hover:bg-[#6872D9] shrink-0 transition-all duration-200 shadow-[0_0_0_1px_rgba(94,106,210,0.5),0_4px_14px_rgba(94,106,210,0.35),inset_0_1px_0_rgba(255,255,255,0.15)] hover:shadow-[0_0_0_1px_rgba(104,114,217,0.6),0_6px_20px_rgba(94,106,210,0.45)] cursor-pointer">
            <Plus className="w-4 h-4" />
            New Assessment
          </motion.button>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════════════════
            ANALYTICS SECTION — only when data exists
        ═══════════════════════════════════════════════════════════════════ */}
        {totalTests > 0 && (
          <>
            {/* ── Row 1: 4 KPI cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
              {kpis.map((k, i) => (
                <motion.div key={k.label}
                  initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }}
                  transition={{ delay:i*0.07,duration:0.4,ease:[0.16,1,0.3,1] }}
                  whileHover={{ y:-3,scale:1.01 }}
                  className={CARD + " p-5 cursor-default transition-all duration-200 hover:shadow-[0_6px_24px_rgba(0,0,0,0.10)] dark:hover:shadow-[0_0_0_1px_rgba(255,255,255,0.09),0_10px_40px_rgba(0,0,0,0.8)]"}>
                  {/* Per-card radial glow */}
                  <div className="absolute inset-0 opacity-[0.08] dark:opacity-[0.12] pointer-events-none"
                    style={{ background:`radial-gradient(circle at 80% 15%,${k.color},transparent 60%)` }} />
                  <EdgeGlow />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{ background:`${k.color}1a`,border:`1px solid ${k.color}35` }}>
                        <k.icon className="w-4 h-4" style={{ color:k.color }} />
                      </div>
                      {k.trend != null && (
                        <span className={`flex items-center gap-0.5 text-xs font-semibold ${k.trend >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                          {k.trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {k.trend >= 0 ? "+" : ""}{k.trend.toFixed(0)}%
                        </span>
                      )}
                    </div>
                    <p className="text-2xl xl:text-3xl font-bold tracking-tight" style={{ color:k.color }}>{k.value}</p>
                    <p className="text-sm font-semibold text-gray-700 dark:text-[#EDEDEF] mt-1">{k.label}</p>
                    <p className="text-xs text-gray-400 dark:text-[#8A8F98] mt-0.5 truncate">{k.sub}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* ── Row 2: BENTO — Score chart (wide) + Radar + Section mini ── */}
            {/* 
              Desktop:  [Score History 5cols] [Radar 3cols] [Section mini 4cols]
              Tablet:   [Score History full] / [Radar + Section half each]
              Mobile:   stacked
            */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-3 lg:gap-4">

              {/* Score History — 5/12 on xl, full on md, full on mobile */}
              <motion.div initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }}
                transition={{ delay:0.15,duration:0.4,ease:[0.16,1,0.3,1] }}
                className={CARD + " xl:col-span-5 p-6"}>
                <EdgeGlow />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-base font-semibold text-gray-900 dark:text-[#EDEDEF]">Score History</p>
                      <p className="text-sm text-gray-400 dark:text-[#8A8F98] mt-0.5">Accuracy over time</p>
                    </div>
                    {trend !== null && (
                      <div className={[
                        "flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border",
                        trend >= 0
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/[0.10] dark:text-emerald-400 dark:border-emerald-500/[0.20]"
                          : "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/[0.10] dark:text-red-400 dark:border-red-500/[0.20]",
                      ].join(" ")}>
                        {trend >= 0 ? <TrendingUp className="w-3.5 h-3.5"/> : <TrendingDown className="w-3.5 h-3.5"/>}
                        {trend >= 0 ? "+" : ""}{trend.toFixed(0)}%
                      </div>
                    )}
                  </div>
                  {graphData.length < 2 ? (
                    <div className="h-[180px] flex flex-col items-center justify-center gap-2">
                      <BarChart3 className="w-8 h-8 text-gray-200 dark:text-white/[0.07]" />
                      <p className="text-sm text-gray-400 dark:text-[#8A8F98]">Need more tests for trends</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={180}>
                      <AreaChart data={graphData} margin={{ top:4,right:4,left:-22,bottom:0 }}>
                        <defs>
                          <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#5E6AD2" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#5E6AD2" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="index" tick={{ fontSize:10,fill:"#8A8F98" }} axisLine={false} tickLine={false}/>
                        <YAxis domain={[0,100]} tick={{ fontSize:10,fill:"#8A8F98" }} axisLine={false} tickLine={false}/>
                        <Tooltip content={<ChartTooltip />}/>
                        <Area type="monotone" dataKey="accuracy" stroke="#5E6AD2" strokeWidth={2}
                          fill="url(#ag)" dot={{ fill:"#5E6AD2",r:3,strokeWidth:0 }}
                          activeDot={{ r:5,fill:"#5E6AD2",stroke:"rgba(94,106,210,0.35)",strokeWidth:5 }}/>
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </motion.div>

              {/* Radar — 3/12 on xl, half on md */}
              <motion.div initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }}
                transition={{ delay:0.2,duration:0.4,ease:[0.16,1,0.3,1] }}
                className={CARD + " xl:col-span-3 p-6"}>
                <EdgeGlow />
                <div className="relative z-10">
                  <p className="text-base font-semibold text-gray-900 dark:text-[#EDEDEF]">Skill Radar</p>
                  <p className="text-sm text-gray-400 dark:text-[#8A8F98] mt-0.5 mb-1">Accuracy by topic</p>
                  {radarData.length < 3 ? (
                    <div className="h-[192px] flex flex-col items-center justify-center gap-2">
                      <Activity className="w-7 h-7 text-gray-200 dark:text-white/[0.07]"/>
                      <p className="text-sm text-gray-400 dark:text-[#8A8F98] text-center">Test more subjects<br/>to unlock radar</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={192}>
                      <RadarChart data={radarData} margin={{ top:8,right:16,left:16,bottom:8 }}>
                        <PolarGrid stroke="rgba(94,106,210,0.15)"/>
                        <PolarAngleAxis dataKey="subject" tick={{ fontSize:9,fill:"#8A8F98" }}/>
                        <Radar name="Accuracy" dataKey="value" stroke="#5E6AD2" fill="#5E6AD2" fillOpacity={0.22} strokeWidth={1.5}/>
                      </RadarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </motion.div>

              {/* Section breakdown mini — 4/12 on xl, half on md */}
              <motion.div initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }}
                transition={{ delay:0.25,duration:0.4,ease:[0.16,1,0.3,1] }}
                className={CARD + " xl:col-span-4 p-6"}>
                <EdgeGlow />
                <div className="relative z-10 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-base font-semibold text-gray-900 dark:text-[#EDEDEF]">Section Scores</p>
                      <p className="text-sm text-gray-400 dark:text-[#8A8F98] mt-0.5">Weakest first</p>
                    </div>
                    <div className="hidden sm:flex gap-3 text-[11px] text-gray-400 dark:text-[#8A8F98]">
                      {[["#ef4444","<50"],["#f59e0b","50–70"],["#22c55e",">70"]].map(([c,l])=>(
                        <span key={l} className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full" style={{ background:c as string }}/>
                          {l}
                        </span>
                      ))}
                    </div>
                  </div>

                  {sectionStats.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center">
                      <p className="text-sm text-gray-400 dark:text-[#8A8F98]">No section data yet</p>
                    </div>
                  ) : (
                    <div className="flex-1 space-y-3 overflow-hidden">
                      {[...sectionStats].sort((a,b) => a.avgAccuracy - b.avgAccuracy).slice(0, 6).map((s, i) => {
                        const color = accColor(s.avgAccuracy);
                        return (
                          <motion.div key={s.slug}
                            initial={{ opacity:0,x:-10 }} animate={{ opacity:1,x:0 }}
                            transition={{ delay:0.3+i*0.04,duration:0.28 }}
                            className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <p className="text-sm text-gray-600 dark:text-[#8A8F98] truncate max-w-[140px]">{s.name}</p>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-[11px] text-gray-400 dark:text-[#8A8F98]/60">{s.attempts}×</span>
                                <span className="text-sm font-bold tabular-nums" style={{ color }}>{s.avgAccuracy}%</span>
                              </div>
                            </div>
                            <div className="h-1.5 bg-gray-100 dark:bg-white/[0.07] rounded-full overflow-hidden">
                              <motion.div className="h-full rounded-full"
                                style={{ background:`linear-gradient(90deg,${color}88,${color})` }}
                                initial={{ width:0 }} animate={{ width:`${s.avgAccuracy}%` }}
                                transition={{ duration:0.9,ease:[0.16,1,0.3,1],delay:0.35+i*0.04 }}/>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            MAIN CONTENT ROW — Assessments (left) + Recent Results (right)
            Desktop: 7/12 + 5/12  |  Tablet: stacked  |  Mobile: stacked
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-3 lg:gap-4 items-start">

          {/* ── Assessments column — 7/12 ── */}
          <div className="xl:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-gray-900 dark:text-[#EDEDEF]">Your Assessments</h2>
                <p className="text-sm text-gray-400 dark:text-[#8A8F98] mt-0.5">AI-generated tests for each role</p>
              </div>
              {(assessments?.length ?? 0) > 0 && (
                <motion.button whileHover={{ scale:1.02,y:-1 }} whileTap={{ scale:0.98 }}
                  transition={{ duration:0.2,ease:[0.16,1,0.3,1] }}
                  onClick={() => navigate("/assessment/new")}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-xl bg-[#5E6AD2] text-white hover:bg-[#6872D9] transition-all duration-200 shadow-[0_0_0_1px_rgba(94,106,210,0.5),0_3px_10px_rgba(94,106,210,0.3),inset_0_1px_0_rgba(255,255,255,0.15)]">
                  <Plus className="w-3.5 h-3.5"/>
                  New
                </motion.button>
              )}
            </div>

            {assessLoading ? (
              <div className="flex justify-center py-16"><Spinner className="w-7 h-7 text-[#5E6AD2]"/></div>
            ) : !assessments?.length ? (
              <EmptyState onNew={() => navigate("/assessment/new")} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {assessments.map((a, i) => (
                  <AssessmentCard key={a.id} assessment={a} index={i} onClick={() => handleAssessmentClick(a)}/>
                ))}
              </div>
            )}
          </div>

          {/* ── Recent Results column — 5/12 ── */}
          {results.length > 0 && (
            <motion.div className="xl:col-span-5 space-y-4"
              initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }}
              transition={{ delay:0.2,duration:0.4,ease:[0.16,1,0.3,1] }}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold tracking-tight text-gray-900 dark:text-[#EDEDEF]">Recent Results</h2>
                  <p className="text-sm text-gray-400 dark:text-[#8A8F98] mt-0.5">Your latest test scores</p>
                </div>
                <button onClick={() => navigate("/results")}
                  className="text-sm text-[#5E6AD2] hover:text-[#6872D9] transition-colors flex items-center gap-0.5 font-medium">
                  View all <ArrowRight className="w-3.5 h-3.5 ml-0.5"/>
                </button>
              </div>

              <div className={CARD + " divide-y divide-black/[0.05] dark:divide-white/[0.05]"}>
                <EdgeGlow/>
                {[...results].reverse().slice(0, 7).map((r, i) => (
                  <RecentResultRow key={r.id} result={r} index={i} onClick={() => navigate(`/results/${r.id}`)}/>
                ))}
              </div>

              {/* Mini section breakdown — full width below results */}
              {sectionStats.length > 0 && (
                <motion.div initial={{ opacity:0,y:12 }} animate={{ opacity:1,y:0 }}
                  transition={{ delay:0.3,duration:0.4,ease:[0.16,1,0.3,1] }}
                  className={CARD + " p-5"}>
                  <EdgeGlow/>
                  <div className="relative z-10">
                    <p className="text-sm font-semibold text-gray-900 dark:text-[#EDEDEF] mb-3">All Sections</p>
                    <div className="space-y-2.5">
                      {[...sectionStats].sort((a,b) => a.avgAccuracy - b.avgAccuracy).map((s,i) => {
                        const color = accColor(s.avgAccuracy);
                        return (
                          <div key={s.slug} className="flex items-center gap-3">
                            <p className="text-xs text-gray-500 dark:text-[#8A8F98] w-28 shrink-0 truncate">{s.name}</p>
                            <div className="flex-1 h-1.5 bg-gray-100 dark:bg-white/[0.07] rounded-full overflow-hidden">
                              <motion.div className="h-full rounded-full"
                                style={{ background:`linear-gradient(90deg,${color}88,${color})` }}
                                initial={{ width:0 }} animate={{ width:`${s.avgAccuracy}%` }}
                                transition={{ duration:0.9,ease:[0.16,1,0.3,1],delay:0.35+i*0.03 }}/>
                            </div>
                            <span className="text-xs font-bold tabular-nums w-8 text-right shrink-0" style={{ color }}>
                              {s.avgAccuracy}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </div>

        <div className="h-8"/>
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Recent Result Row
// ─────────────────────────────────────────────────────────────────────────────

function RecentResultRow({ result: r, index, onClick }: {
  result: ResultSummary; index: number; onClick: () => void;
}) {
  const color = accColor(r.accuracy);
  const Icon  = r.accuracy >= 70 ? CheckCircle2 : r.accuracy >= 50 ? AlertTriangle : XCircle;

  return (
    <motion.div
      initial={{ opacity:0,x:-10 }} animate={{ opacity:1,x:0 }}
      transition={{ delay:0.22+index*0.05,duration:0.3,ease:[0.16,1,0.3,1] }}
      onClick={onClick}
      className="relative z-10 flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-colors group hover:bg-gray-50/80 dark:hover:bg-white/[0.025]">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
        style={{ background:`${color}18`,border:`1px solid ${color}35` }}>
        <Icon className="w-4 h-4" style={{ color }}/>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate text-gray-800 dark:text-[#EDEDEF] group-hover:text-[#5E6AD2] dark:group-hover:text-[#a5adff] transition-colors">{r.title}</p>
        <p className="text-xs text-gray-400 dark:text-[#8A8F98] mt-0.5">
          {r.correctAnswers}/{r.totalQuestions}{r.company && ` · ${r.company}`} · {Math.floor(r.timeSpent/60)}m
        </p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-base font-bold tabular-nums" style={{ color }}>{r.accuracy}%</span>
        <ArrowUpRight className="w-3.5 h-3.5 text-gray-300 dark:text-white/[0.15] group-hover:text-[#5E6AD2] transition-colors"/>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Assessment Card
// ─────────────────────────────────────────────────────────────────────────────

function AssessmentCard({ assessment: a, index, onClick }: {
  assessment: Assessment; index: number; onClick: () => void;
}) {
  const cfg            = STATUS_CFG[a.status];
  const activeSections = a.sections?.filter((s) => s.isActive) ?? [];

  const actionLabel = {
    PENDING:   "Review Plan",
    ACTIVE:    a.session?.status === "ACTIVE" ? "Resume Test" : "Start Test",
    COMPLETED: "View Results",
    EXPIRED:   "View Results",
  }[a.status];

  const ActionIcon = { PENDING:ChevronRight,ACTIVE:Play,COMPLETED:BarChart3,EXPIRED:BarChart3 }[a.status];

  const glowColor = { PENDING:"#f59e0b",ACTIVE:"#3b82f6",COMPLETED:"#22c55e",EXPIRED:"#ef4444" }[a.status];

  return (
    <motion.div
      initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }}
      transition={{ delay:index*0.07,duration:0.35,ease:[0.16,1,0.3,1] }}
      whileHover={{ y:-4,scale:1.007 }}
      onClick={onClick}
      className={[
        CARD,"p-5 cursor-pointer group transition-all duration-200",
        "hover:border-[#5E6AD2]/20 hover:shadow-[0_6px_28px_rgba(94,106,210,0.12)]",
        "dark:hover:border-[#5E6AD2]/25 dark:hover:shadow-[0_0_0_1px_rgba(94,106,210,0.18),0_12px_40px_rgba(0,0,0,0.8),0_0_60px_rgba(94,106,210,0.06)]",
      ].join(" ")}>

      {/* Status glow blob */}
      <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-[0.09] dark:opacity-[0.14] pointer-events-none"
        style={{ background:glowColor }}/>
      <EdgeGlow/>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm leading-snug truncate text-gray-900 dark:text-[#EDEDEF] group-hover:text-[#5E6AD2] dark:group-hover:text-[#a5adff] transition-colors">
              {a.title}
            </h3>
            {(a.role || a.company) && (
              <p className="text-xs text-gray-400 dark:text-[#8A8F98] mt-0.5 truncate">
                {[a.role,a.company].filter(Boolean).join(" @ ")}
              </p>
            )}
          </div>
          <div className={`flex items-center gap-1.5 shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${cfg.pill}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}/>
            {cfg.label}
          </div>
        </div>

        {/* Section chips */}
        {activeSections.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {activeSections.slice(0,4).map((s) => (
              <span key={s.id} className="text-[11px] px-1.5 py-0.5 rounded-md bg-gray-50 dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.08] text-gray-500 dark:text-[#8A8F98]">
                {s.icon} {s.name}
              </span>
            ))}
            {activeSections.length > 4 && (
              <span className="text-[11px] text-gray-400 dark:text-[#8A8F98]/60 py-0.5">+{activeSections.length-4}</span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-black/[0.05] dark:border-white/[0.06]">
          <div className="flex items-center gap-3 text-[11px] text-gray-400 dark:text-[#8A8F98]">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3"/>{a.totalDuration}m</span>
            <span className="flex items-center gap-1"><Zap className="w-3 h-3"/>{activeSections.length}</span>
            <span className="flex items-center gap-1">
              <Activity className="w-3 h-3"/>
              {new Date(a.createdAt).toLocaleDateString("en-IN",{ day:"numeric",month:"short" })}
            </span>
          </div>
          <motion.span whileHover={{ scale:1.04 }}
            className={[
              "flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-lg transition-all duration-200",
              a.status === "ACTIVE"
                ? "bg-[#5E6AD2] text-white shadow-[0_2px_10px_rgba(94,106,210,0.4)]"
                : "text-[#5E6AD2] dark:text-[#a5adff] group-hover:bg-[#5E6AD2]/[0.10]",
            ].join(" ")}>
            <ActionIcon className="w-3 h-3"/>
            {actionLabel}
          </motion.span>
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Empty State
// ─────────────────────────────────────────────────────────────────────────────

function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <motion.div initial={{ opacity:0,scale:0.97 }} animate={{ opacity:1,scale:1 }}
      transition={{ duration:0.4,ease:[0.16,1,0.3,1] }}
      className="flex flex-col items-center justify-center py-20 rounded-2xl text-center px-6 border border-dashed border-gray-200 dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.02]">
      <motion.div animate={{ y:[0,-7,0] }} transition={{ duration:3.5,repeat:Infinity,ease:"easeInOut" }}
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 bg-[#5E6AD2]/[0.10] border border-[#5E6AD2]/[0.20] shadow-[0_0_28px_rgba(94,106,210,0.2)]">
        <Sparkles className="w-7 h-7 text-[#5E6AD2]"/>
      </motion.div>
      <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-[#EDEDEF]">No assessments yet</h3>
      <p className="text-sm text-gray-400 dark:text-[#8A8F98] mb-1.5 max-w-xs leading-relaxed">
        Enter a role and company — AI designs a custom test plan for you.
      </p>
      <p className="text-xs font-mono text-gray-300 dark:text-[#8A8F98]/40 mb-7">
        e.g. "SDE-1 @ Google" → DSA · OS · DBMS · CN · Aptitude
      </p>
      <motion.button whileHover={{ scale:1.03,y:-2 }} whileTap={{ scale:0.98 }}
        transition={{ duration:0.2,ease:[0.16,1,0.3,1] }}
        onClick={onNew}
        className="flex items-center cursor-pointer gap-2 px-6 py-3 text-sm font-semibold rounded-xl bg-[#5E6AD2] text-white hover:bg-[#6872D9] transition-all duration-200 shadow-[0_0_0_1px_rgba(94,106,210,0.5),0_4px_14px_rgba(94,106,210,0.35),inset_0_1px_0_rgba(255,255,255,0.15)] hover:shadow-[0_0_0_1px_rgba(104,114,217,0.6),0_6px_20px_rgba(94,106,210,0.45)]">
        <Plus className="w-4 h-4"/>
        Create First Assessment
      </motion.button>
    </motion.div>
  );
}