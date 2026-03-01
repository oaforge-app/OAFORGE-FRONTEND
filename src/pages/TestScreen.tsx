// src/pages/TestScreen.tsx
// ✅ No props — reads sessionId from URL: /test/:sessionId
// ✅ Imports: useSession, useUpdateSession from test.query
//             useSubmitResult from results.query

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Flag, Grid3x3 } from "lucide-react";

import { useSession, useUpdateSession } from "@/api/test.query";
import { useSubmitResult } from "@/api/results.query";
import { Spinner } from "@/components/ui/spinner";
import { formatTime } from "@/lib/utils";
import type { Answer } from "@/types";

export default function TestScreenPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const { data: session, isLoading } = useSession(sessionId ?? "");
  const saveProgress = useUpdateSession();
  const submitResult = useSubmitResult();

  const [answers, setAnswers]           = useState<Answer[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [remainingSeconds, setRemaining] = useState(0);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [paletteOpen, setPaletteOpen]   = useState(false);
  const [initialized, setInitialized]   = useState(false);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialise state from session once data arrives
  useEffect(() => {
    if (!session || initialized) return;

    const saved = session.answers ?? [];
    const initial: Answer[] = session.questions.map((q) => {
      const existing = saved.find((a: Answer) => a.questionId === q.id);
      return existing ?? { questionId: q.id, answer: "", isMarkedForReview: false };
    });

    setAnswers(initial);
    setCurrentIndex(session.currentIndex ?? 0);
    setRemaining(session.remainingSeconds ?? session.duration);
    setInitialized(true);
  }, [session, initialized]);

  // Countdown timer
  useEffect(() => {
    if (!initialized || remainingSeconds <= 0) return;
    const id = setInterval(() => {
      setRemaining((s) => {
        if (s <= 1) {
          clearInterval(id);
          if (sessionId) {
            // Auto-submit on time-out using the latest answers ref
            setAnswers((latestAnswers) => {
              submitResult.mutate(
                { sessionId, answers: latestAnswers },
                { onSuccess: (data) => navigate(`/results/${data.id}`) }
              );
              return latestAnswers;
            });
          }
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [initialized]); // run once after init

  // Debounced auto-save (800 ms)
  const autoSave = useCallback(
    (ans: Answer[], idx: number) => {
      if (!sessionId) return;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        saveProgress.mutate({ id: sessionId, data: { answers: ans, currentIndex: idx } });
      }, 800);
    },
    [sessionId]
  );

  const handleSelect = (questionId: string, option: string) => {
    const updated = answers.map((a) =>
      a.questionId === questionId ? { ...a, answer: option } : a
    );
    setAnswers(updated);
    autoSave(updated, currentIndex);
  };

  const handleMarkReview = (questionId: string) => {
    setAnswers((prev) =>
      prev.map((a) =>
        a.questionId === questionId
          ? { ...a, isMarkedForReview: !a.isMarkedForReview }
          : a
      )
    );
  };

  const handleNav = (idx: number) => {
    setCurrentIndex(idx);
    setPaletteOpen(false);
    autoSave(answers, idx);
  };

  const handleSubmit = () => {
    if (!sessionId) return;
    submitResult.mutate(
      { sessionId, answers },
      { onSuccess: (data) => navigate(`/results/${data.id}`) }
    );
  };

  // ── Guard states ──────────────────────────────────────────────────────────

  if (isLoading || !initialized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <Spinner className="w-8 h-8 mx-auto" />
          <p className="text-sm text-muted-foreground">Loading test…</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-lg font-semibold">Session not found</p>
          <button onClick={() => navigate("/dashboard")} className="text-sm text-primary hover:underline">
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ── Derived values ────────────────────────────────────────────────────────

  const q             = session.questions[currentIndex];
  const currentAnswer = answers.find((a) => a.questionId === q?.id);
  const total         = session.questions.length;
  const answeredCount = answers.filter((a) => a.answer).length;
  const markedCount   = answers.filter((a) => a.isMarkedForReview).length;
  const pct           = Math.round((answeredCount / total) * 100);
  const timerDanger   = remainingSeconds < 300;
  const timerWarn     = remainingSeconds < 600;

  return (
    <div className="min-h-screen flex flex-col bg-background">

      {/* ── Header ── */}
      <header className="shrink-0 flex items-center justify-between px-5 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <span className="font-semibold">OAForge</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-sm text-muted-foreground">
            {session.sectionTemplate.icon} {session.sectionTemplate.name}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Progress bar */}
          <div className="hidden md:flex items-center gap-2">
            <div className="w-28 h-1.5 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground">{answeredCount}/{total}</span>
          </div>

          {/* Timer */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-mono font-medium border ${
            timerDanger
              ? "bg-destructive/10 border-destructive/30 text-destructive"
              : timerWarn
              ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-600"
              : "bg-primary/10 border-primary/20 text-primary"
          }`}>
            ⏱ {formatTime(remainingSeconds)}
          </div>

          {/* Palette toggle */}
          <button
            onClick={() => setPaletteOpen(!paletteOpen)}
            className={`p-2 rounded-lg border transition-colors ${
              paletteOpen
                ? "bg-primary/10 border-primary/30 text-primary"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            <Grid3x3 className="w-4 h-4" />
          </button>

          {/* Submit button */}
          <button
            onClick={() => setShowConfirm(true)}
            className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Submit →
          </button>
        </div>
      </header>

      {/* ── Main body ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Question area */}
        <main className="flex-1 overflow-y-auto px-6 py-8 md:px-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.18 }}
              className="max-w-2xl"
            >
              {/* Meta chips */}
              <div className="flex items-center gap-2 mb-5 flex-wrap">
                <span className="text-xs font-mono text-primary font-medium">
                  Q{String(currentIndex + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
                </span>
                <span className="text-[11px] px-2 py-0.5 bg-primary/10 border border-primary/20 text-primary rounded">
                  {q.topic}
                </span>
                <span className={`text-[11px] px-2 py-0.5 rounded border ${
                  q.difficulty === "easy"
                    ? "bg-green-500/10 border-green-500/20 text-green-600"
                    : q.difficulty === "hard"
                    ? "bg-red-500/10 border-red-500/20 text-red-500"
                    : "bg-yellow-500/10 border-yellow-500/20 text-yellow-600"
                }`}>
                  {q.difficulty}
                </span>
              </div>

              {/* Question text */}
              <p className="text-base leading-relaxed mb-7 whitespace-pre-wrap">{q.question}</p>

              {/* Options */}
              <div className="flex flex-col gap-2.5">
                {q.options.map((opt) => {
                  const selected = currentAnswer?.answer === opt;
                  return (
                    <button
                      key={opt}
                      onClick={() => handleSelect(q.id, opt)}
                      className={`flex items-start gap-3 px-4 py-3.5 text-left rounded-lg border transition-all ${
                        selected
                          ? "bg-primary/10 border-primary/50 text-foreground"
                          : "bg-card border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
                      }`}
                    >
                      {/* Option letter badge */}
                      <span className={`shrink-0 mt-0.5 w-5 h-5 rounded text-[10px] font-mono flex items-center justify-center border ${
                        selected
                          ? "bg-primary/20 border-primary/60 text-primary"
                          : "bg-secondary border-border text-muted-foreground"
                      }`}>
                        {opt[0]}
                      </span>
                      <span className="text-sm leading-relaxed">{opt.slice(3)}</span>
                    </button>
                  );
                })}
              </div>

              {/* Nav row */}
              <div className="flex items-center justify-between mt-7">
                <button
                  onClick={() => handleMarkReview(q.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg border transition-colors ${
                    currentAnswer?.isMarkedForReview
                      ? "bg-yellow-500/10 border-yellow-500/40 text-yellow-600"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Flag className="w-3.5 h-3.5" />
                  {currentAnswer?.isMarkedForReview ? "Marked" : "Mark for Review"}
                </button>

                <div className="flex gap-2">
                  {currentIndex > 0 && (
                    <button
                      onClick={() => handleNav(currentIndex - 1)}
                      className="flex items-center gap-1 px-4 py-2 text-xs font-medium border border-border rounded-lg hover:bg-accent transition-colors"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" /> Prev
                    </button>
                  )}
                  {currentIndex < total - 1 && (
                    <button
                      onClick={() => handleNav(currentIndex + 1)}
                      className="flex items-center gap-1 px-4 py-2 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Next <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </main>

        {/* ── Question Palette sidebar ── */}
        <AnimatePresence>
          {paletteOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 220, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="shrink-0 overflow-hidden border-l border-border bg-card"
            >
              <div className="p-4 w-[220px]">
                <p className="text-xs font-medium text-muted-foreground mb-3">Question Palette</p>

                {/* Legend */}
                <div className="flex flex-col gap-1.5 mb-4">
                  {[
                    { bg: "bg-primary",    label: "Current"    },
                    { bg: "bg-green-500",  label: "Answered"   },
                    { bg: "bg-yellow-500", label: "Marked"     },
                    { bg: "bg-secondary",  label: "Unanswered" },
                  ].map((l) => (
                    <div key={l.label} className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-sm ${l.bg}`} />
                      <span className="text-[11px] text-muted-foreground">{l.label}</span>
                    </div>
                  ))}
                </div>

                {/* Num grid */}
                <div className="grid grid-cols-5 gap-1.5">
                  {session.questions.map((_, i) => {
                    const a         = answers[i];
                    const isCurrent = i === currentIndex;
                    const isAnswered = !!a?.answer;
                    const isMarked  = !!a?.isMarkedForReview;
                    return (
                      <button
                        key={i}
                        onClick={() => handleNav(i)}
                        className={`w-8 h-8 rounded text-[10px] font-medium transition-transform hover:scale-110 ${
                          isCurrent   ? "bg-primary text-primary-foreground"
                          : isMarked  ? "bg-yellow-500 text-white"
                          : isAnswered ? "bg-green-500 text-white"
                          : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        {i + 1}
                      </button>
                    );
                  })}
                </div>

                {/* Summary counts */}
                <div className="mt-4 pt-4 border-t border-border space-y-1.5">
                  {[
                    { label: "Answered",   val: answeredCount,        color: "text-green-500"       },
                    { label: "Marked",     val: markedCount,           color: "text-yellow-500"      },
                    { label: "Remaining",  val: total - answeredCount, color: "text-muted-foreground" },
                  ].map((s) => (
                    <div key={s.label} className="flex justify-between">
                      <span className="text-[11px] text-muted-foreground">{s.label}</span>
                      <span className={`text-[11px] font-medium ${s.color}`}>{s.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* ── Submit confirmation dialog ── */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.18 }}
              className="w-full max-w-sm bg-card border border-border rounded-xl p-6"
            >
              <h3 className="font-semibold text-lg mb-1">Submit Test?</h3>
              <p className="text-sm text-muted-foreground mb-5">This cannot be undone.</p>

              <div className="space-y-2 mb-6 text-sm">
                {[
                  { label: "Answered",   val: answeredCount,        color: "text-green-500"   },
                  { label: "Unanswered", val: total - answeredCount, color: "text-destructive"  },
                  ...(markedCount > 0
                    ? [{ label: "Marked for Review", val: markedCount, color: "text-yellow-500" }]
                    : []),
                ].map((r) => (
                  <div key={r.label} className="flex justify-between">
                    <span className="text-muted-foreground">{r.label}</span>
                    <span className={`font-medium ${r.color}`}>{r.val}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-2.5 text-sm border border-border rounded-lg hover:bg-accent transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitResult.isPending}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-60 transition-colors"
                >
                  {submitResult.isPending
                    ? <><Spinner className="w-4 h-4" /> Submitting…</>
                    : "Submit →"
                  }
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}