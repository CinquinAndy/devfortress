import type { CSSProperties } from 'react'

interface FacilityCardProps {
	id: number
	name: string
	type: string
	city: string
	province: string
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

export function FacilityCard({ id, name, type, city, province, theme = 'light' }: FacilityCardProps) {
	const isDark = theme === 'dark'

	const cardStyle: CSSProperties = {
		padding: '1.25rem',
		borderRadius: '0.75rem',
		border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
		backgroundColor: isDark ? '#1f2937' : '#ffffff',
		marginBottom: '1rem',
		breakInside: 'avoid',
		pageBreakInside: 'avoid',
		transition: 'all 0.2s ease',
		cursor: 'pointer',
		boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
	}

	const headerStyle: CSSProperties = {
		display: 'flex',
		alignItems: 'flex-start',
		gap: '0.75rem',
	}

	const iconStyle: CSSProperties = {
		fontSize: '2rem',
		lineHeight: 1,
	}

	const contentStyle: CSSProperties = {
		flex: 1,
		minWidth: 0,
	}

	const titleStyle: CSSProperties = {
		fontWeight: 700,
		fontSize: '1rem',
		lineHeight: 1.4,
		marginBottom: '0.5rem',
		color: isDark ? '#ffffff' : '#111827',
	}

	const badgeStyle: CSSProperties = {
		display: 'inline-block',
		padding: '0.25rem 0.5rem',
		borderRadius: '0.375rem',
		fontSize: '0.75rem',
		fontWeight: 500,
		backgroundColor: isDark ? '#1e3a8a' : '#dbeafe',
		color: isDark ? '#93c5fd' : '#1e40af',
		marginBottom: '0.75rem',
	}

	const locationContainerStyle: CSSProperties = {
		display: 'flex',
		alignItems: 'center',
		gap: '0.5rem',
		marginBottom: '0.5rem',
	}

	const locationTextStyle: CSSProperties = {
		fontSize: '0.875rem',
		fontWeight: 500,
		textTransform: 'capitalize',
		color: isDark ? '#d1d5db' : '#374151',
	}

	const idStyle: CSSProperties = {
		fontSize: '0.75rem',
		fontFamily: 'monospace',
		color: isDark ? '#6b7280' : '#9ca3af',
	}

	return (
		<div style={cardStyle}>
			<div style={headerStyle}>
				<div style={iconStyle}>{getTypeIcon(type)}</div>

				<div style={contentStyle}>
					<h3 style={titleStyle}>{name}</h3>

					<div>
						<span style={badgeStyle}>{type}</span>
					</div>

					<div style={locationContainerStyle}>
						<span style={{ fontSize: '0.875rem' }}>📍</span>
						<span style={locationTextStyle}>
							{city}, {province}
						</span>
					</div>

					<div style={idStyle}>ID: {id}</div>
				</div>
			</div>
		</div>
	)
}
