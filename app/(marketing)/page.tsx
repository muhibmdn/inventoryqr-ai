import Link from "next/link";

export default function LandingPage() {
	return (
		<section className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-16 lg:grid-cols-2">
			<div className="space-y-6">
	<h1 className="text-4xl font-bold leading-tight">
		Kelola Inventori + Cetak QR/Barcode secara cepat
	</h1>
	<p className="text-gray-600">
		Invee-ai membantu mengatur barang, membuat label, dan
		(nanti) mengisi deskripsi otomatis dari gambar.
	</p>
	<div className="flex gap-3">
		<Link
			href="/dashboard"
			className="rounded-md bg-gray-900 px-4 py-2 text-white hover:bg-black"
		>
			Coba Sekarang
		</Link>
		<Link
			href="/about"
			className="rounded-md border px-4 py-2 hover:bg-gray-50"
		>
			Pelajari
		</Link>
	</div>
			</div>
			<div className="rounded-xl border bg-white p-6 shadow-sm">
	<div className="aspect-[4/3] w-full rounded-lg bg-gradient-to-br from-gray-100 to-gray-50" />
			</div>
		</section>
	);
}
