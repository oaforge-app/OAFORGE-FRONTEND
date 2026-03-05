import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye, EyeOff, KeyRound, Mail, User,
  CheckCircle2, Rocket, GraduationCap, ShieldCheck,
} from "lucide-react";

import { useRegister }          from "@/api/auth.query";
import { useSendRegisterOtp }   from "@/api/auth.query";
import { useVerifyRegisterOtp } from "@/api/auth.query";
import { QUERY_KEY }            from "@/lib/config";

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

const otpSchema = z.object({
  otp: z
    .string()
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^\d+$/, "OTP must be numeric"),
});

type RegisterFormData = z.infer<typeof registerSchema>;
type OtpFormData      = z.infer<typeof otpSchema>;

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
  if (pwd.length >= 8)    score++;
  if (pwd.length >= 12)   score++;
  if (/[a-z]/.test(pwd))  score++;
  if (/[A-Z]/.test(pwd))  score++;
  if (/[0-9]/.test(pwd))  score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (!/(.)\1{2,}/.test(pwd))   score++;
  if (score <= 2) return { score, segments: 1, label: "Too weak",  color: "bg-red-500"     };
  if (score <= 4) return { score, segments: 2, label: "Weak",      color: "bg-orange-500"  };
  if (score <= 5) return { score, segments: 3, label: "Fair",      color: "bg-yellow-500"  };
  if (score <= 6) return { score, segments: 4, label: "Good",      color: "bg-lime-500"    };
  return                  { score, segments: 4, label: "Strong",    color: "bg-emerald-500" };
}

function Field({ label, error, icon: Icon, suffix, children }: {
  label: string; error?: string; icon?: React.ElementType;
  suffix?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />}
        {children}
        {suffix}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

// ── Step indicator ────────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: 1 | 2 }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {[1, 2].map((s) => (
        <div key={s} className="flex items-center gap-2">
          <div className={[
            "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300",
            s < current
              ? "bg-primary text-primary-foreground"
              : s === current
              ? "bg-primary text-primary-foreground ring-2 ring-primary/30 ring-offset-1 ring-offset-card"
              : "bg-secondary text-muted-foreground",
          ].join(" ")}>
            {s < current ? <CheckCircle2 className="w-3.5 h-3.5" /> : s}
          </div>
          {s < 2 && (
            <div className={`h-px w-8 transition-all duration-300 ${s < current ? "bg-primary" : "bg-border"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const navigate    = useNavigate();
  const queryClient = useQueryClient();

  const [step,     setStep]    = useState<1 | 2>(1);
  const [showPwd,  setShowPwd]  = useState(false);
  const [showConf, setShowConf] = useState(false);

  // Store form data between steps
  const [pendingData, setPendingData] = useState<Omit<RegisterFormData, "confirmPassword"> | null>(null);

  const { registerMutation }  = useRegister();
  const { sendOtpMutation }   = useSendRegisterOtp();
  const { verifyOtpMutation } = useVerifyRegisterOtp();

  const registerForm = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) });
  const otpForm      = useForm<OtpFormData>({ resolver: zodResolver(otpSchema) });

  const pwd      = registerForm.watch("passWord") ?? "";
  const strength = passwordStrength(pwd);

  // Step 1 — send OTP
  const onRegisterSubmit = async (data: RegisterFormData) => {
    const { confirmPassword, ...payload } = data;
    try {
      await sendOtpMutation.mutateAsync(data.email);
      setPendingData(payload);
      setStep(2);
    } catch { /* handled by mutation */ }
  };

  // Step 2 — verify OTP then register
  const onOtpSubmit = async (data: OtpFormData) => {
    if (!pendingData) return;
    try {
      // Verify OTP
      await verifyOtpMutation.mutateAsync({ email: pendingData.email, otp: data.otp });
      // OTP valid — now create account
      await registerMutation.mutateAsync(pendingData);
      await queryClient.invalidateQueries({ queryKey: QUERY_KEY.me });
      navigate("/dashboard");
    } catch { /* handled by mutations */ }
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

        <motion.div animate={{ scale:[1,1.15,1], opacity:[0.25,0.45,0.25] }}
          transition={{ duration:8,repeat:Infinity,ease:"easeInOut" }}
          className="absolute top-16 left-8 w-56 h-56 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <motion.div animate={{ scale:[1,1.1,1], opacity:[0.15,0.3,0.15] }}
          transition={{ duration:10,repeat:Infinity,ease:"easeInOut",delay:3 }}
          className="absolute bottom-16 right-8 w-48 h-48 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity:0, y:20 }}
          animate={{ opacity:1, y:0 }}
          transition={{ duration:0.5 }}
          className="w-full max-w-md z-10 bg-card border border-border rounded-xl p-7 shadow-xl my-6"
        >
          {/* ── Header ── */}
          <div className="text-center mb-4">
            <div className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-3">
              <img src="/logo.webp" alt="OAForge" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              {step === 1 ? "Create Account" : "Verify your email"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {step === 1
                ? "Prep for any OA — free, forever"
                : `We sent a 6-digit code to ${pendingData?.email}`}
            </p>
          </div>

          {/* ── Step indicator ── */}
          <StepIndicator current={step} />

          <AnimatePresence mode="wait">

            {/* ════════════════════════════════
                STEP 1 — Registration form
            ════════════════════════════════ */}
            {step === 1 && (
              <motion.div key="step1"
                initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }}
                exit={{ opacity:0, x:-20 }} transition={{ duration:0.25 }}>

                {/* Google */}
                <button type="button" onClick={handleGoogle}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-accent transition-colors mb-4">
                  <GoogleIcon />
                  Continue with Google
                </button>

                <div className="relative mb-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">or</span>
                  </div>
                </div>

                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-3.5">

                  <div className="grid grid-cols-2 gap-3">
                    <Field label="First Name" error={registerForm.formState.errors.firstName?.message} icon={User}>
                      <input {...registerForm.register("firstName")} type="text" placeholder="Alex"
                        className={`${inputBase} pl-9`} />
                    </Field>
                    <Field label="Last Name" error={registerForm.formState.errors.lastName?.message} icon={User}>
                      <input {...registerForm.register("lastName")} type="text" placeholder="Kumar"
                        className={`${inputBase} pl-9`} />
                    </Field>
                  </div>

                  <Field label="Email" error={registerForm.formState.errors.email?.message} icon={Mail}>
                    <input {...registerForm.register("email")} type="email" placeholder="you@example.com"
                      className={`${inputBase} pl-9`} />
                  </Field>

                  <Field label="Branch" error={registerForm.formState.errors.branch?.message} icon={GraduationCap}>
                    <input {...registerForm.register("branch")} type="text" placeholder="Computer Science (optional)"
                      className={`${inputBase} pl-9`} />
                  </Field>

                  <Field label="Password" error={registerForm.formState.errors.passWord?.message} icon={KeyRound}
                    suffix={
                      <button type="button" onClick={() => setShowPwd(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                        {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    }>
                    <input {...registerForm.register("passWord")} type={showPwd ? "text" : "password"}
                      placeholder="Min. 8 characters" className={`${inputBase} pl-9 pr-10`} />
                  </Field>

                  {pwd && (
                    <div className="flex items-center gap-2.5 -mt-1">
                      <div className="flex flex-1 gap-1">
                        {[1,2,3,4].map((seg) => (
                          <div key={seg} className="h-1.5 flex-1 rounded-full">
                            <div className={`h-full w-full rounded-full transition-all duration-300 ${seg <= strength.segments ? strength.color : "bg-secondary"}`} />
                          </div>
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground w-14 text-right">{strength.label}</span>
                    </div>
                  )}

                  <Field label="Confirm Password" error={registerForm.formState.errors.confirmPassword?.message} icon={KeyRound}
                    suffix={
                      <button type="button" onClick={() => setShowConf(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                        {showConf ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    }>
                    <input {...registerForm.register("confirmPassword")} type={showConf ? "text" : "password"}
                      placeholder="••••••••" className={`${inputBase} pl-9 pr-10`} />
                  </Field>

                  <button type="submit" disabled={sendOtpMutation.isPending}
                    className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-60 transition-colors mt-1">
                    {sendOtpMutation.isPending ? (
                      <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending OTP…</>
                    ) : (
                      "Continue →"
                    )}
                  </button>
                </form>

                <p className="text-sm text-muted-foreground text-center mt-4">
                  Already have an account?{" "}
                  <Link to="/login" className="font-medium text-primary hover:underline">Sign in</Link>
                </p>
              </motion.div>
            )}

            {/* ════════════════════════════════
                STEP 2 — OTP verification
            ════════════════════════════════ */}
            {step === 2 && (
              <motion.div key="step2"
                initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }}
                exit={{ opacity:0, x:20 }} transition={{ duration:0.25 }}>

                {/* Email chip */}
                <div className="flex items-center justify-center gap-2 mb-5 px-3 py-2 bg-primary/[0.07] border border-primary/20 rounded-lg">
                  <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span className="text-sm text-primary font-medium truncate">{pendingData?.email}</span>
                </div>

                <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-4">

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-primary" />
                      Verification Code
                    </label>
                    <input
                      {...otpForm.register("otp")}
                      placeholder="Enter 6-digit OTP"
                      maxLength={6}
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      className={`${inputBase} px-4 text-center text-xl font-bold tracking-[0.5em] focus:border-primary`}
                    />
                    {otpForm.formState.errors.otp && (
                      <p className="text-xs text-destructive">{otpForm.formState.errors.otp.message}</p>
                    )}
                  </div>

                  <button type="submit"
                    disabled={verifyOtpMutation.isPending || registerMutation.isPending}
                    className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-60 transition-colors">
                    {verifyOtpMutation.isPending || registerMutation.isPending ? (
                      <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        {verifyOtpMutation.isPending ? "Verifying…" : "Creating account…"}
                      </>
                    ) : (
                      "Verify & Create Account"
                    )}
                  </button>

                  {/* Resend */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                    <button type="button" onClick={() => setStep(1)}
                      className="hover:text-foreground transition-colors">
                      ← Change email
                    </button>
                    <button type="button"
                      disabled={sendOtpMutation.isPending}
                      onClick={() => pendingData && sendOtpMutation.mutate(pendingData.email)}
                      className="text-primary hover:underline disabled:opacity-50 transition-colors">
                      Resend OTP
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

          </AnimatePresence>
        </motion.div>
      </div>

      {/* ══════════════════════════════════
          RIGHT — Hero (unchanged)
      ══════════════════════════════════ */}
      <div className="hidden lg:flex lg:w-7/12 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-12 flex-col justify-between relative overflow-hidden">

        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "64px 64px",
          }} />
        </div>

        <motion.div animate={{ y:[0,-12,0], rotate:[-1,1,-1] }}
          transition={{ duration:7, repeat:Infinity, ease:"easeInOut" }}
          className="absolute top-24 right-24 bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 shadow-2xl max-w-[260px]">
          <pre className="text-green-400 text-xs font-mono leading-relaxed">{`// Assessment plan ✓  role: SDE Intern
sections: [
  "DSA & Problem Solving",
  "Quantitative Aptitude",
  "Verbal Ability",
  "DBMS & SQL",  +3 more
]`}</pre>
        </motion.div>

        <div className="relative z-10">
          <motion.div initial={{ opacity:0, x:-30 }} animate={{ opacity:1, x:0 }}
            transition={{ delay:0.2, duration:0.6 }}>
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6 border border-primary/20">
              <Rocket className="w-4 h-4" />
              <span>Prep for Any OA — Free</span>
            </div>
            <h2 className="text-6xl font-bold text-white mb-6 leading-tight tracking-tight">
              Practice Smart.<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">Ace Any OA.</span>
            </h2>
            <p className="text-xl text-slate-300 max-w-xl leading-relaxed mb-10">
              Paste a job description, get a custom assessment plan — AI generates fresh questions for every section so you're never practicing blind.
            </p>
            <div className="space-y-3">
              {benefits.map((b, i) => (
                <motion.div key={i}
                  initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }}
                  transition={{ delay:0.4 + i * 0.08 }}
                  className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-slate-300 text-sm">{b}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.8 }}
          className="relative z-10 flex items-center justify-between">
          {[["8+","Sections"],["AI","Powered"],["0₹","Cost"]].map(([val,lbl]) => (
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