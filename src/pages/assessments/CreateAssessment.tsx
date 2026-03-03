import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Sparkles, Building2, Briefcase,
  FileText, ChevronRight, CheckCircle2, Zap,
  AlertTriangle, Clock, BarChart3, ListChecks, AlertCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { useCreateAssessment } from "@/api/assessment.query";
import { useUser } from "@/api/auth.query";
import { Spinner } from "@/components/ui/spinner";
import Navbar from "../components/Navbar";


const schema = z.object({
  role: z.string().min(2, "Role must be at least 2 characters"),
  company: z.string().optional(),
  jdText: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

const ROLE_PRESETS = [
  "SDE-1", "SDE Intern", "Full Stack Developer",
  "Backend Engineer", "Data Analyst", "ML Engineer",
  "DevOps Engineer", "Frontend Engineer",
];

const STEPS = [
  { icon: Sparkles, label: "AI analyzes the role", desc: "Understands required skills and typical OA format" },
  { icon: ListChecks, label: "Designs your test plan", desc: "Selects sections, question counts, time allocation" },
  { icon: Zap, label: "You review & customize", desc: "Add or remove sections before finalizing" },
  { icon: Clock, label: "Questions generated in parallel", desc: "All sections ready simultaneously via Groq" },
  { icon: BarChart3, label: "Detailed score report", desc: "Section-by-section accuracy breakdown" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Design tokens
// ─────────────────────────────────────────────────────────────────────────────

const CARD =
  "relative overflow-hidden rounded-2xl " +
  "bg-white border border-black/[0.07] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.06)] " +
  "dark:bg-[#0d0d10] dark:border-white/[0.07] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.055),0_4px_32px_rgba(0,0,0,0.5)]";

const INPUT_BASE =
  "w-full py-2.5 text-sm rounded-xl outline-none transition-all duration-200 " +
  "bg-gray-50 border text-gray-900 placeholder:text-gray-400 " +
  "dark:bg-[#0F0F14] dark:text-[#EDEDEF] dark:placeholder:text-[#8A8F98] ";

const INPUT_OK = INPUT_BASE + "border-gray-200 focus:bg-white focus:border-[#5E6AD2] focus:ring-2 focus:ring-[#5E6AD2]/15 dark:border-white/[0.08] dark:focus:border-[#5E6AD2] dark:focus:ring-[#5E6AD2]/20 dark:focus:bg-[#0F0F14]";
const INPUT_ERR = INPUT_BASE + "border-red-400 bg-red-50/40 focus:ring-2 focus:ring-red-400/20 dark:border-red-500/50 dark:bg-red-500/[0.06]";

const EdgeGlow = () => (
  <div className="hidden dark:block absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.13] to-transparent pointer-events-none z-10" />
);

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}
      className="flex items-center gap-1.5 text-xs text-red-500 dark:text-red-400 mt-1.5">
      <AlertCircle className="w-3 h-3 shrink-0" />{msg}
    </motion.p>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export default function CreateAssessmentPage() {
  const navigate = useNavigate();
  const { user } = useUser();
  const createAssessment = useCreateAssessment();
  const [showJD, setShowJD] = useState(false);

  if (!user) return null;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, touchedFields, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onTouched",   // validate after blur, not on every keystroke
    defaultValues: { role: "", company: "", jdText: "" },
  });

  const role = watch("role") ?? "";
  const company = watch("company") ?? "";

  const onSubmit = (data: FormData) => {
    if (!user.hasGroqApiKey) {
      toast.error("Groq API key required", {
        description: "Add your key in Settings before creating an assessment.",
        action: { label: "Go to Settings", onClick: () => navigate("/settings") },
        duration: 6000,
      });
      return;
    }
    createAssessment.mutate(
      { role: data.role, company: data.company || undefined, jdText: data.jdText || undefined },
      {
        onSuccess: (res) => navigate(`/assessment/${res.assessment.id}/plan`, {
          state: { reasoning: res.reasoning },
        }),
      }
    );
  };

  const busy = createAssessment.isPending || isSubmitting;

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

      <main className="relative z-10  w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-6 lg:py-10">

        {/* Back */}
        <motion.button initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          onClick={() => navigate("/dashboard")}
          className="inline-flex items-center gap-2 text-sm text-gray-400 dark:text-[#8A8F98] hover:text-gray-700 dark:hover:text-[#EDEDEF] transition-colors mb-6 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
          Back to Dashboard
        </motion.button>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8 items-start">

          {/* ══ LEFT: Form (7/12) ═══════════════════════════════════════════ */}
          <div className="xl:col-span-7 space-y-5">

            {/* Page heading */}
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-9 h-9 rounded-xl bg-[#5E6AD2]/10 border border-[#5E6AD2]/20 flex items-center justify-center shadow-[0_0_16px_rgba(94,106,210,0.18)]">
                  <Sparkles className="w-4 h-4 text-[#5E6AD2]" />
                </div>
                <span className="text-xs font-semibold text-[#5E6AD2] uppercase tracking-widest">
                  AI Assessment Generator
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-[#EDEDEF] mb-2 cursor-pointer">
                Create New Assessment
              </h1>
              <p className="text-sm text-gray-400 dark:text-[#8A8F98] leading-relaxed max-w-xl">
                Enter the role you're targeting. AI will design a custom OA test plan —
                selecting the right sections, question counts, and time allocation.
              </p>
            </motion.div>

            {/* No API key warning */}
            <AnimatePresence>
              {!user.hasGroqApiKey && (
                <motion.div initial={{ opacity: 0, y: -8, height: 0 }} animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -8, height: 0 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden">
                  <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 dark:bg-amber-500/[0.07] dark:border-amber-500/[0.22]">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                      <p className="text-sm text-amber-700 dark:text-amber-400">
                        You need a <strong>Groq API key</strong> to generate AI questions.
                      </p>
                    </div>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      type="button" onClick={() => navigate("/settings")}
                      className="shrink-0 text-xs px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold transition-colors shadow-[0_2px_8px_rgba(245,158,11,0.3)]">
                      Add in Settings →
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form card */}
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className={CARD + " p-6 sm:p-8"}>
              <EdgeGlow />

              <form onSubmit={handleSubmit(onSubmit)} noValidate className="relative z-10 space-y-6">

                {/* ── Role ── */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-[#EDEDEF]">
                    Job Role <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-[#8A8F98] pointer-events-none" />
                    <input
                      {...register("role")}
                      placeholder="e.g. Software Development Engineer 1"
                      className={(errors.role ? INPUT_ERR : INPUT_OK) + " pl-10"}
                    />
                  </div>
                  <FieldError msg={errors.role?.message} />

                  {/* Presets */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {ROLE_PRESETS.map((r) => {
                      const active = role === r;
                      return (
                        <motion.button key={r} type="button"
                          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                          transition={{ duration: 0.15 }}
                          onClick={() => setValue("role", r, { shouldValidate: true, shouldDirty: true, shouldTouch: true })}
                          className={[
                            "text-xs px-2.5 py-1 rounded-full border font-medium transition-all duration-200",
                            active
                              ? "bg-[#5E6AD2]/10 border-[#5E6AD2]/40 text-[#5E6AD2] dark:text-[#a5adff] shadow-[0_0_8px_rgba(94,106,210,0.15)]"
                              : "border-gray-200 dark:border-white/[0.09] text-gray-500 dark:text-[#8A8F98] hover:border-[#5E6AD2]/30 hover:text-[#5E6AD2] dark:hover:text-[#a5adff] hover:bg-[#5E6AD2]/5",
                          ].join(" ")}>
                          {r}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                <div className="h-px bg-gray-100 dark:bg-white/[0.06]" />

                {/* ── Company ── */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-[#EDEDEF]">
                    Company{" "}
                    <span className="text-gray-400 dark:text-[#8A8F98] text-xs font-normal">(optional — but recommended)</span>
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-[#8A8F98] pointer-events-none" />
                    <input
                      {...register("company")}
                      placeholder="e.g. Google, Flipkart, TCS..."
                      className={INPUT_OK + " pl-10"}
                    />
                  </div>
                  <p className="text-xs text-gray-400 dark:text-[#8A8F98]">
                    AI tailors sections to what this company typically tests.
                  </p>
                </div>

                <div className="h-px bg-gray-100 dark:bg-white/[0.06]" />

                {/* ── JD toggle ── */}
                <div className="space-y-3">
                  <motion.button type="button"
                    whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                    onClick={() => setShowJD(!showJD)}
                    className="flex items-center gap-2 text-sm font-medium text-[#5E6AD2] dark:text-[#a5adff] hover:text-[#6872D9] transition-colors">
                    <div className="w-6 h-6 rounded-lg bg-[#5E6AD2]/10 border border-[#5E6AD2]/20 flex items-center justify-center">
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                    {showJD ? "Hide" : "Paste"} Job Description
                    <span className="text-gray-400 dark:text-[#8A8F98] text-xs font-normal">(optional)</span>
                    <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${showJD ? "rotate-90" : ""}`} />
                  </motion.button>

                  <AnimatePresence>
                    {showJD && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden">
                        <div className="space-y-1.5">
                          <textarea
                            {...register("jdText")}
                            rows={5}
                            placeholder="Paste the full JD here for more accurate section selection..."
                            className={INPUT_OK + " px-3.5 resize-none leading-relaxed"}
                          />
                          <p className="text-xs text-gray-400 dark:text-[#8A8F98]">
                            AI reads requirements and picks exactly the right topics to test.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Live preview chip */}
                <AnimatePresence>
                  {(role || company) && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }} transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      className="flex items-center gap-2 p-3.5 rounded-xl bg-[#5E6AD2]/[0.06] border border-[#5E6AD2]/[0.15] dark:bg-[#5E6AD2]/[0.08] dark:border-[#5E6AD2]/[0.18]">
                      <div className="w-5 h-5 rounded-md bg-[#5E6AD2]/15 flex items-center justify-center shrink-0">
                        <Sparkles className="w-3 h-3 text-[#5E6AD2]" />
                      </div>
                      <p className="text-xs text-gray-600 dark:text-[#8A8F98]">
                        Generating for{" "}
                        <span className="font-semibold text-gray-900 dark:text-[#EDEDEF]">{role || "…"}</span>
                        {company && (
                          <> @ <span className="font-semibold text-gray-900 dark:text-[#EDEDEF]">{company}</span></>
                        )}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit */}
                <motion.button type="submit" disabled={busy}
                  whileHover={!busy ? { scale: 1.01, y: -1 } : {}}
                  whileTap={!busy ? { scale: 0.98 } : {}}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full flex items-center justify-center gap-2.5 py-3 text-sm font-semibold rounded-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed bg-[#5E6AD2] text-white hover:bg-[#6872D9] shadow-[0_0_0_1px_rgba(94,106,210,0.5),0_4px_14px_rgba(94,106,210,0.35),inset_0_1px_0_rgba(255,255,255,0.15)] hover:shadow-[0_0_0_1px_rgba(104,114,217,0.6),0_6px_20px_rgba(94,106,210,0.45)]">
                  {busy ? (
                    <><Spinner className="w-4 h-4" /> AI is designing your test plan…</>
                  ) : (
                    <><Sparkles className="w-4 h-4" /> Generate Assessment Plan</>
                  )}
                </motion.button>
              </form>
            </motion.div>
          </div>

          {/* ══ RIGHT: Info panel (5/12) ═════════════════════════════════════ */}
          <div className="xl:col-span-5 space-y-4">

            {/* How it works */}
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className={CARD + " p-6"}>
              <EdgeGlow />
              <div className="relative z-10">
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="w-7 h-7 rounded-lg bg-[#5E6AD2]/10 border border-[#5E6AD2]/20 flex items-center justify-center">
                    <ListChecks className="w-3.5 h-3.5 text-[#5E6AD2]" />
                  </div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-[#EDEDEF]">What happens next?</p>
                </div>
                <ol className="relative space-y-0">
                  {STEPS.map((step, i) => (
                    <motion.li key={i}
                      initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.22 + i * 0.07, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="relative flex gap-4 pb-5 last:pb-0">
                      {i < STEPS.length - 1 && (
                        <div className="absolute left-[15px] top-8 bottom-0 w-px bg-gray-100 dark:bg-white/[0.06]" />
                      )}
                      <div className="relative z-10 w-8 h-8 rounded-xl shrink-0 flex items-center justify-center bg-[#5E6AD2]/[0.08] border border-[#5E6AD2]/[0.18]">
                        <step.icon className="w-3.5 h-3.5 text-[#5E6AD2]" />
                      </div>
                      <div className="pt-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 dark:text-[#EDEDEF] leading-snug">{step.label}</p>
                        <p className="text-xs text-gray-400 dark:text-[#8A8F98] mt-0.5 leading-relaxed">{step.desc}</p>
                      </div>
                    </motion.li>
                  ))}
                </ol>
              </div>
            </motion.div>

            {/* Tips */}
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className={CARD + " p-6"}>
              <EdgeGlow />
              <div className="relative z-10">
                <p className="text-sm font-semibold text-gray-900 dark:text-[#EDEDEF] mb-4">💡 Tips for better results</p>
                <ul className="space-y-3">
                  {[
                    { ok: true, text: "Add company name for role-specific section weights" },
                    { ok: true, text: "Paste the JD for highly accurate topic selection" },
                    { ok: true, text: "Use presets for instant standard test profiles" },
                    { ok: false, text: 'Vague roles like "developer" give generic plans' },
                  ].map((tip, i) => (
                    <motion.li key={i}
                      initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.32 + i * 0.06, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="flex items-start gap-2.5">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${tip.ok ? "bg-emerald-500/15 border border-emerald-500/30" : "bg-red-500/10 border border-red-500/20"}`}>
                        {tip.ok
                          ? <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
                          : <span className="w-1.5 h-1.5 rounded-full bg-red-400" />}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-[#8A8F98] leading-relaxed">{tip.text}</p>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Supported sections */}
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className={CARD + " p-6"}>
              <EdgeGlow />
              <div className="relative z-10">
                <p className="text-sm font-semibold text-gray-900 dark:text-[#EDEDEF] mb-3">Supported Sections</p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "DSA", "Quantitative Aptitude", "Verbal English", "Logical Reasoning",
                    "DBMS", "Computer Networks", "Operating Systems", "OOP Concepts",
                    "System Design", "Core Java", "Python", "SQL", "Data Science", "Probability",
                  ].map((sec, i) => (
                    <motion.span key={sec}
                      initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.38 + i * 0.03, duration: 0.25 }}
                      className="text-[11px] px-2 py-0.5 rounded-full bg-gray-50 dark:bg-white/[0.05] border border-gray-200 dark:border-white/[0.08] text-gray-500 dark:text-[#8A8F98]">
                      {sec}
                    </motion.span>
                  ))}
                </div>
                <p className="text-xs text-gray-400 dark:text-[#8A8F98] mt-3">
                  AI picks the most relevant subset based on your role + company.
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="h-12" />
      </main>
    </div>
  );
}