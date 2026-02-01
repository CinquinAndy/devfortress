import type { CSSProperties } from 'react'

interface FacilityData {
	id: number
	name: string
	type: string
	city: string
	province: string
	address?: string
	postalCode?: string
	phone?: string
	email?: string
	website?: string
}

interface Props {
	data: FacilityData | { facility: FacilityData }
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

export function FacilityDetail({ data, theme = 'light' }: Props) {
	// Handle both formats: direct data or nested facility
	const facility = 'facility' in data ? data.facility : data
	const isDark = theme === 'dark'

	const containerStyle: CSSProperties = {
		minHeight: '100vh',
		padding: '2rem',
		backgroundColor: isDark ? '#111827' : '#f9fafb',
	}

	const maxWidthStyle: CSSProperties = {
		maxWidth: '800px',
		margin: '0 auto',
	}

	const cardStyle: CSSProperties = {
		padding: '2rem',
		borderRadius: '1rem',
		boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
		backgroundColor: isDark ? '#1f2937' : '#ffffff',
		border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
	}

	const headerStyle: CSSProperties = {
		display: 'flex',
		gap: '1.5rem',
		marginBottom: '2rem',
		paddingBottom: '1.5rem',
		borderBottom: `2px solid ${isDark ? '#374151' : '#e5e7eb'}`,
	}

	const iconStyle: CSSProperties = {
		fontSize: '4rem',
		lineHeight: 1,
	}

	const titleStyle: CSSProperties = {
		fontSize: '2rem',
		fontWeight: 700,
		color: isDark ? '#ffffff' : '#111827',
		marginBottom: '0.5rem',
		lineHeight: 1.2,
	}

	const badgeStyle: CSSProperties = {
		display: 'inline-block',
		padding: '0.375rem 0.75rem',
		borderRadius: '0.375rem',
		fontSize: '0.875rem',
		fontWeight: 600,
		backgroundColor: isDark ? '#1e3a8a' : '#dbeafe',
		color: isDark ? '#93c5fd' : '#1e40af',
	}

	const sectionStyle: CSSProperties = {
		marginBottom: '1.5rem',
	}

	const sectionTitleStyle: CSSProperties = {
		fontSize: '1.125rem',
		fontWeight: 700,
		color: isDark ? '#ffffff' : '#111827',
		marginBottom: '0.75rem',
		display: 'flex',
		alignItems: 'center',
		gap: '0.5rem',
	}

	const infoRowStyle: CSSProperties = {
		display: 'flex',
		gap: '0.75rem',
		marginBottom: '0.75rem',
		alignItems: 'flex-start',
	}

	const labelStyle: CSSProperties = {
		fontSize: '0.875rem',
		fontWeight: 600,
		color: isDark ? '#9ca3af' : '#6b7280',
		minWidth: '100px',
	}

	const valueStyle: CSSProperties = {
		fontSize: '0.875rem',
		color: isDark ? '#d1d5db' : '#374151',
		flex: 1,
	}

	const linkStyle: CSSProperties = {
		color: '#3b82f6',
		textDecoration: 'none',
		fontWeight: 500,
	}

	const idBadgeStyle: CSSProperties = {
		display: 'inline-block',
		padding: '0.25rem 0.5rem',
		borderRadius: '0.25rem',
		fontSize: '0.75rem',
		fontFamily: 'monospace',
		backgroundColor: isDark ? '#374151' : '#f3f4f6',
		color: isDark ? '#9ca3af' : '#6b7280',
	}

	return (
		<div style={containerStyle}>
			<div style={maxWidthStyle}>
				<div style={cardStyle}>
					{/* Header */}
					<div style={headerStyle}>
						<div style={iconStyle}>{getTypeIcon(facility.type)}</div>
						<div style={{ flex: 1 }}>
							<h1 style={titleStyle}>{facility.name}</h1>
							<div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
								<span style={badgeStyle}>{facility.type}</span>
								<span style={idBadgeStyle}>ID: {facility.id}</span>
							</div>
						</div>
					</div>

					{/* Location */}
					<div style={sectionStyle}>
						<h2 style={sectionTitleStyle}>
							<span>📍</span>
							<span>Location</span>
						</h2>
						<div style={infoRowStyle}>
							<span style={labelStyle}>City</span>
							<span style={{ ...valueStyle, textTransform: 'capitalize' }}>{facility.city}</span>
						</div>
						<div style={infoRowStyle}>
							<span style={labelStyle}>Province</span>
							<span style={valueStyle}>{facility.province}</span>
						</div>
						{facility.address && (
							<div style={infoRowStyle}>
								<span style={labelStyle}>Address</span>
								<span style={valueStyle}>{facility.address}</span>
							</div>
						)}
						{facility.postalCode && (
							<div style={infoRowStyle}>
								<span style={labelStyle}>Postal Code</span>
								<span style={valueStyle}>{facility.postalCode}</span>
							</div>
						)}
					</div>

					{/* Contact */}
					{(facility.phone || facility.email || facility.website) && (
						<div style={sectionStyle}>
							<h2 style={sectionTitleStyle}>
								<span>📞</span>
								<span>Contact</span>
							</h2>
							{facility.phone && (
								<div style={infoRowStyle}>
									<span style={labelStyle}>Phone</span>
									<a href={`tel:${facility.phone}`} style={{ ...valueStyle, ...linkStyle }}>
										{facility.phone}
									</a>
								</div>
							)}
							{facility.email && (
								<div style={infoRowStyle}>
									<span style={labelStyle}>Email</span>
									<a href={`mailto:${facility.email}`} style={{ ...valueStyle, ...linkStyle }}>
										{facility.email}
									</a>
								</div>
							)}
							{facility.website && (
								<div style={infoRowStyle}>
									<span style={labelStyle}>Website</span>
									<a 
										href={facility.website.startsWith('http') ? facility.website : `https://${facility.website}`}
										target="_blank"
										rel="noopener noreferrer"
										style={{ ...valueStyle, ...linkStyle }}
									>
										{facility.website}
									</a>
								</div>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	)
}
