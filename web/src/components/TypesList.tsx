interface Props {
	data: {
		types?: string[]
	}
	theme?: 'light' | 'dark'
}

const TYPE_ICONS: Record<string, string> = {
	museum: '🏛️',
	gallery: '🖼️',
	'library or archives': '📚',
	'theatre/performance and concert hall': '🎭',
	'heritage or historic site': '🏰',
	'festival site': '🎪',
	'art or cultural centre': '🎨',
	artist: '👨‍🎨',
	miscellaneous: '📍',
}

function getTypeIcon(type: string): string {
	return TYPE_ICONS[type.toLowerCase()] || '📍'
}

export function TypesList({ data, theme = 'light' }: Props) {
	const types = data.types || []

	const bgClass = theme === 'dark' ? 'bg-gray-800' : 'bg-white'
	const textClass = theme === 'dark' ? 'text-white' : 'text-gray-900'
	const textSecondaryClass = theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
	const borderClass = theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
	const bgSecondaryClass = theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'

	return (
		<div className={`p-6 rounded-lg shadow-sm border ${bgClass} ${borderClass}`}>
			<div className="mb-6">
				<h2 className={`text-2xl font-bold mb-2 flex items-center gap-2 ${textClass}`}>🏷️ Cultural Facility Types</h2>
				<p className={textSecondaryClass}>Available categories in the ODCAF database</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
				{types.map(type => {
					const icon = getTypeIcon(type)
					return (
						<div
							key={type}
							className={`flex items-center gap-3 p-3 rounded-lg border hover:border-blue-500 transition-colors ${bgSecondaryClass} ${borderClass}`}
						>
							<span className="text-2xl">{icon}</span>
							<span className={`font-medium ${textClass}`}>{type}</span>
						</div>
					)
				})}
			</div>

			<div className={`mt-6 pt-4 border-t ${borderClass}`}>
				<p className={`text-sm text-center ${textSecondaryClass}`}>
					{types.length} facility types available
				</p>
				<p className="text-xs text-gray-400 text-center mt-1">
					💡 Use these in the <strong>filter</strong> tool with <code className="bg-gray-100 px-1 rounded">facilityType</code> parameter
				</p>
			</div>
		</div>
	)
}
