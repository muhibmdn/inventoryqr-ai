import { MarketingNavbar } from "@/src/components/marketing/navbar";
import { MarketingFooter } from "@/src/components/marketing/footer";

export default function MarketingLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="flex min-h-dvh flex-col">
			<MarketingNavbar />
			<main className="flex-1">{children}</main>
			<MarketingFooter />
		</div>
	);
}
