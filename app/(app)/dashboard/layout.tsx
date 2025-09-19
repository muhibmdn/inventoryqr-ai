import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="flex min-h-dvh">
			<Sidebar />
			<div className="flex w-full flex-col">
				<Topbar title="Dashboard" />
				<main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
					{children}
				</main>
			</div>
		</div>
	);
}
