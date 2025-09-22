import Link from "next/link";

import { appConfig } from "@/src/app-config";

export default function DashboardNotFound() {
  return (
    <div className="rounded-3xl border border-warning-border bg-white p-10 text-center shadow-brand-sm">
      <span className="inline-flex items-center justify-center rounded-full border border-warning-border/80 bg-warning-surface px-4 py-1 text-xs font-semibold text-warning-foreground">
        Modul tidak ditemukan
      </span>
      <h1 className="mt-4 text-2xl font-semibold text-foreground-muted">
        Halaman dashboard yang Anda cari belum tersedia.
      </h1>
      <p className="mt-2 text-sm text-foreground-subtle">
        Gunakan menu samping atau kembali ke ringkasan dashboard untuk melanjutkan.
      </p>
      <Link
        href={appConfig.urls.dashboard}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white shadow-brand-sm transition hover:bg-brand-secondary"
      >
        Buka ringkasan dashboard
      </Link>
    </div>
  );
}