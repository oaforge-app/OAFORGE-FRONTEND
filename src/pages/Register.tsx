// src/pages/Register.tsx
// Matches your RegisterPage.tsx + SignUpForm.tsx pattern exactly.
// Uses useRegister() hook (returns { registerMutation }).

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Eye, EyeOff, KeyRound, Mail, User, CheckCircle2, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";

import { useRegister } from "@/api/auth.query";
import { QUERY_KEY } from "@/lib/config";

// ── Validation ────────────────────────────────────────────────────────────────

const registerSchema = z
  .object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().optional(),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[a-z]/, "Must contain at least one lowercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string(),
    branch: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

// ── Google icon ───────────────────────────────────────────────────────────────

const GoogleIcon = () => (
  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

// ── Component ─────────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { registerMutation } = useRegister();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch("password");

  const passwordStrength = (pwd: string) => {
    if (!pwd) return { strength: 0, label: "", color: "" };
    let s = 0;
    if (pwd.length >= 8) s++;
    if (/[A-Z]/.test(pwd)) s++;
    if (/[a-z]/.test(pwd)) s++;
    if (/[0-9]/.test(pwd)) s++;
    if (/[^A-Za-z0-9]/.test(pwd)) s++;
    if (s <= 2) return { strength: s, label: "Weak",   color: "bg-red-500" };
    if (s <= 3) return { strength: s, label: "Medium", color: "bg-yellow-500" };
    return            { strength: s, label: "Strong",  color: "bg-green-500" };
  };

  const onSubmit = async (data: RegisterFormData) => {
    const { confirmPassword, ...payload } = data;
    try {
      await registerMutation.mutateAsync(payload);
      await queryClient.invalidateQueries({ queryKey: QUERY_KEY.me });
      navigate("/dashboard");
    } catch {
      // Error handled by hook toast
    }
  };

  const handleGoogleSignUp = () => {
    window.location.href = `${import.meta.env.VITE_BACKEND_URL}/auth/google`;
  };

  const benefits = [
    "8+ AMCAT sections with AI-generated questions",
    "Timed tests matching real exam conditions",
    "Per-topic accuracy breakdown after each test",
    "Resume test sessions across devices",
    "Add custom sections for any tech stack",
    "Free forever — no credit card needed",
  ];

  return (
    <div className="min-h-screen flex">
      {/* ── Left: Form ── */}
      <div className="w-full lg:w-5/12 flex items-center justify-center p-8 relative bg-background overflow-y-auto">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-20 left-10 w-64 h-64 bg-primary/20 rounded-full blur-3xl pointer-events-none"
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md z-10 bg-card border border-border rounded-xl p-8 shadow-xl my-8"
        >
          {/* Logo */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl border border-primary/20 bg-primary/5 mb-3">
              <span className="text-xl">⬡</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Create Account</h1>
            <p className="text-sm text-muted-foreground mt-1">Start forging your OA skills</p>
          </div>

          <div className="space-y-4">
            {/* Google */}
            <button
              type="button"
              onClick={handleGoogleSignUp}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-accent transition-colors"
            >
              <GoogleIcon />
              Continue with Google
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">or</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              {/* Name row */}
              <div className="grid grid-cols-2 gap-3">
                <FieldWrap label="First Name" error={errors.firstName?.message}>
                  <input {...register("firstName")} placeholder="Alex"
                    className="field-input pl-9" type="text" />
                  <User className="field-icon" />
                </FieldWrap>
                <FieldWrap label="Last Name" error={errors.lastName?.message}>
                  <input {...register("lastName")} placeholder="Kumar"
                    className="field-input pl-9" type="text" />
                  <User className="field-icon" />
                </FieldWrap>
              </div>

              {/* Email */}
              <FieldWrap label="Email" error={errors.email?.message}>
                <input {...register("email")} type="email" placeholder="you@example.com"
                  className="field-input pl-9" />
                <Mail className="field-icon" />
              </FieldWrap>

              {/* Branch (optional) */}
              <FieldWrap label="Branch (optional)" error={errors.branch?.message}>
                <input {...register("branch")} type="text" placeholder="Computer Science"
                  className="field-input pl-4" />
              </FieldWrap>

              {/* Password */}
              <div className="space-y-1">
                <FieldWrap label="Password" error={errors.password?.message}>
                  <input {...register("password")} type={showPassword ? "text" : "password"}
                    placeholder="Min. 8 characters" className="field-input pl-9 pr-10" />
                  <KeyRound className="field-icon" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </FieldWrap>
                {password && (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div className={cn("h-full transition-all", passwordStrength(password).color)}
                        style={{ width: `${(passwordStrength(password).strength / 5) * 100}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground">{passwordStrength(password).label}</span>
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <FieldWrap label="Confirm Password" error={errors.confirmPassword?.message}>
                <input {...register("confirmPassword")} type={showConfirm ? "text" : "password"}
                  placeholder="••••••••" className="field-input pl-9 pr-10" />
                <KeyRound className="field-icon" />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </FieldWrap>

              {/* Submit */}
              <button
                type="submit"
                disabled={registerMutation.isPending}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-60 transition-colors mt-2"
              >
                {registerMutation.isPending ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            <p className="text-sm text-muted-foreground text-center">
              Already have an account?{" "}
              <Link to="/login" className="font-medium text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>

      {/* ── Right: Hero ── */}
      <div className="hidden lg:flex lg:w-7/12 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute inset-0"
            style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`, backgroundSize: "64px 64px" }} />
        </div>

        <div className="relative z-10">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6 border border-primary/20">
              <Rocket className="w-4 h-4" />
              <span>Start Your OA Prep Journey</span>
            </div>
            <h2 className="text-6xl font-bold text-white mb-6 leading-tight tracking-tight">
              Practice Smart.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">
                Score Higher.
              </span>
            </h2>
            <p className="text-xl text-slate-300 max-w-xl leading-relaxed mb-10">
              The only platform that generates fresh AMCAT-style questions on demand using AI — so you never run out of practice material.
            </p>
            <div className="space-y-3">
              {benefits.map((b, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.08 }} className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-slate-300 text-sm">{b}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
          className="relative z-10 flex items-center justify-between">
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

// ── Shared field sub-components ───────────────────────────────────────────────

function FieldWrap({
  label, error, children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      <div className="relative">{children}</div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}