import Link from "next/link";

import { appConfig } from "@/src/app-config";

export default function StepOnePage() {
  const checklist = [
    "Siapkan template CSV atau unggah gambar QR lama",
    "Pastikan kolom nama, lokasi, dan kondisi terisi",
    "Gunakan format tanggal ISO untuk pembelian & pengecekan",
  ];

  return (
    <aside className="sticky top-28 flex flex-col gap-6 rounded-3xl border border-success-border bg-white p-6 shadow-sm">
      <div className="space-y-2">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-success-surface text-sm font-semibold text-brand-primary">
          1
        </span>
        <h2 className="text-xl font-semibold text-foreground-muted">
          Siapkan data inventaris
        </h2>
        <p className="text-sm text-foreground-subtle">
          Gunakan template standar {appConfig.name} agar data lebih mudah divalidasi dan cocok dengan generator QR & barcode.
        </p>
      </div>
      <ul className="space-y-3 text-sm text-foreground-subtle">
        {checklist.map((item) => (
          <li key={item} className="flex items-start gap-3">
            <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-success-surface text-xs font-semibold text-brand-primary">
              ✓
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <Link
        href="/dashboard/generate"
        className="inline-flex items-center justify-center rounded-full bg-brand-primary px-4 py-2 text-sm font-semibold text-white shadow-brand-sm transition hover:bg-brand-secondary"
      >
        Buka generator
      </Link>
    </aside>
  );
}