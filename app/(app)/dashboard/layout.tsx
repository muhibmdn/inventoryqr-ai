import { Suspense, type ReactNode } from "react";
import { cookies } from "next/headers";

import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";

import SkeletonDashboard from "./loading";

const FIRST_VISIT_COOKIE = "inventoryqr.firstVisit";

type DashboardLayoutProps = {
  children: ReactNode;
  steps: ReactNode;
};

export default async function DashboardLayout({ children, steps }: DashboardLayoutProps) {
  const cookieStore = await cookies();
  const hasVisited = Boolean(cookieStore.get(FIRST_VISIT_COOKIE));

  if (!hasVisited) {
    cookieStore.set(FIRST_VISIT_COOKIE, "1", {
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      httpOnly: false,
    });
  }

  const mainContent = (
    <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto w-full max-w-6xl">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr),minmax(260px,320px)] lg:items-start">
          <div className="space-y-8 lg:space-y-10">{children}</div>
          {steps}
        </div>
      </div>
    </main>
  );

  return (
    <div className="bg-success-surface text-foreground-muted">
      <div className="mx-auto grid min-h-dvh w-full max-w-[1440px] grid-cols-1 md:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)]">
        <Sidebar />
        <div className="flex flex-col">
          <Topbar />
          <Suspense fallback={hasVisited ? null : <SkeletonDashboard />}>{mainContent}</Suspense>
        </div>
      </div>
    </div>
  );
}
