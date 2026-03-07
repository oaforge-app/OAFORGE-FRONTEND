// src/components/settings/SessionsCard.tsx
// Change: use s.isCurrent instead of i === 0

import { useGetSessions, useRevokeSession } from "@/api/sessions.query";
import { Monitor, Smartphone, Tablet, MapPin, Clock, Loader2, LogOut, Shield } from "lucide-react";

export function formatDistanceToNow(
  date: Date | number | string,
  options?: { addSuffix?: boolean }
): string {
  const now     = Date.now();
  const target  = new Date(date).getTime();
  const diff    = now - target;
  const seconds = Math.floor(diff / 1000);
  const units   = [
    { label: "year",   value: 365 * 24 * 60 * 60 },
    { label: "month",  value: 30  * 24 * 60 * 60 },
    { label: "day",    value: 24  * 60 * 60 },
    { label: "hour",   value: 60  * 60 },
    { label: "minute", value: 60 },
    { label: "second", value: 1 },
  ];
  for (const unit of units) {
    const amount = Math.floor(seconds / unit.value);
    if (amount >= 1) {
      const text = `${amount} ${unit.label}${amount > 1 ? "s" : ""}`;
      return options?.addSuffix ? (diff >= 0 ? `${text} ago` : `in ${text}`) : text;
    }
  }
  return options?.addSuffix ? "just now" : "0 seconds";
}

const DeviceIcon = ({ device }: { device: string | null }) => {
  const d = device?.toLowerCase() ?? "";
  if (d.includes("mobile")) return <Smartphone className="w-4 h-4" />;
  if (d.includes("tablet")) return <Tablet      className="w-4 h-4" />;
  return                            <Monitor     className="w-4 h-4" />;
};

export default function SessionsCard() {
  const { data: sessions, isLoading } = useGetSessions();
  const { mutate: revoke, isPending, variables } = useRevokeSession();

  return (
    <div className={[
      "relative overflow-hidden rounded-2xl p-6",
      "bg-white border border-black/[0.07] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.06)]",
      "dark:bg-[#0d0d10] dark:border-white/[0.07] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.055),0_4px_32px_rgba(0,0,0,0.5)]",
    ].join(" ")}>
      <div className="hidden dark:block absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.13] to-transparent pointer-events-none z-10" />
      <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06] pointer-events-none"
        style={{ background: "radial-gradient(circle at 90% 10%, #5E6AD2, transparent 55%)" }} />

      <div className="relative z-10">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
            <Shield className="w-4 h-4 text-rose-500" />
          </div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-[#EDEDEF]">Active Sessions</h3>
        </div>
        <p className="text-sm text-gray-400 dark:text-[#8A8F98] mb-5 ml-[42px]">
          Devices currently signed in to your account. Sign out any session you don't recognise.
        </p>

        {isLoading ? (
          <div className="flex items-center justify-center py-10 gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-gray-400 dark:text-[#8A8F98]" />
            <span className="text-sm text-gray-400 dark:text-[#8A8F98]">Loading sessions…</span>
          </div>
        ) : !sessions?.length ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2">
            <Monitor className="w-8 h-8 text-gray-200 dark:text-white/10" />
            <p className="text-sm text-gray-400 dark:text-[#8A8F98]">No active sessions found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {sessions.map((s) => (
              <div
                key={s.id}
                className={[
                  "relative flex flex-col gap-3 rounded-xl border px-4 py-3.5 transition-colors",
                  s.isCurrent
                    ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-500/[0.06] dark:border-emerald-500/[0.20]"
                    : "bg-gray-50 border-gray-100 hover:border-gray-200 dark:bg-white/[0.03] dark:border-white/[0.06] dark:hover:border-white/[0.10]",
                ].join(" ")}>

                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={[
                      "shrink-0 p-1.5 rounded-lg",
                      s.isCurrent
                        ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/[0.15] dark:text-emerald-400"
                        : "bg-gray-100 text-gray-500 dark:bg-white/[0.07] dark:text-[#8A8F98]",
                    ].join(" ")}>
                      <DeviceIcon device={s.device} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-[#EDEDEF] truncate">
                        {s.browser ?? "Unknown browser"}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-[#8A8F98] truncate">
                        {[s.device, s.os].filter(Boolean).join(" · ") || "Unknown device"}
                      </p>
                    </div>
                  </div>
                  {s.isCurrent && (
                    <span className="shrink-0 text-[10px] font-bold tracking-widest uppercase text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-400/10 border border-emerald-200 dark:border-emerald-400/20 px-2 py-0.5 rounded-full">
                      Current
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex flex-col gap-0.5">
                    {s.location && (
                      <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-[#8A8F98]">
                        <MapPin className="w-3 h-3 shrink-0" />{s.location}
                      </span>
                    )}
                    {s.lastUsedAt && (
                      <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-[#8A8F98]">
                        <Clock className="w-3 h-3 shrink-0" />
                        {formatDistanceToNow(new Date(s.lastUsedAt), { addSuffix: true })}
                      </span>
                    )}
                  </div>
                  {!s.isCurrent && (
                    <button
                      onClick={() => revoke(s.id)}
                      disabled={isPending && variables === s.id}
                      className="shrink-0 flex items-center gap-1.5 text-xs font-medium
                        text-red-600 dark:text-red-400
                        border border-red-200 dark:border-red-500/[0.25]
                        hover:bg-red-50 dark:hover:bg-red-500/[0.08]
                        rounded-lg px-3 py-1.5 transition-all duration-200 disabled:opacity-50 cursor-pointer"
                    >
                      {isPending && variables === s.id
                        ? <Loader2 className="w-3 h-3 animate-spin" />
                        : <LogOut  className="w-3 h-3" />}
                      Sign out
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}