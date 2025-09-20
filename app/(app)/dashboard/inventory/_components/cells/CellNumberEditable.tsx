"use client";

import { useEffect, useRef, useState } from "react";

import type { EditResult } from "./types";

type CellNumberEditableProps = {
  value: number;
  label: string;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  onCommit: (nextValue: number) => Promise<EditResult>;
};

export function CellNumberEditable({
  value,
  label,
  min = 0,
  max,
  step = 1,
  disabled = false,
  onCommit,
}: CellNumberEditableProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [draft, setDraft] = useState<string>(String(value));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEditing) {
      setDraft(String(value));
    }
  }, [isEditing, value]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const resetError = () => setError(null);

  const cancelEdit = () => {
    setDraft(String(value));
    setIsEditing(false);
    resetError();
  };

  const commit = async () => {
    if (isSaving) return;
    const parsed = Number(draft);

    if (!Number.isFinite(parsed)) {
      setError("Nilai harus berupa angka valid.");
      inputRef.current?.focus();
      return;
    }

    if (min !== undefined && parsed < min) {
      setError(`Nilai minimal ${min}.`);
      inputRef.current?.focus();
      return;
    }

    if (max !== undefined && parsed > max) {
      setError(`Nilai maksimal ${max}.`);
      inputRef.current?.focus();
      return;
    }

    if (parsed === value) {
      setIsEditing(false);
      resetError();
      return;
    }

    setIsSaving(true);
    resetError();

    try {
      const result = await onCommit(parsed);
      if (!result.ok) {
        setError(result.message ?? "Gagal memperbarui nilai.");
        setDraft(String(value));
      }
      setIsEditing(false);
    } catch (err) {
      setDraft(String(value));
      setError(err instanceof Error ? err.message : "Gagal memperbarui nilai.");
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      {isEditing ? (
        <input
          ref={inputRef}
          type="number"
          min={min}
          max={max}
          step={step}
          aria-label={label}
          disabled={disabled || isSaving}
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value);
            resetError();
          }}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              commit();
            }
            if (event.key === "Escape") {
              event.preventDefault();
              cancelEdit();
            }
          }}
          className="w-full rounded-xl border border-[#CFE6D6] bg-white px-3 py-2 text-sm text-[#216B5B] shadow-sm focus:border-[#36AF30] focus:outline-none disabled:cursor-not-allowed disabled:border-[#E0E9E4] disabled:bg-[#F5F7F6]"
        />
      ) : (
        <button
          type="button"
          aria-label={`Edit ${label}`}
          disabled={disabled}
          onClick={() => setIsEditing(true)}
          className="w-full rounded-xl border border-transparent px-3 py-2 text-left text-sm text-[#216B5B] transition hover:border-[#36AF30] hover:bg-[#EAF6EE] disabled:cursor-not-allowed disabled:text-[#A6C9B5]"
        >
          {value}
        </button>
      )}
      <span aria-live="polite" className="text-xs text-[#A83232]">
        {error}
      </span>
    </div>
  );
}
