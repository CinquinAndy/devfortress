import { CSSProperties } from 'react'
import { FacilityCard } from './shared/FacilityCard'

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

export function SearchResults({ data, theme = 'light' }: Props) {
	const result: SearchResult = {
		ids: data.ids || [],
		totalCount: data.totalCount || 0,
		preview: data.preview || [],
		query: data.query,
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

	const headerTextStyle: CSSProperties = {
		fontSize: '1rem',
		color: isDark ? '#d1d5db' : '#4b5563',
		margin: 0,
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

	const footerStyle: CSSProperties = {
		marginTop: '2rem',
		padding: '1.5rem',
		borderRadius: '1rem',
		boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
		backgroundColor: isDark ? '#1f2937' : '#ffffff',
		border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
		textAlign: 'center',
	}

	const footerTextStyle: CSSProperties = {
		fontSize: '1rem',
		fontWeight: 500,
		color: isDark ? '#ffffff' : '#111827',
		margin: 0,
	}

	if (result.preview.length === 0) {
		return (
			<div style={containerStyle}>
				<div style={{ ...maxWidthStyle, maxWidth: '672px' }}>
					<div style={{ ...headerBoxStyle, padding: '3rem', textAlign: 'center' }}>
						<div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🔍</div>
						<h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: isDark ? '#ffffff' : '#111827' }}>
							No Results Found
						</h2>
						{result.query && (
							<p style={{ fontSize: '1.125rem', marginBottom: '2rem', color: isDark ? '#d1d5db' : '#4b5563' }}>
								No facilities found matching <span style={{ fontWeight: 600 }}>"{result.query}"</span>
							</p>
						)}
					</div>
				</div>
			</div>
		)
	}

	return (
		<div style={containerStyle}>
			<div style={maxWidthStyle}>
				{/* Header */}
				<div style={headerBoxStyle}>
					<div style={headerTitleContainerStyle}>
						<div style={{ fontSize: '2rem' }}>🔍</div>
						<h2 style={headerTitleStyle}>Search Results</h2>
					</div>
					<p style={headerTextStyle}>
						Found <span style={countStyle}>{result.totalCount.toLocaleString()}</span>
						{result.query && (
							<> facilities matching <span style={{ fontWeight: 600 }}>"{result.query}"</span></>
						)}
						{!result.query && <> facilities</>}
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
					<div style={footerStyle}>
						<p style={footerTextStyle}>
							📊 Showing {result.preview.length} of {result.totalCount.toLocaleString()} results
						</p>
					</div>
				)}
			</div>
		</div>
	)
}
