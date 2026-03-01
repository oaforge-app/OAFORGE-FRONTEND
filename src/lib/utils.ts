// src/lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** "MM:SS" or "HH:MM:SS" */
export function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${pad(h)}:${pad(m)}:${pad(s)}`;
  return `${pad(m)}:${pad(s)}`;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/** Human-readable duration, e.g. "4m 32s" */
export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  if (s === 0) return `${m}m`;
  return `${m}m ${s}s`;
}

/** Colour-coded accuracy badge */
export function getAccuracyBadge(accuracy: number) {
  if (accuracy >= 85) return { label: "Excellent",      color: "#22c55e", emoji: "🏆" };
  if (accuracy >= 70) return { label: "Good",           color: "#6872D9", emoji: "👍" };
  if (accuracy >= 50) return { label: "Average",        color: "#f59e0b", emoji: "📈" };
  return               { label: "Needs Practice",  color: "#ef4444", emoji: "📚" };
}