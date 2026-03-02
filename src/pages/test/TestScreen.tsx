
import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, Flag, Grid3x3,
  CheckCircle2, AlertCircle, Clock,
} from "lucide-react";

import {
  useStartSession, useSaveAnswers,
  useSubmitAssessment, useSessionState,
} from "@/api/assessment.query";
import { Spinner } from "@/components/ui/spinner";
import { formatTime } from "@/lib/utils";
import type { Answer, SessionQuestion } from "@/types";

import ToggleButton from "@/utility/Toogle";
import { useTheme } from "../components/Navbar";


const MODAL_CARD =
  "bg-white dark:bg-[#0d0d10] border border-black/[0.08] dark:border-white/[0.08] " +
  "shadow-[0_2px_24px_rgba(0,0,0,0.12)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_8px_48px_rgba(0,0,0,0.8)]";


export default function TestScreenPage() {
  const { id: assessmentId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const startSession = useStartSession(assessmentId ?? "");
  const saveAnswers = useSaveAnswers(assessmentId ?? "");
  const submit = useSubmitAssessment(assessmentId ?? "");
  const { data: sessionState, isLoading: stateLoading } = useSessionState(assessmentId ?? "");

  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [remainingSecs, setRemaining] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const { dark } = useTheme();
  const [session, setSession] = useState<typeof sessionState | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Init ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (initialized) return;
    const startOrResume = async () => {
      try {
        let state = sessionState;
        if (!state || state.session.status === "PENDING") {
          state = await startSession.mutateAsync();
        }
        if (!state) return;
        setSession(state);
        setAnswers(state.session.questions.map((q) => ({
          questionId: q.id,
          answer: q.userAnswer ?? "",
          isMarkedForReview: false,
        })));
        setRemaining(state.remainingSeconds ?? state.session.duration);
        setInitialized(true);
      } catch { navigate("/dashboard"); }
    };
    if (!stateLoading) startOrResume();
  }, [stateLoading, initialized]);

  // ── Countdown ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!initialized || remainingSecs <= 0) return;
    const id = setInterval(() => {
      setRemaining((s) => {
        if (s <= 1) {
          clearInterval(id);
          setAnswers((latest) => {
            submit.mutate(
              latest.map(({ questionId, answer }) => ({ questionId, answer })),
              { onSuccess: (data) => navigate(`/results/${data.resultId}`) }
            );
            return latest;
          });
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [initialized]);

  // ── Auto-save ─────────────────────────────────────────────────────────────
  const autoSave = useCallback((ans: Answer[]) => {
    if (!assessmentId) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      const clean = ans.filter((a) => a.answer).map(({ questionId, answer }) => ({ questionId, answer }));
      if (clean.length) saveAnswers.mutate(clean);
    }, 800);
  }, [assessmentId]);

  const handleSelect = (questionId: string, option: string) => {
    const updated = answers.map((a) => a.questionId === questionId ? { ...a, answer: option } : a);
    setAnswers(updated);
    autoSave(updated);
  };

  const handleMarkReview = (questionId: string) => {
    setAnswers((prev) => prev.map((a) =>
      a.questionId === questionId ? { ...a, isMarkedForReview: !a.isMarkedForReview } : a
    ));
  };

  const handleNav = (idx: number) => { setCurrentIndex(idx); setPaletteOpen(false); };

  const handleSubmit = () => {
    if (!assessmentId) return;
    submit.mutate(
      answers.map(({ questionId, answer }) => ({ questionId, answer })),
      { onSuccess: (data) => navigate(`/results/${data.resultId}`) }
    );
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (stateLoading || !initialized || startSession.isPending) {
    return (
      <div className="min-h-screen bg-[#f4f4f7] dark:bg-[#050506] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-[#5E6AD2]/10 border border-[#5E6AD2]/20 flex items-center justify-center">
          <Spinner className="w-5 h-5 text-[#5E6AD2]" />
        </div>
        <p className="text-sm text-gray-400 dark:text-[#8A8F98]">
          {startSession.isPending ? "Starting your session…" : "Loading test…"}
        </p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-[#f4f4f7] dark:bg-[#050506] flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-lg font-semibold text-gray-900 dark:text-[#EDEDEF]">Session not found</p>
          <button onClick={() => navigate("/dashboard")} className="text-sm text-[#5E6AD2] hover:underline">
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ── Derived ───────────────────────────────────────────────────────────────

  const questions = session.session.questions;
  const sections = session.session.assessment.sections ?? [];
  const q = questions[currentIndex];
  const totalQ = questions.length;
  const answeredCount = answers.filter((a) => a.answer).length;
  const markedCount = answers.filter((a) => a.isMarkedForReview).length;
  const pct = Math.round((answeredCount / totalQ) * 100);
  const currentAnswer = answers.find((a) => a.questionId === q?.id);
  const timerDanger = remainingSecs < 300;
  const timerWarn = remainingSecs < 600;
  const sectionForQ = (q: SessionQuestion) => sections.find((s) => s.id === q.assessmentSectionId);
  const navBorder = dark
    ? "rgba(255,255,255,0.06)"
    : "rgba(0,0,0,0.07)";

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f4f7] dark:bg-[#050506] transition-colors duration-300">

      {/* ── Sticky header ─────────────────────────────────────────────────── */}
      <header className="shrink-0 sticky top-0 z-40 flex items-center justify-between px-4 sm:px-6 py-3 border-b border-black/[0.06] dark:border-white/[0.07] bg-white/90 dark:bg-[#050506]/95 backdrop-blur-xl">

        {/* Left: logo + title */}
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-[30px] h-[30px] rounded-xl overflow-hidden flex-shrink-0"
            style={{ boxShadow: `0 0 0 1px ${navBorder}` }}
          >
            <img src="/logo.webp" alt="OAForge" className="w-full h-full object-cover" />
          </div>
          <span className="font-bold text-sm text-gray-900 dark:text-[#EDEDEF] shrink-0">OAForge</span>
          <span className="text-gray-300 dark:text-white/20 hidden sm:block">·</span>
          <span className="text-sm text-gray-400 dark:text-[#8A8F98] truncate hidden sm:block max-w-[220px]">
            {session.session.assessment.title}
          </span>
        </div>

        {/* Right: progress + timer + palette + submit */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* Progress bar */}
          <div className="hidden md:flex items-center gap-2">
            <div className="w-24 h-1.5 bg-gray-100 dark:bg-white/[0.08] rounded-full overflow-hidden">
              <motion.div className="h-full bg-[#5E6AD2] rounded-full"
                animate={{ width: `${pct}%` }} transition={{ duration: 0.5 }} />
            </div>
            <span className="text-xs text-gray-400 dark:text-[#8A8F98] tabular-nums">
              {answeredCount}/{totalQ}
            </span>
          </div>

          {/* Timer */}
          <div className={[
            "flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-sm font-mono font-bold border transition-all",
            timerDanger
              ? "bg-red-50 border-red-200 text-red-600 dark:bg-red-500/[0.10] dark:border-red-500/[0.25] dark:text-red-400"
              : timerWarn
                ? "bg-amber-50 border-amber-200 text-amber-600 dark:bg-amber-500/[0.10] dark:border-amber-500/[0.25] dark:text-amber-400"
                : "bg-[#5E6AD2]/[0.08] border-[#5E6AD2]/[0.20] text-[#5E6AD2] dark:text-[#a5adff]",
          ].join(" ")}>
            <Clock className={`w-3.5 h-3.5 ${timerDanger ? "animate-pulse" : ""}`} />
            {formatTime(remainingSecs)}
          </div>

          {/* Palette toggle */}
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => setPaletteOpen(!paletteOpen)}
            className={[
              "p-2 rounded-xl border transition-all duration-200",
              paletteOpen
                ? "bg-[#5E6AD2]/10 border-[#5E6AD2]/30 text-[#5E6AD2]"
                : "border-gray-200 dark:border-white/[0.09] text-gray-400 dark:text-[#8A8F98] hover:text-[#5E6AD2] hover:border-[#5E6AD2]/30",
            ].join(" ")}>
            <Grid3x3 className="w-4 h-4" />
          </motion.button>
          <ToggleButton />
          {/* Submit */}
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => setShowConfirm(true)}
            className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold bg-[#5E6AD2] text-white rounded-xl hover:bg-[#6872D9] transition-all duration-200 shadow-[0_0_0_1px_rgba(94,106,210,0.5),0_3px_10px_rgba(94,106,210,0.3)]">
            Submit →
          </motion.button>
        </div>
      </header>

      {/* ── Body: question + optional palette ─────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Question area ── */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 lg:px-12 py-8">
          <AnimatePresence mode="wait">
            <motion.div key={currentIndex}
              initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -14 }} transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-2xl mx-auto">

              {/* Meta chips row */}
              <div className="flex items-center gap-2 mb-6 flex-wrap">
                <span className="text-xs font-mono font-semibold text-[#5E6AD2] dark:text-[#a5adff] bg-[#5E6AD2]/[0.08] px-2.5 py-1 rounded-lg border border-[#5E6AD2]/[0.18]">
                  Q{String(currentIndex + 1).padStart(2, "0")} / {String(totalQ).padStart(2, "0")}
                </span>
                {sectionForQ(q) && (
                  <span className="text-xs px-2.5 py-1 bg-[#5E6AD2]/[0.07] border border-[#5E6AD2]/[0.18] text-[#5E6AD2] dark:text-[#a5adff] rounded-lg">
                    {sectionForQ(q)?.icon} {sectionForQ(q)?.name}
                  </span>
                )}
                {q.topic && (
                  <span className="text-xs px-2.5 py-1 bg-gray-50 dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.08] text-gray-500 dark:text-[#8A8F98] rounded-lg">
                    {q.topic}
                  </span>
                )}
                {q.difficulty && (
                  <span className={[
                    "text-xs px-2.5 py-1 rounded-lg border font-medium",
                    q.difficulty === "easy"
                      ? "bg-emerald-50 dark:bg-emerald-500/[0.08] border-emerald-200 dark:border-emerald-500/[0.20] text-emerald-600 dark:text-emerald-400"
                      : q.difficulty === "hard"
                        ? "bg-red-50 dark:bg-red-500/[0.08] border-red-200 dark:border-red-500/[0.20] text-red-600 dark:text-red-400"
                        : "bg-amber-50 dark:bg-amber-500/[0.08] border-amber-200 dark:border-amber-500/[0.20] text-amber-600 dark:text-amber-400",
                  ].join(" ")}>
                    {q.difficulty}
                  </span>
                )}
              </div>

              {/* Question text */}
              <p className="text-base sm:text-lg leading-relaxed text-gray-900 dark:text-[#EDEDEF] mb-7 whitespace-pre-wrap font-medium">
                {q.questionText}
              </p>

              {/* Options */}
              <div className="flex flex-col gap-2.5">
                {(q.options as string[]).map((opt) => {
                  const selected = currentAnswer?.answer === opt;
                  return (
                    <motion.button key={opt}
                      whileHover={{ scale: 1.005 }} whileTap={{ scale: 0.995 }}
                      onClick={() => handleSelect(q.id, opt)}
                      className={[
                        "flex items-start gap-3.5 px-4 py-3.5 text-left rounded-xl border transition-all duration-200",
                        selected
                          ? "bg-[#5E6AD2]/[0.08] border-[#5E6AD2]/50 dark:border-[#5E6AD2]/40 shadow-[0_0_0_1px_rgba(94,106,210,0.15)]"
                          : "bg-white dark:bg-[#0d0d10] border-gray-200 dark:border-white/[0.08] text-gray-500 dark:text-[#8A8F98] hover:border-[#5E6AD2]/30 hover:bg-[#5E6AD2]/[0.03] dark:hover:border-[#5E6AD2]/25 dark:hover:bg-[#5E6AD2]/[0.04]",
                      ].join(" ")}>
                      {/* Option letter badge */}
                      <span className={[
                        "shrink-0 mt-0.5 w-6 h-6 rounded-lg text-[11px] font-bold flex items-center justify-center border transition-all",
                        selected
                          ? "bg-[#5E6AD2] border-[#5E6AD2] text-white shadow-[0_0_8px_rgba(94,106,210,0.4)]"
                          : "bg-gray-50 dark:bg-white/[0.06] border-gray-200 dark:border-white/[0.09] text-gray-400 dark:text-[#8A8F98]",
                      ].join(" ")}>
                        {opt[0]}
                      </span>
                      <span className={[
                        "text-sm leading-relaxed transition-colors",
                        selected ? "text-gray-900 dark:text-[#EDEDEF] font-medium" : "",
                      ].join(" ")}>
                        {opt.slice(3)}
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Navigation footer */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100 dark:border-white/[0.06]">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={() => handleMarkReview(q.id)}
                  className={[
                    "flex items-center gap-2 px-3.5 py-2 text-sm rounded-xl border transition-all duration-200",
                    currentAnswer?.isMarkedForReview
                      ? "bg-amber-50 dark:bg-amber-500/[0.10] border-amber-300 dark:border-amber-500/[0.35] text-amber-600 dark:text-amber-400 font-semibold"
                      : "border-gray-200 dark:border-white/[0.09] text-gray-400 dark:text-[#8A8F98] hover:text-amber-500 hover:border-amber-300 dark:hover:border-amber-500/[0.30]",
                  ].join(" ")}>
                  <Flag className="w-3.5 h-3.5" />
                  {currentAnswer?.isMarkedForReview ? "Marked" : "Mark for Review"}
                </motion.button>

                <div className="flex gap-2">
                  {currentIndex > 0 && (
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      onClick={() => handleNav(currentIndex - 1)}
                      className="flex items-center gap-1 px-4 py-2 text-sm font-medium border border-gray-200 dark:border-white/[0.09] text-gray-600 dark:text-[#8A8F98] rounded-xl hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-all">
                      <ChevronLeft className="w-4 h-4" /> Prev
                    </motion.button>
                  )}
                  {currentIndex < totalQ - 1 && (
                    <motion.button whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.97 }}
                      onClick={() => handleNav(currentIndex + 1)}
                      className="flex items-center gap-1 px-4 py-2 text-sm font-semibold bg-[#5E6AD2] text-white rounded-xl hover:bg-[#6872D9] transition-all duration-200 shadow-[0_0_0_1px_rgba(94,106,210,0.5),0_3px_10px_rgba(94,106,210,0.3)]">
                      Next <ChevronRight className="w-4 h-4" />
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </main>

        {/* ── Question palette sidebar ── */}
        <AnimatePresence>
          {paletteOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }} animate={{ width: 230, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }} transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="shrink-0 overflow-hidden border-l border-black/[0.06] dark:border-white/[0.07] bg-white dark:bg-[#080809]">
              <div className="p-4 w-[230px] overflow-y-auto h-full">
                <p className="text-xs font-bold text-gray-500 dark:text-[#8A8F98] uppercase tracking-widest mb-3">
                  Question Palette
                </p>

                {/* Legend */}
                <div className="grid grid-cols-2 gap-1.5 mb-4">
                  {[
                    { bg: "bg-[#5E6AD2]", label: "Current" },
                    { bg: "bg-emerald-500", label: "Answered" },
                    { bg: "bg-amber-500", label: "Marked" },
                    { bg: "bg-gray-100 dark:bg-white/[0.08]", label: "Unanswered" },
                  ].map((l) => (
                    <div key={l.label} className="flex items-center gap-1.5 text-[11px]">
                      <div className={`w-3 h-3 rounded-md ${l.bg}`} />
                      <span className="text-gray-400 dark:text-[#8A8F98]">{l.label}</span>
                    </div>
                  ))}
                </div>

                {/* Sections */}
                {sections.map((sec) => {
                  const secQs = questions.map((sq, i) => ({ sq, i })).filter(({ sq }) => sq.assessmentSectionId === sec.id);
                  if (!secQs.length) return null;
                  return (
                    <div key={sec.id} className="mb-4">
                      <p className="text-[10px] font-semibold text-gray-400 dark:text-[#8A8F98] uppercase tracking-wide mb-2">
                        {sec.icon} {sec.name}
                      </p>
                      <div className="grid grid-cols-5 gap-1">
                        {secQs.map(({ sq, i }) => {
                          const a = answers[i];
                          return (
                            <motion.button key={sq.id} whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.92 }}
                              onClick={() => handleNav(i)}
                              className={[
                                "w-8 h-8 rounded-lg text-[11px] font-bold transition-all duration-150",
                                i === currentIndex
                                  ? "bg-[#5E6AD2] text-white shadow-[0_2px_8px_rgba(94,106,210,0.4)]"
                                  : a?.isMarkedForReview
                                    ? "bg-amber-500 text-white"
                                    : a?.answer
                                      ? "bg-emerald-500 text-white"
                                      : "bg-gray-100 dark:bg-white/[0.07] text-gray-500 dark:text-[#8A8F98]",
                              ].join(" ")}>
                              {i + 1}
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {/* Stats */}
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/[0.06] space-y-2">
                  {[
                    { label: "Answered", val: answeredCount, color: "text-emerald-500" },
                    { label: "Marked", val: markedCount, color: "text-amber-500" },
                    { label: "Remaining", val: totalQ - answeredCount, color: "text-gray-400 dark:text-[#8A8F98]" },
                  ].map((s) => (
                    <div key={s.label} className="flex justify-between text-xs">
                      <span className="text-gray-400 dark:text-[#8A8F98]">{s.label}</span>
                      <span className={`font-bold ${s.color}`}>{s.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* ── Submit confirm modal ───────────────────────────────────────────── */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.94, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }} transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className={`w-full max-w-sm rounded-2xl p-6 ${MODAL_CARD}`}>

              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#5E6AD2]/10 border border-[#5E6AD2]/20 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-[#5E6AD2]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-[#EDEDEF]">Submit Test?</h3>
                  <p className="text-xs text-gray-400 dark:text-[#8A8F98]">This action cannot be undone.</p>
                </div>
              </div>

              {/* Stats */}
              <div className="rounded-xl bg-gray-50 dark:bg-white/[0.04] border border-gray-100 dark:border-white/[0.06] divide-y divide-gray-100 dark:divide-white/[0.05] mb-5 overflow-hidden">
                {[
                  { label: "Answered", val: answeredCount, Icon: CheckCircle2, color: "text-emerald-500" },
                  { label: "Unanswered", val: totalQ - answeredCount, Icon: AlertCircle, color: "text-red-500" },
                  ...(markedCount > 0 ? [{ label: "Marked for Review", val: markedCount, Icon: Flag, color: "text-amber-500" }] : []),
                ].map((r) => (
                  <div key={r.label} className="flex items-center justify-between px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <r.Icon className={`w-3.5 h-3.5 ${r.color}`} />
                      <span className="text-sm text-gray-500 dark:text-[#8A8F98]">{r.label}</span>
                    </div>
                    <span className={`text-sm font-bold ${r.color}`}>{r.val}</span>
                  </div>
                ))}
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-2.5 text-sm font-medium border border-gray-200 dark:border-white/[0.09] text-gray-600 dark:text-[#8A8F98] rounded-xl hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-all">
                  Cancel
                </motion.button>
                <motion.button whileHover={{ scale: 1.01, y: -1 }} whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit}
                  disabled={submit.isPending}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold bg-[#5E6AD2] text-white rounded-xl hover:bg-[#6872D9] disabled:opacity-60 transition-all duration-200 shadow-[0_0_0_1px_rgba(94,106,210,0.5),0_4px_14px_rgba(94,106,210,0.3)]">
                  {submit.isPending ? <><Spinner className="w-4 h-4" /> Submitting…</> : "Submit →"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}