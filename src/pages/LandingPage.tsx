import { useRef, useState, useEffect } from "react";
import {
    motion, useInView, useScroll, useTransform, AnimatePresence,
} from "framer-motion";
import { Link } from "react-router-dom";
import {
    Brain, Target, Zap, BarChart3, Clock, Trophy,
    ArrowRight, ChevronRight, Check, Menu, X, Flame,
    Github, Twitter, Mail,
} from "lucide-react";

import SpotlightCards from "@/components/ui/spotlight-cards";
import LogoLoop from "@/components/ui/LogoLoop";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";

import {
    SiReact, SiNestjs, SiTypescript, SiPostgresql, SiPrisma,
    SiTailwindcss, SiNodedotjs, SiVercel, SiDocker,
    SiJsonwebtokens, SiFramer, SiZod, SiMailgun,
} from "react-icons/si";
import { TbBrandTabler } from "react-icons/tb";
import AnimatedGenerateButton from "@/components/ui/FreeNos";

/* ─── Design tokens ──────────────────────────────────────────────────────── */
// const E = [0.16, 1, 0.3, 1] as const;  // expo-out easing
const EASE_OUT = [0.16, 1, 0.3, 1] as const;
/* ─── Data ───────────────────────────────────────────────────────────────── */
const FEATURES = [
    { icon: Brain, title: "AI Assessment Engine", description: "Paste a JD — Groq reads it and builds role-specific MCQs across DSA, DBMS, OS, CN, and Aptitude in one shot.", color: "#5E6AD2" },
    { icon: Target, title: "Company-Tailored Plans", description: "'SDE-1 @ Google' — AI picks exactly the sections and question distribution that company's OA demands.", color: "#a78bfa" },
    { icon: Zap, title: "Parallel Generation", description: "All sections generate simultaneously. Full 60-question test ready in under 10 seconds via async Groq calls.", color: "#f59e0b" },
    { icon: BarChart3, title: "Deep Analytics", description: "Track accuracy trends, subject radar, day streaks, and weak-area heatmaps. Know where to push harder.", color: "#38bdf8" },
    { icon: Clock, title: "Timed Sessions", description: "Per-section countdowns, debounced auto-save on every keystroke, auto-submit when time runs out.", color: "#34d399" },
    { icon: Trophy, title: "Instant Score Reports", description: "Section-by-section breakdown, answer explanations, and a full PDF report emailed the moment you submit.", color: "#fb923c" },
];

const STEPS = [
    { num: "01", title: "Get Your Free Groq Key", desc: "Visit console.groq.com and grab a free API key in 30 seconds. No credit card, no billing — ever.", hint: "console.groq.com → Create API Key" },
    { num: "02", title: "Describe Your Target Role", desc: "Enter the role and company, or paste the full JD. AI reads it and designs a custom assessment plan.", hint: "e.g.  SDE-1 @ Google · Backend Intern @ Flipkart" },
    { num: "03", title: "Practice. Analyze. Repeat.", desc: "Take timed tests under real OA conditions, review every answer, track your weak spots, and watch accuracy climb.", hint: "Full score report emailed after every test" },
];

const STATS = [
    { value: "< 10s", label: "Generation Speed", sub: "Full 60Q assessment" },
    { value: "6+", label: "Subject Areas", sub: "DSA · OS · DBMS · CN · Apt" },
    { value: "$0", label: "Cost to Start", sub: "Just bring your Groq key" },
    { value: "100%", label: "Personalized", sub: "Every test is uniquely yours" },
];

const TECH = [
    { node: <SiReact className="text-[#61DAFB]" />, title: "React", href: "https://react.dev" },
    { node: <SiNestjs className="text-[#E0234E]" />, title: "NestJS", href: "https://nestjs.com" },
    { node: <SiTypescript className="text-[#3178C6]" />, title: "TypeScript", href: "https://typescriptlang.org" },
    { node: <SiPostgresql className="text-[#4169E1]" />, title: "PostgreSQL", href: "https://postgresql.org" },
    { node: <SiPrisma className="text-[#5A67D8]" />, title: "Prisma", href: "https://prisma.io" },
    { node: <SiTailwindcss className="text-[#38BDF8]" />, title: "Tailwind CSS", href: "https://tailwindcss.com" },
    { node: <SiNodedotjs className="text-[#339933]" />, title: "Node.js", href: "https://nodejs.org" },
    { node: <SiVercel className="text-white" />, title: "Vercel", href: "https://vercel.com" },
    { node: <SiDocker className="text-[#2496ED]" />, title: "Docker", href: "https://docker.com" },
    { node: <SiJsonwebtokens className="text-[#D63AFF]" />, title: "JWT", href: "https://jwt.io" },
    { node: <SiMailgun className="text-[#F06B66]" />, title: "Nodemailer", href: "https://nodemailer.com" },
    { node: <SiFramer className="text-white" />, title: "Framer Motion", href: "https://framer.com/motion" },
    { node: <SiZod className="text-[#3E67B1]" />, title: "Zod", href: "https://zod.dev" },
    { node: <TbBrandTabler className="text-[#5E6AD2]" />, title: "TanStack Q", href: "https://tanstack.com/query" },
];

const TERMINAL_LINES = [
    { text: "$ oaforge create --role 'SDE-1' --company 'Google'", color: "#5A6270", delay: 0 },
    { text: "✓ Reading job description...", color: "#5E6AD2", delay: 500 },
    { text: "✓ AI designing assessment plan...", color: "#5E6AD2", delay: 950 },
    { text: "", color: "", delay: 1300 },
    { text: "  sections:", color: "#a78bfa", delay: 1400 },
    { text: '    → "Data Structures & Algorithms"    45min  25Q', color: "#34d399", delay: 1620 },
    { text: '    → "System Design MCQ"               20min  12Q', color: "#34d399", delay: 1820 },
    { text: '    → "Operating Systems"               20min  12Q', color: "#34d399", delay: 2020 },
    { text: '    → "Verbal & Aptitude"               15min  11Q', color: "#34d399", delay: 2220 },
    { text: "", color: "", delay: 2400 },
    { text: "✓ 60 questions generated in 8.4s", color: "#f59e0b", delay: 2600 },
    { text: "✓ Score report will be emailed. Good luck! 🚀", color: "#EDEDEF", delay: 3050 },
];

/* ─── Aurora Background ──────────────────────────────────────────────────── */
// Clean beam/aurora effect — no bubbles, pure atmospheric depth

function Background() {
    return (
        <div className="fixed inset-0 overflow-hidden" style={{ zIndex: 0, background: "#020209" }}>

            {/* ── Beam 1 — central indigo column */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-full"
                style={{ background: "linear-gradient(180deg, transparent 0%, rgba(94,106,210,0.5) 30%, rgba(94,106,210,0.15) 70%, transparent 100%)" }} />

            {/* ── Top arc glow (above the fold) */}
            <div className="absolute -top-[120px] left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-[50%]"
                style={{ background: "radial-gradient(ellipse at center top, rgba(94,106,210,0.18) 0%, rgba(124,58,237,0.06) 45%, transparent 70%)", filter: "blur(1px)" }} />

            {/* ── Left aurora streak */}
            <div className="absolute top-[15%] -left-[100px] w-[480px] h-[900px]"
                style={{
                    background: "conic-gradient(from 200deg at 0% 50%, transparent 0deg, rgba(124,58,237,0.07) 40deg, rgba(94,106,210,0.04) 80deg, transparent 120deg)",
                    filter: "blur(40px)",
                    transform: "rotate(-15deg)",
                }} />

            {/* ── Right aurora streak */}
            <div className="absolute top-[20%] -right-[100px] w-[420px] h-[800px]"
                style={{
                    background: "conic-gradient(from 340deg at 100% 50%, transparent 0deg, rgba(56,189,248,0.05) 40deg, rgba(94,106,210,0.04) 80deg, transparent 120deg)",
                    filter: "blur(40px)",
                    transform: "rotate(15deg)",
                }} />

            {/* ── Mid-page secondary glow (below hero) */}
            <div className="absolute top-[110vh] left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full"
                style={{ background: "radial-gradient(ellipse, rgba(94,106,210,0.06) 0%, transparent 70%)", filter: "blur(2px)" }} />

            {/* ── Fine dot grid */}
            <div className="absolute inset-0 opacity-[0.6]"
                style={{
                    backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.035) 1px, transparent 1px)",
                    backgroundSize: "44px 44px",
                }} />

            {/* ── Horizontal scan lines (subtle banding) */}
            <div className="absolute inset-0"
                style={{
                    backgroundImage: "linear-gradient(0deg, transparent 0px, rgba(255,255,255,0.008) 1px, transparent 2px)",
                    backgroundSize: "100% 3px",
                }} />

            {/* ── Film grain */}
            <div className="absolute inset-0 opacity-[0.025]"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />

            {/* ── Hard edge vignette */}
            <div className="absolute inset-0"
                style={{ background: "radial-gradient(ellipse 120% 120% at 50% 50%, transparent 40%, rgba(2,2,9,0.8) 100%)" }} />

        </div>
    );
}

/* ─── Ember Canvas ───────────────────────────────────────────────────────── */
// Subtle floating particles — fewer, slower, more elegant

function EmberCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        let raf: number;
        type P = { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; size: number; hue: number; brightness: number };
        const particles: P[] = [];
        const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
        resize();
        window.addEventListener("resize", resize);
        let frame = 0;
        const tick = () => {
            frame++;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            if (frame % 5 === 0) {
                for (let i = 0; i < 2; i++) {
                    particles.push({
                        x: window.innerWidth * (0.25 + Math.random() * 0.5),
                        y: window.innerHeight * (0.65 + Math.random() * 0.35),
                        vx: (Math.random() - 0.5) * 0.9, vy: -(Math.random() * 1.4 + 0.5),
                        life: 0, maxLife: 100 + Math.random() * 200,
                        size: Math.random() * 2.5 + 0.5,
                        hue: Math.random() > 0.55 ? 224 + Math.random() * 28 : 28 + Math.random() * 22,
                        brightness: 60 + Math.random() * 35,
                    });
                }
            }
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.life++; p.x += p.vx + Math.sin(p.life * 0.04) * 0.35; p.y += p.vy; p.vy *= 0.999; p.vx *= 0.999;
                const t = p.life / p.maxLife;
                const alpha = (t < 0.12 ? t / 0.12 : t > 0.68 ? (1 - t) / 0.32 : 1) * 0.55;
                const sz = p.size * (1 - t * 0.45);
                ctx.save();
                ctx.globalAlpha = alpha;
                const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, sz * 3.5);
                g.addColorStop(0, `hsl(${p.hue},85%,${p.brightness}%)`);
                g.addColorStop(1, `hsla(${p.hue},85%,${p.brightness}%,0)`);
                ctx.fillStyle = g;
                ctx.beginPath(); ctx.arc(p.x, p.y, sz * 3.5, 0, Math.PI * 2); ctx.fill();
                ctx.restore();
                if (p.life >= p.maxLife) particles.splice(i, 1);
            }
            raf = requestAnimationFrame(tick);
        };
        tick();
        return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
    }, []);
    return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 1, opacity: 0.5 }} />;
}

/* ─── Navbar ─────────────────────────────────────────────────────────────── */

export function LandingNav() {
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handler = () => setScrolled(window.scrollY > 50);
        window.addEventListener("scroll", handler, { passive: true });
        return () => window.removeEventListener("scroll", handler);
    }, []);

    return (
        <div className="fixed inset-x-0 top-0 z-50 flex justify-center pointer-events-none"
            style={{ paddingTop: scrolled ? "12px" : "0px", transition: "padding 0.4s cubic-bezier(0.16,1,0.3,1)" }}
        >
            <div
                className="pointer-events-auto flex items-center justify-between"
                style={{
                    width: scrolled ? "min(700px, calc(100vw - 32px))" : "100%",
                    height: scrolled ? "54px" : "70px",
                    padding: scrolled ? "0 22px" : "0 36px",
                    borderRadius: scrolled ? "9999px" : "0px",
                    background: scrolled ? "rgba(8,8,14,0.88)" : "transparent",
                    border: scrolled ? "1px solid rgba(255,255,255,0.08)" : "1px solid transparent",
                    backdropFilter: scrolled ? "blur(28px) saturate(180%)" : "none",
                    WebkitBackdropFilter: scrolled ? "blur(28px) saturate(180%)" : "none",
                    boxShadow: scrolled ? "0 0 0 1px rgba(255,255,255,0.04), 0 12px 48px rgba(0,0,0,0.65), 0 1px 0 rgba(255,255,255,0.05) inset" : "none",
                    transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
                }}
            >
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2.5 shrink-0">
                    <motion.div whileHover={{ scale: 1.08, rotate: -6 }} transition={{ duration: 0.2 }}
                        style={{
                            width: scrolled ? 28 : 34, height: scrolled ? 28 : 34, borderRadius: scrolled ? "10px" : "13px", overflow: "hidden",
                            boxShadow: "0 0 18px rgba(94,106,210,0.35)", transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)"
                        }}
                    >
                        <img src="/logo.webp" alt="OAForge" className="w-full h-full object-cover" />
                    </motion.div>
                    <div className="flex flex-col leading-none">
                        <span style={{ fontSize: scrolled ? "13px" : "15px", fontWeight: 700, color: "#EDEDEF", letterSpacing: "-0.02em", transition: "font-size 0.4s cubic-bezier(0.16,1,0.3,1)" }}>
                            OAForge
                        </span>
                        {!scrolled && <span className="text-[9px] font-semibold tracking-[0.14em] uppercase" style={{ color: "rgba(138,143,152,0.6)", marginTop: "2px" }}>Ace Every OA</span>}
                    </div>
                </Link>

                {/* Nav links */}
                <div className="hidden md:flex items-center gap-1">
                    {[["Features", "#features"], ["How It Works", "#how-it-works"], ["Pricing", "#pricing"]].map(([l, h]) => (
                        <a key={h} href={h}
                            className="px-3.5 py-1.5 text-[12.5px] font-medium rounded-full transition-all duration-150"
                            style={{ color: "rgba(138,143,152,0.85)" }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#EDEDEF"; (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(138,143,152,0.85)"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                        >{l}</a>
                    ))}
                </div>

                {/* CTAs */}
                <div className="hidden md:flex items-center gap-3">
                    <Link to="/login">
                        <button className="px-4 py-2 text-[12.5px] font-semibold rounded-full transition-all" style={{ color: "rgba(138,143,152,0.85)" }}
                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#EDEDEF"}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "rgba(138,143,152,0.85)"}
                        >Sign In</button>
                    </Link>
                    <Link to="/register">
                        <motion.button
                            whileHover={{ y: -1 }}
                            whileTap={{ scale: 0.98 }}
                            className={`
      px-6 py-2.5
      text-sm font-semibold
      rounded-md
      border
      border-[#2a2f3a]
      bg-[#111317]
      text-white
      transition-all duration-150
      hover:bg-[#161a20]
      active:bg-[#0d0f13]
      cursor-pointer
    `}
                        >
                            Start Free →
                        </motion.button>
                    </Link>
                </div>

                {/* Mobile */}
                <button onClick={() => setOpen(o => !o)} className="md:hidden w-9 h-9 flex items-center justify-center rounded-full"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#8A8F98" }}
                >
                    {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                </button>
            </div>

            {/* Mobile dropdown */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.97 }}
                        transition={{ duration: 0.2, ease: EASE_OUT }}
                        className="pointer-events-auto absolute top-full mt-2 left-4 right-4 rounded-2xl p-4 md:hidden"
                        style={{ background: "rgba(8,8,14,0.96)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", boxShadow: "0 20px 60px rgba(0,0,0,0.75)" }}
                    >
                        <div className="flex flex-col gap-1 mb-4">
                            {[["Features", "#features"], ["How It Works", "#how-it-works"]].map(([l, h]) => (
                                <a key={h} href={h} onClick={() => setOpen(false)} className="px-4 py-3 text-sm font-medium rounded-xl" style={{ color: "rgba(138,143,152,0.9)" }}>{l}</a>
                            ))}
                        </div>
                        <div className="flex flex-col gap-2 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                            <Link to="/login" onClick={() => setOpen(false)}><button className="w-full py-3 text-sm font-semibold rounded-xl" style={{ background: "rgba(255,255,255,0.04)", color: "#EDEDEF", border: "1px solid rgba(255,255,255,0.07)" }}>Sign In</button></Link>
                            <Link to="/register" onClick={() => setOpen(false)}><button className="w-full py-3 text-sm font-bold rounded-xl" style={{ background: "linear-gradient(135deg,#5E6AD2,#7c3aed)", color: "#fff" }}>Start Free →</button></Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

/* ─── Shared Button ──────────────────────────────────────────────────────── */
// Single source of truth for the primary CTA button

function PrimaryButton({
    children, size = "md", className = "", onClick,
}: {
    children: React.ReactNode;
    size?: "sm" | "md" | "lg";
    className?: string;
    onClick?: () => void;
}) {
    const pad = size === "sm" ? "px-4 py-2 text-[12.5px]" : size === "lg" ? "px-10 py-4 text-[15px]" : "px-6 py-2.5 text-[13px]";
    return (
        <motion.button
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={onClick}
            className={`inline-flex items-center gap-2 font-bold rounded-xl select-none ${pad} ${className}`}
            style={{
                background: "linear-gradient(160deg, #6470e0 0%, #5562cc 40%, #4c52c4 100%)",
                color: "#fff",
                boxShadow: "0 0 0 1px rgba(94,106,210,0.5), 0 2px 0 rgba(255,255,255,0.12) inset, 0 -1px 0 rgba(0,0,0,0.25) inset, 0 6px 24px rgba(94,106,210,0.32)",
                letterSpacing: "-0.01em",
            }}
        >
            {children}
        </motion.button>
    );
}

function GhostButton({
    children, className = "", href,
}: {
    children: React.ReactNode; className?: string; href?: string;
}) {
    const inner = (
        <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className={`inline-flex items-center gap-2 font-semibold px-6 py-2.5 text-[13px] rounded-xl select-none ${className}`}
            style={{ background: "rgba(255,255,255,0.04)", color: "rgba(237,237,239,0.85)", border: "1px solid rgba(255,255,255,0.1)", letterSpacing: "-0.01em" }}
        >{children}</motion.button>
    );
    return href ? <a href={href}>{inner}</a> : inner;
}

/* ─── Utilities ──────────────────────────────────────────────────────────── */

function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-56px" });
    return (
        <motion.div ref={ref} initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay, ease: EASE_OUT }} className={className}
        >{children}</motion.div>
    );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-mono tracking-[0.14em] uppercase mb-5"
            style={{ background: "rgba(94,106,210,0.08)", border: "1px solid rgba(94,106,210,0.2)", color: "#7c87e8" }}
        >{children}</span>
    );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
    return (
        <h2 className="text-[clamp(28px,4.5vw,52px)] font-black tracking-[-0.035em] leading-[0.92]"
            style={{ background: "linear-gradient(180deg,#EDEDEF 0%,rgba(237,237,239,0.65) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
        >{children}</h2>
    );
}

/* ─── Typed Terminal ─────────────────────────────────────────────────────── */

function TypedTerminal() {
    const [visible, setVisible] = useState(0);
    useEffect(() => {
        const timers = TERMINAL_LINES.map((l, i) => setTimeout(() => setVisible(i + 1), l.delay));
        return () => timers.forEach(clearTimeout);
    }, []);
    return (
        <div className="space-y-[2px] min-h-[200px] font-mono text-[13px] leading-relaxed">
            {TERMINAL_LINES.slice(0, visible).map((l, i) => (
                <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.1 }} style={{ color: l.color }}>
                    {l.text || "\u00A0"}
                </motion.div>
            ))}
            {visible < TERMINAL_LINES.length && (
                <span className="inline-block w-[7px] h-[14px] align-middle animate-pulse" style={{ background: "#5E6AD2", borderRadius: "1px" }} />
            )}
        </div>
    );
}

/* ─── Hero ────────────────────────────────────────────────────────────────── */

function Hero() {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
    const y = useTransform(scrollYProgress, [0, 1], [0, 60]);
    const op = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

    return (
        <section ref={ref} className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-24 px-6 overflow-hidden">

            {/* Central hero glow */}
            <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(94,106,210,0.07) 0%, transparent 60%)" }}
            />

            <motion.div style={{ y, opacity: op }} className="relative z-10 w-full max-w-5xl mx-auto text-center">

             
             

                      <div className="my-5">
                          <AnimatedGenerateButton
              labelIdle="Powered by Groq — world's fastest AI inference"
              labelActive="Building"
              highlightHueDeg={5000}/>
                      </div>
                 

                {/* Headline */}
                <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1, ease: EASE_OUT }}
                    className="text-[clamp(42px,8.5vw,100px)] font-black leading-[0.87] tracking-[-0.04em] mb-7"
                >
                    <span style={{ background: "linear-gradient(180deg,#ffffff 0%,rgba(255,255,255,0.76) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                        Crack Your OA.
                    </span>
                    <br />
                    <span style={{ background: "linear-gradient(110deg,#5E6AD2 0%,#a78bfa 40%,#818cf8 60%,#5E6AD2 100%)", backgroundSize: "300% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", animation: "shimmer 4s linear infinite" }}>
                        Land The Job.
                    </span>
                </motion.h1>
                {/* Subhead */}
                <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2, ease: EASE_OUT }}
                    className="text-[clamp(15px,2.4vw,19px)] leading-relaxed max-w-xl mx-auto mb-10"
                    style={{ color: "rgba(138,143,152,0.85)" }}
                >
                    Enter your target role and company. AI builds a custom OA test plan, generates every question, times each section, and scores you the instant you submit.
                </motion.p>

                {/* CTA row */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.28, ease: EASE_OUT }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10 cursor-pointer"
                >
                    <Link to="/register">
                        <PrimaryButton size="lg" className="cursor-pointer">
                            Start Practicing Free <ArrowRight className="w-4 h-4" />
                        </PrimaryButton>
                    </Link>
                    <GhostButton href="#how-it-works" className="cursor-pointer">
                        See How It Works <ChevronRight className="w-4 h-4" style={{ color: "#5E6AD2" }} />
                    </GhostButton>
                </motion.div>

                {/* Trust row */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.5 }}
                    className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2 mb-20"
                >
                    {["No credit card needed", "Free Groq API key", "Full test in < 10s"].map(t => (
                        <span key={t} className="flex items-center gap-1.5 text-[11px] font-mono" style={{ color: "rgba(138,143,152,0.5)" }}>
                            <Check className="w-3 h-3 shrink-0" style={{ color: "#5E6AD2" }} />{t}
                        </span>
                    ))}
                </motion.div>

                {/* Terminal card */}
                <motion.div initial={{ opacity: 0, y: 44, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.85, delay: 0.55, ease: EASE_OUT }} className="relative">
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[60%] h-14 rounded-full blur-3xl pointer-events-none"
                        style={{ background: "rgba(94,106,210,0.2)" }}
                    />
                    <div className="relative max-w-2xl mx-auto rounded-2xl overflow-hidden text-left"
                        style={{ background: "linear-gradient(180deg,rgba(255,255,255,0.06) 0%,rgba(255,255,255,0.02) 100%)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 0 0 1px rgba(255,255,255,0.04), 0 32px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.07)" }}
                    >
                        {/* Terminal chrome */}
                        <div className="flex items-center gap-2 px-5 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.2)" }}>
                            <div className="flex gap-1.5">
                                {["#FF5F57", "#FFBD2E", "#28CA41"].map(c => <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />)}
                            </div>
                            <span className="text-[10px] font-mono mx-auto pr-10" style={{ color: "rgba(138,143,152,0.4)" }}>oaforge — plan generated</span>
                        </div>
                        <div className="px-6 py-5"><TypedTerminal /></div>
                    </div>
                </motion.div>
            </motion.div>
        </section>
    );
}

/* ─── Stats ───────────────────────────────────────────────────────────────── */

function StatsBar() {
    return (
        <section className="relative py-14"
            style={{ borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(94,106,210,0.02)" }}
        >
            <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
                {STATS.map((s, i) => (
                    <Reveal key={s.label} delay={i * 0.07}>
                        <div className="text-center">
                            <div className="text-[clamp(28px,4vw,44px)] font-black tracking-[-0.03em] mb-1.5"
                                style={{ background: "linear-gradient(180deg,#EDEDEF 0%,rgba(237,237,239,0.58) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
                            >{s.value}</div>
                            <div className="text-[10.5px] font-bold tracking-[0.1em] uppercase mb-1" style={{ color: "#5E6AD2" }}>{s.label}</div>
                            <div className="text-[10px] font-mono" style={{ color: "rgba(138,143,152,0.5)" }}>{s.sub}</div>
                        </div>
                    </Reveal>
                ))}
            </div>
        </section>
    );
}

/* ─── Features ───────────────────────────────────────────────────────────── */

function FeaturesGrid() {
    return (
        <section id="features" className="py-28 relative">
            <div className="max-w-6xl mx-auto px-4">
                <Reveal className="text-center mb-4">
                    <SectionLabel><Flame className="w-3 h-3" /> Features</SectionLabel>
                </Reveal>
                <Reveal delay={0.05}>
                    <SpotlightCards
                        items={FEATURES}
                        eyebrow=""
                        heading="Precision-engineered for OA mastery."
                    />
                </Reveal>
            </div>
        </section>
    );
}

/* ─── How It Works ───────────────────────────────────────────────────────── */

function HowItWorks() {
    return (
        <section id="how-it-works" className="py-28 px-6 relative">
            {/* vertical connector line */}
            <div className="absolute left-1/2 top-40 bottom-40 w-px -translate-x-1/2 hidden lg:block"
                style={{ background: "linear-gradient(180deg,transparent,rgba(94,106,210,0.2) 20%,rgba(94,106,210,0.2) 80%,transparent)" }}
            />
            <div className="max-w-4xl mx-auto">
                <Reveal className="text-center mb-14">
                    <SectionLabel><Zap className="w-3 h-3" /> How It Works</SectionLabel>
                    <SectionHeading>Three steps to mastery.</SectionHeading>
                </Reveal>
                <div className="space-y-4">
                    {STEPS.map((s, i) => (
                        <Reveal key={s.num} delay={i * 0.1}>
                            <StepCard step={s} />
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
}

function StepCard({ step: s }: { step: typeof STEPS[0] }) {
    const ref = useRef<HTMLDivElement>(null);
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const [over, setOver] = useState(false);
    return (
        <div ref={ref}
            onMouseMove={e => { if (!ref.current) return; const r = ref.current.getBoundingClientRect(); setPos({ x: e.clientX - r.left, y: e.clientY - r.top }); }}
            onMouseEnter={() => setOver(true)} onMouseLeave={() => setOver(false)}
            className="relative rounded-2xl overflow-hidden"
            style={{ background: "linear-gradient(145deg,rgba(255,255,255,0.05) 0%,rgba(255,255,255,0.015) 100%)", border: "1px solid rgba(255,255,255,0.065)" }}
        >
            <div className="pointer-events-none absolute inset-0" style={{
                opacity: over ? 1 : 0, transition: "opacity 0.3s",
                background: `radial-gradient(440px circle at ${pos.x}px ${pos.y}px, rgba(94,106,210,0.08), transparent 65%)`
            }}
            />
            <div className="relative flex flex-col sm:flex-row items-start gap-6 p-8">
                <span className="text-[42px] font-black leading-none font-mono tracking-tighter shrink-0"
                    style={{ background: "linear-gradient(180deg,rgba(94,106,210,0.45) 0%,rgba(94,106,210,0.12) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
                >{s.num}</span>
                <div className="flex-1 min-w-0">
                    <h3 className="text-[16px] font-bold mb-2 tracking-[-0.02em]" style={{ color: "#EDEDEF" }}>{s.title}</h3>
                    <p className="text-[13px] leading-relaxed mb-4" style={{ color: "rgba(138,143,152,0.78)" }}>{s.desc}</p>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-mono"
                        style={{ background: "rgba(94,106,210,0.06)", border: "1px solid rgba(94,106,210,0.14)", color: "rgba(138,143,152,0.6)" }}
                    >
                        <span className="w-1 h-1 rounded-full" style={{ background: "#5E6AD2" }} />{s.hint}
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ─── Tech Stack ─────────────────────────────────────────────────────────── */

function TechStack() {
    return (
        <section className="py-14 relative overflow-hidden"
            style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
        >
            <Reveal>
                <p className="text-center text-[10px] font-mono tracking-[0.16em] uppercase mb-10" style={{ color: "rgba(138,143,152,0.3)" }}>
                    Built on a rock-solid stack
                </p>
            </Reveal>
            <LogoLoop
                logos={TECH}
                speed={85}
                direction="left"
                logoHeight={26}
                gap={44}
                hoverSpeed={0}
                fadeOut={true}
                fadeOutColor="#020209"
                ariaLabel="Tech stack"
            />
        </section>
    );
}

/* ─── CTA / Pricing ──────────────────────────────────────────────────────── */

function CTA() {
    return (
        <section id="pricing" className="py-32 px-6 relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[700px] h-[600px] rounded-full"
                    style={{ background: "radial-gradient(ellipse, rgba(94,106,210,0.065) 0%, transparent 65%)" }}
                />
            </div>
            <Reveal>
                <div className="relative max-w-xl mx-auto text-center">
                    <SectionLabel><Trophy className="w-3 h-3" /> Get Started</SectionLabel>
                    <SectionHeading>Ready to forge your career?</SectionHeading>
                    <p className="text-[14px] mt-5 mb-12 max-w-sm mx-auto leading-relaxed" style={{ color: "rgba(138,143,152,0.7)" }}>
                        Bring your free Groq API key. We handle test generation, timing, scoring, and analytics.
                    </p>

                    {/* Pricing card */}
                    <div className="relative rounded-3xl overflow-hidden text-left mb-8"
                        style={{ background: "linear-gradient(150deg,rgba(94,106,210,0.1) 0%,rgba(124,58,237,0.055) 100%)", border: "1px solid rgba(94,106,210,0.24)", boxShadow: "0 0 100px rgba(94,106,210,0.1), inset 0 0 0 1px rgba(255,255,255,0.04)" }}
                    >
                        {/* Top shimmer line */}
                        <div className="absolute top-0 left-0 right-0 h-px"
                            style={{ background: "linear-gradient(90deg,transparent 0%,rgba(94,106,210,0.7) 50%,transparent 100%)" }}
                        />
                        <div className="p-8">
                            {/* Price row */}
                            <div className="flex items-start justify-between mb-7">
                                <div>
                                    <div className="text-[11px] font-bold tracking-[0.12em] uppercase mb-2" style={{ color: "#5E6AD2" }}>Free Forever</div>
                                    <div className="flex items-end gap-1.5">
                                        <span className="text-[52px] font-black leading-none tracking-[-0.04em]" style={{ color: "#EDEDEF" }}>$0</span>
                                        <span className="text-[18px] font-medium mb-2" style={{ color: "rgba(138,143,152,0.4)" }}>/mo</span>
                                    </div>
                                </div>
                                <span className="px-3 py-1.5 rounded-full text-[10.5px] font-bold mt-1"
                                    style={{ background: "rgba(52,211,153,0.09)", border: "1px solid rgba(52,211,153,0.22)", color: "#34d399" }}
                                >No limits</span>
                            </div>

                            {/* Features grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-7">
                                {["Unlimited assessments", "All subject areas", "Full analytics dashboard", "Email score reports", "Subject radar chart", "Day streak tracking", "Any company / role", "Instant AI generation"].map(f => (
                                    <div key={f} className="flex items-center gap-2.5 text-[12px]" style={{ color: "rgba(237,237,239,0.65)" }}>
                                        <Check className="w-3.5 h-3.5 shrink-0" style={{ color: "#5E6AD2" }} />{f}
                                    </div>
                                ))}
                            </div>

                            <p className="text-[10.5px] font-mono mb-5" style={{ color: "rgba(138,143,152,0.4)" }}>
                                * Requires your Groq API key — free at console.groq.com
                            </p>

                            <Link to="/register">
                                <PrimaryButton size="lg" className="w-full justify-center cursor-pointer">
                                    Start Practicing Free — No Card Needed →
                                </PrimaryButton>
                            </Link>
                        </div>
                    </div>
                </div>
            </Reveal>
        </section>
    );
}

/* ─── Footer ─────────────────────────────────────────────────────────────── */

const FOOTER_LINKS = {
    Product: [["Features", "#features"], ["How It Works", "#how-it-works"], ["Pricing", "#pricing"]],
    Platform: [["Sign In", "/login"], ["Register", "/register"], ["Dashboard", "/dashboard"]],
    Resources: [["Groq Console", "https://console.groq.com"], ["GitHub", "https://github.com/rajat12826"],
        //   ["Portfolio","https://rajat-parihar.vercel.app"]
    ],
};

function Footer() {
    return (
        <footer className="relative pt-16 pb-10 px-6 overflow-hidden"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
            {/* Faint glow */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] rounded-full pointer-events-none"
                style={{ background: "radial-gradient(ellipse at bottom, rgba(94,106,210,0.04) 0%, transparent 70%)" }}
            />

            <div className="relative max-w-5xl mx-auto">
                {/* Top row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-10 pb-12 mb-10"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
                >
                    {/* Brand */}
                    <div className="col-span-2 md:col-span-1">
                        <div className="flex items-center gap-2.5 mb-4">
                            <img src="/logo.webp" alt="OAForge" className="w-8 h-8 rounded-xl object-cover" style={{ boxShadow: "0 0 14px rgba(94,106,210,0.35)" }} />
                            <div className="flex flex-col leading-none">
                                <span className="text-[14px] font-bold" style={{ color: "#EDEDEF", letterSpacing: "-0.02em" }}>OAForge</span>
                                <span className="text-[9px] font-semibold tracking-[0.14em] uppercase mt-[2px]" style={{ color: "rgba(138,143,152,0.4)" }}>Ace Every OA</span>
                            </div>
                        </div>
                        <p className="text-[12px] leading-relaxed mb-5" style={{ color: "rgba(138,143,152,0.55)" }}>
                            AI-powered Online Assessment practice — tailored to your role, your company, your JD.
                        </p>
                        {/* Social links */}
                        <div className="flex items-center gap-2">
                            {[
                                { icon: Github, href: "https://github.com/rajat12826", label: "GitHub" },
                                { icon: Twitter, href: "https://twitter.com/rajatparihar", label: "Twitter" },
                                { icon: Mail, href: "mailto:pariharrm@rknec.edu", label: "Email" },
                            ].map(({ icon: Icon, href, label }) => (
                                <a key={label} href={href} target="_blank" rel="noopener" aria-label={label}
                                    className="w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-150"
                                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "rgba(138,143,152,0.6)" }}
                                    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.color = "#EDEDEF"; el.style.borderColor = "rgba(255,255,255,0.14)"; el.style.background = "rgba(255,255,255,0.07)"; }}
                                    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.color = "rgba(138,143,152,0.6)"; el.style.borderColor = "rgba(255,255,255,0.07)"; el.style.background = "rgba(255,255,255,0.04)"; }}
                                >
                                    <Icon className="w-3.5 h-3.5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Link columns */}
                    {Object.entries(FOOTER_LINKS).map(([group, links]) => (
                        <div key={group}>
                            <div className="text-[10.5px] font-bold tracking-[0.12em] uppercase mb-4" style={{ color: "rgba(138,143,152,0.45)" }}>{group}</div>
                            <ul className="space-y-3">
                                {links.map(([label, href]) => (
                                    <li key={label}>
                                        {href.startsWith("/") ? (
                                            <Link to={href} className="text-[12.5px] transition-colors" style={{ color: "rgba(138,143,152,0.6)" }}
                                                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#EDEDEF"}
                                                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "rgba(138,143,152,0.6)"}
                                            >{label}</Link>
                                        ) : (
                                            <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener"
                                                className="text-[12.5px] transition-colors" style={{ color: "rgba(138,143,152,0.6)" }}
                                                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#EDEDEF"}
                                                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "rgba(138,143,152,0.6)"}
                                            >{label}</a>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom row */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-[11px] font-mono" style={{ color: "rgba(138,143,152,0.3)" }}>
                        © 2026 OAForge · All rights reserved
                    </p>
                    <p className="text-[11px] font-mono" style={{ color: "rgba(138,143,152,0.3)" }}>
                        Built with ♥ by{" "}
                        <a href="https://rajat-parihar.vercel.app" target="_blank" rel="noopener"
                            className="transition-colors hover:text-[#5E6AD2]"
                        >Rajat Parihar</a>
                    </p>
                </div>
            </div>
        </footer>
    );
}

/* ─── Global CSS ─────────────────────────────────────────────────────────── */

const CSS = `
  @keyframes shimmer {
    0%   { background-position: 200% center; }
    100% { background-position: -200% center; }
  }
`;

/* ─── Page ────────────────────────────────────────────────────────────────── */

export default function LandingPage() {
    return (
        <>
            <style>{CSS}</style>
            <div className="min-h-screen text-[#EDEDEF]"
                style={{ background: "#020209", WebkitFontSmoothing: "antialiased" }}
            >
                <Background />
                <EmberCanvas />
                <LandingNav />
                <Hero />
                <StatsBar />
                <FeaturesGrid />
                <HowItWorks />
                <TechStack />
                <CTA />
                <Footer />
            </div>
        </>
    );
}