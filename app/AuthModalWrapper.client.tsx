"use client";

import { useEffect, useState } from "react";
import { AuthModal } from "../src/components/marketing/auth-modal"; // Changed to relative path

export function AuthModalWrapper() {
  const [open, setOpen] = useState(false);
  const [initialMode, setInitialMode] = useState<"login" | "register">("login");

  useEffect(() => {
    const handleOpenModal = (event: CustomEvent) => {
      setInitialMode(event.detail.mode);
      setOpen(true);
    };

    window.addEventListener("auth-modal:open", handleOpenModal as EventListener);

    return () => {
      window.removeEventListener("auth-modal:open", handleOpenModal as EventListener);
    };
  }, []);

  return (
    <AuthModal
      open={open}
      onOpenChange={setOpen}
      initialMode={initialMode}
    />
  );
}