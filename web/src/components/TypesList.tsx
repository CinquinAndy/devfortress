interface Props {
	data: {
		types?: string[]
	}
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

export function TypesList({ data }: Props) {
	const types = data.types || []

	return (
		<div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
			<div className="mb-6">
				<h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">🏷️ Cultural Facility Types</h2>
				<p className="text-gray-600">Available categories in the ODCAF database</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
				{types.map(type => {
					const icon = getTypeIcon(type)
					return (
						<div
							key={type}
							className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-blue-50 transition-colors"
						>
							<span className="text-2xl">{icon}</span>
							<span className="font-medium text-gray-900">{type}</span>
						</div>
					)
				})}
			</div>

			<div className="mt-6 pt-4 border-t border-gray-200">
				<p className="text-sm text-gray-500 text-center">
					{types.length} facility types available
				</p>
				<p className="text-xs text-gray-400 text-center mt-1">
					💡 Use these in the <strong>filter</strong> tool with <code className="bg-gray-100 px-1 rounded">facilityType</code> parameter
				</p>
			</div>
		</div>
	)
}
