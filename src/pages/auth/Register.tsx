import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Eye, EyeOff, KeyRound, Mail, User,
  CheckCircle2, Rocket, GraduationCap,
} from "lucide-react";

import { useRegister } from "@/api/auth.query";
import { QUERY_KEY } from "@/lib/config";

// ── Validation ────────────────────────────────────────────────────────────────

const registerSchema = z
  .object({
    firstName:       z.string().min(2, "At least 2 characters"),
    lastName:        z.string().optional(),
    email:           z.string().email("Invalid email address"),
    passWord:        z
      .string()
      .min(8, "At least 8 characters")
      .regex(/[A-Z]/, "One uppercase letter required")
      .regex(/[a-z]/, "One lowercase letter required")
      .regex(/[0-9]/, "One number required"),
    confirmPassword: z.string(),
    branch:          z.string().optional(),
  })
  .refine((d) => d.passWord === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

// ── Helpers ───────────────────────────────────────────────────────────────────

const GoogleIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

function passwordStrength(pwd: string) {
  if (!pwd) return { score: 0, label: "", color: "", segments: 0 };

  let score = 0;
  const checks = {
    length8:    pwd.length >= 8,
    length12:   pwd.length >= 12,
    lowercase:  /[a-z]/.test(pwd),
    uppercase:  /[A-Z]/.test(pwd),
    digit:      /[0-9]/.test(pwd),
    special:    /[^A-Za-z0-9]/.test(pwd),
    noRepeats:  !/(.)\1{2,}/.test(pwd),
    noSequence: !/(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i.test(pwd),
    notCommon:  !/(password|123456|qwerty|letmein|admin|welcome|monkey|dragon)/i.test(pwd),
  };

  if (checks.length8)    score += 1;
  if (checks.lowercase)  score += 1;
  if (checks.uppercase)  score += 1;
  if (checks.digit)      score += 1;
  if (checks.special)    score += 1;
  if (checks.length12)   score += 1;
  if (checks.noRepeats)  score += 1;
  if (checks.noSequence) score += 1;
  if (checks.notCommon)  score += 1;

  if (pwd.length < 6)    score -= 2;
  if (!checks.notCommon) score -= 3;

  score = Math.max(0, Math.min(score, 9));

  if (score <= 2) return { score, segments: 1, label: "Too weak",  color: "bg-red-500"     };
  if (score <= 4) return { score, segments: 2, label: "Weak",      color: "bg-orange-500"  };
  if (score <= 6) return { score, segments: 3, label: "Fair",      color: "bg-yellow-500"  };
  if (score <= 7) return { score, segments: 4, label: "Good",      color: "bg-lime-500"    };
  return                  { score, segments: 4, label: "Strong",    color: "bg-emerald-500" };
}

// ── Input field ───────────────────────────────────────────────────────────────

function Field({
  label, error, icon: Icon, suffix, children,
}: {
  label: string;
  error?: string;
  icon?: React.ElementType;
  suffix?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        )}
        {children}
        {suffix}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const navigate    = useNavigate();
  const queryClient = useQueryClient();
  const [showPwd,   setShowPwd]  = useState(false);
  const [showConf,  setShowConf] = useState(false);

  const { registerMutation } = useRegister();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) });

  const pwd      = watch("passWord") ?? "";
  const strength = passwordStrength(pwd);

  const onSubmit = async (data: RegisterFormData) => {
    const { confirmPassword, ...payload } = data;
    try {
      await registerMutation.mutateAsync(payload);
      await queryClient.invalidateQueries({ queryKey: QUERY_KEY.me });
      navigate("/dashboard");
    } catch { /* handled by hook */ }
  };

  const handleGoogle = () => {
    window.location.href = `${import.meta.env.VITE_BACKEND_URL}/auth/google`;
  };

  const benefits = [
    "Custom plans from any JD or role target",
    "8+ sections: English, Quant, DSA, DBMS, CN, OS…",
    "Questions generated fresh by Groq / LLaMA",
    "Timed tests matching real OA conditions",
    "Per-section accuracy breakdown after each test",
    "Free forever — bring your own Groq API key",
  ];

  const inputBase =
    "w-full py-2.5 text-sm bg-background border border-border rounded-lg outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/50";

  return (
    <div className="min-h-screen flex">

      {/* ══════════════════════════════════
          LEFT — Form
      ══════════════════════════════════ */}
      <div className="w-full lg:w-5/12 flex items-center justify-center p-6 lg:p-8 relative bg-background overflow-y-auto">

        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.25, 0.45, 0.25] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-16 left-8 w-56 h-56 bg-primary/20 rounded-full blur-3xl pointer-events-none"
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          className="absolute bottom-16 right-8 w-48 h-48 bg-purple-500/15 rounded-full blur-3xl pointer-events-none"
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md z-10 bg-card border border-border rounded-xl p-7 shadow-xl my-6"
        >
          {/* ── Header ── */}
          <div className="text-center mb-6">
            <div className="w-20 h-20 rounded-xl flex items-center justify-center mx-auto mb-2">
              <img src="/logo.webp" alt="OAForge" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Create Account</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Prep for any OA — free, forever
            </p>
          </div>

          {/* ── Google ── */}
          <button
            type="button"
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-accent transition-colors mb-4"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          {/* ── Divider ── */}
          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">or</span>
            </div>
          </div>

          {/* ── Form ── */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">

            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="First Name" error={errors.firstName?.message} icon={User}>
                <input
                  {...register("firstName")}
                  type="text"
                  placeholder="Alex"
                  className={`${inputBase} pl-9`}
                />
              </Field>
              <Field label="Last Name" error={errors.lastName?.message} icon={User}>
                <input
                  {...register("lastName")}
                  type="text"
                  placeholder="Kumar"
                  className={`${inputBase} pl-9`}
                />
              </Field>
            </div>

            {/* Email */}
            <Field label="Email" error={errors.email?.message} icon={Mail}>
              <input
                {...register("email")}
                type="email"
                placeholder="you@example.com"
                className={`${inputBase} pl-9`}
              />
            </Field>

            {/* Branch */}
            <Field label="Branch" error={errors.branch?.message} icon={GraduationCap}>
              <input
                {...register("branch")}
                type="text"
                placeholder="Computer Science (optional)"
                className={`${inputBase} pl-9`}
              />
            </Field>

            {/* Password */}
            <Field
              label="Password"
              error={errors.passWord?.message}
              icon={KeyRound}
              suffix={
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
            >
              <input
                {...register("passWord")}
                type={showPwd ? "text" : "password"}
                placeholder="Min. 8 characters"
                className={`${inputBase} pl-9 pr-10`}
              />
            </Field>

            {/* Strength bar */}
            {pwd && (
              <div className="flex items-center gap-2.5 -mt-1">
                <div className="flex flex-1 gap-1">
                  {[1, 2, 3, 4].map((seg) => (
                    <div key={seg} className="h-1.5 flex-1 rounded-full">
                      <div
                        className={`h-full w-full rounded-full transition-all duration-300 ${
                          seg <= strength.segments ? strength.color : "bg-secondary"
                        }`}
                      />
                    </div>
                  ))}
                </div>
                <span className="text-xs text-muted-foreground w-14 text-right">
                  {strength.label}
                </span>
              </div>
            )}

            {/* Confirm password */}
            <Field
              label="Confirm Password"
              error={errors.confirmPassword?.message}
              icon={KeyRound}
              suffix={
                <button
                  type="button"
                  onClick={() => setShowConf((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConf ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
            >
              <input
                {...register("confirmPassword")}
                type={showConf ? "text" : "password"}
                placeholder="••••••••"
                className={`${inputBase} pl-9 pr-10`}
              />
            </Field>

            {/* Submit */}
            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-60 transition-colors mt-1"
            >
              {registerMutation.isPending ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account…
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Footer link */}
          <p className="text-sm text-muted-foreground text-center mt-4">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>

      {/* ══════════════════════════════════
          RIGHT — Hero
      ══════════════════════════════════ */}
      <div className="hidden lg:flex lg:w-7/12 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-12 flex-col justify-between relative overflow-hidden">

        {/* Grid texture */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: "64px 64px",
            }}
          />
        </div>

        {/* Floating code card */}
        <motion.div
          animate={{ y: [0, -12, 0], rotate: [-1, 1, -1] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-24 right-24 bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 shadow-2xl max-w-[260px]"
        >
          <pre className="text-green-400 text-xs font-mono leading-relaxed">{`// Assessment plan ✓  role: SDE Intern
sections: [
  "DSA & Problem Solving",
  "Quantitative Aptitude",
  "Verbal Ability",
  "DBMS & SQL",  +3 more
]`}</pre>
        </motion.div>

        {/* Content */}
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6 border border-primary/20">
              <Rocket className="w-4 h-4" />
              <span>Prep for Any OA — Free</span>
            </div>

            <h2 className="text-6xl font-bold text-white mb-6 leading-tight tracking-tight">
              Practice Smart.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">
                Ace Any OA.
              </span>
            </h2>

            <p className="text-xl text-slate-300 max-w-xl leading-relaxed mb-10">
              Paste a job description, get a custom assessment plan — AI generates
              fresh questions for every section so you're never practicing blind.
            </p>

            <div className="space-y-3">
              {benefits.map((b, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.08 }}
                  className="flex items-center gap-3"
                >
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-slate-300 text-sm">{b}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="relative z-10 flex items-center justify-between"
        >
          {[["8+", "Sections"], ["AI", "Powered"], ["0₹", "Cost"]].map(([val, lbl]) => (
            <div key={lbl} className="text-center">
              <div className="text-4xl font-bold text-white mb-1">{val}</div>
              <div className="text-sm text-slate-400">{lbl}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}