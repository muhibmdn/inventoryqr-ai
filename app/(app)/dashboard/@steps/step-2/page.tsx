import Link from "next/link";

export default function StepTwoPage() {
  const checklist = [
    "Lengkapi detail barang dan lokasi penyimpanan",
    "Pilih jenis kode (QR atau barcode) sesuai kebutuhan",
    "Gunakan shimmer preview untuk cek hasil sebelum cetak",
  ];

  return (
    <aside className="sticky top-28 flex flex-col gap-6 rounded-3xl border border-info-border bg-info-surface p-6 shadow-sm">
      <div className="space-y-2">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-semibold text-info-foreground">
          2
        </span>
        <h2 className="text-xl font-semibold text-info-foreground">
          Lengkapi detail & pratinjau
        </h2>
        <p className="text-sm text-info-foreground/80">
          Pastikan semua metadata barang terekam agar proses pencarian dan audit berjalan cepat.
        </p>
      </div>
      <ul className="space-y-3 text-sm text-info-foreground/80">
        {checklist.map((item) => (
          <li key={item} className="flex items-start gap-3">
            <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/80 text-xs font-semibold text-info-foreground">
              ✓
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <Link
        href="/dashboard/inventory"
        className="inline-flex items-center justify-center rounded-full border border-white/80 bg-white px-4 py-2 text-sm font-semibold text-info-foreground transition hover:bg-white/90"
      >
        Lihat daftar inventaris
      </Link>
    </aside>
  );
}