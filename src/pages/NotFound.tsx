import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertTriangle, ArrowLeft, Home } from "lucide-react";

// ── 404 Page ──────────────────────────────────────────────────────────────────

const NotFoundPage = () => {
  const navigate = useNavigate();

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
        animate={{ opacity: 1, scale: 1,    y: 0  }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        <div className={[
          "relative overflow-hidden rounded-2xl p-10 text-center",
          "bg-white border border-black/[0.07] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.06)]",
          "dark:bg-[#0d0d10] dark:border-white/[0.07] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.055),0_4px_32px_rgba(0,0,0,0.5)]",
        ].join(" ")}>

          {/* Edge glow */}
          <div className="hidden dark:block absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.13] to-transparent pointer-events-none" />

          {/* Accent top bar */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#5E6AD2]/50 to-transparent pointer-events-none" />

          {/* Radial glow blob */}
          <div className="absolute inset-0 opacity-[0.07] dark:opacity-[0.12] pointer-events-none"
            style={{ background: "radial-gradient(circle at 50% 0%,#5E6AD2,transparent 65%)" }} />

          {/* 404 number */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1,  y: 0   }}
            transition={{ delay: 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 mb-6"
          >
            <span
              className="text-[96px] font-extrabold leading-none tracking-tight tabular-nums select-none"
              style={{
                background: "linear-gradient(135deg,#5E6AD2,#7c3aed)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                filter: "drop-shadow(0 0 32px rgba(94,106,210,0.35))",
              }}
            >
              404
            </span>
          </motion.div>

          {/* Icon + text */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1,  y: 0  }}
            transition={{ delay: 0.18, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 space-y-3 mb-8"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mx-auto
              bg-[#5E6AD2]/[0.10] border border-[#5E6AD2]/[0.20]
              shadow-[0_0_24px_rgba(94,106,210,0.2)]">
              <AlertTriangle className="w-5 h-5 text-[#5E6AD2]" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-[#EDEDEF]">
              Page not found
            </h2>
            <p className="text-sm text-gray-400 dark:text-[#8A8F98] leading-relaxed max-w-xs mx-auto">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </motion.div>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1,  y: 0  }}
            transition={{ delay: 0.26, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 flex flex-col sm:flex-row gap-3 justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}
              onClick={() => navigate(-1)}
              className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200
                border border-black/[0.07] dark:border-white/[0.08]
                bg-gray-50 dark:bg-white/[0.04]
                text-gray-600 dark:text-[#8A8F98]
                hover:text-gray-900 dark:hover:text-[#EDEDEF]
                hover:bg-gray-100 dark:hover:bg-white/[0.07]"
            >
              <ArrowLeft className="w-4 h-4" />
              Go back
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/dashboard")}
              className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200
                bg-[#5E6AD2] text-white hover:bg-[#6872D9]
                shadow-[0_0_0_1px_rgba(94,106,210,0.5),0_4px_14px_rgba(94,106,210,0.35),inset_0_1px_0_rgba(255,255,255,0.15)]
                hover:shadow-[0_0_0_1px_rgba(104,114,217,0.6),0_6px_20px_rgba(94,106,210,0.45)]"
            >
              <Home className="w-4 h-4" />
              Dashboard
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;

// ── NotFoundTableData — inline empty/error state ──────────────────────────────

export const NotFoundTableData = ({ title, message }: { title: string; message?: string }) => {
  return (
    <div className={[
      "relative overflow-hidden flex flex-col items-center justify-center rounded-2xl p-8 text-center",
      "bg-white border border-black/[0.07] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.06)]",
      "dark:bg-[#0d0d10] dark:border-white/[0.07] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.055),0_4px_32px_rgba(0,0,0,0.5)]",
    ].join(" ")}>
      {/* Edge glow */}
      <div className="hidden dark:block absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.13] to-transparent pointer-events-none" />
      {/* Radial blob */}
      <div className="absolute inset-0 opacity-[0.06] dark:opacity-[0.10] pointer-events-none"
        style={{ background: "radial-gradient(circle at 50% 0%,#ef4444,transparent 65%)" }} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1,  scale: 1    }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex flex-col items-center gap-3"
      >
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center
          bg-red-500/[0.08] border border-red-500/[0.18]
          shadow-[0_0_20px_rgba(239,68,68,0.15)]">
          <AlertTriangle className="w-5 h-5 text-red-500" />
        </div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-[#EDEDEF]">{title}</h3>
        <p className="text-xs text-gray-400 dark:text-[#8A8F98] max-w-[240px] leading-relaxed">
          {message ?? "An unexpected error occurred."}
        </p>
      </motion.div>
    </div>
  );
};