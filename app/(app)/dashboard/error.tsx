"use client";

import { useEffect } from "react";
import Link from "next/link";

import { appConfig } from "@/app-config";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard route error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-6 rounded-3xl border border-danger-border bg-white p-10 text-center shadow-brand-sm">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-foreground-muted">
          Ada masalah saat memuat data dashboard
        </h1>
        <p className="text-sm text-foreground-subtle">
          Coba muat ulang halaman atau kembali ke ringkasan dashboard.
        </p>
        {error.digest ? (
          <p className="text-xs text-foreground-subtle/70">Kode referensi: {error.digest}</p>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-full bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white shadow-brand-sm transition hover:bg-brand-secondary"
        >
          Muat ulang
        </button>
        <Link
          href={appConfig.urls.dashboard}
          className="inline-flex items-center gap-2 rounded-full border border-success-border bg-success-surface px-5 py-2.5 text-sm font-semibold text-brand-primary transition hover:bg-white"
        >
          Kembali ke dashboard
        </Link>
      </div>
    </div>
  );
}