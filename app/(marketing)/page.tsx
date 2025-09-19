import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="bg-[#EAF6EE] text-[#343B38]">
      <section id="home" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#2E6431] via-[#216B5B] to-[#36AF30]" />
        <div className="absolute -bottom-24 -right-32 h-72 w-72 rounded-full bg-[#9DDB8D]/40 blur-3xl" />
        <div className="absolute -top-20 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-[#1E6AD6]/20 blur-3xl" />

        <div className="relative mx-auto grid max-w-6xl grid-cols-1 gap-16 px-4 py-20 lg:grid-cols-[1.05fr_minmax(0,1fr)] lg:py-28">
          <div className="space-y-8 text-white">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-1 text-sm uppercase tracking-wider backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-[#9DDB8D]" />
              Automasi Inventori Cerdas
            </span>

            <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
              Kelola stok, cetak QR/Barcode, dan dokumentasi produk dalam hitungan menit.
            </h1>
            <p className="max-w-xl text-lg text-white/80">
              Invee-ai memadukan pengelolaan inventori, pencetakan label, serta deskripsi otomatis berbasis AI untuk mempercepat operasional gudang dan retail Anda.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-full bg-[#36AF30] px-6 py-3 text-base font-semibold text-[#143819] shadow-lg shadow-[#36AF30]/40 transition hover:bg-[#2E6431] hover:text-white"
              >
                Coba Sekarang
              </Link>
              <Link
                href="/#about"
                className="inline-flex items-center justify-center rounded-full border border-white/40 px-6 py-3 text-base font-semibold text-white transition hover:bg-white/10"
              >
                Pelajari Produk
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-white/30 bg-white/10 p-4 backdrop-blur">
                <p className="text-sm font-semibold text-[#CFE6D6]">Label instan</p>
                <p className="text-sm text-white/80">
                  Cetak QR & Barcode dengan warna brand dan detail produk terbaru.
                </p>
              </div>
              <div className="rounded-xl border border-white/30 bg-white/10 p-4 backdrop-blur">
                <p className="text-sm font-semibold text-[#FFE3B3]">Automasi AI</p>
                <p className="text-sm text-white/80">
                  Gunakan AI untuk mengisi deskripsi dan spesifikasi produk dari gambar.
                </p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 translate-x-6 translate-y-6 rounded-3xl bg-[#CFE6D6] opacity-60" />
            <div className="relative rounded-3xl border border-white/40 bg-white p-6 shadow-2xl">
              <div className="mb-6 flex items-center justify-between">
                <span className="rounded-full bg-[#EAF2FD] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#185AB6]">
                  Dashboard Live
                </span>
                <span className="text-xs font-medium text-[#216B5B]">Sinkron realtime</span>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-[#CFE6D6] bg-[#EAF6EE] p-4">
                  <p className="text-sm font-semibold text-[#216B5B]">Stok Gudang A</p>
                  <p className="text-xs text-[#343B38]">Terpenuhi 98% | 2 SKU perlu restock</p>
                </div>
                <div className="rounded-2xl border border-[#C7D9F7] bg-[#EAF2FD] p-4">
                  <p className="text-sm font-semibold text-[#185AB6]">Label Siap Cetak</p>
                  <p className="text-xs text-[#3E4643]">24 label dalam antrian | Format QR & Barcode</p>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-[#F6B8B8] bg-[#F6B8B8]/20 p-4">
                  <div>
                    <p className="text-sm font-semibold text-[#A83232]">Peringatan Stok</p>
                    <p className="text-xs text-[#3E4643]">SKU-192 & SKU-204</p>
                  </div>
                  <span className="rounded-full bg-[#FFB114] px-3 py-1 text-[11px] font-semibold text-[#343B38]">
                    Prioritas
                  </span>
                </div>
              </div>

              <div className="mt-8 rounded-2xl bg-[#216B5B] p-4 text-white">
                <p className="text-sm font-semibold">Rekomendasi AI</p>
                <p className="text-xs text-white/80">
                  Gabungkan SKU serupa dan hemat waktu penginputan hingga 65%.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="relative overflow-hidden border-y border-[#CFE6D6] bg-white">
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#CFE6D6]/80 to-transparent" />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-12 px-4 py-20">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-[#CFE6D6] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#216B5B]">
                Alur kerja terpadu
              </p>
              <h2 className="mt-4 text-3xl font-semibold text-[#216B5B]">
                Semua tim inventori terhubung dalam satu panel kontrol.
              </h2>
            </div>
            <p className="max-w-lg text-sm text-[#3E4643]">
              Sinkronkan stok lintas channel, setujui label, dan kolaborasi dengan tim operasional tanpa berpindah aplikasi. Fitur kami dirancang modular sehingga mudah menyesuaikan proses bisnis Anda.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-[#CFE6D6] bg-[#EAF6EE] p-6 shadow-sm">
              <h3 className="mb-3 text-lg font-semibold text-[#216B5B]">Panel stok terpadu</h3>
              <p className="text-sm text-[#3E4643]">
                Monitor setiap SKU secara real-time, lengkap dengan peringatan restock otomatis dan histori pergerakan barang.
              </p>
            </div>
            <div className="rounded-2xl border border-[#C7D9F7] bg-[#EAF2FD] p-6 shadow-sm">
              <h3 className="mb-3 text-lg font-semibold text-[#185AB6]">Label sesuai standar</h3>
              <p className="text-sm text-[#3E4643]">
                Cetak QR atau barcode yang konsisten di setiap lokasi, dengan template yang dapat disesuaikan hingga detail warna.
              </p>
            </div>
            <div className="rounded-2xl border border-[#FFE3B3] bg-[#FFF7E6] p-6 shadow-sm">
              <h3 className="mb-3 text-lg font-semibold text-[#B97C00]">Workflow approval</h3>
              <p className="text-sm text-[#3E4643]">
                Kirim, review, dan setujui label atau perubahan stok lewat satu sistem agar keputusan lebih cepat dan terdokumentasi.
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-[1.4fr_1fr]">
            <div className="rounded-3xl border border-[#CFE6D6] bg-gradient-to-br from-white via-[#EAF6EE] to-white p-8 shadow-lg">
              <h3 className="text-2xl font-semibold text-[#216B5B]">Integrasi AI yang kontekstual</h3>
              <p className="mt-4 text-sm text-[#3E4643]">
                Setiap gambar produk otomatis dipindai untuk menghasilkan deskripsi, spesifikasi, dan rekomendasi bundling. AI kami tidak sekadar menyalin, tetapi belajar dari data historis inventori Anda untuk menjaga konsistensi brand.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-[#216B5B]">
                <li className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2">
                  <span className="h-2 w-2 rounded-full bg-[#36AF30]" />
                  Pengenalan atribut produk otomatis
                </li>
                <li className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2">
                  <span className="h-2 w-2 rounded-full bg-[#1E6AD6]" />
                  Rekomendasi pengelompokan SKU pintar
                </li>
                <li className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2">
                  <span className="h-2 w-2 rounded-full bg-[#FFB114]" />
                  Notifikasi mismatch yang proaktif
                </li>
              </ul>
            </div>
            <div className="rounded-3xl border border-[#F6B8B8] bg-[#F6B8B8]/20 p-8 shadow-lg">
              <p className="text-sm font-semibold uppercase tracking-widest text-[#A83232]">
                Dampak bisnis
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-[#A83232]">
                Kurangi stok mati hingga 28% dalam 3 bulan.
              </h3>
              <p className="mt-4 text-sm text-[#3E4643]">
                Insight otomatis membantu tim prioritas restock, mengurangi human error, serta memaksimalkan rotasi inventori untuk cashflow yang lebih sehat.
              </p>
              <div className="mt-6 grid gap-4">
                <div className="rounded-2xl bg-white/90 px-4 py-3 text-sm text-[#343B38]">
                  <span className="font-semibold text-[#216B5B]">65%</span> waktu input berkurang lewat label otomatis.
                </div>
                <div className="rounded-2xl bg-white/90 px-4 py-3 text-sm text-[#343B38]">
                  <span className="font-semibold text-[#185AB6]">3x</span> lebih cepat analisis stok antar gudang.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="mx-auto max-w-6xl px-4 py-20">
        <div className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-[#CFE6D6] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#216B5B]">
              Dibangun untuk tim operasional
            </p>
            <h2 className="mt-4 text-3xl font-semibold text-[#216B5B]">
              Workflow inventori yang menyatu dengan bisnis Anda.
            </h2>
          </div>
          <p className="max-w-xl text-sm text-[#3E4643]">
            Kelola stok lintas lokasi, pantau performa SKU, dan kirim label siap cetak ke tim gudang tanpa perlu berpindah alat. Invee-ai hadir sebagai co-pilot untuk setiap proses perpindahan barang.
          </p>
        </div>

        <div className="grid gap-12 md:grid-cols-[1.15fr_minmax(0,1fr)]">
          <div className="space-y-10">
            <article className="rounded-3xl border border-[#CFE6D6] bg-white p-8 shadow-sm">
              <h3 className="text-2xl font-semibold text-[#216B5B]">Visi kami</h3>
              <p className="mt-4 text-sm text-[#3E4643]">
                Membuat setiap tim operasional dapat mengambil keputusan berbasis data dalam hitungan menit. Mulai dari pengecekan stok harian hingga menyusun strategi pembelian, semuanya terbantu oleh automasi yang bisa dipercaya.
              </p>
            </article>
            <article className="rounded-3xl border border-[#C7D9F7] bg-white p-8 shadow-sm">
              <h3 className="text-2xl font-semibold text-[#185AB6]">Cara kami bekerja</h3>
              <p className="mt-4 text-sm text-[#3E4643]">
                Tim kami menggabungkan pengalaman warehouse, retail, dan teknologi AI. Setiap fitur yang dirilis melewati proses validasi dengan operator gudang agar manfaatnya langsung terasa.
              </p>
            </article>
          </div>

          <div className="grid gap-6">
            <div className="rounded-2xl border border-[#FFE3B3] bg-[#FFF7E6] p-6">
              <p className="text-sm font-semibold text-[#B97C00]">Mengapa satu halaman landing?</p>
              <p className="mt-3 text-sm text-[#3E4643]">
                Navigasi utama kami langsung mengarah ke setiap bagian penting: hero, fitur, dan tentang. Anda bisa menelusuri keseluruhan cerita produk dalam satu alur tanpa merasa terpisah antar halaman.
              </p>
            </div>
            <div className="rounded-2xl border border-[#F6B8B8] bg-[#F6B8B8]/20 p-6">
              <p className="text-sm font-semibold text-[#A83232]">Siapa yang cocok?</p>
              <p className="mt-3 text-sm text-[#3E4643]">
                UKM, distributor, hingga brand direct-to-consumer yang membutuhkan kendali penuh atas inventori fisik maupun online dengan biaya implementasi yang efisien.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-t border-[#CFE6D6] bg-white">
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#C7D9F7]/40 to-transparent" />
        <div className="relative mx-auto max-w-6xl px-4 py-16">
          <div className="grid gap-10 rounded-3xl border border-[#C7D9F7] bg-[#EAF2FD] p-8 md:grid-cols-[1.2fr_minmax(0,1fr)] md:items-center">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#185AB6]">Mulai gratis</p>
              <h3 className="text-3xl font-semibold text-[#185AB6]">
                Tingkatkan akurasi inventori dan percepat pelabelan produk Anda hari ini juga.
              </h3>
              <p className="text-sm text-[#3E4643]">
                Aktivasi akun percobaan untuk menjelajah dashboard, otomatisasi AI, dan fitur pencetakan label. Tidak perlu kartu kredit.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/dashboard"
                className="flex-1 rounded-full bg-[#36AF30] px-5 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-[#36AF30]/30 transition hover:bg-[#2E6431]"
              >
                Masuk ke Dashboard
              </Link>
              <Link
                href="/#home"
                className="flex-1 rounded-full border border-[#216B5B] px-5 py-3 text-center text-sm font-semibold text-[#216B5B] transition hover:bg-[#EAF6EE]"
              >
                Kembali ke atas
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

