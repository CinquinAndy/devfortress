import type { CSSProperties } from 'react'

interface StatsData {
	totalFacilities: number
	byProvince: Array<{ province: string; count: number }>
	byType: Array<{ type: string; count: number }>
}

interface Props {
	data: StatsData
	theme?: 'light' | 'dark'
}

function StatBar({
	label,
	count,
	total,
	color,
	theme,
}: {
	label: string
	count: number
	total: number
	color: string
	theme: 'light' | 'dark'
}) {
	const percentage = total > 0 ? (count / total) * 100 : 0
	const isDark = theme === 'dark'

	const containerStyle: CSSProperties = {
		marginBottom: '1rem',
	}

	const labelRowStyle: CSSProperties = {
		display: 'flex',
		justifyContent: 'space-between',
		marginBottom: '0.25rem',
		fontSize: '0.875rem',
	}

	const labelStyle: CSSProperties = {
		fontWeight: 600,
		color: isDark ? '#ffffff' : '#111827',
	}

	const countStyle: CSSProperties = {
		fontWeight: 700,
		color,
	}

	const barBgStyle: CSSProperties = {
		width: '100%',
		height: '0.75rem',
		backgroundColor: isDark ? '#374151' : '#e5e7eb',
		borderRadius: '9999px',
		overflow: 'hidden',
	}

	const barFillStyle: CSSProperties = {
		height: '100%',
		width: `${percentage}%`,
		backgroundColor: color,
		transition: 'width 0.5s ease',
		borderRadius: '9999px',
	}

	return (
		<div style={containerStyle}>
			<div style={labelRowStyle}>
				<span style={labelStyle}>{label}</span>
				<span style={countStyle}>{count.toLocaleString()}</span>
			</div>
			<div style={barBgStyle}>
				<div style={barFillStyle} />
			</div>
		</div>
	)
}

export function StatsWidget({ data, theme = 'light' }: Props) {
	const isDark = theme === 'dark'

	const containerStyle: CSSProperties = {
		minHeight: '100vh',
		padding: '2rem',
		backgroundColor: isDark ? '#111827' : '#f9fafb',
	}

	const maxWidthStyle: CSSProperties = {
		maxWidth: '1280px',
		margin: '0 auto',
	}

	const headerStyle: CSSProperties = {
		padding: '1.5rem',
		borderRadius: '1rem',
		boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
		backgroundColor: isDark ? '#1f2937' : '#ffffff',
		border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
		marginBottom: '2rem',
		textAlign: 'center',
	}

	const titleStyle: CSSProperties = {
		fontSize: '2rem',
		fontWeight: 700,
		color: isDark ? '#ffffff' : '#111827',
		marginBottom: '0.5rem',
	}

	const totalStyle: CSSProperties = {
		fontSize: '3rem',
		fontWeight: 700,
		color: '#3b82f6',
		margin: 0,
	}

	const cardStyle: CSSProperties = {
		padding: '1.5rem',
		borderRadius: '1rem',
		boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
		backgroundColor: isDark ? '#1f2937' : '#ffffff',
		border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
		marginBottom: '1.5rem',
	}

	const cardTitleStyle: CSSProperties = {
		fontSize: '1.25rem',
		fontWeight: 700,
		color: isDark ? '#ffffff' : '#111827',
		marginBottom: '1.5rem',
		display: 'flex',
		alignItems: 'center',
		gap: '0.5rem',
	}

	const gridStyle: CSSProperties = {
		display: 'grid',
		gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
		gap: '1.5rem',
	}

	const provinceColors = [
		'#3b82f6',
		'#ef4444',
		'#10b981',
		'#f59e0b',
		'#8b5cf6',
		'#ec4899',
		'#14b8a6',
		'#f97316',
		'#06b6d4',
		'#84cc16',
	]

	const typeColors = ['#6366f1', '#f43f5e', '#22c55e', '#eab308', '#a855f7', '#ec4899', '#14b8a6', '#f97316']

	const topProvinces = [...data.byProvince].sort((a, b) => b.count - a.count).slice(0, 10)

	const topTypes = [...data.byType].sort((a, b) => b.count - a.count).slice(0, 8)

	return (
		<div style={containerStyle}>
			<div style={maxWidthStyle}>
				{/* Header */}
				<div style={headerStyle}>
					<div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
					<h2 style={titleStyle}>Statistics Dashboard</h2>
					<div style={totalStyle}>{data.totalFacilities.toLocaleString()}</div>
					<p style={{ fontSize: '1rem', color: isDark ? '#d1d5db' : '#6b7280', margin: 0 }}>
						Cultural Facilities in Canada
					</p>
				</div>

				{/* Grid of charts */}
				<div style={gridStyle}>
					{/* By Province */}
					<div style={cardStyle}>
						<h3 style={cardTitleStyle}>
							<span>🗺️</span>
							<span>Top Provinces</span>
						</h3>
						{topProvinces.map((item, idx) => (
							<StatBar
								key={item.province}
								label={item.province}
								count={item.count}
								total={data.totalFacilities}
								color={provinceColors[idx % provinceColors.length]}
								theme={theme}
							/>
						))}
					</div>

					{/* By Type */}
					<div style={cardStyle}>
						<h3 style={cardTitleStyle}>
							<span>🏛️</span>
							<span>Top Facility Types</span>
						</h3>
						{topTypes.map((item, idx) => (
							<StatBar
								key={item.type}
								label={item.type}
								count={item.count}
								total={data.totalFacilities}
								color={typeColors[idx % typeColors.length]}
								theme={theme}
							/>
						))}
					</div>
				</div>
			</div>
		</div>
	)
}
