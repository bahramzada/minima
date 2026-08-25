"use client";

import { useState, type FormEvent } from "react";
import { X } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "framer-motion";

import type { Habit } from "@/components/app/types";

export type HabitInput = {
  title: string;
  emoji: string;
  subtitle: string;
  category: string;
  targetMinutes: number;
};

export function HabitModal({
  open,
  habit,
  busy,
  onClose,
  onSave,
  onDelete,
}: {
  open: boolean;
  habit: Habit | null;
  busy: boolean;
  onClose: () => void;
  onSave: (input: HabitInput) => Promise<void>;
  onDelete: (() => Promise<void>) | null;
}) {
  return (
    <AnimatePresence>
      {open && (
        <HabitModalPanel
          key={habit?.id || "new"}
          habit={habit}
          busy={busy}
          onClose={onClose}
          onSave={onSave}
          onDelete={onDelete}
        />
      )}
    </AnimatePresence>
  );
}

function HabitModalPanel({
  habit,
  busy,
  onClose,
  onSave,
  onDelete,
}: {
  habit: Habit | null;
  busy: boolean;
  onClose: () => void;
  onSave: (input: HabitInput) => Promise<void>;
  onDelete: (() => Promise<void>) | null;
}) {
  const [form, setForm] = useState<HabitInput>({
    title: habit?.title || "",
    emoji: habit?.emoji || "🌱",
    subtitle: habit?.subtitle || "Kiçik addım",
    category: habit?.category || "Ümumi",
    targetMinutes: habit?.targetMinutes || 5,
  });
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (form.title.trim().length < 2) {
      setError("Vərdiş üçün qısa bir ad yaz.");
      return;
    }
    setError("");
    await onSave({ ...form, title: form.title.trim() });
  }

  return (
    <motion.div
      className="modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <motion.div
        className="habit-modal"
        initial={{ y: 30, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 20, opacity: 0, scale: 0.97 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="habit-modal-title"
      >
            <div className="modal-heading">
              <div>
                <h2 id="habit-modal-title">
                  {habit ? "Minimalı redaktə et" : "Yeni minimal əlavə et"}
                </h2>
                <p>Kiçik, aydın və bu gün edilə bilən saxla.</p>
              </div>
              <button type="button" onClick={onClose} aria-label="Bağla">
                <X size={20} weight="bold" />
              </button>
            </div>

            <form onSubmit={submit}>
              <div className="form-row compact-row">
                <label>
                  <span>Emoji</span>
                  <input
                    className="emoji-input"
                    value={form.emoji}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        emoji: event.target.value,
                      }))
                    }
                    maxLength={8}
                  />
                </label>
                <label className="grow-field">
                  <span>Ad</span>
                  <input
                    value={form.title}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        title: event.target.value,
                      }))
                    }
                    placeholder="Məs: 5 dəq kitab oxu"
                    autoFocus
                  />
                </label>
              </div>
              <div className="form-row">
                <label>
                  <span>Alt yazı</span>
                  <input
                    value={form.subtitle}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        subtitle: event.target.value,
                      }))
                    }
                    placeholder="Diqqət · Sakitlik"
                  />
                </label>
                <label>
                  <span>Kateqoriya</span>
                  <input
                    value={form.category}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        category: event.target.value,
                      }))
                    }
                    placeholder="Sakitlik"
                  />
                </label>
              </div>
              <label>
                <span>Müddət · {form.targetMinutes} dəqiqə</span>
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={form.targetMinutes}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      targetMinutes: Number(event.target.value),
                    }))
                  }
                />
              </label>

              {error && <div className="modal-error">{error}</div>}

              <div className="modal-actions">
                {onDelete && (
                  <button
                    type="button"
                    className="delete-button"
                    onClick={onDelete}
                    disabled={busy}
                  >
                    Sil
                  </button>
                )}
                <button type="button" className="cancel-button" onClick={onClose}>
                  Ləğv et
                </button>
                <button type="submit" className="save-button" disabled={busy}>
                  {busy ? "Saxlanılır…" : "Yadda saxla"}
                </button>
              </div>
            </form>
      </motion.div>
    </motion.div>
  );
}
