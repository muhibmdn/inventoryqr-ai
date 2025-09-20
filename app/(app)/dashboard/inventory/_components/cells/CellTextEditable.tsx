"use client";

import { useEffect, useRef, useState } from "react";

import type { EditResult } from "./types";

type CellTextEditableProps = {
  value: string;
  label: string;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
  onCommit: (nextValue: string) => Promise<EditResult>;
};

export function CellTextEditable({
  value,
  label,
  placeholder = "-",
  disabled = false,
  maxLength,
  onCommit,
}: CellTextEditableProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [draft, setDraft] = useState<string>(value);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEditing) {
      setDraft(value);
    }
  }, [isEditing, value]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const cancelEdit = () => {
    setDraft(value);
    setIsEditing(false);
    setError(null);
  };

  const commit = async () => {
    if (isSaving) return;
    const normalized = draft.trim();
    if (normalized === value.trim()) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const result = await onCommit(normalized);
      if (!result.ok) {
        setError(result.message ?? "Gagal memperbarui nilai.");
        setDraft(value);
      }
      setIsEditing(false);
    } catch (err) {
      setDraft(value);
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
          type="text"
          maxLength={maxLength}
          aria-label={label}
          disabled={disabled || isSaving}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
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
          {value.trim() === "" ? (
            <span className="text-[#6F847B]">{placeholder}</span>
          ) : (
            value
          )}
        </button>
      )}
      <span aria-live="polite" className="text-xs text-[#A83232]">
        {error}
      </span>
    </div>
  );
}
