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

export function FacilityCard({ data }: Props) {
	const facility = data.facility

	if (!facility) {
		return (
			<div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
				<p className="text-gray-600">Facility not found</p>
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
		<div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
			<div className="mb-6">
				<div className="flex items-center gap-3 mb-2">
					<span className="text-4xl">{icon}</span>
					<div>
						<h2 className="text-2xl font-bold text-gray-900">{facility.facilityName}</h2>
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
						<label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">City</label>
						<p className="text-gray-900 font-medium">{facility.city}</p>
					</div>
					<div>
						<label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Province</label>
						<p className="text-gray-900 font-medium">
							{provinceName} ({facility.provTerr})
						</p>
					</div>
					{address && (
						<div>
							<label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Address</label>
							<p className="text-gray-900 font-medium">{address}</p>
						</div>
					)}
					{facility.postalCode && facility.postalCode !== '..' && (
						<div>
							<label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
								Postal Code
							</label>
							<p className="text-gray-900 font-medium font-mono">{facility.postalCode}</p>
						</div>
					)}
				</div>

				<div className="space-y-3">
					{facility.latitude && facility.longitude && (
						<div>
							<label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
								Coordinates
							</label>
							<p className="text-gray-900 font-medium font-mono text-sm">
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
							<label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
								Data Source
							</label>
							<p className="text-gray-900 font-medium text-sm">{facility.provider}</p>
						</div>
					)}
					<div>
						<label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">ID</label>
						<p className="text-gray-900 font-medium font-mono text-sm">{facility.index}</p>
					</div>
				</div>
			</div>
		</div>
	)
}
