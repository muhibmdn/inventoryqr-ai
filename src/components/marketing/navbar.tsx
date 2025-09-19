"use client";
import Link from "next/link";
import { useState } from "react";
import { AuthModal } from "./auth-modal";

const navLinks = [
  { href: "/#home", label: "Beranda" },
  { href: "/#features", label: "Fitur" },
  { href: "/#about", label: "Tentang" },
];

export function MarketingNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[#CFE6D6] bg-white/80 backdrop-blur-xl">
      <div className="relative mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-4">
        <Link
          href="/#home"
          className="group inline-flex items-center gap-2 text-lg font-semibold tracking-tight text-[#216B5B]"
        >
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#2E6431] via-[#216B5B] to-[#36AF30] text-white">
            IA
          </span>
          <span className="leading-none">
            Invee<span className="text-[#2E6431]">-ai</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-[#3E4643] md:flex">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition hover:text-[#216B5B]"
              scroll
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center justify-center rounded-full border border-[#2CBFA4]/70 bg-white px-4 py-2 text-sm font-semibold text-[#216B5B] transition hover:-translate-y-[1px] hover:border-[#2CBFA4] hover:bg-[#EAF6EE] hover:text-[#2E6431]"
          >
            Masuk / Daftar
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-full bg-[#36AF30] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-[#36AF30]/40 transition hover:-translate-y-[1px] hover:bg-[#2E6431]"
          >
            Ke Dashboard
          </Link>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center justify-center rounded-full border border-[#36AF30] px-4 py-2 text-sm font-semibold text-[#216B5B] transition hover:bg-[#EAF6EE] md:hidden"
        >
          Masuk
        </button>
      </div>

      <nav className="flex items-center justify-center gap-6 border-t border-[#CFE6D6] bg-[#EAF6EE] px-4 py-3 text-sm font-medium text-[#216B5B] md:hidden">
        {navLinks.map((item) => (
          <Link key={item.href} href={item.href} scroll className="transition hover:text-[#2E6431]">
            {item.label}
          </Link>
        ))}
      </nav>

      <AuthModal open={open} onOpenChange={setOpen} />
    </header>
  );
}
