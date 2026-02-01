interface Facility {
	index: number
	facilityName: string
	odcafFacilityType: string
	city: string
	provTerr: string
	streetNo: string
	streetName: string
	postalCode: string
	latitude: number | null
	longitude: number | null
	provider: string
}

interface Props {
	data: {
		facility?: Facility
		id?: number
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

export function FacilityCard({ data, theme = 'light' }: Props) {
	const facility = data.facility

	const bgClass = theme === 'dark' ? 'bg-gray-800' : 'bg-white'
	const textClass = theme === 'dark' ? 'text-white' : 'text-gray-900'
	const textSecondaryClass = theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
	const borderClass = theme === 'dark' ? 'border-gray-700' : 'border-gray-200'

	if (!facility) {
		return (
			<div className={`p-6 rounded-lg shadow-sm border ${bgClass} ${borderClass}`}>
				<p className={textSecondaryClass}>Facility not found</p>
			</div>
		)
	}

	const icon = getTypeIcon(facility.odcafFacilityType)
	const provinceName = getProvinceName(facility.provTerr)
	const address = [facility.streetNo, facility.streetName].filter(Boolean).join(' ')
	const mapUrl =
		facility.latitude && facility.longitude
			? `https://www.google.com/maps?q=${facility.latitude},${facility.longitude}`
			: null

	return (
		<div className={`p-6 rounded-lg shadow-sm border ${bgClass} ${borderClass}`}>
			<div className="mb-6">
				<div className="flex items-center gap-3 mb-2">
					<span className="text-4xl">{icon}</span>
					<div>
						<h2 className={`text-2xl font-bold ${textClass}`}>{facility.facilityName}</h2>
						<div className="mt-1">
							<span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
								{facility.odcafFacilityType.toUpperCase()}
							</span>
						</div>
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div className="space-y-3">
					<div>
						<label className={`text-xs font-semibold uppercase tracking-wide ${textSecondaryClass}`}>City</label>
						<p className={`font-medium ${textClass}`}>{facility.city}</p>
					</div>
					<div>
						<label className={`text-xs font-semibold uppercase tracking-wide ${textSecondaryClass}`}>Province</label>
						<p className={`font-medium ${textClass}`}>
							{provinceName} ({facility.provTerr})
						</p>
					</div>
					{address && (
						<div>
							<label className={`text-xs font-semibold uppercase tracking-wide ${textSecondaryClass}`}>Address</label>
							<p className={`font-medium ${textClass}`}>{address}</p>
						</div>
					)}
					{facility.postalCode && facility.postalCode !== '..' && (
						<div>
							<label className={`text-xs font-semibold uppercase tracking-wide ${textSecondaryClass}`}>
								Postal Code
							</label>
							<p className={`font-medium font-mono ${textClass}`}>{facility.postalCode}</p>
						</div>
					)}
				</div>

				<div className="space-y-3">
					{facility.latitude && facility.longitude && (
						<div>
							<label className={`text-xs font-semibold uppercase tracking-wide ${textSecondaryClass}`}>
								Coordinates
							</label>
							<p className={`font-medium font-mono text-sm ${textClass}`}>
								{facility.latitude.toFixed(4)}, {facility.longitude.toFixed(4)}
							</p>
						</div>
					)}
					{mapUrl && (
						<div>
							<a
								href={mapUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
							>
								📍 View on Google Maps
							</a>
						</div>
					)}
					{facility.provider && (
						<div>
							<label className={`text-xs font-semibold uppercase tracking-wide ${textSecondaryClass}`}>
								Data Source
							</label>
							<p className={`font-medium text-sm ${textClass}`}>{facility.provider}</p>
						</div>
					)}
					<div>
						<label className={`text-xs font-semibold uppercase tracking-wide ${textSecondaryClass}`}>ID</label>
						<p className={`font-medium font-mono text-sm ${textClass}`}>{facility.index}</p>
					</div>
				</div>
			</div>
		</div>
	)
}
