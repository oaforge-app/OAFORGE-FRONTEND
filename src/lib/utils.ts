// src/lib/utils.ts

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

export function getAccuracyBadge(accuracy: number) {
  if (accuracy >= 85) return { label: "Excellent",     emoji: "🏆", color: "#22c55e" };
  if (accuracy >= 70) return { label: "Good",          emoji: "👍", color: "#6872D9" };
  if (accuracy >= 50) return { label: "Average",       emoji: "📈", color: "#f59e0b" };
  return               { label: "Needs Practice", emoji: "📚", color: "#ef4444" };
}