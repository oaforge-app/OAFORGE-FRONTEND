// src/pages/ResultDetail.tsx
// ✅ No props — reads resultId from URL: /results/:resultId
// ✅ Import: useResultDetail from results.query

import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle, XCircle, Minus } from "lucide-react";

import { useResultDetail } from "@/api/results.query";
import { Spinner } from "@/components/ui/spinner";
import { getAccuracyBadge, formatDuration } from "@/lib/utils";

export default function ResultDetailPage() {
  const { resultId } = useParams<{ resultId: string }>();
  const navigate = useNavigate();

  const { data: result, isLoading } = useResultDetail(resultId ?? "");

  // ── Guard states ──────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <Spinner className="w-8 h-8 mx-auto" />
          <p className="text-sm text-muted-foreground">Loading result…</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-lg font-semibold">Result not found</p>
          <button onClick={() => navigate("/dashboard")} className="text-sm text-primary hover:underline">
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const badge     = getAccuracyBadge(result.accuracy);
  const breakdown = (result.breakdown ?? []) as any[];

  // Group breakdown by topic for the performance chart
  const topicMap = new Map<string, { correct: number; total: number }>();
  breakdown.forEach((b) => {
    const cur = topicMap.get(b.topic) ?? { correct: 0, total: 0 };
    topicMap.set(b.topic, {
      correct: cur.correct + (b.isCorrect ? 1 : 0),
      total:   cur.total + 1,
    });
  });
  const topicStats = [...topicMap.entries()].map(([topic, { correct, total }]) => ({
    topic, correct, total, pct: Math.round((correct / total) * 100),
  }));

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-8">

        {/* Back */}
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        {/* ── Score hero card ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-card border border-border rounded-xl p-7 mb-5"
        >
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-4">
            Score Report · {result.sectionName}
          </p>

          <div className="flex items-end gap-5 mb-6">
            <span className="text-6xl font-bold leading-none">{result.accuracy}%</span>
            <div className="mb-1">
              <p className="text-base font-medium" style={{ color: badge.color }}>
                {badge.emoji} {badge.label}
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">
                {result.correctAnswers}/{result.totalQuestions} correct · {formatDuration(result.timeSpent)}
              </p>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 divide-x divide-border border border-border rounded-lg overflow-hidden">
            {[
              { label: "Correct",  val: result.correctAnswers,                        color: "text-green-500"   },
              { label: "Wrong",    val: result.totalQuestions - result.correctAnswers, color: "text-destructive" },
              { label: "Accuracy", val: `${result.accuracy}%`,                        color: "text-primary"     },
            ].map((s) => (
              <div key={s.label} className="text-center py-4 bg-card">
                <div className={`text-2xl font-bold ${s.color}`}>{s.val}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Topic performance ── */}
        {topicStats.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.35 }}
            className="bg-card border border-border rounded-xl mb-5 overflow-hidden"
          >
            <div className="px-5 py-3.5 border-b border-border">
              <p className="text-sm font-medium">Performance by Topic</p>
            </div>
            <div className="p-5 space-y-3">
              {topicStats.map((t) => {
                const barColor =
                  t.pct >= 70 ? "#22c55e" : t.pct >= 40 ? "#f59e0b" : "#ef4444";
                return (
                  <div key={t.topic} className="flex items-center gap-4">
                    <p className="w-32 text-xs text-muted-foreground truncate shrink-0">{t.topic}</p>
                    <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${t.pct}%`, background: barColor }}
                      />
                    </div>
                    <p className="text-xs font-medium w-20 text-right shrink-0" style={{ color: barColor }}>
                      {t.correct}/{t.total} · {t.pct}%
                    </p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ── Question breakdown ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16, duration: 0.35 }}
          className="bg-card border border-border rounded-xl overflow-hidden"
        >
          <div className="px-5 py-3.5 border-b border-border">
            <p className="text-sm font-medium">Question Breakdown</p>
          </div>

          <div className="divide-y divide-border">
            {breakdown.map((b, i) => (
              <div key={b.questionId ?? i} className="px-5 py-4">
                <div className="flex items-start gap-3">
                  <span className="text-xs text-primary font-mono shrink-0 mt-0.5">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground leading-relaxed">{b.question}</p>

                    <div className="flex items-center gap-4 mt-2 flex-wrap">
                      {/* Your answer */}
                      <div className="flex items-center gap-1.5 text-xs">
                        {b.isCorrect ? (
                          <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                        ) : b.yourAnswer ? (
                          <XCircle className="w-3.5 h-3.5 text-destructive" />
                        ) : (
                          <Minus className="w-3.5 h-3.5 text-muted-foreground" />
                        )}
                        <span className="text-muted-foreground">Your answer: </span>
                        <span className={
                          b.isCorrect
                            ? "text-green-600 font-medium"
                            : b.yourAnswer
                            ? "text-destructive font-medium"
                            : "text-muted-foreground italic"
                        }>
                          {b.yourAnswer || "Not answered"}
                        </span>
                      </div>

                      {/* Correct answer — only shown when wrong */}
                      {!b.isCorrect && b.correctAnswer && (
                        <div className="flex items-center gap-1.5 text-xs">
                          <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                          <span className="text-muted-foreground">Correct: </span>
                          <span className="text-green-600 font-medium">{b.correctAnswer}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
}