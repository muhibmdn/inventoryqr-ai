import { Suspense, type ReactNode } from "react";
import { cookies } from "next/headers";

import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";

import { FIRST_VISIT_COOKIE } from "./constants";
import { FirstVisitSetter } from "./_components/FirstVisitSetter.client";
import SkeletonDashboard from "./loading";

type DashboardLayoutProps = {
  children: ReactNode;
  steps: ReactNode;
};

export default async function DashboardLayout({ children, steps }: DashboardLayoutProps) {
  const cookieStore = await cookies();
  const hasVisited = Boolean(cookieStore.get(FIRST_VISIT_COOKIE));

  const mainContent = (
    <main className="flex-1 overflow-y-auto px-6 py-6 lg:px-10">
      <div className="w-full">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr),minmax(260px,320px)] lg:items-start">
          <div className="space-y-8 lg:space-y-10">{children}</div>
          {steps}
        </div>
      </div>
    </main>
  );

  return (
    <div className="bg-success-surface text-foreground-muted">
      <div className="grid min-h-dvh w-full grid-cols-1 md:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)]">
        <Sidebar />
        <div className="flex min-w-0 flex-col">
          <Topbar />
          {hasVisited ? null : <FirstVisitSetter />}
          <Suspense fallback={hasVisited ? null : <SkeletonDashboard />}>{mainContent}</Suspense>
        </div>
      </div>
    </div>
  );
}
