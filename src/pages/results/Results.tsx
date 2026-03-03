
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Mail, CheckCircle2, ChevronRight,
  TrendingUp, TrendingDown, BarChart3, Clock,
  Loader2, Sparkles, Plus, Target, Activity,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useMyResults, useResendResultEmail } from "@/api/results.query";
import { Spinner } from "@/components/ui/spinner";
import type { ResultSummary } from "@/types";
import Navbar from "../components/Navbar";


const accColor = (n: number) =>
  n >= 70 ? "#22c55e" : n >= 50 ? "#f59e0b" : "#ef4444";

const accLabel = (n: number) =>
  n >= 85 ? "Excellent" : n >= 70 ? "Good" : n >= 50 ? "Average" : "Needs Work";

// Shared explicit card — no transparent bg in dark
const CARD =
  "relative overflow-hidden rounded-2xl " +
  "bg-white border border-black/[0.07] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.06)] " +
  "dark:bg-[#0d0d10] dark:border-white/[0.07] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.055),0_4px_32px_rgba(0,0,0,0.5)]";

const EdgeGlow = () => (
  <div className="hidden dark:block absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.13] to-transparent pointer-events-none z-10" />
);

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
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function ResultsPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useMyResults();

  const results = data?.results ?? [];
  const graphData = data?.graphData ?? [];
  const sectionStats = data?.sectionStats ?? [];
  const overallAcc = data?.overallAccuracy ?? 0;
  const totalTests = data?.totalTests ?? 0;

  const trend = graphData.length >= 2
    ? graphData[graphData.length - 1].accuracy - graphData[graphData.length - 2].accuracy
    : null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f4f4f7] dark:bg-[#050506] flex items-center justify-center">
        <Spinner className="w-7 h-7 text-[#5E6AD2]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f4f7] dark:bg-[#050506] transition-colors duration-300">

      {/* ── Atmospheric background ───────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="dark:hidden absolute inset-0 bg-[radial-gradient(ellipse_100%_40%_at_50%_0%,rgba(99,102,241,0.09),transparent_70%)]" />
        <div className="hidden dark:block absolute inset-0 bg-[#050506]" />
        <div className="hidden dark:block absolute inset-0 bg-[radial-gradient(ellipse_at_top,#0d0d18_0%,transparent_55%)]" />
        <div className="absolute inset-0 opacity-[0.018]"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: "128px 128px" }} />
        <div className="absolute inset-0 opacity-[0.022] dark:opacity-[0.032]"
          style={{ backgroundImage: "linear-gradient(rgba(94,106,210,0.3) 1px,transparent 1px),linear-gradient(90deg,rgba(94,106,210,0.3) 1px,transparent 1px)", backgroundSize: "64px 64px" }} />
        <motion.div animate={{ y: [0, -24, 0], rotate: [-3, 3, -3] }} transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="hidden dark:block absolute -top-64 left-1/2 -translate-x-1/2 w-[1200px] h-[700px] rounded-full bg-[#5E6AD2]/[0.14] blur-[170px]" />
        <motion.div animate={{ y: [0, 18, 0], x: [0, -14, 0] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="hidden dark:block absolute bottom-0 right-0 w-[700px] h-[600px] rounded-full bg-purple-700/[0.09] blur-[150px]" />
        <div className="dark:hidden absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[450px] rounded-full bg-indigo-200/[0.28] blur-[130px]" />
        <div className="dark:hidden absolute bottom-0 right-0 w-[600px] h-[500px] rounded-full bg-violet-200/[0.20] blur-[120px]" />
      </div>

      {/* ── Navbar ── */}
      <Navbar />

      {/* ── Main ─────────────────────────────────────────────────────────── */}
      <main className="relative z-10 w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-6 lg:py-8 space-y-6 lg:space-y-7">

        {/* Back + page title */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <button onClick={() => navigate("/dashboard")}
              className="inline-flex items-center gap-2 text-sm text-gray-400 dark:text-[#8A8F98] hover:text-gray-700 dark:hover:text-[#EDEDEF] transition-colors mb-2 group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
              Back to Dashboard
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-[#EDEDEF]">
              All Results
            </h1>
            <p className="text-sm text-gray-400 dark:text-[#8A8F98] mt-0.5">
              {totalTests > 0
                ? `${totalTests} test${totalTests !== 1 ? "s" : ""} completed · overall accuracy ${overallAcc}%`
                : "Complete an assessment to see your results here."}
            </p>
          </div>
          {results.length > 0 && (
            <motion.button whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => navigate("/assessment/new")}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl bg-[#5E6AD2] text-white hover:bg-[#6872D9] shrink-0 transition-all duration-200 shadow-[0_0_0_1px_rgba(94,106,210,0.5),0_4px_14px_rgba(94,106,210,0.35),inset_0_1px_0_rgba(255,255,255,0.15)] hover:shadow-[0_0_0_1px_rgba(104,114,217,0.6),0_6px_20px_rgba(94,106,210,0.45)] cursor-pointer">
              <Plus className="w-4 h-4" />
              New Assessment
            </motion.button>
          )}
        </motion.div>

        {/* ── Empty state ── */}
        {results.length === 0 && (
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center justify-center py-28 rounded-2xl border border-dashed border-gray-200 dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.02] text-center px-6">
            <motion.div animate={{ y: [0, -7, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 bg-[#5E6AD2]/[0.10] border border-[#5E6AD2]/[0.20] shadow-[0_0_28px_rgba(94,106,210,0.20)]">
              <BarChart3 className="w-7 h-7 text-[#5E6AD2]" />
            </motion.div>
            <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-[#EDEDEF]">No results yet</h3>
            <p className="text-sm text-gray-400 dark:text-[#8A8F98] mb-7 max-w-xs leading-relaxed">
              Complete an assessment to see your performance breakdown here.
            </p>
            <motion.button whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/assessment/new")}
              className="flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl bg-[#5E6AD2] text-white hover:bg-[#6872D9] transition-all duration-200 shadow-[0_0_0_1px_rgba(94,106,210,0.5),0_4px_14px_rgba(94,106,210,0.35),inset_0_1px_0_rgba(255,255,255,0.15)]">
              <Sparkles className="w-4 h-4" />
              Create Assessment
            </motion.button>
          </motion.div>
        )}

        {results.length > 0 && (
          <>
            {/* ══════════════════════════════════════════════════════════════
                ROW 1: 3 KPI cards  +  chart  (bento grid)
            ══════════════════════════════════════════════════════════════ */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-3 lg:gap-4">

              {/* KPIs stacked — 4/12 on xl, full on mobile */}
              <div className="xl:col-span-4 grid grid-cols-3 xl:grid-cols-1 gap-3">
                {[
                  {
                    label: "Tests Taken", value: String(totalTests),
                    icon: BarChart3, color: "#5E6AD2",
                    sub: `${sectionStats.length} section types`,
                  },
                  {
                    label: "Avg Accuracy", value: `${overallAcc}%`,
                    icon: Target, color: accColor(overallAcc),
                    sub: accLabel(overallAcc),
                    trend,
                  },
                  {
                    label: "Sections Tracked", value: String(sectionStats.length),
                    icon: Activity, color: "#a78bfa",
                    sub: "unique topics",
                  },
                ].map((k, i) => (
                  <motion.div key={k.label}
                    initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07, duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
                    whileHover={{ y: -2, scale: 1.01 }}
                    className={CARD + " p-4 xl:p-5 cursor-default transition-all duration-200 hover:shadow-[0_6px_24px_rgba(0,0,0,0.10)] dark:hover:shadow-[0_0_0_1px_rgba(255,255,255,0.09),0_10px_40px_rgba(0,0,0,0.8)]"}>
                    <div className="absolute inset-0 opacity-[0.08] dark:opacity-[0.12] pointer-events-none"
                      style={{ background: `radial-gradient(circle at 80% 15%,${k.color},transparent 60%)` }} />
                    <EdgeGlow />
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                          style={{ background: `${k.color}1a`, border: `1px solid ${k.color}35` }}>
                          <k.icon className="w-3.5 h-3.5" style={{ color: k.color }} />
                        </div>
                        {k.trend != null && (
                          <span className={`flex items-center gap-0.5 text-[11px] font-semibold ${k.trend >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                            {k.trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {k.trend >= 0 ? "+" : ""}{k.trend.toFixed(0)}%
                          </span>
                        )}
                      </div>
                      <p className="text-2xl font-bold tracking-tight" style={{ color: k.color }}>{k.value}</p>
                      <p className="text-sm font-semibold text-gray-700 dark:text-[#EDEDEF] mt-0.5">{k.label}</p>
                      <p className="text-xs text-gray-400 dark:text-[#8A8F98] mt-0.5 truncate">{k.sub}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Score chart — 8/12 on xl */}
              <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className={CARD + " xl:col-span-8 p-6"}>
                <EdgeGlow />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <p className="text-base font-semibold text-gray-900 dark:text-[#EDEDEF]">Accuracy Over Time</p>
                      <p className="text-sm text-gray-400 dark:text-[#8A8F98] mt-0.5">Score progression across all tests</p>
                    </div>
                    {trend !== null && (
                      <div className={[
                        "flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border",
                        trend >= 0
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/[0.10] dark:text-emerald-400 dark:border-emerald-500/[0.20]"
                          : "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/[0.10] dark:text-red-400 dark:border-red-500/[0.20]",
                      ].join(" ")}>
                        {trend >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        {trend >= 0 ? "+" : ""}{trend.toFixed(0)}%
                      </div>
                    )}
                  </div>
                  {graphData.length < 2 ? (
                    <div className="h-[180px] flex flex-col items-center justify-center gap-3">
                      <BarChart3 className="w-8 h-8 text-gray-200 dark:text-white/[0.07]" />
                      <p className="text-sm text-gray-400 dark:text-[#8A8F98]">Complete more tests to see your trend</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={180}>
                      <AreaChart data={graphData} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
                        <defs>
                          <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#5E6AD2" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#5E6AD2" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="index" tick={{ fontSize: 10, fill: "#8A8F98" }} axisLine={false} tickLine={false} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#8A8F98" }} axisLine={false} tickLine={false} />
                        <Tooltip content={<ChartTooltip />} />
                        <Area type="monotone" dataKey="accuracy" stroke="#5E6AD2" strokeWidth={2}
                          fill="url(#rg)"
                          dot={{ fill: "#5E6AD2", r: 3, strokeWidth: 0 }}
                          activeDot={{ r: 5, fill: "#5E6AD2", stroke: "rgba(94,106,210,0.35)", strokeWidth: 5 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </motion.div>
            </div>

            {/* ══════════════════════════════════════════════════════════════
                ROW 2: Section performance  +  Results list
            ══════════════════════════════════════════════════════════════ */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-3 lg:gap-4 items-start">

              {/* Section performance — 4/12 on xl */}
              {sectionStats.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className={CARD + " xl:col-span-4 p-6"}>
                  <EdgeGlow />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-base font-semibold text-gray-900 dark:text-[#EDEDEF]">Section Performance</p>
                        <p className="text-sm text-gray-400 dark:text-[#8A8F98] mt-0.5">Weakest → strongest</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {[...sectionStats].sort((a, b) => a.avgAccuracy - b.avgAccuracy).map((s, i) => {
                        const color = accColor(s.avgAccuracy);
                        return (
                          <motion.div key={s.slug}
                            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.24 + i * 0.04, duration: 0.28 }}>
                            <div className="flex items-center justify-between mb-1.5">
                              <p className="text-xs text-gray-600 dark:text-[#8A8F98] truncate max-w-[140px]">{s.name}</p>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-[11px] text-gray-400 dark:text-[#8A8F98]/60">{s.attempts}×</span>
                                <span className="text-xs font-bold tabular-nums" style={{ color }}>{s.avgAccuracy}%</span>
                              </div>
                            </div>
                            <div className="h-1.5 bg-gray-100 dark:bg-white/[0.07] rounded-full overflow-hidden">
                              <motion.div className="h-full rounded-full"
                                style={{ background: `linear-gradient(90deg,${color}88,${color})` }}
                                initial={{ width: 0 }} animate={{ width: `${s.avgAccuracy}%` }}
                                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.28 + i * 0.04 }} />
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Results list — 8/12 on xl (or full if no section stats) */}
              <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.22, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className={`${sectionStats.length > 0 ? "xl:col-span-8" : "xl:col-span-12"} space-y-3`}>
                <div className="flex items-center justify-between">
                  <p className="text-base font-semibold text-gray-900 dark:text-[#EDEDEF]">
                    All Tests
                    <span className="ml-2 text-xs font-normal text-gray-400 dark:text-[#8A8F98]">
                      ({results.length})
                    </span>
                  </p>
                </div>

                <div className="space-y-2.5">
                  {[...results].reverse().map((r, i) => (
                    <ResultRow
                      key={r.id}
                      result={r}
                      index={i}
                      onView={() => navigate(`/results/${r.id}`)}
                    />
                  ))}
                </div>
              </motion.div>
            </div>
          </>
        )}

        <div className="h-10" />
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Result Row
// ─────────────────────────────────────────────────────────────────────────────

function ResultRow({
  result: r, index, onView,
}: {
  result: ResultSummary; index: number; onView: () => void;
}) {
  const resendEmail = useResendResultEmail();
  const [sent, setSent] = useState(false);

  const color = accColor(r.accuracy);
  const mins = Math.floor(r.timeSpent / 60);
  const date = new Date(r.createdAt).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });

  const handleResend = (e: React.MouseEvent) => {
    e.stopPropagation();
    resendEmail.mutate(r.id, { onSuccess: () => setSent(true) });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      className={[
        CARD,
        "overflow-hidden  group transition-all duration-200",
        "hover:border-[#5E6AD2]/20 hover:shadow-[0_6px_28px_rgba(94,106,210,0.10)]",
        "dark:hover:border-[#5E6AD2]/25 dark:hover:shadow-[0_0_0_1px_rgba(94,106,210,0.18),0_12px_40px_rgba(0,0,0,0.8)]",
      ].join(" ")}
    >
      <EdgeGlow />

      {/* Main row */}
      <div className="relative z-10 flex items-center gap-4 px-5 py-4">

        {/* Accuracy badge */}
        <div className="shrink-0 w-14 h-14 rounded-2xl flex flex-col items-center justify-center border-2 transition-all duration-200"
          style={{ borderColor: `${color}35`, background: `${color}10` }}>
          <span className="text-xl font-bold leading-none tabular-nums" style={{ color }}>
            {r.accuracy}
          </span>
          <span className="text-[9px] font-bold mt-0.5 tracking-wide" style={{ color }}>%</span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate text-gray-900 dark:text-[#EDEDEF] group-hover:text-[#5E6AD2] dark:group-hover:text-[#a5adff] transition-colors">
            {r.title}
          </p>
          {(r.role || r.company) && (
            <p className="text-xs text-[#5E6AD2]/80 dark:text-[#a5adff]/70 mt-0.5 truncate">
              {[r.role, r.company].filter(Boolean).join(" @ ")}
            </p>
          )}
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <span className="text-xs text-gray-400 dark:text-[#8A8F98]">
              {r.correctAnswers}/{r.totalQuestions} correct
            </span>
            <span className="text-xs text-gray-400 dark:text-[#8A8F98] flex items-center gap-1">
              <Clock className="w-3 h-3" />{mins}m
            </span>
            <span className="text-xs text-gray-400 dark:text-[#8A8F98]">{date}</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full border font-semibold"
              style={{ color, borderColor: `${color}40`, background: `${color}12` }}>
              {accLabel(r.accuracy)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Resend email */}
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={handleResend}
            disabled={resendEmail.isPending || sent}
            title={sent ? "Email sent!" : "Send score report to your email"}
            className={[
              "flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border font-medium transition-all duration-200 disabled:opacity-60",
              sent
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "border-gray-200 dark:border-white/[0.09] text-gray-500 dark:text-[#8A8F98] hover:border-[#5E6AD2]/30 hover:text-[#5E6AD2] dark:hover:text-[#a5adff] hover:bg-[#5E6AD2]/[0.06]",
            ].join(" ")}>
            {resendEmail.isPending ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : sent ? (
              <CheckCircle2 className="w-3 h-3" />
            ) : (
              <Mail className="w-3 h-3" />
            )}
            {sent ? "Sent!" : "Email"}
          </motion.button>

          {/* View detail */}
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={onView}
            className="cursor-pointer flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#5E6AD2] dark:text-[#a5adff] hover:bg-[#5E6AD2]/[0.10] rounded-lg transition-colors">
            View <ChevronRight className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </div>

      {/* Section mini-bars */}
      {Array.isArray(r.sectionBreakdown) && r.sectionBreakdown.length > 0 && (
        <div className="relative z-10 flex border-t border-black/[0.05] dark:border-white/[0.05] divide-x divide-black/[0.04] dark:divide-white/[0.04]">
          {(r.sectionBreakdown as any[]).map((s) => {
            const c = accColor(s.accuracy);
            return (
              <div key={s.sectionId} className="flex-1 px-3 py-2 min-w-0" title={`${s.sectionName}: ${s.accuracy}%`}>
                <p className="text-[10px] text-gray-400 dark:text-[#8A8F98] truncate mb-1">
                  {s.icon} {s.sectionName}
                </p>
                <div className="h-1 bg-gray-100 dark:bg-white/[0.07] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${s.accuracy}%`, background: c }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}