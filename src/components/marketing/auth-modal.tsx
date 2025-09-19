"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AuthModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");

  if (!open) return null;

  const handleSubmit = () => {
    router.push("/dashboard");
    onOpenChange(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-[#343B38]/60 px-4 py-10"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-[#CFE6D6] bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute -top-32 -right-28 h-48 w-48 rounded-full bg-[#9DDB8D]/50 blur-3xl" />
        <div className="absolute -bottom-20 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-[#C7D9F7]/50 blur-3xl" />

        <div className="relative grid gap-6 p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#216B5B]">
                {mode === "login" ? "Masuk ke Invee-ai" : "Buat akun baru"}
              </p>
              <h2 className="mt-1 text-2xl font-semibold text-[#2E6431]">
                {mode === "login" ? "Selamat datang kembali" : "Mulai kelola inventori"}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#CFE6D6] text-lg font-semibold text-[#216B5B] transition hover:bg-[#EAF6EE]"
            >
              ×
            </button>
          </div>

          <form className="grid gap-4">
            {mode === "register" && (
              <div className="grid gap-1">
                <label className="text-sm font-medium text-[#216B5B]">Nama</label>
                <input
                  className="rounded-xl border border-[#CFE6D6] bg-[#EAF6EE] px-4 py-3 text-sm text-[#343B38] focus:border-[#36AF30] focus:outline-none"
                  placeholder="Nama lengkap"
                />
              </div>
            )}
            <div className="grid gap-1">
              <label className="text-sm font-medium text-[#216B5B]">Email</label>
              <input
                type="email"
                className="rounded-xl border border-[#CFE6D6] bg-[#EAF6EE] px-4 py-3 text-sm text-[#343B38] focus:border-[#36AF30] focus:outline-none"
                placeholder="kamu@email.com"
              />
            </div>
            <div className="grid gap-1">
              <label className="text-sm font-medium text-[#216B5B]">Password</label>
              <input
                type="password"
                className="rounded-xl border border-[#CFE6D6] bg-[#EAF6EE] px-4 py-3 text-sm text-[#343B38] focus:border-[#36AF30] focus:outline-none"
                placeholder="********"
              />
            </div>
            <button
              type="button"
              onClick={handleSubmit}
              className="mt-2 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#2E6431] via-[#216B5B] to-[#36AF30] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#216B5B]/30 transition hover:shadow-xl"
            >
              {mode === "login" ? "Masuk" : "Daftar"}
            </button>
          </form>

          <div className="rounded-2xl border border-dashed border-[#CFE6D6] bg-[#EAF6EE] p-4 text-center text-sm text-[#3E4643]">
            <p>
              {mode === "login" ? "Belum punya akun?" : "Sudah punya akun?"}
              <button
                type="button"
                className="ml-1 font-semibold text-[#216B5B] underline-offset-4 hover:underline"
                onClick={() => setMode(mode === "login" ? "register" : "login")}
              >
                {mode === "login" ? "Daftar sekarang" : "Masuk"}
              </button>
            </p>
          </div>

          <button
            type="button"
            className="inline-flex items-center justify-center gap-3 rounded-full border border-[#C7D9F7] bg-white px-5 py-3 text-sm font-semibold text-[#185AB6] transition hover:bg-[#EAF2FD]"
          >
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#1E6AD6]/15 text-xs font-semibold text-[#1E6AD6]">
              G
            </span>
            Lanjutkan dengan Google
          </button>
        </div>
      </div>
    </div>
  );
}
