"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Boxes, Home, LogOut, QrCode } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/dashboard/generate", label: "Generate QR/Barcode", icon: QrCode },
  { href: "/dashboard/inventory", label: "Inventory", icon: Boxes },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden min-h-dvh w-72 shrink-0 flex-col justify-between bg-gradient-to-b from-[#2E6431] via-[#216B5B] to-[#185AB6] text-white md:flex">
      <div>
        <Link href="/" className="flex items-center gap-3 px-6 pb-6 pt-8">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-lg font-semibold text-white">
            IA
          </span>
          <div>
            <p className="text-sm uppercase tracking-widest text-white/70">Invee-ai</p>
            <p className="text-base font-semibold">Inventory Intelligence</p>
          </div>
        </Link>

        <nav className="mt-4 space-y-1 px-4">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-white text-[#216B5B] shadow-lg shadow-black/10"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }`}
                prefetch
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="px-4 pb-6 pt-10">
        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/20"
        >
          <LogOut className="h-4 w-4" />
          Keluar
        </button>
      </div>
    </aside>
  );
}

