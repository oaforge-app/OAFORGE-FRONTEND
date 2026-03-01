// src/pages/Dashboard.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, LogOut, Trash2, Play, CheckCircle } from "lucide-react";

import { useUser, useLogout } from "@/api/auth.query";
import {
  useMySections,
  useAvailableSections,
  useAddSection,
  useRemoveSection,
  useCreateCustomSection,
  type CreateCustomSectionPayload,
} from "@/api/sections.query";
import { useCreateSession } from "@/api/test.query";
import { useMyResults } from "@/api/results.query";
import { Spinner } from "@/components/ui/spinner";
import type { UserSection, SectionTemplate } from "@/types";

export default function Dashboard() {
  const navigate = useNavigate();
  const [modal, setModal] = useState<"add" | "custom" | null>(null);
  const [startingId, setStartingId] = useState<string | null>(null);

  const { user }                                                      = useUser();
  const { logout }                                                    = useLogout();
  const { data: mySections, isLoading: sectionsLoading }             = useMySections();
  const { data: available, isLoading: availableLoading }             = useAvailableSections();
  const { data: results }                                            = useMyResults();

  const addSection    = useAddSection();
  const removeSection = useRemoveSection();
  const createCustom  = useCreateCustomSection();
  const createSession = useCreateSession();

  const handleStartTest = (us: UserSection) => {
    setStartingId(us.id);
    createSession.mutate(
      {
        // ✅ use sectionTemplate.id — the Prisma relation is sectionTemplate, not section
        sectionTemplateId: us.sectionTemplate.id,
        questionCount: us.questionCount,
        duration: us.duration,
      },
      {
        onSuccess: (session) => {
          navigate(`/test/${session.id}`);
        },
        onSettled: () => setStartingId(null),
      }
    );
  };

  const completedCount  = results?.length ?? 0;
  const overallAccuracy = results?.length
    ? Math.round(results.reduce((s, r) => s + r.accuracy, 0) / results.length)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-6 py-4 flex items-center justify-between bg-card">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <span className="text-sm">⬡</span>
          </div>
          <span className="font-semibold text-lg">OAForge</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {user?.firstName ?? user?.email}
          </span>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Stats */}
        {results && results.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: "Completed",    value: String(completedCount),          color: "text-green-500"  },
              { label: "Avg Accuracy", value: `${overallAccuracy}%`,           color: "text-primary"    },
              { label: "My Sections",  value: String(mySections?.length ?? 0), color: "text-yellow-500" },
            ].map((s) => (
              <div key={s.label} className="bg-card border border-border rounded-xl p-4">
                <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Heading */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Your Sections</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Click Start to take an AI-generated test
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setModal("custom")}
              className="flex items-center gap-2 px-4 py-2 text-sm border border-border rounded-lg hover:bg-accent transition-colors"
            >
              <Plus className="w-4 h-4" />
              Custom
            </button>
            <button
              onClick={() => setModal("add")}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Section
            </button>
          </div>
        </div>

        {/* Section cards */}
        {sectionsLoading ? (
          <div className="flex justify-center py-20"><Spinner /></div>
        ) : mySections && mySections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mySections.filter((us) => !!us.sectionTemplate).map((us, i) => (
              <SectionCard
                key={us.id}
                userSection={us}
                index={i}
                onStart={() => handleStartTest(us)}
                onRemove={() => removeSection.mutate(us.id)}
                isStarting={startingId === us.id}
                isRemoving={removeSection.isPending}
              />
            ))}
          </div>
        ) : (
          <EmptyState onAdd={() => setModal("add")} />
        )}

        {/* Past results */}
        {results && results.length > 0 && (
          <div className="mt-10">
            <h2 className="text-lg font-semibold mb-4">Past Results</h2>
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              {results.map((r, i) => {
                const color =
                  r.accuracy >= 70 ? "text-green-500" :
                  r.accuracy >= 50 ? "text-yellow-500" :
                  "text-red-500";
                return (
                  <div
                    key={r.id}
                    className={`flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-accent/30 transition-colors ${i > 0 ? "border-t border-border" : ""}`}
                    onClick={() => navigate(`/results/${r.id}`)}
                  >
                    <div>
                      <p className="font-medium text-sm">{r.sectionName}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {r.correctAnswers}/{r.totalQuestions} correct · {Math.floor(r.timeSpent / 60)}m spent
                      </p>
                    </div>
                    <span className={`text-xl font-bold ${color}`}>{r.accuracy}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <AnimatePresence>
        {modal === "add" && (
          <AddSectionModal
            available={available ?? []}
            // ✅ pass isLoading separately — don't use available.length === 0 as loading check
            isLoading={availableLoading}
            existing={mySections?.map((us) => us.sectionTemplate.id) ?? []}
            onAdd={(id) => { addSection.mutate({ sectionTemplateId: id }); setModal(null); }}
            onClose={() => setModal(null)}
            isAdding={addSection.isPending}
          />
        )}
        {modal === "custom" && (
          <CreateCustomModal
            onCreate={(data) => { createCustom.mutate(data); setModal(null); }}
            onClose={() => setModal(null)}
            isCreating={createCustom.isPending}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Section Card ──────────────────────────────────────────────────────────────

function SectionCard({
  userSection: us, index, onStart, onRemove, isStarting, isRemoving,
}: {
  userSection: UserSection;
  index: number;
  onStart: () => void;
  onRemove: () => void;
  isStarting: boolean;
  isRemoving: boolean;
}) {
  // ✅ use sectionTemplate, not section (matches Prisma schema relation name)
  const s = us.sectionTemplate;
  if (!s) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="bg-card border border-border rounded-xl p-5 flex flex-col hover:border-primary/40 transition-colors"
    >
      <div className="flex items-start gap-3 mb-3">
        <span className="text-2xl">{s?.icon?s.icon: "📋"}</span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{s?.name?s.name:"a"}</p>
          {s.description && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{s.description}</p>
          )}
        </div>
      </div>

      <div className="flex gap-3 text-xs text-muted-foreground mb-3">
        <span className="text-primary font-medium">{us.questionCount}Q</span>
        <span>{us.duration}min</span>
      </div>

      {Array.isArray(s.topics) && (s.topics as string[]).length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {(s.topics as string[]).slice(0, 3).map((t) => (
            <span
              key={t}
              className="text-[10px] px-2 py-0.5 bg-primary/8 border border-primary/15 text-primary/80 rounded"
            >
              {t}
            </span>
          ))}
          {(s.topics as string[]).length > 3 && (
            <span className="text-[10px] text-muted-foreground">
              +{(s.topics as string[]).length - 3}
            </span>
          )}
        </div>
      )}

      <div className="flex gap-2 mt-auto">
        <button
          onClick={onStart}
          disabled={isStarting}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {isStarting ? (
            <Spinner className="w-3 h-3" />
          ) : (
            <><Play className="w-3 h-3" /> Start</>
          )}
        </button>
        <button
          onClick={onRemove}
          disabled={isRemoving}
          className="p-2 border border-border rounded-lg hover:border-destructive hover:text-destructive transition-colors text-muted-foreground"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border rounded-xl text-center">
      <div className="text-5xl mb-4">⚡</div>
      <h3 className="text-lg font-semibold mb-1">No sections yet</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Add sections to start your OA preparation
      </p>
      <button
        onClick={onAdd}
        className="flex items-center gap-2 px-5 py-2.5 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add Your First Section
      </button>
    </div>
  );
}

// ── Modals ────────────────────────────────────────────────────────────────────

function Modal({
  title, onClose, children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-md bg-card border border-border rounded-xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground text-lg leading-none"
          >
            ✕
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}

function AddSectionModal({
  available, isLoading, existing, onAdd, onClose, isAdding,
}: {
  available: SectionTemplate[];
  // ✅ separate isLoading prop — fixes infinite spinner bug
  isLoading: boolean;
  existing: string[];
  onAdd: (id: string) => void;
  onClose: () => void;
  isAdding: boolean;
}) {
  return (
    <Modal title="Add Section" onClose={onClose}>
      {/* ✅ Show spinner only while loading, not when genuinely empty */}
      {isLoading ? (
        <div className="flex justify-center py-8"><Spinner /></div>
      ) : available.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          No sections available to add.
        </p>
      ) : (
        <div className="flex flex-col gap-2 max-h-80 overflow-y-auto">
          {available.map((s) => {
            const added = existing.includes(s.id);
            return (
              <button
                key={s.id}
                disabled={added || isAdding}
                onClick={() => onAdd(s.id)}
                className="flex items-center gap-3 px-4 py-3 text-left border border-border rounded-lg hover:border-primary/50 disabled:opacity-50 transition-colors"
              >
                <span className="text-xl">{s?.icon ?? "📋"}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{s.name}</p>
                  {s.description && (
                    <p className="text-xs text-muted-foreground">{s.description}</p>
                  )}
                </div>
                <span className={`text-xs font-medium ${added ? "text-green-500" : "text-primary"}`}>
                  {added ? "✓ Added" : "+ Add"}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </Modal>
  );
}

function CreateCustomModal({
  onCreate, onClose, isCreating,
}: {
  onCreate: (d: CreateCustomSectionPayload) => void;
  onClose: () => void;
  isCreating: boolean;
}) {
  const [form, setForm] = useState({
    slug: "", name: "", description: "", icon: "",
    topicsRaw: "", promptHint: "", questionCount: 15, duration: 25,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({
      slug: form.slug,
      name: form.name,
      description: form.description || undefined,
      icon: form?.icon || undefined,
      topics: form.topicsRaw.split(",").map((t) => t.trim()).filter(Boolean),
      promptHint: form.promptHint || undefined,
      questionCount: form.questionCount,
      duration: form.duration,
    });
  };

  const f = (key: keyof typeof form) => ({
    value: String(form[key]),
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((p) => ({ ...p, [key]: e.target.value })),
  });

  return (
    <Modal title="Create Custom Section" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Slug" placeholder="react-js" {...f("slug")} required />
          <Field label="Name" placeholder="React.js" {...f("name")} required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Icon (emoji)" placeholder="⚛️" {...f("icon")} />
          <Field label="Description" placeholder="Optional" {...f("description")} />
        </div>
        <Field label="Topics (comma-separated)" placeholder="Hooks, JSX, State" {...f("topicsRaw")} required />
        <Field label="Prompt hint (optional)" placeholder="Focus on React 18 patterns" {...f("promptHint")} />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Questions</label>
            <input
              type="number" min={5} max={30} {...f("questionCount")}
              className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Duration (min)</label>
            <input
              type="number" min={10} max={60} {...f("duration")}
              className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background outline-none focus:border-primary"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={isCreating}
          className="flex items-center justify-center gap-2 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-60 mt-1"
        >
          {isCreating ? <><Spinner className="w-4 h-4" /> Creating...</> : "Create Section"}
        </button>
      </form>
    </Modal>
  );
}

function Field({
  label, placeholder, value, onChange, required,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-xs text-muted-foreground mb-1 block">{label}</label>
      <input
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background outline-none focus:border-primary transition-colors"
      />
    </div>
  );
}