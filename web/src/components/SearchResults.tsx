import { FacilityPreview } from './FacilityPreview'

interface SearchResult {
	ids: number[]
	totalCount: number
	preview: Array<{
		id: number
		name: string
		type: string
		city: string
		province: string
	}>
	query?: string
}

interface Props {
	data: {
		ids?: number[]
		totalCount?: number
		preview?: Array<{
			id: number
			name: string
			type: string
			city: string
			province: string
		}>
		query?: string
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

export function SearchResults({ data, theme = 'light' }: Props) {
	const result: SearchResult = {
		ids: data.ids || [],
		totalCount: data.totalCount || 0,
		preview: data.preview || [],
		query: data.query,
	}

	const bgClass = theme === 'dark' ? 'bg-gray-800' : 'bg-white'
	const textClass = theme === 'dark' ? 'text-white' : 'text-gray-900'
	const textSecondaryClass = theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
	const borderClass = theme === 'dark' ? 'border-gray-700' : 'border-gray-200'

	if (result.preview.length === 0) {
		return (
			<div className={`p-6 rounded-lg shadow-sm border ${bgClass} ${borderClass}`}>
				<div className="text-center py-8">
					<div className="text-4xl mb-4">🔍</div>
					<h2 className={`text-xl font-semibold mb-2 ${textClass}`}>No Results Found</h2>
					{result.query && (
						<p className={`mb-4 ${textSecondaryClass}`}>No facilities found matching "{result.query}"</p>
					)}
					<div className={`text-sm space-y-1 ${textSecondaryClass}`}>
						<p>💡 Try:</p>
						<ul className="list-disc list-inside space-y-1">
							<li>Using broader search terms</li>
							<li>Checking spelling</li>
							<li>Searching by city or province code (ON, QC, BC...)</li>
						</ul>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className={`p-6 rounded-lg shadow-sm border ${bgClass} ${borderClass}`}>
			<div className="mb-6">
				<h2 className={`text-2xl font-bold mb-2 flex items-center gap-2 ${textClass}`}>
					🔍 Search Results
				</h2>
				{result.query ? (
					<p className={textSecondaryClass}>
						Found <span className="font-semibold text-blue-600">{result.totalCount.toLocaleString()}</span>{' '}
						facilities matching <span className="font-semibold">"{result.query}"</span>
					</p>
				) : (
					<p className={textSecondaryClass}>
						Found <span className="font-semibold text-blue-600">{result.totalCount.toLocaleString()}</span>{' '}
						facilities
					</p>
				)}
			</div>

			<div className="space-y-3">
				{result.preview.map(item => (
					<FacilityPreview
						key={item.id}
						id={item.id}
						name={item.name}
						type={item.type}
						city={item.city}
						province={item.province}
						icon={getTypeIcon(item.type)}
						theme={theme}
					/>
				))}
			</div>

			{result.totalCount > result.preview.length && (
				<div className={`mt-6 pt-4 border-t ${borderClass}`}>
					<p className={`text-sm text-center ${textSecondaryClass}`}>
						📊 Showing {result.preview.length} of {result.totalCount.toLocaleString()} results
					</p>
					<p className="text-xs text-gray-400 text-center mt-1">
						💡 Use <strong>filter</strong> tool for more specific results
					</p>
				</div>
			)}
		</div>
	)
}
