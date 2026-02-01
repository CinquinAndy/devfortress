import type { CSSProperties } from 'react'
import { FacilityCard } from './shared/FacilityCard'

interface FilterResult {
	ids: number[]
	totalCount: number
	preview: Array<{
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

export function FilterResults({ data, theme = 'light' }: Props) {
	const result: FilterResult = {
		ids: data.ids || [],
		totalCount: data.totalCount || 0,
		preview: data.preview || [],
		filters: data.filters,
	}

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

	const headerBoxStyle: CSSProperties = {
		padding: '1.5rem',
		borderRadius: '1rem',
		boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
		backgroundColor: isDark ? '#1f2937' : '#ffffff',
		border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
		marginBottom: '2rem',
	}

	const headerTitleContainerStyle: CSSProperties = {
		display: 'flex',
		alignItems: 'center',
		gap: '0.75rem',
		marginBottom: '1rem',
	}

	const headerTitleStyle: CSSProperties = {
		fontSize: '1.5rem',
		fontWeight: 700,
		color: isDark ? '#ffffff' : '#111827',
		margin: 0,
	}

	const filterChipsContainerStyle: CSSProperties = {
		display: 'flex',
		flexWrap: 'wrap',
		gap: '0.5rem',
		marginBottom: '1rem',
	}

	const chipStyle: CSSProperties = {
		display: 'inline-block',
		padding: '0.375rem 0.75rem',
		borderRadius: '9999px',
		fontSize: '0.875rem',
		fontWeight: 500,
		backgroundColor: isDark ? '#065f46' : '#d1fae5',
		color: isDark ? '#6ee7b7' : '#065f46',
	}

	const countStyle: CSSProperties = {
		fontWeight: 700,
		color: '#3b82f6',
	}

	const masonryStyle: CSSProperties = {
		columnCount: 'auto',
		columnWidth: '300px',
		columnGap: '1rem',
	}

	// Build active filters display
	const activeFilters = []
	if (result.filters?.province) activeFilters.push(`Province: ${result.filters.province}`)
	if (result.filters?.city) activeFilters.push(`City: ${result.filters.city}`)
	if (result.filters?.facilityType) activeFilters.push(`Type: ${result.filters.facilityType}`)

	return (
		<div style={containerStyle}>
			<div style={maxWidthStyle}>
				{/* Header */}
				<div style={headerBoxStyle}>
					<div style={headerTitleContainerStyle}>
						<div style={{ fontSize: '2rem' }}>🔎</div>
						<h2 style={headerTitleStyle}>Filter Results</h2>
					</div>

					{/* Active filters */}
					{activeFilters.length > 0 && (
						<div style={filterChipsContainerStyle}>
							{activeFilters.map((filter, idx) => (
								<span key={idx} style={chipStyle}>
									{filter}
								</span>
							))}
						</div>
					)}

					<p style={{ fontSize: '1rem', color: isDark ? '#d1d5db' : '#4b5563', margin: 0 }}>
						Found <span style={countStyle}>{result.totalCount.toLocaleString()}</span> facilities
					</p>
				</div>

				{/* Masonry Grid */}
				<div style={masonryStyle}>
					{result.preview.map(item => (
						<FacilityCard
							key={item.id}
							id={item.id}
							name={item.name}
							type={item.type}
							city={item.city}
							province={item.province}
							theme={theme}
						/>
					))}
				</div>

				{/* Footer */}
				{result.totalCount > result.preview.length && (
					<div
						style={{
							marginTop: '2rem',
							padding: '1.5rem',
							borderRadius: '1rem',
							boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
							backgroundColor: isDark ? '#1f2937' : '#ffffff',
							border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
							textAlign: 'center',
						}}
					>
						<p style={{ fontSize: '1rem', fontWeight: 500, color: isDark ? '#ffffff' : '#111827', margin: 0 }}>
							📊 Showing {result.preview.length} of {result.totalCount.toLocaleString()} results
						</p>
					</div>
				)}
			</div>
		</div>
	)
}
