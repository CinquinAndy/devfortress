interface Props {
	id: number
	name: string
	type: string
	city: string
	province: string
	icon: string
}

export function FacilityPreview({ id, name, type, city, province, icon }: Props) {
	const handleClick = () => {
		if (window.openai?.callTool) {
			window.openai.callTool('fetch', { id })
		}
	}

	return (
		<button
			onClick={handleClick}
			className="w-full text-left p-4 bg-gray-50 hover:bg-blue-50 border border-gray-200 rounded-lg transition-colors group"
		>
			<div className="flex items-start gap-3">
				<div className="text-2xl flex-shrink-0">{icon}</div>
				<div className="flex-1 min-w-0">
					<h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
						{name}
					</h3>
					<div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
						<span>📍 {city}, {province}</span>
						<span>•</span>
						<span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
							{type}
						</span>
					</div>
					<div className="mt-2 text-xs text-gray-400 font-mono">ID: {id}</div>
				</div>
			</div>
		</button>
	)
}
