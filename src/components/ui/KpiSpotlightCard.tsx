"use client";

import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";

const TILT_MAX = 9;
const TILT_SPRING = { stiffness: 300, damping: 28 } as const;
const GLOW_SPRING = { stiffness: 180, damping: 22 } as const;

export interface KpiItem {
  label: string;
  value: string;
  sub: string;
  icon: LucideIcon;
  color: string;
  trend?: number | null;
}

interface KpiCardProps {
  item: KpiItem;
  index: number;
  dimmed: boolean;
  onHoverStart: () => void;
  onHoverEnd: () => void;
}

export function KpiSpotlightCard({
  item,
  dimmed,
  onHoverStart,
  onHoverEnd,
}: KpiCardProps) {
  const Icon = item.icon;
  const cardRef = useRef<HTMLDivElement>(null);

  const normX = useMotionValue(0.5);
  const normY = useMotionValue(0.5);

  const rawRotateX = useTransform(normY, [0, 1], [TILT_MAX, -TILT_MAX]);
  const rawRotateY = useTransform(normX, [0, 1], [-TILT_MAX, TILT_MAX]);

  const rotateX = useSpring(rawRotateX, TILT_SPRING);
  const rotateY = useSpring(rawRotateY, TILT_SPRING);
  const glowOpacity = useSpring(0, GLOW_SPRING);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();

    normX.set((e.clientX - rect.left) / rect.width);
    normY.set((e.clientY - rect.top) / rect.height);
  };

  const handleMouseEnter = () => {
    glowOpacity.set(1);
    onHoverStart();
  };

  const handleMouseLeave = () => {
    normX.set(0.5);
    normY.set(0.5);
    glowOpacity.set(0);
    onHoverEnd();
  };

  return (
    <motion.div
      ref={cardRef}
      animate={{
        scale: dimmed ? 0.96 : 1,
        opacity: dimmed ? 0.4 : 1,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 900,
      }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border p-5 cursor-default",
        "border-white/[0.06] bg-gradient-to-b from-white/[0.06] to-white/[0.02]",
        "transition-[border-color] duration-300",
        "hover:border-white/[0.14]",
        "shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_2px_20px_rgba(0,0,0,0.3)]"
      )}
    >
      {/* Static tint */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{
          background: `radial-gradient(circle at 80% 15%, ${item.color}14, transparent 60%)`,
        }}
      />

      {/* Hover glow */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{
          opacity: glowOpacity,
          background: `radial-gradient(circle at 80% 15%, ${item.color}2e, transparent 60%)`,
        }}
      />

      {/* Shimmer */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-[55%] -translate-x-full -skew-x-12 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[280%]"
      />

      <div className="relative z-10">
        {/* Icon + trend */}
        <div className="flex items-start justify-between mb-4">
          <div
            className="flex w-9 h-9 items-center justify-center rounded-xl"
            style={{
              background: `${item.color}1a`,
              border: `1px solid ${item.color}35`,
            }}
          >
            <Icon className="w-4 h-4" style={{ color: item.color }} />
          </div>

          {item.trend != null && (
            <span
              className={cn(
                "flex items-center gap-0.5 text-xs font-semibold",
                item.trend >= 0 ? "text-emerald-500" : "text-red-500"
              )}
            >
              {item.trend >= 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {item.trend >= 0 ? "+" : ""}
              {item.trend.toFixed(0)}%
            </span>
          )}
        </div>

        {/* Value */}
        <p
          className="text-2xl xl:text-3xl font-bold tracking-tight"
          style={{ color: item.color }}
        >
          {item.value}
        </p>

        {/* Label */}
        <p className="text-sm font-semibold text-gray-700 dark:text-[#EDEDEF] mt-1">
          {item.label}
        </p>

        {/* Sub text */}
        <p className="text-xs text-gray-400 dark:text-[#8A8F98] mt-0.5 truncate">
          {item.sub}
        </p>
      </div>

      {/* Bottom accent */}
      <div
        aria-hidden
        className="absolute bottom-0 left-0 h-[2px] w-0 rounded-full transition-all duration-500 group-hover:w-full"
        style={{
          background: `linear-gradient(to right, ${item.color}80, transparent)`,
        }}
      />
    </motion.div>
  );
}