"use client";

import Link from "next/link";
import { useEffect } from "react";

import { appConfig } from "@/app-config";

type MarketingErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function MarketingError({ error, reset }: MarketingErrorProps) {
  useEffect(() => {
    console.error("Marketing route error:", error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-4xl flex-col items-center justify-center gap-8 px-6 text-center">
      <span className="inline-flex items-center justify-center rounded-full border border-success-border/70 bg-success-surface px-4 py-1 text-sm font-semibold text-brand-primary">
        {appConfig.name}
      </span>
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold text-foreground-muted sm:text-4xl">
          Terjadi kesalahan tak terduga
        </h1>
        <p className="text-base text-foreground-subtle">
          Kami sudah menerima laporannya. Coba muat ulang halaman ini atau kembali ke beranda untuk melanjutkan eksplorasi.
        </p>
        {error.digest ? (
          <p className="text-xs text-foreground-subtle/70">Kode referensi: {error.digest}</p>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-full bg-brand-accent px-5 py-2.5 text-sm font-semibold text-white shadow-brand-sm transition hover:bg-brand-secondary"
        >
          Coba lagi
        </button>
        <Link
          href={appConfig.urls.marketing}
          className="inline-flex items-center gap-2 rounded-full border border-success-border/80 bg-white px-5 py-2.5 text-sm font-semibold text-brand-secondary transition hover:bg-success-surface"
        >
          Kembali ke beranda
        </Link>
      </div>
    </div>
  );
}