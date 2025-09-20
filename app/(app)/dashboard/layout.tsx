import { Suspense, type ReactNode } from "react";

import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";

import DashboardLoading from "./loading";

type DashboardLayoutProps = {
  children: ReactNode;
  steps: ReactNode;
};

export default function DashboardLayout({ children, steps }: DashboardLayoutProps) {
  return (
    <div className="bg-success-surface text-foreground-muted">
      <div className="mx-auto grid min-h-dvh w-full max-w-[1440px] grid-cols-1 md:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)]">
        <Sidebar />
        <div className="flex flex-col">
          <Topbar />
          <Suspense fallback={<DashboardLoading />}>
            <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-10">
              <div className="mx-auto w-full max-w-6xl">
                <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr),minmax(260px,320px)] lg:items-start">
                  <div className="space-y-8 lg:space-y-10">{children}</div>
                  {steps}
                </div>
              </div>
            </main>
          </Suspense>
        </div>
      </div>
    </div>
  );
}
