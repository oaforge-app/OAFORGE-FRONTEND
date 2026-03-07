import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Key, User, Eye, EyeOff,
  CheckCircle2, Trash2, ExternalLink, Shield,
  Mail, GraduationCap, BookOpen, AlertCircle,
} from "lucide-react";

import { useUser } from "@/api/auth.query";
import { useProfile, useSaveGroqKey, useRemoveGroqKey, useUpdateProfile } from "@/api/user.query";
import { Spinner } from "@/components/ui/spinner";
import Navbar from "../components/Navbar";
import SessionsCard from "./SessionsCard";

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().optional(),
  college: z.string().optional(),
  branch: z.string().optional(),
});
type ProfileForm = z.infer<typeof profileSchema>;

const groqKeySchema = z.object({
  groqKey: z
    .string()
    .min(1, "API key is required")
    .min(10, "Key must be at least 10 characters")
    .refine((v) => v.startsWith("gsk_"), { message: 'Key must start with "gsk_"' }),
});
type GroqKeyForm = z.infer<typeof groqKeySchema>;

const CARD =
  "relative overflow-hidden rounded-2xl " +
  "bg-white border border-black/[0.07] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.06)] " +
  "dark:bg-[#0d0d10] dark:border-white/[0.07] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.055),0_4px_32px_rgba(0,0,0,0.5)]";

const INPUT_BASE =
  "w-full py-2.5 px-3.5 text-sm rounded-xl outline-none transition-all duration-200 " +
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

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { data: profile, isLoading } = useProfile();

  const saveKey = useSaveGroqKey();
  const removeKey = useRemoveGroqKey();
  const updateProfile = useUpdateProfile();

  const [showKey, setShowKey] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  const {
    register: pReg,
    handleSubmit: pSubmit,
    reset: pReset,
    formState: { errors: pErr, isDirty: pDirty, isSubmitting: pBusy },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { firstName: "", lastName: "", college: "", branch: "" },
  });

  useEffect(() => {
    if (!profile) return;
    pReset({
      firstName: profile.firstName ?? "",
      lastName: profile.lastName ?? "",
      college: profile.college ?? "",
      branch: profile.branch ?? "",
    });
  }, [profile, pReset]);

  const onSaveProfile = (data: ProfileForm) => {
    updateProfile.mutate(data, {
      onSuccess: () => {
        setProfileSaved(true);
        setTimeout(() => setProfileSaved(false), 2500);
        pReset(data);
      },
    });
  };

  const {
    register: kReg,
    handleSubmit: kSubmit,
    reset: kReset,
    formState: { errors: kErr, isSubmitting: kBusy },
  } = useForm<GroqKeyForm>({
    resolver: zodResolver(groqKeySchema),
    defaultValues: { groqKey: "" },
  });

  const onSaveKey = (data: GroqKeyForm) => {
    saveKey.mutate(data.groqKey, { onSuccess: () => kReset() });
  };

  const hasGroqKey = profile?.hasGroqApiKey ?? user?.hasGroqApiKey ?? false;

  return (
    <div className="min-h-screen bg-[#f4f4f7] dark:bg-[#050506] transition-colors duration-300">

      {/* Atmospheric background */}
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

      <main className="relative z-10 w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-6 lg:py-8 space-y-6">

        {/* Page header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
          <button onClick={() => navigate("/dashboard")}
            className="inline-flex items-center gap-2 text-sm text-gray-400 dark:text-[#8A8F98] hover:text-gray-700 dark:hover:text-[#EDEDEF] transition-colors mb-3 group cursor-pointer">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
            Back to Dashboard
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-[#EDEDEF]">Settings</h1>
          <p className="text-sm text-gray-400 dark:text-[#8A8F98] mt-1">
            Manage your API key, profile, and account preferences.
          </p>
        </motion.div>

        {/* Bento grid: left col (API key + Account) | right col (Profile) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">

          {/* LEFT: API Key + Account (5/12) */}
          <div className="xl:col-span-5 space-y-4">

            {/* Groq API Key card */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className={CARD + " p-6"}>
              <div className="absolute inset-0 opacity-[0.06] dark:opacity-[0.08] pointer-events-none"
                style={{ background: "radial-gradient(circle at 85% 15%,#5E6AD2,transparent 60%)" }} />
              <EdgeGlow />
              <div className="relative z-10">
                <div className="flex items-center gap-2.5 mb-1">
                  <div className="w-8 h-8 rounded-xl bg-[#5E6AD2]/10 border border-[#5E6AD2]/20 flex items-center justify-center">
                    <Key className="w-4 h-4 text-[#5E6AD2]" />
                  </div>
                  <h2 className="text-base font-semibold text-gray-900 dark:text-[#EDEDEF]">Groq API Key</h2>
                </div>
                <p className="text-sm text-gray-400 dark:text-[#8A8F98] mb-4 ml-[42px]">
                  Required for AI question generation.{" "}
                  <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer"
                    className="text-[#5E6AD2] dark:text-[#a5adff] hover:underline inline-flex items-center gap-0.5">
                    Get free key <ExternalLink className="w-3 h-3" />
                  </a>
                </p>
                {isLoading ? (
                  <div className="flex items-center gap-2 ml-[42px]">
                    <Spinner className="w-4 h-4 text-[#5E6AD2]" />
                    <span className="text-sm text-gray-400 dark:text-[#8A8F98]">Loading…</span>
                  </div>
                ) : hasGroqKey ? (
                  <div className="ml-[42px] space-y-3">
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 dark:bg-emerald-500/[0.07] dark:border-emerald-500/[0.20]">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">API key active</p>
                        <p className="text-xs text-emerald-600/70 dark:text-emerald-500/60 mt-0.5">Securely stored and encrypted</p>
                      </div>
                    </div>
                    <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                      type="button" onClick={() => removeKey.mutate()}
                      disabled={removeKey.isPending}
                      className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/[0.25] rounded-xl hover:bg-red-50 dark:hover:bg-red-500/[0.08] transition-all duration-200 disabled:opacity-60">
                      {removeKey.isPending ? <Spinner className="w-3.5 h-3.5" /> : <Trash2 className="w-3.5 h-3.5" />}
                      Remove API key
                    </motion.button>
                  </div>
                ) : (
                  <form onSubmit={kSubmit(onSaveKey)} noValidate className="ml-[42px] space-y-3">
                    <div>
                      <div className="relative">
                        <input
                          {...kReg("groqKey")}
                          type={showKey ? "text" : "password"}
                          placeholder="gsk_..."
                          autoComplete="off"
                          className={(kErr.groqKey ? INPUT_ERR : INPUT_OK) + " pr-11 font-mono"}
                        />
                        <button type="button" onClick={() => setShowKey(s => !s)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[#8A8F98] hover:text-gray-700 dark:hover:text-[#EDEDEF] transition-colors cursor-pointer">
                          {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <FieldError msg={kErr.groqKey?.message} />
                    </div>
                    <motion.button whileHover={{ scale: 1.01, y: -1 }} whileTap={{ scale: 0.98 }}
                      type="submit" disabled={saveKey.isPending || kBusy}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl bg-[#5E6AD2] text-white hover:bg-[#6872D9] transition-all duration-200 disabled:opacity-60 shadow-[0_0_0_1px_rgba(94,106,210,0.5),0_4px_14px_rgba(94,106,210,0.3),inset_0_1px_0_rgba(255,255,255,0.15)] cursor-pointer">
                      {(saveKey.isPending || kBusy) ? <Spinner className="w-4 h-4" /> : <Key className="w-4 h-4" />}
                      Save API Key
                    </motion.button>
                  </form>
                )}
              </div>
            </motion.div>

            {/* Account info card */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className={CARD + " p-6"}>
              <EdgeGlow />
              <div className="relative z-10">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-violet-500" />
                  </div>
                  <h2 className="text-base font-semibold text-gray-900 dark:text-[#EDEDEF]">Account</h2>
                </div>
                <div className="space-y-3">
                  {[
                    { Icon: Mail, label: "Email", value: profile?.email ?? user?.email ?? "—", cap: false },
                    { Icon: Shield, label: "Login method", value: (profile?.provider ?? user?.provider)?.toLowerCase() ?? "—", cap: true },
                  ].map((row) => (
                    <div key={row.label}
                      className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/[0.04] border border-gray-100 dark:border-white/[0.05]">
                      <div className="flex items-center gap-2.5">
                        <row.Icon className="w-4 h-4 text-gray-400 dark:text-[#8A8F98] shrink-0" />
                        <span className="text-sm text-gray-500 dark:text-[#8A8F98]">{row.label}</span>
                      </div>
                      <span className={`text-sm font-semibold text-gray-800 dark:text-[#EDEDEF] truncate max-w-[180px] ${row.cap ? "capitalize" : ""}`}>
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* RIGHT: Profile form (7/12) */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className={CARD + " xl:col-span-7 p-6"}>
            <EdgeGlow />
            <div className="relative z-10">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                  <User className="w-4 h-4 text-indigo-500" />
                </div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-[#EDEDEF]">Profile</h2>
              </div>
              {isLoading ? (
                <div className="flex items-center gap-2 py-6">
                  <Spinner className="w-4 h-4 text-[#5E6AD2]" />
                  <span className="text-sm text-gray-400 dark:text-[#8A8F98]">Loading profile…</span>
                </div>
              ) : (
                <form onSubmit={pSubmit(onSaveProfile)} noValidate className="space-y-5">
                  <div className="flex items-center gap-4 pb-1">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold text-white bg-gradient-to-br from-[#5E6AD2] to-[#7c3aed] shadow-[0_4px_14px_rgba(94,106,210,0.35)] shrink-0">
                      {profile?.firstName?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? "U"}
                    </div>
                    <div>
                      <p className="text-base font-semibold text-gray-900 dark:text-[#EDEDEF]">
                        {profile?.firstName || profile?.lastName
                          ? `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim()
                          : "Add your name"}
                      </p>
                      <p className="text-sm text-gray-400 dark:text-[#8A8F98] mt-0.5">
                        {profile?.email ?? user?.email}
                      </p>
                    </div>
                  </div>
                  <div className="h-px bg-gray-100 dark:bg-white/[0.06]" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-500 dark:text-[#8A8F98] uppercase tracking-wide">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input {...pReg("firstName")} placeholder="First name"
                        className={pErr.firstName ? INPUT_ERR : INPUT_OK} />
                      <FieldError msg={pErr.firstName?.message} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-500 dark:text-[#8A8F98] uppercase tracking-wide">
                        Last Name
                      </label>
                      <input {...pReg("lastName")} placeholder="Last name" className={INPUT_OK} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 dark:text-[#8A8F98] uppercase tracking-wide flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5" /> College
                    </label>
                    <input {...pReg("college")} placeholder="e.g. IIT Bombay, VIT..." className={INPUT_OK} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 dark:text-[#8A8F98] uppercase tracking-wide flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" /> Branch
                    </label>
                    <input {...pReg("branch")} placeholder="e.g. Computer Science & Engineering" className={INPUT_OK} />
                  </div>
                  <AnimatePresence>
                    {pDirty && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}
                        className="overflow-hidden">
                        <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#5E6AD2]/[0.06] border border-[#5E6AD2]/[0.18] dark:bg-[#5E6AD2]/[0.08] dark:border-[#5E6AD2]/[0.20]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#5E6AD2] animate-pulse shrink-0" />
                          <p className="text-xs text-[#5E6AD2] dark:text-[#a5adff]">You have unsaved changes</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="flex items-center gap-3 pt-1">
                    <motion.button type="submit"
                      disabled={!pDirty || updateProfile.isPending || pBusy}
                      whileHover={pDirty ? { scale: 1.01, y: -1 } : {}}
                      whileTap={pDirty ? { scale: 0.98 } : {}}
                      className={[
                        "flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200",
                        pDirty
                          ? "bg-[#5E6AD2] text-white hover:bg-[#6872D9] shadow-[0_0_0_1px_rgba(94,106,210,0.5),0_4px_14px_rgba(94,106,210,0.3),inset_0_1px_0_rgba(255,255,255,0.15)] cursor-pointer"
                          : "bg-gray-100 dark:bg-white/[0.06] text-gray-400 dark:text-[#8A8F98]/60 border border-gray-200 dark:border-white/[0.08] cursor-not-allowed",
                      ].join(" ")}>
                      {(updateProfile.isPending || pBusy)
                        ? <><Spinner className="w-4 h-4" /> Saving…</>
                        : "Save Profile"}
                    </motion.button>
                    <AnimatePresence>
                      {pDirty && (
                        <motion.button type="button"
                          initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -6 }} transition={{ duration: 0.18 }}
                          onClick={() => pReset()}
                          className="text-sm text-gray-400 dark:text-[#8A8F98] hover:text-gray-700 dark:hover:text-[#EDEDEF] transition-colors px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/[0.06]">
                          Discard
                        </motion.button>
                      )}
                    </AnimatePresence>
                    <AnimatePresence>
                      {profileSaved && (
                        <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                          className="flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-4 h-4" /> Saved!
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>

        {/* ── Active Sessions — full width below the bento grid ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}>
          <SessionsCard />
        </motion.div>

        <div className="h-10" />
      </main>
    </div>
  );
}