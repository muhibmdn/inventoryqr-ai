# InventoryQR Enterprise Table

Project ini menyiapkan dashboard inventori berbasis Next.js dengan TanStack Table, fetch server-first, dan aksi server optimistis.

## Endpoint Data Inventori

- **GET `/api/items/table`**
  - Query: `cursor`, `pageSize` (default 20), `sort` dan `filters` berupa JSON array, `q` untuk pencarian global.
  - Response: `{ rows, nextCursor, error }` dengan header `Cache-Control: s-maxage=30, stale-while-revalidate=300`.
  - Sorting & filtering mendukung kolom: `name`, `category`, `brand`, `quantity`, `condition`, `qrPayload`, `barcodePayload`, `createdAt`, `updatedAt`.

## Server Actions

- **`updateItem({ id, patch })`**
  - Validasi dengan Zod lalu mutasi Prisma (termasuk sinkronisasi foto utama melalui `photoUrl`).
  - Mengembalikan `{ ok, id, patch }` dan melakukan `revalidateTag` untuk `items`, `inventory`, dan `dashboard`.
- **`deleteItem(id)`**
  - Menghapus item beserta foto, mereturn `{ ok, id }`, dan revalidate tag yang sama.

Server actions dipanggil dari komponen klien secara optimistis. Kegagalan otomatis membatalkan perubahan dan menampilkan toast kesalahan.

## TanStack Table UX

- Sorting, filtering, pagination cursor berbasis server; perubahan state langsung memperbarui `searchParams` sehingga SSR melakukan refetch.
- Konfigurasi kolom (visibility & urutan) dipersist lewat `localStorage`:
  - `inv.columnVisibility`
  - `inv.columnOrder`
- Header sticky, kolom aksi sticky kanan, hover row, dan virtualisasi otomatis saat data > 1000 baris.
- Inline editable cell:
  - Nama barang, jumlah, dan kondisi (select) menggunakan komponen editable khusus dengan optimistik update.
- Modal edit memberikan form lengkap (deskripsi, harga, lokasi, PIC, tanggal, payload QR/Barcode, SKU, foto). Submit memanggil `updateItem` dengan patch teragregasi.
- Tombol aksi memakai ikon (`Pencil`, `Trash2`) dengan `aria-label` dan notifikasi `aria-live="polite"`.

## Perilaku Optimistic & Toast

- Semua mutasi mengubah state tabel terlebih dahulu, memicu server action, lalu memanggil `router.refresh()` setelah `revalidateTag` agar SSR sinkron.
- Jika server gagal, state direvert dari snapshot dan toast merah tampil selama ~3 detik; keberhasilan menampilkan toast hijau.

## Pengembangan

- Jalankan `pnpm dev` untuk pengembangan lokal.
- Validasi: jalankan `pnpm lint` dan `pnpm build` sebelum rilis (perlu Node.js + pnpm).

## Catatan Tambahan

- Skeleton dashboard hanya muncul pada kunjungan pertama berkat cookie `inventoryqr.firstVisit` di layout dashboard.
- Virtualisasi memakai `@tanstack/react-virtual`; pastikan dependensi terpasang (`pnpm install`).
