export function Topbar({ title }: { title: string }) {
	return (
		<div className="sticky top-0 z-30 border-b bg-white/80 backdrop-blur">
			<div className="mx-auto max-w-6xl px-4 h-12 flex items-center">
				{title}
			</div>
		</div>
	);
}
