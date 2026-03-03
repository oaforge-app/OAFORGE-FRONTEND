import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, CheckCircle, XCircle, Minus,
  ChevronDown, ChevronUp, 
  Clock, Sparkles, Plus, 
} from "lucide-react";
import { useState } from "react";
import { useResultDetail } from "@/api/results.query";
import { Spinner } from "@/components/ui/spinner";
import type { SectionBreakdown } from "@/types";
import Navbar from "../components/Navbar";

const accColor = (n: number) =>
  n >= 70 ? "#22c55e" : n >= 50 ? "#f59e0b" : "#ef4444";

const badge = (acc: number) => {
  if (acc >= 85) return { label: "Excellent", emoji: "🏆", color: "#22c55e" };
  if (acc >= 70) return { label: "Good", emoji: "👍", color: "#6872D9" };
  if (acc >= 50) return { label: "Average", emoji: "📈", color: "#f59e0b" };
  return { label: "Needs Practice", emoji: "📚", color: "#ef4444" };
};

const formatDuration = (secs: number) => {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
};

const CARD =
  "relative overflow-hidden rounded-2xl " +
  "bg-white border border-black/[0.07] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.06)] " +
  "dark:bg-[#0d0d10] dark:border-white/[0.07] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.055),0_4px_32px_rgba(0,0,0,0.5)]";

const EdgeGlow = () => (
  <div className="hidden dark:block absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.13] to-transparent pointer-events-none z-10" />
);

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function ResultDetailPage() {
  const { resultId } = useParams<{ resultId: string }>();
  const navigate = useNavigate();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const { data: result, isLoading } = useResultDetail(resultId ?? "");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f4f4f7] dark:bg-[#050506] flex items-center justify-center">
        <Spinner className="w-7 h-7 text-[#5E6AD2]" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-[#f4f4f7] dark:bg-[#050506] flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-lg font-semibold text-gray-900 dark:text-[#EDEDEF]">Result not found</p>
          <button onClick={() => navigate("/dashboard")}
            className="text-sm text-[#5E6AD2] hover:text-[#6872D9] transition-colors">
            ← Dashboard
          </button>
        </div>
      </div>
    );
  }

  const b = badge(result.accuracy);
  const breakdown = (result.sectionBreakdown ?? []) as SectionBreakdown[];
  const color = accColor(result.accuracy);
  const wrong = result.totalQuestions - result.correctAnswers;

  return (
    <div className="min-h-screen bg-[#f4f4f7] dark:bg-[#050506] transition-colors duration-300">

      {/* ── Atmospheric background ── */}
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

      <Navbar />

      <main className="relative z-10  w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-6 lg:py-8 space-y-6 lg:space-y-7">

        {/* Back + header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <button onClick={() => navigate("/results")}
              className="inline-flex items-center gap-2 text-sm text-gray-400 dark:text-[#8A8F98] hover:text-gray-700 dark:hover:text-[#EDEDEF] transition-colors mb-2 group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
              Back to Results
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-[#EDEDEF] truncate max-w-2xl">
              {result.title}
            </h1>
            {(result.role || result.company) && (
              <p className="text-sm text-[#5E6AD2] dark:text-[#a5adff] mt-0.5">
                {[result.role, result.company].filter(Boolean).join(" @ ")}
              </p>
            )}
          </div>
          <motion.button whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/assessment/new")}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl bg-[#5E6AD2] text-white hover:bg-[#6872D9] shrink-0 transition-all duration-200 shadow-[0_0_0_1px_rgba(94,106,210,0.5),0_4px_14px_rgba(94,106,210,0.35),inset_0_1px_0_rgba(255,255,255,0.15)] cursor-pointer">
            <Plus className="w-4 h-4" />
            New Assessment
          </motion.button>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">

          {/* Score hero — 5/12 */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className={CARD + " xl:col-span-5 p-7 flex flex-col justify-between"}>
            {/* Radial glow matching accuracy color */}
            <div className="absolute inset-0 opacity-[0.07] dark:opacity-[0.10] pointer-events-none"
              style={{ background: `radial-gradient(circle at 20% 30%,${color},transparent 55%)` }} />
            <EdgeGlow />

            <div className="relative z-10">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <span className="text-xs font-semibold text-gray-400 dark:text-[#8A8F98] uppercase tracking-widest">
                    Score Report
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border text-sm font-semibold"
                  style={{ borderColor: `${b.color}40`, background: `${b.color}12`, color: b.color }}>
                  {b.emoji} {b.label}
                </div>
              </div>

              {/* Big score */}
              <div className="flex items-end gap-4 mb-6">
                <span className="text-7xl font-bold leading-none tabular-nums tracking-tight"
                  style={{ color }}>
                  {result.accuracy}
                </span>
                <div className="mb-2">
                  <span className="text-2xl font-bold text-gray-400 dark:text-[#8A8F98]">%</span>
                  <p className="text-sm text-gray-400 dark:text-[#8A8F98] mt-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {formatDuration(result.timeSpent)}
                  </p>
                </div>
              </div>

              {/* Correct / Wrong / Total */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Correct", val: result.correctAnswers, color: "#22c55e" },
                  { label: "Wrong", val: wrong, color: "#ef4444" },
                  { label: "Total", val: result.totalQuestions, color: "#5E6AD2" },
                ].map((s) => (
                  <div key={s.label}
                    className="rounded-xl p-3 text-center border border-black/[0.05] dark:border-white/[0.06] bg-gray-50 dark:bg-white/[0.04]">
                    <p className="text-xl font-bold tabular-nums" style={{ color: s.color }}>{s.val}</p>
                    <p className="text-xs text-gray-400 dark:text-[#8A8F98] mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Section summary cards — 7/12 */}
          <div className="xl:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {breakdown.map((sec, i) => {
              const c = accColor(sec.accuracy);
              return (
                <motion.div key={sec.sectionId}
                  initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 + i * 0.06, duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ y: -2, scale: 1.01 }}
                  className={CARD + " p-4 cursor-default transition-all duration-200 hover:shadow-[0_6px_24px_rgba(0,0,0,0.10)] dark:hover:shadow-[0_0_0_1px_rgba(255,255,255,0.09),0_10px_40px_rgba(0,0,0,0.8)]"}>
                  <div className="absolute inset-0 opacity-[0.07] dark:opacity-[0.10] pointer-events-none"
                    style={{ background: `radial-gradient(circle at 80% 15%,${c},transparent 60%)` }} />
                  <EdgeGlow />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-lg shrink-0">{sec.icon ?? "📋"}</span>
                        <p className="text-sm font-semibold text-gray-800 dark:text-[#EDEDEF] truncate">{sec.sectionName}</p>
                      </div>
                      <span className="text-xs font-bold tabular-nums shrink-0 mt-0.5" style={{ color: c }}>{sec.accuracy}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 dark:bg-white/[0.07] rounded-full overflow-hidden mb-2">
                      <motion.div className="h-full rounded-full"
                        style={{ background: `linear-gradient(90deg,${c}88,${c})` }}
                        initial={{ width: 0 }} animate={{ width: `${sec.accuracy}%` }}
                        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.12 + i * 0.06 }} />
                    </div>
                    <p className="text-xs text-gray-400 dark:text-[#8A8F98]">
                      {sec.correctAnswers}/{sec.totalQuestions} correct
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {breakdown.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-3">
            <h2 className="text-base font-semibold text-gray-900 dark:text-[#EDEDEF]">
              Question Breakdown
            </h2>

            {breakdown.map((sec, si) => {
              const c = accColor(sec.accuracy);
              const isExpanded = expandedSection === sec.sectionId;

              return (
                <motion.div key={sec.sectionId}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.22 + si * 0.05 }}
                  className={CARD + " overflow-hidden transition-all duration-200 hover:border-[#5E6AD2]/20 dark:hover:border-[#5E6AD2]/25"}>
                  <EdgeGlow />

                  {/* Section header toggle */}
                  <button
                    onClick={() => setExpandedSection(isExpanded ? null : sec.sectionId)}
                    className="relative z-10 w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-white/[0.025] transition-colors text-left">
                    <span className="text-xl shrink-0">{sec.icon ?? "📋"}</span>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 dark:text-[#EDEDEF]">{sec.sectionName}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <div className="h-1.5 bg-gray-100 dark:bg-white/[0.07] rounded-full overflow-hidden w-28">
                          <div className="h-full rounded-full" style={{ width: `${sec.accuracy}%`, background: c }} />
                        </div>
                        <span className="text-xs font-bold" style={{ color: c }}>{sec.accuracy}%</span>
                        <span className="text-xs text-gray-400 dark:text-[#8A8F98]">
                          {sec.correctAnswers}/{sec.totalQuestions} correct
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-gray-400 dark:text-[#8A8F98]">
                        {isExpanded ? "Collapse" : "Expand"}
                      </span>
                      {isExpanded
                        ? <ChevronUp className="w-4 h-4 text-gray-400 dark:text-[#8A8F98]" />
                        : <ChevronDown className="w-4 h-4 text-gray-400 dark:text-[#8A8F98]" />}
                    </div>
                  </button>

                  {/* Questions list */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden">
                        <div className="border-t border-black/[0.05] dark:border-white/[0.05] divide-y divide-black/[0.04] dark:divide-white/[0.04]">
                          {sec.questions.map((q, qi) => (
                            <div key={q.questionId} className="px-5 py-4">
                              <div className="flex items-start gap-3">
                                {/* Q number */}
                                <span className="text-xs font-mono text-[#5E6AD2] dark:text-[#a5adff] shrink-0 mt-0.5 w-6 font-semibold">
                                  {String(qi + 1).padStart(2, "0")}
                                </span>

                                {/* Status icon */}
                                <div className="shrink-0 mt-0.5">
                                  {q.isCorrect ? (
                                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                                  ) : q.yourAnswer ? (
                                    <XCircle className="w-4 h-4 text-red-500" />
                                  ) : (
                                    <Minus className="w-4 h-4 text-gray-300 dark:text-white/25" />
                                  )}
                                </div>

                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-gray-700 dark:text-[#EDEDEF] leading-relaxed mb-3">
                                    {q.questionText}
                                  </p>

                                  <div className="flex flex-wrap gap-3">
                                    {/* Your answer */}
                                    <div className="flex items-center gap-1.5 text-xs">
                                      <span className="text-gray-400 dark:text-[#8A8F98]">Your answer:</span>
                                      <span className={[
                                        "font-semibold",
                                        q.isCorrect ? "text-emerald-600 dark:text-emerald-400"
                                          : q.yourAnswer ? "text-red-600 dark:text-red-400"
                                            : "text-gray-400 dark:text-[#8A8F98] italic",
                                      ].join(" ")}>
                                        {q.yourAnswer ? q.yourAnswer.slice(0, 50) : "Not answered"}
                                      </span>
                                    </div>

                                    {/* Correct answer (only if wrong) */}
                                    {!q.isCorrect && q.correctAnswer && (
                                      <div className="flex items-center gap-1.5 text-xs">
                                        <CheckCircle className="w-3 h-3 text-emerald-500 shrink-0" />
                                        <span className="text-gray-400 dark:text-[#8A8F98]">Correct:</span>
                                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                                          {q.correctAnswer.slice(0, 50)}
                                        </span>
                                      </div>
                                    )}

                                    {/* Topic chip */}
                                    {q.topic && (
                                      <span className="text-[11px] px-2 py-0.5 rounded-lg bg-gray-50 dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.08] text-gray-400 dark:text-[#8A8F98]">
                                        {q.topic}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* CTA */}
        <div className="flex justify-center pt-4 pb-8">
          <motion.button whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/assessment/new")}
            className="flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl bg-[#5E6AD2] text-white hover:bg-[#6872D9] transition-all duration-200 shadow-[0_0_0_1px_rgba(94,106,210,0.5),0_4px_14px_rgba(94,106,210,0.35),inset_0_1px_0_rgba(255,255,255,0.15)] hover:shadow-[0_0_0_1px_rgba(104,114,217,0.6),0_6px_20px_rgba(94,106,210,0.45)]">
            <Sparkles className="w-4 h-4" />
            Create Another Assessment
          </motion.button>
        </div>
      </main>
    </div>
  );
}