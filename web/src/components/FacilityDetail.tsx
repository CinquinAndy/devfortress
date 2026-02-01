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
	try {
		// Handle both formats: direct data or nested facility
		const rawFacility = 'facility' in data ? (data.facility as any) : (data as any)
		const isDark = theme === 'dark'

		// Normalize data to handle both raw CSV keys and our widget keys
		const facility = {
			id: rawFacility.id ?? rawFacility.index ?? '???',
			name: rawFacility.name ?? rawFacility.facilityName ?? 'Unknown Facility',
			type: rawFacility.type ?? rawFacility.odcafFacilityType ?? 'miscellaneous',
			city: rawFacility.city ?? 'Unknown City',
			province: rawFacility.province ?? rawFacility.provTerr ?? '',
			address: rawFacility.address ?? ([rawFacility.streetNo, rawFacility.streetName].filter(Boolean).join(' ') || rawFacility.sourceFormatAddress || ''),
			postalCode: rawFacility.postalCode ?? '',
			phone: rawFacility.phone ?? '',
			email: rawFacility.email ?? '',
			website: rawFacility.website ?? ''
		}

		console.log('[FacilityDetail] Rendering with normalized facility:', facility)

		const containerStyle: CSSProperties = {
			padding: '1.5rem',
			backgroundColor: isDark ? '#111827' : '#f9fafb',
			borderRadius: '0.75rem',
		}

		const cardStyle: CSSProperties = {
			padding: '1.5rem',
			borderRadius: '1rem',
			boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
			backgroundColor: isDark ? '#1f2937' : '#ffffff',
			border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
		}

		const headerStyle: CSSProperties = {
			display: 'flex',
			gap: '1.5rem',
			marginBottom: '1.5rem',
			paddingBottom: '1rem',
			borderBottom: `2px solid ${isDark ? '#374151' : '#e5e7eb'}`,
		}

		const iconStyle: CSSProperties = {
			fontSize: '3rem',
			lineHeight: 1,
		}

		const titleStyle: CSSProperties = {
			fontSize: '1.5rem',
			fontWeight: 700,
			color: isDark ? '#ffffff' : '#111827',
			marginBottom: '0.25rem',
			lineHeight: 1.2,
		}

		const badgeStyle: CSSProperties = {
			display: 'inline-block',
			padding: '0.25rem 0.5rem',
			borderRadius: '0.375rem',
			fontSize: '0.75rem',
			fontWeight: 600,
			backgroundColor: isDark ? '#1e3a8a' : '#dbeafe',
			color: isDark ? '#93c5fd' : '#1e40af',
		}

		const sectionStyle: CSSProperties = {
			marginBottom: '1.25rem',
		}

		const sectionTitleStyle: CSSProperties = {
			fontSize: '1rem',
			fontWeight: 700,
			color: isDark ? '#ffffff' : '#111827',
			marginBottom: '0.5rem',
			display: 'flex',
			alignItems: 'center',
			gap: '0.5rem',
		}

		const infoRowStyle: CSSProperties = {
			display: 'flex',
			gap: '0.75rem',
			marginBottom: '0.5rem',
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
			padding: '0.25rem 0.375rem',
			borderRadius: '0.25rem',
			fontSize: '0.75rem',
			fontFamily: 'monospace',
			backgroundColor: isDark ? '#374151' : '#f3f4f6',
			color: isDark ? '#9ca3af' : '#6b7280',
		}

		return (
			<div style={containerStyle}>
				<div style={cardStyle}>
					{/* Header */}
					<div style={headerStyle}>
						<div style={iconStyle}>{getTypeIcon(facility.type)}</div>
						<div style={{ flex: 1 }}>
							<h1 style={titleStyle}>{facility.name}</h1>
							<div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
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
					{(facility.phone || facility.email || (facility.website && facility.website !== '..')) && (
						<div style={sectionStyle}>
							<h2 style={sectionTitleStyle}>
								<span>📞</span>
								<span>Contact</span>
							</h2>
							{facility.phone && facility.phone !== '..' && (
								<div style={infoRowStyle}>
									<span style={labelStyle}>Phone</span>
									<a href={`tel:${facility.phone}`} style={{ ...valueStyle, ...linkStyle }}>
										{facility.phone}
									</a>
								</div>
							)}
							{facility.email && facility.email !== '..' && (
								<div style={infoRowStyle}>
									<span style={labelStyle}>Email</span>
									<a href={`mailto:${facility.email}`} style={{ ...valueStyle, ...linkStyle }}>
										{facility.email}
									</a>
								</div>
							)}
							{facility.website && facility.website !== '..' && (
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
		)
	} catch (err) {
		console.error('[FacilityDetail] Rendering crash:', err)
		return (
			<div style={{ padding: '2rem', color: '#ef4444', backgroundColor: '#fee2e2', borderRadius: '0.5rem' }}>
				<p style={{ fontWeight: 700 }}>Unable to render facility details.</p>
				<p style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>{(err as Error).message}</p>
				<pre style={{ fontSize: '0.65rem', marginTop: '1rem', overflow: 'auto' }}>
					{JSON.stringify(data, null, 2)}
				</pre>
			</div>
		)
	}
}
