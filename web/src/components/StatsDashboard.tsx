interface Props {
	data: {
		totalFacilities?: number
		byType?: Record<string, number>
		byProvince?: Record<string, number>
		topCities?: Array<{ city: string; count: number }>
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

function ProgressBar({ value, max, width = 15 }: { value: number; max: number; width?: number }) {
	const filled = Math.round((value / max) * width)
	const empty = width - filled
	return (
		<div className="flex items-center gap-2">
			<div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
				<div
					className="h-full bg-blue-600 transition-all"
					style={{ width: `${(value / max) * 100}%` }}
				></div>
			</div>
			<span className="text-xs text-gray-600 font-mono w-12 text-right">
				{((value / max) * 100).toFixed(1)}%
			</span>
		</div>
	)
}

export function StatsDashboard({ data }: Props) {
	const total = data.totalFacilities || 0
	const byType = data.byType || {}
	const byProvince = data.byProvince || {}
	const topCities = data.topCities || []

	const sortedTypes = Object.entries(byType).sort((a, b) => b[1] - a[1])
	const maxByType = Math.max(...Object.values(byType), 1)

	const sortedProvinces = Object.entries(byProvince)
		.filter(([code]) => code !== '..')
		.sort((a, b) => b[1] - a[1])

	return (
		<div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 space-y-8">
			{/* Header */}
			<div className="text-center pb-6 border-b border-gray-200">
				<h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
					📊 ODCAF Cultural Facilities Dashboard
				</h1>
				<p className="text-gray-600">🇨🇦 Open Database of Cultural and Art Facilities - Canada</p>
			</div>

			{/* Total */}
			<div className="text-center">
				<div className="text-4xl font-bold text-blue-600 mb-2">{total.toLocaleString()}</div>
				<div className="text-lg text-gray-600">Total Facilities</div>
			</div>

			{/* By Type */}
			<div>
				<h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">🏷️ By Facility Type</h2>
				<div className="space-y-4">
					{sortedTypes.map(([type, count]) => {
						const icon = getTypeIcon(type)
						const pct = ((count / total) * 100).toFixed(1)
						return (
							<div key={type} className="space-y-1">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<span className="text-xl">{icon}</span>
										<span className="font-semibold text-gray-900">{type}</span>
									</div>
									<span className="text-sm font-medium text-gray-600">
										{count.toLocaleString()} ({pct}%)
									</span>
								</div>
								<ProgressBar value={count} max={maxByType} />
							</div>
						)
					})}
				</div>
			</div>

			{/* By Province */}
			<div>
				<h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">🗺️ By Province/Territory</h2>
				<div className="overflow-x-auto">
					<table className="w-full text-sm">
						<thead>
							<tr className="border-b border-gray-200">
								<th className="text-left py-2 font-semibold text-gray-700">Province</th>
								<th className="text-right py-2 font-semibold text-gray-700">Count</th>
								<th className="text-right py-2 font-semibold text-gray-700">%</th>
							</tr>
						</thead>
						<tbody>
							{sortedProvinces.map(([code, count]) => {
								const name = getProvinceName(code)
								const pct = ((count / total) * 100).toFixed(1)
								return (
									<tr key={code} className="border-b border-gray-100">
										<td className="py-2">
											🍁 {name} ({code})
										</td>
										<td className="text-right py-2 font-medium">{count.toLocaleString()}</td>
										<td className="text-right py-2 text-gray-600">{pct}%</td>
									</tr>
								)
							})}
						</tbody>
					</table>
				</div>
			</div>

			{/* Top Cities */}
			<div>
				<h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">🏙️ Top 10 Cities</h2>
				<div className="space-y-2">
					{topCities.map((item, idx) => {
						const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}.`
						return (
							<div key={item.city} className="flex items-center justify-between p-2 bg-gray-50 rounded">
								<span className="font-medium text-gray-900">
									{medal} {item.city}
								</span>
								<span className="text-sm text-gray-600">{item.count.toLocaleString()} facilities</span>
							</div>
						)
					})}
				</div>
			</div>
		</div>
	)
}
