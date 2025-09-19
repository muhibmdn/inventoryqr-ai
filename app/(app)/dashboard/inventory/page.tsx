"use client";
import { useEffect, useState } from "react";

type Item = {
	id: string;
	name: string;
	category: string | null;
	brandModel: string | null;
	quantity: number;
	condition: string;
};

export default function InventoryPage() {
	const [items, setItems] = useState<Item[]>([]);
	useEffect(() => {
		fetch("/api/items")
			.then((r) => r.json())
			.then((d) => setItems(d.items));
	}, []);

	return (
		<div className="grid gap-4">
			<h1 className="text-xl font-semibold">Inventory</h1>
			<div className="overflow-x-auto rounded-lg border">
				<table className="w-full text-sm">
					<thead className="bg-gray-50 text-left">
						<tr>
							<th className="px-3 py-2">Nama Barang</th>
							<th className="px-3 py-2">Kategori</th>
							<th className="px-3 py-2">Merk/Model</th>
							<th className="px-3 py-2">Jumlah</th>
							<th className="px-3 py-2">Kondisi</th>
						</tr>
					</thead>
					<tbody>
						{items.map((it) => (
							<tr key={it.id} className="border-t">
								<td className="px-3 py-2">{it.name}</td>
								<td className="px-3 py-2">
									{it.category ?? "-"}
								</td>
								<td className="px-3 py-2">
									{it.brandModel ?? "-"}
								</td>
								<td className="px-3 py-2">{it.quantity}</td>
								<td className="px-3 py-2">{it.condition}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
