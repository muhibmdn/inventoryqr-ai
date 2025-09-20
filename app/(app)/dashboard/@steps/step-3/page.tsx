import Link from "next/link";

export default function StepThreePage() {
  const checklist = [
    "Cetak label QR/barcode sesuai perangkat cetak",
    "Aktifkan mode audit cepat untuk tim lapangan",
    "Gunakan revalidasi otomatis untuk sinkron data",
  ];

  return (
    <aside className="sticky top-28 flex flex-col gap-6 rounded-3xl border border-brand-accent/30 bg-brand-accent/10 p-6 shadow-sm">
      <div className="space-y-2 text-brand-secondary">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-accent text-sm font-semibold text-white">
          3
        </span>
        <h2 className="text-xl font-semibold">Distribusikan & monitor</h2>
        <p className="text-sm text-brand-secondary/80">
          Bagikan label ke tim operasional dan pantau status inventaris melalui dashboard real-time.
        </p>
      </div>
      <ul className="space-y-3 text-sm text-brand-secondary/80">
        {checklist.map((item) => (
          <li key={item} className="flex items-start gap-3">
            <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/60 text-xs font-semibold text-brand-secondary">
              ✓
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <Link
        href="/dashboard"
        className="inline-flex items-center justify-center rounded-full bg-brand-primary px-4 py-2 text-sm font-semibold text-white shadow-brand-sm transition hover:bg-brand-secondary"
      >
        Kembali ke ringkasan
      </Link>
    </aside>
  );
}