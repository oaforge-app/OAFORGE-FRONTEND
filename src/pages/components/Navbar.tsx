import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import {
  BarChart3, Settings, LogOut, Menu, X, ChevronDown,
  Zap, Sun, Moon, LayoutDashboard,
} from "lucide-react";
import { useUser, useLogout } from "@/api/auth.query";

// ── Theme hook ───────────────────────────────────────────────────────────────
export function useTheme() {
  const [dark, setDark] = useState(() =>
    typeof document !== "undefined"
      ? document.documentElement.classList.contains("dark")
      : false
  );
  const toggle = () => {
    document.documentElement.classList.toggle("dark");
    setDark((d) => !d);
  };
  return { dark, toggle };
}

// ── Nav items ────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Results",   href: "/results",   icon: BarChart3        },
  { label: "Settings",  href: "/settings",  icon: Settings         },
];

// ── Component ────────────────────────────────────────────────────────────────
export default function Navbar() {
  const navigate   = useNavigate();
  const location   = useLocation();
  const { user }   = useUser();
  const { logout } = useLogout();
  const { dark, toggle } = useTheme();

  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mounted,     setMounted]     = useState(false);

  useEffect(() => setMounted(true), []);

  // ── Scroll pill mode ───────────────────────────────────────────────────────
  const { scrollY } = useScroll();
  const [mode, setMode] = useState<"full" | "pill">("full");
  useMotionValueEvent(scrollY, "change", (cur) => {
    const prev = scrollY.getPrevious() ?? 0;
    if (cur < 60)        setMode("full");
    else if (cur > prev) setMode("pill");
    else                 setMode("full");
  });
  const isPill = mode === "pill";

  const isKeyNeeded = !user?.hasGroqApiKey;

  const displayName =
    user?.firstName
      ? `${user.firstName}${user.lastName ? " " + user.lastName : ""}`
      : user?.email?.split("@")[0] ?? "User";

  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // ── Design tokens ──────────────────────────────────────────────────────────
  const navBg = dark
    ? "rgba(5,5,6,0.82)"
    : "rgba(255,255,255,0.82)";

  const navBorder = dark
    ? "rgba(255,255,255,0.06)"
    : "rgba(0,0,0,0.07)";

  const navShadow = dark
    ? "0 0 0 1px rgba(255,255,255,0.06), 0 4px 32px rgba(0,0,0,0.55), 0 1px 0 rgba(255,255,255,0.03) inset"
    : "0 0 0 1px rgba(0,0,0,0.04), 0 4px 24px rgba(0,0,0,0.07), 0 1px 0 rgba(255,255,255,0.9) inset";

  const textPrimary = dark ? "#EDEDEF"                : "rgba(9,9,11,0.90)";
  const textMuted   = dark ? "#8A8F98"                : "rgba(9,9,11,0.38)";
  const textHover   = dark ? "rgba(237,237,239,0.75)" : "rgba(9,9,11,0.65)";

  const pillBg     = dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
  const pillBorder = dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";

  const shimmer = dark
    ? "linear-gradient(90deg, transparent, rgba(94,106,210,0.35) 50%, transparent)"
    : "linear-gradient(90deg, transparent, rgba(94,106,210,0.18) 50%, transparent)";

  const divider = dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const dotColor = "#5E6AD2";

  const chipActiveBg    = dark ? "rgba(94,106,210,0.15)"  : "rgba(94,106,210,0.10)";
  const chipActiveColor = dark ? "#a5b4fc"                 : "#4f46e5";
  const chipDefaultBg   = dark ? "rgba(255,255,255,0.04)"  : "rgba(0,0,0,0.04)";
  const chipDefaultColor= dark ? "rgba(255,255,255,0.25)"  : "rgba(0,0,0,0.28)";

  const dropdownBg = dark ? "rgba(10,10,12,0.92)" : "rgba(255,255,255,0.94)";

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
   <>
    <div className="fixed inset-x-0 top-0 z-50 flex justify-center pointer-events-none">

      {/* Accent shimmer line */}
      <div
        className="absolute inset-x-0 top-0 h-px pointer-events-none"
        style={{ background: shimmer }}
      />

      {/* ══════════════════════════════════
          DESKTOP
      ══════════════════════════════════ */}
      <motion.header
        animate={
          isPill
            ? { top: 12, width: "auto", borderRadius: 9999, paddingLeft: 16, paddingRight: 16 }
            : { top: 0,  width: "100%", borderRadius: 0,    paddingLeft: 24, paddingRight: 24 }
        }
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="hidden md:flex items-center justify-between pointer-events-auto h-[52px]"
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          maxWidth: isPill ? "fit-content" : "100%",
          margin: "0 auto",
          background: navBg,
          border: `1px solid ${navBorder}`,
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          boxShadow: navShadow,
        }}
      >

        {/* Logo — hidden in pill */}
        <AnimatePresence>
          {!isPill && (
            <motion.div
              key="logo"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden mr-7 flex-shrink-0"
            >
              <button
                onClick={() => navigate("/dashboard")}
                className="flex items-center gap-2.5 group select-none"
              >
                <motion.div
                  whileHover={{ scale: 1.08, rotate: 5 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="w-[30px] h-[30px] rounded-xl overflow-hidden flex-shrink-0 transition-all duration-200"
                  style={{ boxShadow: `0 0 0 1px ${navBorder}, 0 2px 8px rgba(94,106,210,0.15)` }}
                >
                  <img src="/logo.webp" alt="OAForge logo" className="w-full h-full object-cover" />
                </motion.div>
                <div className="flex flex-col leading-none">
                  <span className="text-[13px] font-bold tracking-tight" style={{ color: textPrimary }}>
                    OAForge
                  </span>
                  <span className="text-[9px] font-semibold tracking-[0.16em] uppercase mt-[2px]" style={{ color: textMuted }}>
                    Ace Every OA
                  </span>
                </div>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Nav links */}
        <nav className="flex items-center gap-px">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <button
                key={item.href}
                onClick={() => navigate(item.href)}
                className="relative flex items-center gap-1.5 px-3 py-[7px] rounded-full
                  select-none text-[11.5px] font-semibold tracking-[0.05em] uppercase
                  transition-colors duration-150 outline-none"
                style={{ color: isActive ? textPrimary : textMuted }}
                onMouseEnter={(e) => {
                  if (!isActive) (e.currentTarget as HTMLElement).style.color = textHover;
                }}
                onMouseLeave={(e) => {
                  if (!isActive) (e.currentTarget as HTMLElement).style.color = textMuted;
                }}
              >
                {/* Active pill */}
                {isActive && (
                  <motion.span
                    layoutId="activeNavPill"
                    className="absolute inset-0 rounded-full"
                    style={{ background: pillBg, border: `1px solid ${pillBorder}` }}
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                {/* Active dot */}
                {isActive && (
                  <span className="relative w-1 h-1 rounded-full flex-shrink-0" style={{ background: dotColor }} />
                )}
                <span className="relative">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right controls */}
        <div className="flex items-center gap-2.5 ml-6 flex-shrink-0">
          <div className="w-px h-[18px]" style={{ background: divider }} />

          {/* Add API Key badge */}
          {isKeyNeeded && (
            <button
              onClick={() => navigate("/settings")}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-full transition-all duration-200"
              style={{
                background: dark ? "rgba(94,106,210,0.12)" : "rgba(94,106,210,0.08)",
                border: `1px solid rgba(94,106,210,${dark ? "0.22" : "0.18"})`,
                color: dark ? "#a5b4fc" : "#4f46e5",
              }}
            >
              <Zap className="w-3 h-3" />
              Add API Key
            </button>
          )}

          {/* Theme toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggle}
            className="cursor-pointer w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-150"
            style={{
              border: `1px solid ${navBorder}`,
              background: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
              color: textMuted,
            }}
            title={dark ? "Light mode" : "Dark mode"}
          >
            <AnimatePresence mode="wait" initial={false}>
              {dark ? (
                <motion.span key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <Sun className="w-3.5 h-3.5" />
                </motion.span>
              ) : (
                <motion.span key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <Moon className="w-3.5 h-3.5" />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen((p) => !p)}
              className=" cursor-pointer flex items-center gap-2 pl-1 pr-2 py-1 rounded-full transition-all duration-150"
              style={{
                border: `1px solid ${profileOpen ? navBorder : "transparent"}`,
                background: profileOpen ? (dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)") : "transparent",
              }}
            >
              <div
                className="w-[26px] h-[26px] rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg, #5E6AD2, #7c3aed)",
                  boxShadow: "0 0 10px rgba(94,106,210,0.35)",
                }}
              >
                {initials}
              </div>
              <span className="text-[11.5px] font-semibold max-w-[90px] truncate hidden sm:block" style={{ color: textPrimary }}>
                {displayName}
              </span>
              <ChevronDown
                className="w-3 h-3 transition-transform duration-200"
                style={{ color: textMuted, transform: profileOpen ? "rotate(180deg)" : "rotate(0deg)" }}
              />
            </button>

            <AnimatePresence>
              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0,  scale: 1    }}
                    exit={{ opacity: 0,    y: -6,  scale: 0.97 }}
                    transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute right-0 top-full mt-2 w-56 z-20 rounded-2xl overflow-hidden"
                    style={{
                      background: dropdownBg,
                      border: `1px solid ${navBorder}`,
                      backdropFilter: "blur(24px) saturate(200%)",
                      WebkitBackdropFilter: "blur(24px) saturate(200%)",
                      boxShadow: dark
                        ? "0 0 0 1px rgba(255,255,255,0.06), 0 20px 48px rgba(0,0,0,0.65)"
                        : "0 0 0 1px rgba(0,0,0,0.04), 0 20px 40px rgba(0,0,0,0.10)",
                    }}
                  >
                    {/* Shimmer top line */}
                    <div className="h-px" style={{ background: shimmer }} />

                    {/* User info */}
                    <div className="px-4 py-3" style={{ borderBottom: `1px solid ${divider}` }}>
                      <p className="text-[13px] font-semibold truncate" style={{ color: textPrimary }}>{displayName}</p>
                      <p className="text-[11px] truncate mt-0.5" style={{ color: textMuted }}>{user?.email}</p>
                    </div>

                    {/* Actions */}
                    <div className="p-1.5 space-y-px">
                      {[
                        { label: "Results",  icon: BarChart3, href: "/results"  },
                        { label: "Settings", icon: Settings,  href: "/settings" },
                      ].map((item) => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.href}
                            onClick={() => { navigate(item.href); setProfileOpen(false); }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-[12px] font-semibold rounded-xl transition-colors duration-150"
                            style={{ color: textMuted }}
                            onMouseEnter={(e) => {
                              (e.currentTarget as HTMLElement).style.color = textHover;
                              (e.currentTarget as HTMLElement).style.background = dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)";
                            }}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLElement).style.color = textMuted;
                              (e.currentTarget as HTMLElement).style.background = "transparent";
                            }}
                          >
                            <span
                              className="w-6 h-6 flex items-center justify-center rounded-lg flex-shrink-0"
                              style={{ background: chipDefaultBg, color: chipDefaultColor, border: `1px solid ${navBorder}` }}
                            >
                              <Icon size={12} />
                            </span>
                            {item.label}
                          </button>
                        );
                      })}

                      <div className="h-px my-1" style={{ background: divider }} />

                      <button
                        onClick={() => { logout(); setProfileOpen(false); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-[12px] font-semibold text-red-500 rounded-xl transition-colors duration-150"
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = dark ? "rgba(239,68,68,0.08)" : "rgba(239,68,68,0.06)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                      >
                        <span
                          className="w-6 h-6 flex items-center justify-center rounded-lg flex-shrink-0"
                          style={{ background: "rgba(239,68,68,0.10)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.15)" }}
                        >
                          <LogOut size={12} />
                        </span>
                        Sign out
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.header>

      {/* ══════════════════════════════════
          MOBILE
      ══════════════════════════════════ */}
      <div className="md:hidden fixed inset-x-0 top-0 px-3 pt-3 pointer-events-auto">

        {/* Mobile bar */}
        <div
          className="flex items-center justify-between px-4 rounded-2xl"
          style={{
            height: "52px",
            background: navBg,
            border: `1px solid ${navBorder}`,
            backdropFilter: "blur(20px) saturate(180%)",
            WebkitBackdropFilter: "blur(20px) saturate(180%)",
            boxShadow: navShadow,
          }}
        >
          {/* Logo */}
          <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 select-none">
            <div
              className="w-[30px] h-[30px] rounded-xl overflow-hidden flex-shrink-0"
              style={{ boxShadow: `0 0 0 1px ${navBorder}` }}
            >
              <img src="/logo.webp" alt="OAForge" className="w-full h-full object-cover" />
            </div>
            <span className="text-[13px] font-bold tracking-tight" style={{ color: textPrimary }}>
              OAForge
            </span>
          </button>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            {/* Avatar */}
            <div
              className="w-[26px] h-[26px] rounded-full flex items-center justify-center text-[10px] font-bold text-white"
              style={{ background: "linear-gradient(135deg, #5E6AD2, #7c3aed)", boxShadow: "0 0 8px rgba(94,106,210,0.3)" }}
            >
              {initials}
            </div>

            {/* Theme toggle */}
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={toggle}
              className="w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-150"
              style={{ border: `1px solid ${navBorder}`, background: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)", color: textMuted }}
            >
              <AnimatePresence mode="wait" initial={false}>
                {dark ? (
                  <motion.span key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <Sun className="w-3.5 h-3.5" />
                  </motion.span>
                ) : (
                  <motion.span key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <Moon className="w-3.5 h-3.5" />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Hamburger */}
            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-150 active:scale-[0.94]"
              style={{ border: `1px solid ${navBorder}`, background: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)", color: textMuted }}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={mobileOpen ? "close" : "open"}
                  initial={{ opacity: 0, rotate: -60, scale: 0.6 }}
                  animate={{ opacity: 1, rotate: 0,   scale: 1   }}
                  exit={{ opacity: 0,    rotate:  60,  scale: 0.6 }}
                  transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
                >
                  {mobileOpen ? <X size={14} /> : <Menu size={14} />}
                </motion.span>
              </AnimatePresence>
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0,  scale: 1    }}
              exit={{ opacity: 0,    y: -8,  scale: 0.98 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="mt-2 rounded-2xl overflow-hidden"
              style={{
                background: dropdownBg,
                border: `1px solid ${navBorder}`,
                backdropFilter: "blur(24px) saturate(200%)",
                WebkitBackdropFilter: "blur(24px) saturate(200%)",
                boxShadow: dark
                  ? "0 0 0 1px rgba(255,255,255,0.06), 0 20px 48px rgba(0,0,0,0.65)"
                  : "0 0 0 1px rgba(0,0,0,0.04), 0 20px 40px rgba(0,0,0,0.10)",
              }}
            >
              <div className="h-px" style={{ background: shimmer }} />

              <div className="p-2 space-y-px">
                {/* User info */}
                <div className="flex items-center gap-3 px-3 py-3 mb-1" style={{ borderBottom: `1px solid ${divider}` }}>
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, #5E6AD2, #7c3aed)", boxShadow: "0 0 10px rgba(94,106,210,0.3)" }}
                  >
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12px] font-semibold truncate" style={{ color: textPrimary }}>{displayName}</p>
                    <p className="text-[10px] truncate mt-0.5" style={{ color: textMuted }}>{user?.email}</p>
                  </div>
                </div>

                {/* Nav items */}
                {NAV_ITEMS.map((item, i) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  return (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0  }}
                      transition={{ delay: i * 0.045, duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <button
                        onClick={() => { navigate(item.href); setMobileOpen(false); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[12px] font-semibold tracking-[0.05em] uppercase transition-all duration-150"
                        style={{
                          color: isActive ? textPrimary : textMuted,
                          background: isActive ? (dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)") : "transparent",
                          border: `1px solid ${isActive ? navBorder : "transparent"}`,
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) {
                            (e.currentTarget as HTMLElement).style.color = textHover;
                            (e.currentTarget as HTMLElement).style.background = dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) {
                            (e.currentTarget as HTMLElement).style.color = textMuted;
                            (e.currentTarget as HTMLElement).style.background = "transparent";
                          }
                        }}
                      >
                        <span
                          className="w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0 transition-colors duration-150"
                          style={{
                            background: isActive ? chipActiveBg    : chipDefaultBg,
                            color:      isActive ? chipActiveColor : chipDefaultColor,
                            border: isActive
                              ? `1px solid rgba(94,106,210,${dark ? "0.18" : "0.14"})`
                              : `1px solid ${navBorder}`,
                          }}
                        >
                          <Icon size={13} strokeWidth={2.2} />
                        </span>
                        {item.label}
                        {isActive && (
                          <motion.span
                            layoutId="mobileActiveDot"
                            className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{ background: dotColor }}
                            transition={{ type: "spring", stiffness: 380, damping: 32 }}
                          />
                        )}
                      </button>
                    </motion.div>
                  );
                })}

                <div className="h-px my-1" style={{ background: divider }} />

                {/* Sign out */}
                <motion.div
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0  }}
                  transition={{ delay: NAV_ITEMS.length * 0.045, duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                >
                  <button
                    onClick={() => { logout(); setMobileOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[12px] font-semibold tracking-[0.05em] uppercase text-red-500 transition-all duration-150"
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = dark ? "rgba(239,68,68,0.08)" : "rgba(239,68,68,0.06)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                  >
                    <span
                      className="w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0"
                      style={{ background: "rgba(239,68,68,0.10)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.15)" }}
                    >
                      <LogOut size={13} strokeWidth={2.2} />
                    </span>
                    Sign out
                  </button>
                </motion.div>
              </div>

              {/* Footer */}
              <div
                className="mx-2 mb-2 mt-1 px-3 py-2 rounded-xl flex items-center justify-between"
                style={{ background: dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)", border: `1px solid ${navBorder}` }}
              >
                <span className="text-[10px] font-semibold tracking-[0.10em] uppercase" style={{ color: textMuted }}>
                  OAForge · Ace Every OA
                </span>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: dotColor, opacity: 0.5 }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
    
    <div className="h-[52px] w-full" /></>
  );
}