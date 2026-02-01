interface Props {
	id: number
	name: string
	type: string
	city: string
	province: string
	icon: string
	theme?: 'light' | 'dark'
}

export function FacilityPreview({ id, name, type, city, province, icon, theme = 'light' }: Props) {
	const handleClick = () => {
		if (window.openai?.callTool) {
			window.openai.callTool('fetch', { id })
		}
	}

	const bgClass = theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'
	const hoverBgClass = theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-blue-50'
	const borderClass = theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
	const textClass = theme === 'dark' ? 'text-white' : 'text-gray-900'
	const textSecondaryClass = theme === 'dark' ? 'text-gray-400' : 'text-gray-600'

	return (
		<button
			onClick={handleClick}
			className={`w-full text-left p-4 border rounded-lg transition-colors group ${bgClass} ${hoverBgClass} ${borderClass}`}
		>
			<div className="flex items-start gap-3">
				<div className="text-2xl flex-shrink-0">{icon}</div>
				<div className="flex-1 min-w-0">
					<h3 className={`font-semibold group-hover:text-blue-600 transition-colors truncate ${textClass}`}>
						{name}
					</h3>
					<div className={`mt-1 flex items-center gap-2 text-sm ${textSecondaryClass}`}>
						<span>📍 {city}, {province}</span>
						<span>•</span>
						<span className="px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 rounded text-xs font-medium">
							{type}
						</span>
					</div>
					<div className="mt-2 text-xs text-gray-400 font-mono">ID: {id}</div>
				</div>
			</div>
		</button>
	)
}
