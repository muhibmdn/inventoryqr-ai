"use client";
import Link from "next/link";
import { useState } from "react";
import { AuthModal } from "./auth-modal";

export function MarketingNavbar() {
	const [open, setOpen] = useState(false);
	return (
		<header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur">
			<div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
				<Link href="/" className="font-semibold">
					Invee-ai
				</Link>
				<nav className="flex items-center gap-6 text-sm">
					<Link href="/" className="hover:text-gray-700">
						Home
					</Link>
					<Link href="/about" className="hover:text-gray-700">
						About
					</Link>
					<button
						onClick={() => setOpen(true)}
						className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
					>
						Login / Register
					</button>
				</nav>
			</div>
			<AuthModal open={open} onOpenChange={setOpen} />
		</header>
	);
}
