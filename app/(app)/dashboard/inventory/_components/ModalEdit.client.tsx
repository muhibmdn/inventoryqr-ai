"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import type { Item } from "@/types/item";

import type { EditResult } from "./cells/types";

export type ModalPayload = {
  optimistic: Partial<Item> & { images?: { url: string }[] };
  patch: Record<string, unknown>;
};

type ModalEditProps = {
  open: boolean;
  item: Item & { images?: { url: string }[] };
  pending: boolean;
  onClose: () => void;
  onSubmit: (payload: ModalPayload) => Promise<EditResult>;
};

type FormState = {
  description: string;
  unitPrice: string;
  location: string;
  floor: string;
  room: string;
  rack: string;
  fundingSource: string;
  pic: string;
  category: string;
  brand: string;
  purchasedAt: string;
  lastCheckedAt: string;
  damagedAt: string;
  qrPayload: string;
  barcodePayload: string;
  sku: string;
  photoUrl: string;
};

const toDateValue = (value: string | null | undefined): string =>
  value ? value.slice(0, 10) : "";

const buildFormState = (item: Item & { images?: { url: string }[] }): FormState => ({
  description: item.description ?? "",
  unitPrice: item.unitPrice != null ? String(item.unitPrice) : "",
  location: item.location ?? "",
  floor: item.floor ?? "",
  room: item.room ?? "",
  rack: item.rack ?? "",
  fundingSource: item.fundingSource ?? "",
  pic: item.pic ?? "",
  category: item.category ?? "",
  brand: item.brand ?? "",
  purchasedAt: toDateValue(item.purchasedAt ?? null),
  lastCheckedAt: toDateValue(item.lastCheckedAt ?? null),
  damagedAt: toDateValue(item.damagedAt ?? null),
  qrPayload: item.qrPayload ?? "",
  barcodePayload: item.barcodePayload ?? "",
  sku: item.code ?? "",
  photoUrl: item.images?.[0]?.url ?? "",
});

const focusableSelectors = [
  "button",
  "[href]",
  'input:not([type="hidden"])',
  "select",
  "textarea",
  "[tabindex]:not([tabindex='-1'])",
];

export function ModalEdit({ open, item, pending, onClose, onSubmit }: ModalEditProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const initialRef = useRef<FormState>(buildFormState(item));
  const [form, setForm] = useState<FormState>(initialRef.current);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initialRef.current = buildFormState(item);
    setForm(initialRef.current);
    setError(null);
  }, [item]);

  const trapFocus = useCallback((event: KeyboardEvent) => {
    if (event.key !== "Tab") return;
    const dialog = dialogRef.current;
    if (!dialog) return;

    const focusable = Array.from(
      dialog.querySelectorAll<HTMLElement>(focusableSelectors.join(","))
    ).filter((element) => !element.hasAttribute("disabled"));

    if (focusable.length === 0) {
      event.preventDefault();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
      return;
    }

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    }
  }, []);

  useEffect(() => {
    if (!open) return;

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      trapFocus(event);
    };

    document.addEventListener("keydown", handleKeydown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusTimeout = window.setTimeout(() => {
      const dialog = dialogRef.current;
      if (!dialog) return;
      const focusable = dialog.querySelector<HTMLElement>(focusableSelectors.join(","));
      focusable?.focus();
    }, 30);

    return () => {
      document.removeEventListener("keydown", handleKeydown);
      document.body.style.overflow = previousOverflow;
      window.clearTimeout(focusTimeout);
    };
  }, [open, onClose, trapFocus]);

  const handleBackdrop = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const toNullable = (value: string) => (value.trim() === "" ? null : value.trim());

  const toNumber = (value: string) => {
    const trimmed = value.trim();
    if (trimmed === "") return null;
    const parsed = Number(trimmed.replace(/,/g, ""));
    return Number.isFinite(parsed) ? parsed : null;
  };

  const buildPayload = () => {
    const initial = initialRef.current;
    const optimistic: Partial<Item> & { images?: { url: string }[] } = {};
    const patch: Record<string, unknown> = {};

    const assignIfChanged = <T,>(key: keyof FormState, mapper: (value: string) => T, apply: (value: T) => void) => {
      if (form[key] === initial[key]) return;
      const mapped = mapper(form[key]);
      apply(mapped);
    };

    assignIfChanged("description", toNullable, (value) => {
      optimistic.description = value;
      patch.description = value;
    });

    assignIfChanged("unitPrice", toNumber, (value) => {
      optimistic.unitPrice = value;
      patch.unitPrice = value;
    });

    assignIfChanged("location", toNullable, (value) => {
      optimistic.location = value;
      patch.location = value;
    });

    assignIfChanged("floor", toNullable, (value) => {
      optimistic.floor = value;
      patch.floor = value;
    });

    assignIfChanged("room", toNullable, (value) => {
      optimistic.room = value;
      patch.room = value;
    });

    assignIfChanged("rack", toNullable, (value) => {
      optimistic.rack = value;
      patch.rack = value;
    });

    assignIfChanged("fundingSource", toNullable, (value) => {
      optimistic.fundingSource = value;
      patch.fundingSource = value;
    });

    assignIfChanged("pic", toNullable, (value) => {
      optimistic.pic = value;
      patch.pic = value;
    });

    assignIfChanged("category", toNullable, (value) => {
      optimistic.category = value;
      patch.category = value;
    });

    assignIfChanged("brand", toNullable, (value) => {
      optimistic.brand = value;
      patch.brandModel = value;
    });

    assignIfChanged("purchasedAt", toNullable, (value) => {
      optimistic.purchasedAt = value;
      patch.purchasedAt = value;
    });

    assignIfChanged("lastCheckedAt", toNullable, (value) => {
      optimistic.lastCheckedAt = value;
      patch.lastCheckedAt = value;
    });

    assignIfChanged("damagedAt", toNullable, (value) => {
      optimistic.damagedAt = value;
      patch.damagedAt = value;
    });

    assignIfChanged("qrPayload", toNullable, (value) => {
      optimistic.qrPayload = value;
      patch.qrPayload = value;
    });

    assignIfChanged("barcodePayload", toNullable, (value) => {
      optimistic.barcodePayload = value;
      patch.barcodePayload = value;
    });

    assignIfChanged("sku", toNullable, (value) => {
      optimistic.code = value;
      patch.code = value;
    });

    if (form.photoUrl !== initial.photoUrl) {
      const photo = toNullable(form.photoUrl);
      optimistic.images = photo ? [{ url: photo }] : [];
      patch.photoUrl = photo;
    }

    return { optimistic, patch };
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending || isSaving) return;

    const { optimistic, patch } = buildPayload();

    if (Object.keys(patch).length === 0) {
      onClose();
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const result = await onSubmit({ optimistic, patch });
      if (!result.ok) {
        setError(result.message ?? "Gagal memperbarui data.");
        setIsSaving(false);
        return;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memperbarui data.");
      setIsSaving(false);
    }
  };

  const handleChange = (key: keyof FormState) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 px-4 py-6 backdrop-blur-sm"
      onMouseDown={handleBackdrop}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-inventory-title"
        className="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-6">
          <header className="flex items-start justify-between gap-4">
            <div>
              <h2 id="edit-inventory-title" className="text-xl font-semibold text-[#216B5B]">
                Edit Detail Inventori
              </h2>
              <p className="text-sm text-[#3E4643]">
                Perbarui informasi barang secara lengkap. Perubahan tersimpan otomatis setelah tombol simpan ditekan.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-transparent p-2 text-[#3E4643] transition hover:bg-[#EAF6EE]"
              aria-label="Tutup modal"
            >
              ×
            </button>
          </header>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm text-[#3E4643]">
              <span>Deskripsi</span>
              <textarea
                value={form.description}
                onChange={handleChange("description")}
                rows={3}
                className="rounded-2xl border border-[#CFE6D6] px-4 py-3 text-sm text-[#216B5B] focus:border-[#36AF30] focus:outline-none"
                placeholder="Tuliskan detail kondisi atau catatan"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-[#3E4643]">
              <span>Harga Satuan (IDR)</span>
              <input
                type="number"
                min="0"
                value={form.unitPrice}
                onChange={handleChange("unitPrice")}
                className="rounded-2xl border border-[#CFE6D6] px-4 py-3 text-sm text-[#216B5B] focus:border-[#36AF30] focus:outline-none"
                placeholder="Misal: 2500000"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-[#3E4643]">
              <span>Lokasi</span>
              <input
                value={form.location}
                onChange={handleChange("location")}
                className="rounded-2xl border border-[#CFE6D6] px-4 py-3 text-sm text-[#216B5B] focus:border-[#36AF30] focus:outline-none"
                placeholder="Gedung / Area"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-[#3E4643]">
              <span>Lantai</span>
              <input
                value={form.floor}
                onChange={handleChange("floor")}
                className="rounded-2xl border border-[#CFE6D6] px-4 py-3 text-sm text-[#216B5B] focus:border-[#36AF30] focus:outline-none"
                placeholder="Misal: 2"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-[#3E4643]">
              <span>Ruangan</span>
              <input
                value={form.room}
                onChange={handleChange("room")}
                className="rounded-2xl border border-[#CFE6D6] px-4 py-3 text-sm text-[#216B5B] focus:border-[#36AF30] focus:outline-none"
                placeholder="Ruang Server / Gudang"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-[#3E4643]">
              <span>Rak/Lemari</span>
              <input
                value={form.rack}
                onChange={handleChange("rack")}
                className="rounded-2xl border border-[#CFE6D6] px-4 py-3 text-sm text-[#216B5B] focus:border-[#36AF30] focus:outline-none"
                placeholder="Rak A3"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-[#3E4643]">
              <span>Sumber Dana</span>
              <input
                value={form.fundingSource}
                onChange={handleChange("fundingSource")}
                className="rounded-2xl border border-[#CFE6D6] px-4 py-3 text-sm text-[#216B5B] focus:border-[#36AF30] focus:outline-none"
                placeholder="APBD / Internal"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-[#3E4643]">
              <span>PIC</span>
              <input
                value={form.pic}
                onChange={handleChange("pic")}
                className="rounded-2xl border border-[#CFE6D6] px-4 py-3 text-sm text-[#216B5B] focus:border-[#36AF30] focus:outline-none"
                placeholder="Nama penanggung jawab"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-[#3E4643]">
              <span>Kategori</span>
              <input
                value={form.category}
                onChange={handleChange("category")}
                className="rounded-2xl border border-[#CFE6D6] px-4 py-3 text-sm text-[#216B5B] focus:border-[#36AF30] focus:outline-none"
                placeholder="Elektronik / Furnitur"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-[#3E4643]">
              <span>Merk / Brand</span>
              <input
                value={form.brand}
                onChange={handleChange("brand")}
                className="rounded-2xl border border-[#CFE6D6] px-4 py-3 text-sm text-[#216B5B] focus:border-[#36AF30] focus:outline-none"
                placeholder="Sony / IKEA"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-[#3E4643]">
              <span>Tanggal Pembelian</span>
              <input
                type="date"
                value={form.purchasedAt}
                onChange={handleChange("purchasedAt")}
                className="rounded-2xl border border-[#CFE6D6] px-4 py-3 text-sm text-[#216B5B] focus:border-[#36AF30] focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-[#3E4643]">
              <span>Terakhir Diperiksa</span>
              <input
                type="date"
                value={form.lastCheckedAt}
                onChange={handleChange("lastCheckedAt")}
                className="rounded-2xl border border-[#CFE6D6] px-4 py-3 text-sm text-[#216B5B] focus:border-[#36AF30] focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-[#3E4643]">
              <span>Tanggal Kerusakan</span>
              <input
                type="date"
                value={form.damagedAt}
                onChange={handleChange("damagedAt")}
                className="rounded-2xl border border-[#CFE6D6] px-4 py-3 text-sm text-[#216B5B] focus:border-[#36AF30] focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-[#3E4643]">
              <span>Payload QR</span>
              <input
                value={form.qrPayload}
                onChange={handleChange("qrPayload")}
                className="rounded-2xl border border-[#CFE6D6] px-4 py-3 text-sm text-[#216B5B] focus:border-[#36AF30] focus:outline-none"
                placeholder="INV:123"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-[#3E4643]">
              <span>Payload Barcode</span>
              <input
                value={form.barcodePayload}
                onChange={handleChange("barcodePayload")}
                className="rounded-2xl border border-[#CFE6D6] px-4 py-3 text-sm text-[#216B5B] focus:border-[#36AF30] focus:outline-none"
                placeholder="0102030405"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-[#3E4643]">
              <span>Kode / SKU</span>
              <input
                value={form.sku}
                onChange={handleChange("sku")}
                className="rounded-2xl border border-[#CFE6D6] px-4 py-3 text-sm text-[#216B5B] focus:border-[#36AF30] focus:outline-none"
                placeholder="SKU-001"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-[#3E4643]">
              <span>URL Foto Utama</span>
              <input
                value={form.photoUrl}
                onChange={handleChange("photoUrl")}
                className="rounded-2xl border border-[#CFE6D6] px-4 py-3 text-sm text-[#216B5B] focus:border-[#36AF30] focus:outline-none"
                placeholder="https://..."
              />
            </label>
          </div>

          <div className="flex flex-col gap-2">
            <span aria-live="polite" className="text-sm text-[#A83232]">
              {error}
            </span>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-[#CFE6D6] px-5 py-2 text-sm font-semibold text-[#3E4643] transition hover:bg-[#F4FBF6]"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={pending || isSaving}
                className="rounded-full bg-[#216B5B] px-6 py-2 text-sm font-semibold text-white transition hover:bg-[#1A5247] disabled:cursor-not-allowed disabled:bg-[#A6C9B5]"
              >
                {isSaving || pending ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
