import type { ReactNode } from "react";

import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";

type DashboardLayoutProps = {
  children: ReactNode;
  steps: ReactNode;
};

export default function DashboardLayout({ children, steps }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-dvh bg-success-surface text-foreground-muted">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Topbar />
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-10">
          <div className="mx-auto w-full max-w-6xl">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr),minmax(260px,320px)] lg:items-start">
              <div className="space-y-8 lg:space-y-10">{children}</div>
              {steps}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}