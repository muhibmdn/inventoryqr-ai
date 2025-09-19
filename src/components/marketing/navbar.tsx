"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AuthModal } from "./auth-modal";

type AuthMode = "login" | "register";

const navLinks = [
  { href: "/#home", label: "Beranda" },
  { href: "/#features", label: "Fitur" },
  { href: "/#about", label: "Tentang" },
];

export function MarketingNavbar() {
  const [open, setOpen] = useState(false);
  const [modalMode, setModalMode] = useState<AuthMode>("login");
  const [activeSection, setActiveSection] = useState("#home");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleScroll = () => {
      setScrolled(window.scrollY > 24);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const initialHash = window.location.hash || "#home";
    setActiveSection(initialHash);

    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("[data-section]")
    );
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(`#${entry.target.id}`);
          }
        });
      },
      {
        rootMargin: "-35% 0px -45% 0px",
        threshold: 0.2,
      }
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const externalOpenHandler = (event: Event) => {
      const detail = (event as CustomEvent<{ mode?: AuthMode }>).detail;
      setModalMode(detail?.mode ?? "login");
      setOpen(true);
    };

    window.addEventListener(
      "auth-modal:open",
      externalOpenHandler as EventListener
    );
    return () =>
      window.removeEventListener(
        "auth-modal:open",
        externalOpenHandler as EventListener
      );
  }, []);

  const openModal = (mode: AuthMode) => {
    setModalMode(mode);
    setOpen(true);
  };

  const headerClasses = scrolled
    ? "border-b border-[#CFE6D6] bg-white/80 backdrop-blur-xl shadow-sm"
    : "border-b border-transparent bg-white";

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${headerClasses}`}
    >
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

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((item) => {
            const isActive = activeSection === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                scroll
                onClick={() => setActiveSection(item.href)}
                className={`group flex flex-col items-center gap-1 text-sm font-medium transition-colors ${
                  isActive ? "text-[#216B5B]" : "text-[#3E4643] hover:text-[#216B5B]"
                }`}
              >
                <span>{item.label}</span>
                <span
                  className={`h-0.5 w-full origin-center rounded-full transition-transform duration-300 ${
                    isActive
                      ? "scale-x-100 bg-[#2E6431]"
                      : "scale-x-0 bg-[#9DDB8D] group-hover:scale-x-100"
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <button
            onClick={() => openModal("login")}
            className="inline-flex items-center justify-center rounded-full border border-[#2CBFA4]/70 bg-white px-4 py-2 text-sm font-semibold text-[#216B5B] transition hover:-translate-y-[1px] hover:border-[#2CBFA4] hover:bg-[#EAF6EE] hover:text-[#2E6431]"
          >
            Masuk / Daftar
          </button>
        </div>

        <button
          onClick={() => openModal("login")}
          className="inline-flex items-center justify-center rounded-full border border-[#36AF30] px-4 py-2 text-sm font-semibold text-[#216B5B] transition hover:bg-[#EAF6EE] md:hidden"
        >
          Masuk
        </button>
      </div>

      <nav className="flex items-center justify-center gap-6 border-t border-[#CFE6D6] bg-[#EAF6EE] px-4 py-3 text-sm font-medium text-[#216B5B] md:hidden">
        {navLinks.map((item) => {
          const isActive = activeSection === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              scroll
              onClick={() => setActiveSection(item.href)}
              className={`group flex flex-col items-center gap-1 transition-colors ${
                isActive ? "text-[#216B5B]" : "text-[#3E4643] hover:text-[#216B5B]"
              }`}
            >
              <span>{item.label}</span>
              <span
                className={`h-0.5 w-full origin-center rounded-full transition-transform duration-300 ${
                  isActive
                    ? "scale-x-100 bg-[#2E6431]"
                    : "scale-x-0 bg-[#9DDB8D] group-hover:scale-x-100"
                }`}
              />
            </Link>
          );
        })}
      </nav>

      <AuthModal
        open={open}
        onOpenChange={setOpen}
        initialMode={modalMode}
      />
    </header>
  );
}
