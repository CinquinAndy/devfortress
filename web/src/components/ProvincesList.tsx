interface Props {
	data: {
		provinces?: Array<{ code: string; count: number }>
	}
	theme?: 'light' | 'dark'
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

function getProvinceName(code: string): string {
	return PROVINCE_NAMES[code] || code
}

function ProgressBar({ value, max, width = 12 }: { value: number; max: number; width?: number }) {
	const filled = Math.round((value / max) * width)
	return (
		<div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
			<div
				className="h-full bg-blue-600 transition-all"
				style={{ width: `${(value / max) * 100}%` }}
			></div>
		</div>
	)
}

export function ProvincesList({ data, theme = 'light' }: Props) {
	const provinces = data.provinces || []
	const total = provinces.reduce((sum, p) => sum + p.count, 0)
	const maxCount = Math.max(...provinces.map(p => p.count), 1)

	const bgClass = theme === 'dark' ? 'bg-gray-800' : 'bg-white'
	const textClass = theme === 'dark' ? 'text-white' : 'text-gray-900'
	const textSecondaryClass = theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
	const borderClass = theme === 'dark' ? 'border-gray-700' : 'border-gray-200'

	return (
		<div className={`p-6 rounded-lg shadow-sm border ${bgClass} ${borderClass}`}>
			<div className="mb-6">
				<h2 className={`text-2xl font-bold mb-2 flex items-center gap-2 ${textClass}`}>🗺️ Provinces & Territories</h2>
				<p className={textSecondaryClass}>Cultural facilities across Canada</p>
			</div>

			<div className="space-y-3">
				{provinces
					.filter(p => p.code !== '..')
					.map(p => {
						const name = getProvinceName(p.code)
						const pct = ((p.count / total) * 100).toFixed(1)
						return (
							<div key={p.code} className="space-y-1">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<span className="text-lg">🍁</span>
										<span className={`font-semibold ${textClass}`}>{name}</span>
										<span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-0.5 rounded">
											{p.code}
										</span>
									</div>
									<span className={`text-sm font-medium ${textSecondaryClass}`}>
										{p.count.toLocaleString()} ({pct}%)
									</span>
								</div>
								<ProgressBar value={p.count} max={maxCount} />
							</div>
						)
					})}
			</div>

			<div className={`mt-6 pt-4 border-t ${borderClass}`}>
				<p className={`text-sm text-center ${textSecondaryClass}`}>
					Total: <span className="font-semibold">{total.toLocaleString()}</span> facilities across{' '}
					<span className="font-semibold">{provinces.length}</span> provinces/territories
				</p>
				<p className="text-xs text-gray-400 text-center mt-1">
					💡 Use province codes in <strong>filter</strong> tool: <code className="bg-gray-100 px-1 rounded">province: "ON"</code>, <code className="bg-gray-100 px-1 rounded">province: "QC"</code>, etc.
				</p>
			</div>
		</div>
	)
}
