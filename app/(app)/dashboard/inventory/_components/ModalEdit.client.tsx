"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import type { Item } from "@/src/types/item";

import { Trash2, UploadCloud, X } from "lucide-react";

import Image from "next/image";

import type { EditResult } from "./cells/types";

export type ModalPayload = {
  optimistic: Partial<Item> & { images?: { id: string; url: string }[] };
  patch: Record<string, unknown>;
};

type ModalEditProps = {
  open: boolean;
  item: Item & { images?: { id: string; url: string }[] };
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
};

type ExistingImage = { id: string; url: string };
type PendingImage = { file: File; preview: string };
const generateTempId = () =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `temp-${Date.now()}-${Math.random().toString(16).slice(2)}`;
const toDateValue = (value: string | null | undefined): string =>
  value ? value.slice(0, 10) : "";

const buildFormState = (item: Item & { images?: { id: string; url: string }[] }): FormState => ({
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
  const [existingImages, setExistingImages] = useState<ExistingImage[]>(item.images ?? []);
  const [removedImageIds, setRemovedImageIds] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<PendingImage[]>([]);

  useEffect(() => {
    initialRef.current = buildFormState(item);
    setForm(initialRef.current);
    setError(null);
    setExistingImages(item.images ?? []);
    setRemovedImageIds([]);
    setNewImages((prev) => {
      prev.forEach(({ preview }) => URL.revokeObjectURL(preview));
      return [];
    });
  }, [item]);

  useEffect(() => {
    return () => {
      newImages.forEach(({ preview }) => URL.revokeObjectURL(preview));
    };
  }, [newImages]);

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

  const handleExistingImageRemove = (imageId: string) => {
    setExistingImages((prev) => prev.filter((image) => image.id !== imageId));
    setRemovedImageIds((prev) => (prev.includes(imageId) ? prev : [...prev, imageId]));
  };

  const handleNewImageRemove = (index: number) => {
    setNewImages((prev) => {
      const next = [...prev];
      const [removed] = next.splice(index, 1);
      if (removed) {
        URL.revokeObjectURL(removed.preview);
      }
      return next;
    });
  };

  const handleFileSelection = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    const accepted = Array.from(files).filter((file) => file.type.startsWith("image/"));
    if (accepted.length === 0) {
      event.target.value = "";
      return;
    }
    setNewImages((prev) => [
      ...prev,
      ...accepted.map((file) => ({ file, preview: URL.createObjectURL(file) })),
    ]);
    event.target.value = "";
  };

  const convertFileToWebp = useCallback((file: File) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        const image = new window.Image();
        image.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = image.naturalWidth || image.width;
          canvas.height = image.naturalHeight || image.height;
          const context = canvas.getContext("2d");
          if (!context) {
            reject(new Error("Canvas tidak tersedia untuk konversi gambar."));
            return;
          }
          context.drawImage(image, 0, 0);
          try {
            const webp = canvas.toDataURL("image/webp", 0.92);
            resolve(webp.startsWith("data:image") ? webp : base64);
          } catch (error) {
            reject(error instanceof Error ? error : new Error("Gagal mengubah gambar ke WebP."));
          }
        };
        image.onerror = () => reject(new Error("Gagal memuat gambar untuk konversi."));
        image.src = base64;
      };
      reader.onerror = () => reject(new Error("Gagal membaca file gambar."));
      reader.readAsDataURL(file);
    });
  }, []);
  const buildPayload = () => {
    const initial = initialRef.current;
    const optimistic: Partial<Item> & { images?: { id: string; url: string }[] } = {};
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

    return { optimistic, patch };
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending || isSaving) return;

    const { optimistic, patch } = buildPayload();
    const hasImageChanges = removedImageIds.length > 0 || newImages.length > 0;

    setIsSaving(true);
    setError(null);

    try {
      let convertedNewImages: string[] = [];

      if (hasImageChanges) {
        convertedNewImages = await Promise.all(newImages.map(({ file }) => convertFileToWebp(file)));
        const totalImages = existingImages.length + convertedNewImages.length;
        if (totalImages < 2) {
          setError("Minimal dua foto harus tersimpan untuk setiap barang.");
          setIsSaving(false);
          return;
        }

        if (convertedNewImages.length > 0) {
          patch.newImages = convertedNewImages;
        }

        if (removedImageIds.length > 0) {
          patch.removeImageIds = removedImageIds;
        }

        optimistic.images = [
          ...existingImages.map((image) => ({ ...image })),
          ...convertedNewImages.map((url) => ({ id: generateTempId(), url })),
        ];
      }

      if (!hasImageChanges && Object.keys(patch).length === 0) {
        setIsSaving(false);
        onClose();
        return;
      }

      onSubmit({ optimistic, patch }).catch((error) => {
        console.error("Gagal memperbarui data melalui modal edit.", error);
      });

      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Gagal memperbarui data.");
      setIsSaving(false);
      return;
    }
  };

  const handleChange = (key: keyof FormState) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
        className="relative w-full max-w-[75vw] rounded-3xl bg-white shadow-2xl"
        style={{ maxHeight: "85vh" }}
      >
        <form onSubmit={handleSubmit} className="flex max-h-[80vh] flex-col gap-6 overflow-y-auto p-6">
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
            <div className="sm:col-span-2 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-[#216B5B]">Foto Barang</span>
                <span className="text-xs text-[#3E4643]">Minimal 2 foto aktif.</span>
              </div>
              <div className="flex flex-wrap gap-3">
                {existingImages.map((image) => (
                  <div key={image.id} className="relative h-24 w-24 overflow-hidden rounded-xl border border-[#CFE6D6] bg-[#F8FBF9]">
                    <Image
                    src={image.url}
                    alt="Foto barang"
                    fill
                    sizes="96px"
                    className="object-cover"
                    unoptimized
                  />
                    <button
                      type="button"
                      onClick={() => handleExistingImageRemove(image.id)}
                      className="absolute right-1 top-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/80 text-[#A83232] shadow transition hover:bg-[#FCECEB]"
                      aria-label="Hapus foto"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {newImages.map((image, index) => (
                  <div
                    key={`new-${index}`}
                    className="relative h-24 w-24 overflow-hidden rounded-xl border border-dashed border-[#CFE6D6] bg-[#F8FBF9]"
                  >
                    <Image
                    src={image.preview}
                    alt="Foto baru"
                    fill
                    sizes="96px"
                    className="object-cover"
                    unoptimized
                  />
                    <button
                      type="button"
                      onClick={() => handleNewImageRemove(index)}
                      className="absolute right-1 top-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/80 text-[#A83232] shadow transition hover:bg-[#FCECEB]"
                      aria-label="Hapus foto baru"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[#CFE6D6] bg-[#F8FBF9] text-xs text-[#216B5B] transition hover:border-[#36AF30] hover:bg-[#EAF6EE]">
                  <UploadCloud className="h-5 w-5" />
                  <span>Tambah Foto</span>
                  <input type="file" accept="image/*" multiple onChange={handleFileSelection} className="hidden" />
                </label>
              </div>
            </div>

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
































