import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, KeyRound } from "lucide-react";

import { useForgotPassword, useResetPassword } from "@/api/auth.query";
import { LoaderButton } from "@/components/ui/LoaderButton";

// ── Validation ─────────────────────────────────────────

const forgotSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const resetPasswordSchema = z.object({
  email: z.string().email(),
  otp: z.string().min(6, "OTP must be 6 digits").max(6),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
});

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2>(1);
  const [showPassword, setShowPassword] = useState(false);

  const forgotPassMutation = useForgotPassword();
  const resetPassMutation = useResetPassword();

  const step1Form = useForm({
    resolver: zodResolver(forgotSchema),
  });

  const step2Form = useForm({
    resolver: zodResolver(resetPasswordSchema),
  });

  const handleStep1Submit = (data: any) => {
    forgotPassMutation.mutate(data, {
      onSuccess: () => {
        step2Form.setValue("email", data.email);
        setStep(2);
      },
    });
  };

  const handleStep2Submit = (data: any) => {
    resetPassMutation.mutate(data, {
      onSuccess: () => {
        navigate("/");
      },
    });
  };

  return (
    <div className="min-h-screen flex">
      {/* ───────── LEFT SIDE ───────── */}
      <div className="w-full lg:w-5/12 flex items-center justify-center p-8 relative bg-background">

        {/* Background dots */}
        <div className="absolute inset-0 opacity-[0.015]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
              backgroundSize: "24px 24px",
            }}
          />
        </div>

        {/* Gradient Orb */}
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-20 left-10 w-64 h-64 bg-primary/20 rounded-full blur-3xl"
        />

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md z-10 bg-card border border-border rounded-xl p-8 shadow-xl"
        >
          {/* Logo */}
          <div className="text-center mb-6">
            <div className="w-20 h-20 rounded-xl flex items-center justify-center mx-auto mb-2">
              <img src="/logo.webp" alt="OAForge" />
            </div>

            <h1 className="text-2xl font-bold tracking-tight">
              {step === 1 ? "Reset your password" : "Enter OTP & New Password"}
            </h1>

            <p className="text-sm text-muted-foreground mt-1">
              {step === 1
                ? "We’ll send you a verification code"
                : "Check your email for the OTP"}
            </p>
          </div>

          {/* ───────── STEP 1 ───────── */}
          {step === 1 && (
            <form
              onSubmit={step1Form.handleSubmit(handleStep1Submit)}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    {...step1Form.register("email")}
                    type="email"
                    placeholder="you@example.com"
                    className="w-full pl-9 pr-4 py-2.5 text-sm bg-background border border-border rounded-lg outline-none focus:border-primary transition-colors"
                  />
                </div>
                <p className="text-xs text-destructive">
                  {step1Form.formState.errors.email?.message as string}
                </p>
              </div>

             <LoaderButton
  type="submit"
  isLoading={forgotPassMutation.isPending}
  loadingText="Sending..."
>
  Send OTP
</LoaderButton>

              <p className="text-sm text-center text-muted-foreground">
                Remembered your password?{" "}
                <Link to="/" className="text-primary hover:underline">
                  Back to login
                </Link>
              </p>
            </form>
          )}

          {/* ───────── STEP 2 ───────── */}
          {step === 2 && (
            <form
              onSubmit={step2Form.handleSubmit(handleStep2Submit)}
              className="space-y-4"
            >
              <input type="hidden" {...step2Form.register("email")} />

              <div className="space-y-1.5">
                <label className="text-sm font-medium">OTP Code</label>
                <input
                  {...step2Form.register("otp")}
                  placeholder="Enter 6-digit OTP"
                  className="w-full px-4 py-2.5 text-sm bg-background border border-border rounded-lg focus:border-primary outline-none"
                />
                <p className="text-xs text-destructive">
                  {step2Form.formState.errors.otp?.message as string}
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">New Password</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    {...step2Form.register("newPassword")}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2.5 text-sm bg-background border border-border rounded-lg focus:border-primary outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

            <LoaderButton
  type="submit"
  isLoading={resetPassMutation.isPending}
  loadingText="Resetting..."
>
  Reset Password
</LoaderButton>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-xs text-muted-foreground hover:underline"
              >
                Use different email
              </button>
            </form>
          )}
        </motion.div>
      </div>

      {/* ───────── RIGHT SIDE (Same as login hero) ───────── */}
      <div className="hidden lg:flex lg:w-7/12 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
    </div>
  );
}