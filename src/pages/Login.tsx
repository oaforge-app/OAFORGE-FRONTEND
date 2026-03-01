// src/pages/Login.tsx
// Matches your LoginPage.tsx pattern exactly:
// - react-hook-form + zodResolver
// - useSignIn hook (returns { loginMutation })
// - Google OAuth via window.location.href
// - useNavigate after success
// - Same layout with left form + right hero

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Eye, EyeOff, KeyRound, Mail, Zap, BookOpen, Brain, Target } from "lucide-react";

import { useSignIn } from "@/api/auth.query";
import { QUERY_KEY } from "@/lib/config";

// ── Validation ────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

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

export default function LoginPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);

  const { loginMutation } = useSignIn();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await loginMutation.mutateAsync(data);
      // Cookie is set by backend. Invalidate /auth/me so ProtectedRoute re-evaluates.
      await queryClient.invalidateQueries({ queryKey: QUERY_KEY.me });
      navigate("/dashboard");
    } catch {
      // Error already handled by useSignIn hook via toast
    }
  };

  const handleGoogleSignIn = () => {
    window.location.href = `${import.meta.env.VITE_BACKEND_URL}/auth/google`;
  };

  const features = [
    { icon: Brain,    title: "AI-Generated Questions", desc: "Powered by Groq / LLaMA 3.3" },
    { icon: Target,   title: "8+ Sections",            desc: "English, Quant, DSA, DBMS, CN..." },
    { icon: BookOpen, title: "Track Progress",          desc: "Scores, accuracy, topic breakdown" },
    { icon: Zap,      title: "AMCAT Focused",           desc: "Exactly what the exam tests" },
  ];

  return (
    <div className="min-h-screen flex">
      {/* ── Left: Form ── */}
      <div className="w-full lg:w-5/12 flex items-center justify-center p-8 relative bg-background">
        {/* Background texture */}
        <div className="absolute inset-0 opacity-[0.015]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
              backgroundSize: "24px 24px",
            }}
          />
        </div>

        {/* Gradient orbs */}
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-10 w-64 h-64 bg-primary/20 rounded-full blur-3xl"
        />

        {/* Form card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md z-10 bg-card border border-border rounded-xl p-8 shadow-xl"
        >
          {/* Logo */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl border border-primary/20 bg-primary/5 mb-3">
              <span className="text-xl">⬡</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">OAForge</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Forge your Online Assessment skills
            </p>
          </div>

          <div className="space-y-4">
            {/* Google */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-accent transition-colors"
            >
              <GoogleIcon />
              Continue with Google
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">or</span>
              </div>
            </div>

            {/* Email form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-medium">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    id="email"
                    {...register("email")}
                    type="email"
                    placeholder="you@example.com"
                    className="w-full pl-9 pr-4 py-2.5 text-sm bg-background border border-border rounded-lg outline-none focus:border-primary transition-colors"
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium">Password</label>
                  <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    id="password"
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2.5 text-sm bg-background border border-border rounded-lg outline-none focus:border-primary transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password.message}</p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-60 transition-colors"
              >
                {loginMutation.isPending ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            {/* Footer */}
            <p className="text-sm text-muted-foreground text-center">
              Don't have an account?{" "}
              <Link to="/register" className="font-medium text-primary hover:underline">
                Sign up free
              </Link>
            </p>
          </div>
        </motion.div>
      </div>

      {/* ── Right: Hero ── */}
      <div className="hidden lg:flex lg:w-7/12 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-12 flex-col justify-between relative overflow-hidden">
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

        <motion.div
          animate={{ y: [0, -15, 0], rotate: [-2, 2, -2] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-24 right-24 bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 shadow-2xl"
        >
          <pre className="text-green-400 text-xs font-mono">{`// Groq generated ✓\nfunction binarySearch(arr, x) {\n  let lo=0, hi=arr.length-1;\n  while(lo<=hi) {...}\n}`}</pre>
        </motion.div>

        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <h2 className="text-6xl font-bold text-white mb-6 leading-tight tracking-tight">
              Crack Your OA.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">
                Land The Job.
              </span>
            </h2>
            <p className="text-xl text-slate-300 max-w-xl leading-relaxed mb-10">
              AI-powered AMCAT prep — practice with dynamically generated MCQs
              across every section that matters.
            </p>

            <div className="grid grid-cols-2 gap-4">
              {features.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4"
                >
                  <f.icon className="w-5 h-5 text-primary mb-2" />
                  <p className="text-white text-sm font-semibold">{f.title}</p>
                  <p className="text-slate-400 text-xs mt-1">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="relative z-10 flex items-center justify-between"
        >
          {[["8+", "Sections"], ["AI", "Powered"], ["Free", "Forever"]].map(
            ([val, label]) => (
              <div key={label} className="text-center">
                <div className="text-4xl font-bold text-white mb-1">{val}</div>
                <div className="text-sm text-slate-400">{label}</div>
              </div>
            )
          )}
        </motion.div>
      </div>
    </div>
  );
}