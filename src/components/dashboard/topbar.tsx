"use client";
import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { CalendarDays } from "lucide-react";

const titleMap: Record<string, string> = {
  "/dashboard": "Home",
  "/dashboard/generate": "Generate QR/Barcode",
  "/dashboard/inventory": "Inventory",
};

function resolveTitle(pathname: string) {
  if (pathname.startsWith("/dashboard/generate")) return titleMap["/dashboard/generate"];
  if (pathname.startsWith("/dashboard/inventory")) return titleMap["/dashboard/inventory"];
  return titleMap["/dashboard"];
}

export function Topbar() {
  const pathname = usePathname();
  const title = useMemo(() => resolveTitle(pathname ?? "/dashboard"), [pathname]);
  const today = useMemo(() => ({
    formatted: new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date()),
  }), []);

  return (
    <header className="sticky top-0 z-40 border-b border-[#CFE6D6] bg-white/80 backdrop-blur-xl">
      <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#216B5B]">Menu aktif</p>
          <h1 className="text-xl font-semibold text-[#2E6431]">{title}</h1>
        </div>
        <div className="hidden items-center gap-2 rounded-full border border-[#C7D9F7] bg-[#EAF2FD] px-4 py-2 text-xs font-medium text-[#185AB6] sm:flex">
          <CalendarDays className="h-4 w-4" />
          <span>{today.formatted}</span>
        </div>
      </div>
    </header>
  );
}

