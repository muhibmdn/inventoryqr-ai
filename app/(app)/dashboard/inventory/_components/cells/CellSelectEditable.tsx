"use client";

import { useEffect, useState } from "react";

import type { EditResult } from "./types";

type Option = {
  label: string;
  value: string;
};

type CellSelectEditableProps = {
  value: string;
  label: string;
  options: Option[];
  disabled?: boolean;
  onCommit: (nextValue: string) => Promise<EditResult>;
};

export function CellSelectEditable({
  value,
  label,
  options,
  disabled = false,
  onCommit,
}: CellSelectEditableProps) {
  const [current, setCurrent] = useState<string>(value);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setCurrent(value);
  }, [value]);

  const handleChange = async (nextValue: string) => {
    if (nextValue === value) {
      setCurrent(nextValue);
      return;
    }

    setCurrent(nextValue);
    setIsSaving(true);
    setError(null);

    try {
      const result = await onCommit(nextValue);
      if (!result.ok) {
        setCurrent(value);
        setError(result.message ?? "Gagal memperbarui nilai.");
      }
    } catch (err) {
      setCurrent(value);
      setError(err instanceof Error ? err.message : "Gagal memperbarui nilai.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <select
        aria-label={label}
        value={current}
        disabled={disabled || isSaving}
        onChange={(event) => handleChange(event.target.value)}
        className="w-full rounded-xl border border-[#CFE6D6] bg-white px-3 py-2 text-sm text-[#216B5B] shadow-sm focus:border-[#36AF30] focus:outline-none disabled:cursor-not-allowed disabled:border-[#E0E9E4] disabled:bg-[#F5F7F6]"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <span aria-live="polite" className="text-xs text-[#A83232]">
        {error}
      </span>
    </div>
  );
}
