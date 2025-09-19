export function MarketingFooter() {
	return (
		<footer className="border-t bg-white">
			<div className="mx-auto max-w-6xl px-4 py-6 text-sm text-gray-600 flex items-center justify-between">
				<p>© {new Date().getFullYear()} Invee-ai</p>
				<div className="flex items-center gap-4">
					<a className="hover:underline" href="#">
						Instagram
					</a>
					<a className="hover:underline" href="#">
						GitHub
					</a>
				</div>
			</div>
		</footer>
	);
}
