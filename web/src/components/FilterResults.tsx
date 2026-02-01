import { FacilityPreview } from './FacilityPreview'

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
		filters?: {
			province?: string
			city?: string
			facilityType?: string
		}
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

const PROVINCE_NAMES: Record<string, string> = {
	ON: 'Ontario',
	QC: 'Québec',
	BC: 'British Columbia',
	AB: 'Alberta',
	SK: 'Saskatchewan',
	MB: 'Manitoba',
	NB: 'New Brunswick',
	NS: 'Nova Scotia',
	NL: 'Newfoundland & Labrador',
	PE: 'Prince Edward Island',
	NT: 'Northwest Territories',
	YT: 'Yukon',
	NU: 'Nunavut',
}

function getTypeIcon(type: string): string {
	return TYPE_ICONS[type.toLowerCase()] || '📍'
}

function getProvinceName(code: string): string {
	return PROVINCE_NAMES[code] || code
}

export function FilterResults({ data, theme = 'light' }: Props) {
	const filters = data.filters || {}
	const preview = data.preview || []
	const totalCount = data.totalCount || 0

	const filterDesc = []
	if (filters.province) filterDesc.push(`Province: ${getProvinceName(filters.province)}`)
	if (filters.city) filterDesc.push(`City: ${filters.city}`)
	if (filters.facilityType) filterDesc.push(`Type: ${filters.facilityType}`)

	const bgClass = theme === 'dark' ? 'bg-gray-800' : 'bg-white'
	const textClass = theme === 'dark' ? 'text-white' : 'text-gray-900'
	const textSecondaryClass = theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
	const borderClass = theme === 'dark' ? 'border-gray-700' : 'border-gray-200'

	if (preview.length === 0) {
		return (
			<div className={`p-6 rounded-lg shadow-sm border ${bgClass} ${borderClass}`}>
				<div className="text-center py-8">
					<div className="text-4xl mb-4">🎯</div>
					<h2 className={`text-xl font-semibold mb-2 ${textClass}`}>No Results Found</h2>
					<p className={textSecondaryClass}>No facilities match your filters</p>
				</div>
			</div>
		)
	}

	return (
		<div className={`p-6 rounded-lg shadow-sm border ${bgClass} ${borderClass}`}>
			<div className="mb-6">
				<h2 className={`text-2xl font-bold mb-2 flex items-center gap-2 ${textClass}`}>🎯 Filtered Results</h2>
				{filterDesc.length > 0 && (
					<p className={`mb-2 ${textSecondaryClass}`}>{filterDesc.join(' • ')}</p>
				)}
				<p className="text-gray-600">
					<span className="font-semibold text-blue-600">{totalCount.toLocaleString()}</span> facilities found
				</p>
			</div>

			<div className="space-y-3">
				{preview.map((item, idx) => (
					<div key={item.id} className="flex items-center gap-3">
						<div className="flex-shrink-0 w-8 text-center text-gray-400 font-semibold">#{idx + 1}</div>
						<div className="flex-1">
							<FacilityPreview
								id={item.id}
								name={item.name}
								type={item.type}
								city={item.city}
								province={item.province}
								icon={getTypeIcon(item.type)}
								theme={theme}
							/>
						</div>
					</div>
				))}
			</div>

			{totalCount > preview.length && (
				<div className={`mt-6 pt-4 border-t ${borderClass}`}>
					<p className={`text-sm text-center ${textSecondaryClass}`}>
						Showing {preview.length} of {totalCount.toLocaleString()} • Increase <code className="bg-gray-100 px-1 rounded">limit</code> for more
					</p>
				</div>
			)}
		</div>
	)
}
