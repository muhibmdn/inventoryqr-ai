import Link from "next/link";

import { appConfig } from "@/src/app-config";

export default function RootNotFound() {
  return (
    <div className="mx-auto flex min-h-[65vh] w-full max-w-4xl flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="text-3xl font-semibold text-foreground-muted sm:text-4xl">
        Ups, halaman ini tidak tersedia.
      </h1>
      <p className="text-base text-foreground-subtle">
        URL mungkin berubah atau fitur masih dalam pengembangan. Pilih jalur berikut untuk melanjutkan.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href={appConfig.urls.marketing}
          className="inline-flex items-center gap-2 rounded-full bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white shadow-brand-sm transition hover:bg-brand-secondary"
        >
          Halaman utama
        </Link>
        <Link
          href={appConfig.urls.dashboard}
          className="inline-flex items-center gap-2 rounded-full border border-success-border bg-white px-5 py-2.5 text-sm font-semibold text-brand-primary transition hover:bg-success-surface"
        >
          Buka dashboard
        </Link>
      </div>
    </div>
  );
}