"use client";
import { useState } from "react";

export function AuthModal({
    open,
    onOpenChange,
}: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
}) {
    const [mode, setMode] = useState<"login" | "register">("login");
    if (!open) return null;
    return (
        <div
            className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
            onClick={() => onOpenChange(false)}
        >
            <div
                className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold">
                        {mode === "login" ? "Login" : "Register"}
                    </h2>
                    <button
                        onClick={() => onOpenChange(false)}
                        className="rounded p-1 hover:bg-gray-100"
                    >
                        ✕
                    </button>
                </div>
                <form className="grid gap-3">
                    {mode === "register" && (
                        <div className="grid gap-1">
                            <label className="text-sm">Username</label>
                            <input
                                className="rounded-md border px-3 py-2"
                                placeholder="yourname"
                            />
                        </div>
                    )}
                    <div className="grid gap-1">
                        <label className="text-sm">Email</label>
                        <input
                            type="email"
                            className="rounded-md border px-3 py-2"
                            placeholder="you@mail.com"
                        />
                    </div>
                    <div className="grid gap-1">
                        <label className="text-sm">Password</label>
                        <input
                            type="password"
                            className="rounded-md border px-3 py-2"
                            placeholder="••••••••"
                        />
                    </div>
                    <button
                        type="button"
                        className="mt-2 rounded-md bg-gray-900 px-3 py-2 text-white hover:bg-black"
                    >
                        {mode === "login" ? "Masuk" : "Daftar"}
                    </button>
                </form>
                <div className="mt-4 text-center text-sm">
                    {mode === "login" ? (
                        <button
                            className="underline"
                            onClick={() => setMode("register")}
                        >
                            Belum punya akun? Register
                        </button>
                    ) : (
                        <button
                            className="underline"
                            onClick={() => setMode("login")}
                        >
                            Sudah punya akun? Login
                        </button>
                    )}
                </div>
                <div className="mt-4">
                    <button className="w-full rounded-md border px-3 py-2 hover:bg-gray-50">
                        Lanjutkan dengan Google
                    </button>
                </div>
            </div>
        </div>
    );
}
