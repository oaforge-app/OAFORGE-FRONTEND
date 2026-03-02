
import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Plus, Trash2, ToggleLeft, ToggleRight,
  Sparkles, Clock, BookOpen, ChevronDown, ChevronUp,
  CheckCircle2, Zap, Target, AlertCircle,
} from "lucide-react";

import {
  useAssessment,
  useAddCustomSection,
  useUpdateSection,
  useRemoveSection,
  useFinalizeAssessment,
} from "@/api/assessment.query";
import { Spinner } from "@/components/ui/spinner";
import type { AssessmentSection } from "@/types";
import Navbar from "../components/Navbar";


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

export default function AssessmentPlanPage() {
  const { id: assessmentId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const reasoning = (location.state as any)?.reasoning as string | undefined;

  const { data: assessment, isLoading } = useAssessment(assessmentId ?? "");
  const addSection = useAddCustomSection(assessmentId ?? "");
  const updateSection = useUpdateSection(assessmentId ?? "");
  const removeSection = useRemoveSection(assessmentId ?? "");
  const finalize = useFinalizeAssessment(assessmentId ?? "");

  const [showAddCustom, setShowAddCustom] = useState(false);
  const [showReasoning, setShowReasoning] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading || !assessment) {
    return (
      <div className="min-h-screen bg-[#f4f4f7] dark:bg-[#050506] flex items-center justify-center">
        <div className="text-center space-y-3">
          <Spinner className="w-8 h-8 mx-auto text-[#5E6AD2]" />
          <p className="text-sm text-gray-400 dark:text-[#8A8F98]">Loading plan…</p>
        </div>
      </div>
    );
  }

  // ── Redirect if already finalized ─────────────────────────────────────────
  if (assessment.status !== "PENDING") {
    if (assessment.session?.status === "PENDING" || assessment.session?.status === "ACTIVE") {
      navigate(`/assessment/${assessmentId}/test`, { replace: true });
    } else {
      navigate(`/results/${assessmentId}`, { replace: true });
    }
    return null;
  }

  const activeSections = assessment.sections.filter((s) => s.isActive);
  const totalMins = activeSections.reduce((s, sec) => s + sec.duration, 0);
  const totalQuestions = activeSections.reduce((s, sec) => s + sec.questionCount, 0);

  const handleFinalize = () => {
    finalize.mutate({}, {
      onSuccess: () => navigate(`/assessment/${assessmentId}/test`),
    });
  };

  const kpis = [
    { label: "Sections", value: String(activeSections.length), icon: BookOpen, color: "#5E6AD2" },
    { label: "Questions", value: String(totalQuestions), icon: Sparkles, color: "#a855f7" },
    { label: "Total Time", value: `${totalMins}m`, icon: Clock, color: "#f59e0b" },
    { label: "Active", value: `${activeSections.length}/${assessment.sections.length}`, icon: Target, color: "#22c55e" },
  ];

  return (
    <div className="min-h-screen bg-[#f4f4f7] dark:bg-[#050506] transition-colors duration-300">

      {/* ── Atmospheric background (mirrors Dashboard exactly) ────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="dark:hidden absolute inset-0 bg-[radial-gradient(ellipse_100%_40%_at_50%_0%,rgba(99,102,241,0.09),transparent_70%)]" />
        <div className="hidden dark:block absolute inset-0 bg-[#050506]" />
        <div className="hidden dark:block absolute inset-0 bg-[radial-gradient(ellipse_at_top,#0d0d18_0%,transparent_55%)]" />

        {/* Noise grain */}
        <div className="absolute inset-0 opacity-[0.018]"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: "128px 128px" }} />

        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.022] dark:opacity-[0.032]"
          style={{ backgroundImage: "linear-gradient(rgba(94,106,210,0.3) 1px,transparent 1px),linear-gradient(90deg,rgba(94,106,210,0.3) 1px,transparent 1px)", backgroundSize: "64px 64px" }} />

        {/* Blobs */}
        <motion.div animate={{ y: [0, -26, 0], rotate: [-3, 3, -3] }} transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="hidden dark:block absolute -top-64 left-1/2 -translate-x-1/2 w-[1400px] h-[800px] rounded-full bg-[#5E6AD2]/[0.14] blur-[180px]" />
        <motion.div animate={{ y: [0, 20, 0], x: [0, -14, 0] }} transition={{ duration: 13, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="hidden dark:block absolute bottom-0 right-0 w-[800px] h-[700px] rounded-full bg-purple-700/[0.09] blur-[160px]" />
        <div className="dark:hidden absolute -top-32 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] rounded-full bg-indigo-200/[0.28] blur-[140px]" />
        <div className="dark:hidden absolute bottom-0 right-0 w-[600px] h-[500px] rounded-full bg-violet-200/[0.20] blur-[120px]" />
      </div>

      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <Navbar />

      {/* ── Page body ──────────────────────────────────────────────────────── */}
      <main className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 lg:py-8 space-y-6">

        {/* ── Breadcrumb + header row ───────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

          {/* Back + title */}
          <div>
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 text-sm text-gray-400 dark:text-[#8A8F98] hover:text-gray-700 dark:hover:text-[#EDEDEF] transition-colors mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-[#EDEDEF]">
              {assessment.title}
            </h1>
            {(assessment.role || assessment.company) && (
              <p className="text-sm text-gray-400 dark:text-[#8A8F98] mt-1">
                {[assessment.role, assessment.company].filter(Boolean).join(" @ ")}
              </p>
            )}
          </div>

          {/* Finalize CTA */}
          <motion.button
            whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            onClick={handleFinalize}
            disabled={finalize.isPending || activeSections.length === 0}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-[#5E6AD2] text-white hover:bg-[#6872D9] shrink-0 disabled:opacity-60 transition-all duration-200 shadow-[0_0_0_1px_rgba(94,106,210,0.5),0_4px_14px_rgba(94,106,210,0.35),inset_0_1px_0_rgba(255,255,255,0.15)] hover:shadow-[0_0_0_1px_rgba(104,114,217,0.6),0_6px_20px_rgba(94,106,210,0.45)]"
          >
            {finalize.isPending ? (
              <><Spinner className="w-3.5 h-3.5" /> Generating…</>
            ) : (
              <><Zap className="w-4 h-4" /> Finalize & Generate</>
            )}
          </motion.button>
        </motion.div>

        {/* ── 4 KPI stat cards ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          {kpis.map((k, i) => (
            <motion.div key={k.label}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -3, scale: 1.01 }}
              className={CARD + " p-5 cursor-default transition-all duration-200 hover:shadow-[0_6px_24px_rgba(0,0,0,0.10)] dark:hover:shadow-[0_0_0_1px_rgba(255,255,255,0.09),0_10px_40px_rgba(0,0,0,0.8)]"}>
              <div className="absolute inset-0 opacity-[0.08] dark:opacity-[0.12] pointer-events-none"
                style={{ background: `radial-gradient(circle at 80% 15%,${k.color},transparent 60%)` }} />
              <EdgeGlow />
              <div className="relative z-10">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${k.color}1a`, border: `1px solid ${k.color}35` }}>
                  <k.icon className="w-4 h-4" style={{ color: k.color }} />
                </div>
                <p className="text-2xl xl:text-3xl font-bold tracking-tight" style={{ color: k.color }}>{k.value}</p>
                <p className="text-sm font-semibold text-gray-700 dark:text-[#EDEDEF] mt-1">{k.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Callout + AI reasoning row ───────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">

          {/* Review callout */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className={CARD + " p-5"}>
            <EdgeGlow />
            <div className="relative z-10 flex gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-emerald-500/[0.10] border border-emerald-500/[0.20]">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-[#EDEDEF]">Review then Finalize</p>
                <p className="text-xs text-gray-400 dark:text-[#8A8F98] mt-1 leading-relaxed">
                  Toggle sections on/off, adjust question counts, or add custom sections. Click <span className="text-[#5E6AD2] font-medium">Finalize & Generate</span> when ready — questions are created in parallel for all active sections.
                </p>
              </div>
            </div>
          </motion.div>

          {/* AI Reasoning */}
          {reasoning ? (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className={CARD}>
              <EdgeGlow />
              <button
                onClick={() => setShowReasoning(!showReasoning)}
                className="relative z-10 w-full flex items-center justify-between px-5 py-4 text-sm font-semibold text-[#5E6AD2] dark:text-[#a5adff] hover:bg-[#5E6AD2]/[0.04] transition-colors rounded-2xl"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Why this plan? (AI reasoning)
                </span>
                {showReasoning ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              <AnimatePresence>
                {showReasoning && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden">
                    <p className="relative z-10 px-5 pb-4 text-sm text-gray-500 dark:text-[#8A8F98] leading-relaxed border-t border-black/[0.05] dark:border-white/[0.06] pt-3">
                      {reasoning}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className={CARD + " p-5"}>
              <EdgeGlow />
              <div className="relative z-10 flex gap-3 items-center">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-[#5E6AD2]/[0.10] border border-[#5E6AD2]/[0.20]">
                  <AlertCircle className="w-4 h-4 text-[#5E6AD2]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-[#EDEDEF]">AI-Curated Plan</p>
                  <p className="text-xs text-gray-400 dark:text-[#8A8F98] mt-0.5">Sections were selected based on your role & company profile.</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* ── Section cards ─────────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>

          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-gray-900 dark:text-[#EDEDEF]">Sections</h2>
              <p className="text-sm text-gray-400 dark:text-[#8A8F98] mt-0.5">Toggle, adjust, or remove sections</p>
            </div>
          </div>

          <div className="space-y-3">
            {assessment.sections
              .sort((a, b) => a.orderIndex - b.orderIndex)
              .map((section, i) => (
                <SectionPlanCard
                  key={section.id}
                  section={section}
                  index={i}
                  expanded={expandedSection === section.id}
                  onToggleExpand={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                  onToggleActive={() => updateSection.mutate({ sectionId: section.id, data: { isActive: !section.isActive } })}
                  onUpdateCount={(n) => updateSection.mutate({ sectionId: section.id, data: { questionCount: n } })}
                  onUpdateDuration={(n) => updateSection.mutate({ sectionId: section.id, data: { duration: n } })}
                  onRemove={() => removeSection.mutate(section.id)}
                  isUpdating={updateSection.isPending || removeSection.isPending}
                />
              ))}
          </div>
        </motion.div>

        {/* ── Add custom section ────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
          {!showAddCustom ? (
            <button
              onClick={() => setShowAddCustom(true)}
              className="w-full flex items-center justify-center gap-2 py-3.5 text-sm font-medium border border-dashed border-gray-200 dark:border-white/[0.08] rounded-2xl text-gray-400 dark:text-[#8A8F98] hover:border-[#5E6AD2]/40 hover:text-[#5E6AD2] dark:hover:border-[#5E6AD2]/30 dark:hover:text-[#a5adff] transition-colors bg-white/50 dark:bg-white/[0.02]"
            >
              <Plus className="w-4 h-4" />
              Add Custom Section
            </button>
          ) : (
            <AddCustomSectionForm
              onAdd={(data) => addSection.mutate(data, { onSuccess: () => setShowAddCustom(false) })}
              onCancel={() => setShowAddCustom(false)}
              isLoading={addSection.isPending}
            />
          )}
        </motion.div>

        {/* ── Bottom finalize button ────────────────────────────────────────── */}
        <motion.button
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ scale: 1.01, y: -1 }} whileTap={{ scale: 0.99 }}
          onClick={handleFinalize}
          disabled={finalize.isPending || activeSections.length === 0}
          className="w-full flex items-center justify-center gap-2 py-3.5 text-sm font-semibold rounded-xl bg-[#5E6AD2] text-white hover:bg-[#6872D9] disabled:opacity-60 transition-all duration-200 shadow-[0_0_0_1px_rgba(94,106,210,0.5),0_4px_14px_rgba(94,106,210,0.35),inset_0_1px_0_rgba(255,255,255,0.15)] hover:shadow-[0_0_0_1px_rgba(104,114,217,0.6),0_6px_20px_rgba(94,106,210,0.45)]"
        >
          {finalize.isPending ? (
            <>
              <Spinner className="w-4 h-4" />
              Generating questions for {activeSections.length} section{activeSections.length !== 1 ? "s" : ""}… this may take 10–20s
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              Finalize & Generate Questions ({totalQuestions} total)
            </>
          )}
        </motion.button>

        <div className="h-8" />
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section Plan Card
// ─────────────────────────────────────────────────────────────────────────────

function SectionPlanCard({
  section, index, expanded,
  onToggleExpand, onToggleActive, onUpdateCount, onUpdateDuration, onRemove,
  isUpdating,
}: {
  section: AssessmentSection;
  index: number;
  expanded: boolean;
  onToggleExpand: () => void;
  onToggleActive: () => void;
  onUpdateCount: (n: number) => void;
  onUpdateDuration: (n: number) => void;
  onRemove: () => void;
  isUpdating: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -2 }}
      className={[
        "relative overflow-hidden rounded-2xl transition-all duration-200",
        "bg-white border border-black/[0.07] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.06)]",
        "dark:bg-[#0d0d10] dark:border-white/[0.07] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.055),0_4px_32px_rgba(0,0,0,0.5)]",
        section.isActive
          ? "hover:border-[#5E6AD2]/20 hover:shadow-[0_6px_24px_rgba(94,106,210,0.10)] dark:hover:border-[#5E6AD2]/20 dark:hover:shadow-[0_0_0_1px_rgba(94,106,210,0.15),0_8px_32px_rgba(0,0,0,0.7)]"
          : "opacity-50",
      ].join(" ")}>

      {/* Subtle accent glow */}
      {section.isActive && (
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-[0.07] dark:opacity-[0.10] pointer-events-none bg-[#5E6AD2]" />
      )}
      <div className="hidden dark:block absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.13] to-transparent pointer-events-none z-10" />

      {/* Main row */}
      <div className="relative z-10 flex items-center gap-3 px-4 py-4">
        <span className="text-xl w-8 text-center shrink-0">{section.icon ?? "📋"}</span>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-[#EDEDEF] truncate">{section.name}</p>
          <p className="text-xs text-gray-400 dark:text-[#8A8F98] mt-0.5">
            {section.questionCount}Q &middot; {section.duration}min
          </p>
        </div>

        {/* Active badge */}
        <div className={[
          "hidden sm:flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full border shrink-0",
          section.isActive
            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/[0.10] dark:text-emerald-400 dark:border-emerald-500/[0.20]"
            : "bg-gray-50 text-gray-400 border-gray-200 dark:bg-white/[0.04] dark:text-[#8A8F98] dark:border-white/[0.08]",
        ].join(" ")}>
          <span className={`w-1.5 h-1.5 rounded-full ${section.isActive ? "bg-emerald-400" : "bg-gray-300 dark:bg-white/20"}`} />
          {section.isActive ? "Active" : "Off"}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button onClick={onToggleExpand}
            className="p-1.5 text-gray-400 dark:text-[#8A8F98] hover:text-gray-700 dark:hover:text-[#EDEDEF] transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-white/[0.05]">
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          <button onClick={onToggleActive} disabled={isUpdating}
            className="p-1.5 text-gray-400 dark:text-[#8A8F98] hover:text-[#5E6AD2] dark:hover:text-[#a5adff] transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-white/[0.05] disabled:opacity-40">
            {section.isActive
              ? <ToggleRight className="w-5 h-5 text-[#5E6AD2] dark:text-[#a5adff]" />
              : <ToggleLeft className="w-5 h-5" />
            }
          </button>
          <button onClick={onRemove} disabled={isUpdating}
            className="p-1.5 text-gray-400 dark:text-[#8A8F98] hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-500/[0.08] disabled:opacity-40">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Expanded controls */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="relative z-10 px-4 pb-4 pt-3 border-t border-black/[0.05] dark:border-white/[0.06] space-y-4">

              {/* Topics */}
              {Array.isArray(section.topics) && section.topics.length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 dark:text-[#8A8F98] mb-2 font-medium">Topics covered</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(section.topics as string[]).map((t) => (
                      <span key={t}
                        className="text-[11px] px-2 py-0.5 rounded-lg bg-gray-50 dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.08] text-gray-500 dark:text-[#8A8F98]">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Number inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 dark:text-[#8A8F98] mb-1.5 block font-medium">Questions</label>
                  <input
                    type="number" min={5} max={30}
                    defaultValue={section.questionCount}
                    onBlur={(e) => onUpdateCount(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-black/[0.07] dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.04] text-gray-900 dark:text-[#EDEDEF] outline-none focus:border-[#5E6AD2]/40 dark:focus:border-[#5E6AD2]/40 focus:ring-1 focus:ring-[#5E6AD2]/20 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 dark:text-[#8A8F98] mb-1.5 block font-medium">Duration (min)</label>
                  <input
                    type="number" min={5} max={60}
                    defaultValue={section.duration}
                    onBlur={(e) => onUpdateDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-black/[0.07] dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.04] text-gray-900 dark:text-[#EDEDEF] outline-none focus:border-[#5E6AD2]/40 dark:focus:border-[#5E6AD2]/40 focus:ring-1 focus:ring-[#5E6AD2]/20 transition-colors"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Add Custom Section Form
// ─────────────────────────────────────────────────────────────────────────────

function AddCustomSectionForm({
  onAdd, onCancel, isLoading,
}: {
  onAdd: (d: { name: string; description?: string }) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className={CARD + " p-5"}>
      <EdgeGlow />
      {/* Accent top border */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#5E6AD2]/50 to-transparent pointer-events-none" />

      <div className="relative z-10">
        <p className="text-sm font-semibold text-gray-900 dark:text-[#EDEDEF] mb-4">Add Custom Section</p>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-400 dark:text-[#8A8F98] mb-1.5 block font-medium">Section Name *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. React.js, System Design, SQL…"
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-black/[0.07] dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.04] text-gray-900 dark:text-[#EDEDEF] placeholder:text-gray-300 dark:placeholder:text-[#8A8F98]/50 outline-none focus:border-[#5E6AD2]/40 focus:ring-1 focus:ring-[#5E6AD2]/20 transition-colors"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 dark:text-[#8A8F98] mb-1.5 block font-medium">Description <span className="opacity-60">(optional)</span></label>
            <input
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="What should this section test?"
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-black/[0.07] dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.04] text-gray-900 dark:text-[#EDEDEF] placeholder:text-gray-300 dark:placeholder:text-[#8A8F98]/50 outline-none focus:border-[#5E6AD2]/40 focus:ring-1 focus:ring-[#5E6AD2]/20 transition-colors"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button
              type="button" onClick={onCancel}
              className="flex-1 py-2.5 text-sm font-medium rounded-xl border border-black/[0.07] dark:border-white/[0.08] text-gray-600 dark:text-[#8A8F98] hover:text-gray-900 dark:hover:text-[#EDEDEF] hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors"
            >
              Cancel
            </button>
            <motion.button
              type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              disabled={!name.trim() || isLoading}
              onClick={() => onAdd({ name: name.trim(), description: desc || undefined })}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl bg-[#5E6AD2] text-white hover:bg-[#6872D9] disabled:opacity-60 transition-all duration-200 shadow-[0_0_0_1px_rgba(94,106,210,0.5),0_3px_10px_rgba(94,106,210,0.3)]"
            >
              {isLoading ? <><Spinner className="w-3.5 h-3.5" /> AI is enriching…</> : <><Plus className="w-3.5 h-3.5" /> Add Section</>}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}