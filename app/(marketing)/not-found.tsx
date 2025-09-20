import Link from "next/link";

import { appConfig } from "@/app-config";

export default function MarketingNotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-4xl flex-col items-center justify-center gap-6 px-6 text-center">
      <span className="inline-flex items-center justify-center rounded-full border border-warning-border/70 bg-warning-surface px-4 py-1 text-xs font-semibold text-warning-foreground">
        404 Tidak ditemukan
      </span>
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold text-foreground-muted sm:text-4xl">
          Halaman yang Anda cari belum tersedia.
        </h1>
        <p className="text-base text-foreground-subtle">
          Silakan kembali ke beranda atau gunakan menu navigasi untuk menemukan konten lainnya.
        </p>
      </div>
      <Link
        href={appConfig.urls.marketing}
        className="inline-flex items-center gap-2 rounded-full bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white shadow-brand-sm transition hover:bg-brand-secondary"
      >
        Kembali ke beranda
      </Link>
    </div>
  );
}