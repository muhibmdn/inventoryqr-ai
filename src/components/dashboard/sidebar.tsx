"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
	{ href: "/dashboard", label: "Home" },
	{ href: "/dashboard/generate", label: "Generate QR/Barcode" },
	{ href: "/dashboard/inventory", label: "Inventory" },
];

export function Sidebar() {
	const pathname = usePathname();
	return (
		<aside className="hidden w-64 shrink-0 border-r bg-white md:block">
			<div className="p-4 font-semibold">Invee-ai</div>
			<nav className="grid gap-1 p-2">
				{links.map((l) => {
					const active = pathname === l.href;
					return (
						<Link
							key={l.href}
							href={l.href}
							className={`rounded-md px-3 py-2 text-sm hover:bg-gray-50 ${
								active ? "bg-gray-100 font-medium" : ""
							}`}
						>
							{l.label}
						</Link>
					);
				})}
			</nav>
			<div className="mt-auto p-2">
				<button className="w-full rounded-md border px-3 py-2 text-left text-sm hover:bg-gray-50">
					Logout
				</button>
			</div>
		</aside>
	);
}
