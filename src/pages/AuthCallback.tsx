import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { QUERY_KEY } from "@/lib/config";
import { motion } from "framer-motion";

export default function AuthCallback() {
  const navigate     = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient  = useQueryClient();

  useEffect(() => {
    const success = searchParams.get("success");
    const error   = searchParams.get("error");

    if (success === "true") {
      toast.success("Successfully signed in with Google!");
      queryClient.invalidateQueries({ queryKey: QUERY_KEY.me });
      setTimeout(() => navigate("/dashboard", { replace: true }), 500);
    } else if (error) {
      toast.error("Authentication failed. Please try again.");
      navigate("/login", { replace: true });
    } else {
      toast.error("Authentication error. Please try again.");
      navigate("/login", { replace: true });
    }
  }, [searchParams, navigate, queryClient]);

  return (
    <div className="min-h-screen bg-[#f4f4f7] dark:bg-[#050506] transition-colors duration-300 flex items-center justify-center p-6">

      {/* ── Atmospheric background ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="dark:hidden absolute inset-0 bg-[radial-gradient(ellipse_100%_40%_at_50%_0%,rgba(99,102,241,0.09),transparent_70%)]" />
        <div className="hidden dark:block absolute inset-0 bg-[radial-gradient(ellipse_at_top,#0d0d18_0%,transparent_55%)]" />
        <div className="absolute inset-0 opacity-[0.022] dark:opacity-[0.032]"
          style={{ backgroundImage:"linear-gradient(rgba(94,106,210,0.3) 1px,transparent 1px),linear-gradient(90deg,rgba(94,106,210,0.3) 1px,transparent 1px)", backgroundSize:"64px 64px" }} />
        <motion.div animate={{ y:[0,-26,0],rotate:[-3,3,-3] }} transition={{ duration:14,repeat:Infinity,ease:"easeInOut" }}
          className="hidden dark:block absolute -top-64 left-1/2 -translate-x-1/2 w-[1400px] h-[800px] rounded-full bg-[#5E6AD2]/[0.14] blur-[180px]" />
        <div className="dark:hidden absolute -top-32 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] rounded-full bg-indigo-200/[0.28] blur-[140px]" />
      </div>

      {/* ── Card ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1,  scale: 1,    y: 0  }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-sm"
      >
        <div className={[
          "relative overflow-hidden rounded-2xl px-10 py-12 text-center",
          "bg-white border border-black/[0.07] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.06)]",
          "dark:bg-[#0d0d10] dark:border-white/[0.07] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.055),0_4px_32px_rgba(0,0,0,0.5)]",
        ].join(" ")}>

          {/* Edge glow */}
          <div className="hidden dark:block absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.13] to-transparent pointer-events-none" />
          {/* Shimmer accent */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#5E6AD2]/50 to-transparent pointer-events-none" />
          {/* Radial blob */}
          <div className="absolute inset-0 opacity-[0.07] dark:opacity-[0.12] pointer-events-none"
            style={{ background: "radial-gradient(circle at 50% 0%,#5E6AD2,transparent 65%)" }} />

          {/* Spinner */}
          <div className="relative z-10 flex justify-center mb-6">
            <div className="relative w-16 h-16">
              {/* Outer ring */}
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="28" fill="none"
                  stroke="rgba(94,106,210,0.12)" strokeWidth="4" />
                <motion.circle cx="32" cy="32" r="28" fill="none"
                  stroke="#5E6AD2" strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray="175.93"
                  animate={{ strokeDashoffset: [175.93, 0, 175.93] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                />
              </svg>
              {/* Inner icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 rounded-xl overflow-hidden border border-[#5E6AD2]/25
                  shadow-[0_0_12px_rgba(94,106,210,0.25)]">
                  <img src="/logo.webp" alt="OAForge" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          </div>

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1,  y: 0  }}
            transition={{ delay: 0.15, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 space-y-2"
          >
            <h2 className="text-lg font-bold tracking-tight text-gray-900 dark:text-[#EDEDEF]">
              Completing sign in…
            </h2>
            <p className="text-sm text-gray-400 dark:text-[#8A8F98]">
              Please wait while we set up your account
            </p>
          </motion.div>

          {/* Animated dots */}
          <div className="relative z-10 flex justify-center gap-1.5 mt-6">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-[#5E6AD2]"
                animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.1, 0.8] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}