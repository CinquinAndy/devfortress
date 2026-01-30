/**
 * Widget Formatters - Beautiful Markdown rendering for MCP responses
 * These render as styled "cards" in ChatGPT and other MCP clients
 */

import type { OdcafFacility, SearchResult, StatsResult } from '../types/odcaf.js'

// =============================================
// EMOJI ICONS
// =============================================

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

// =============================================
// PROGRESS BAR
// =============================================

function progressBar(value: number, max: number, width = 10): string {
	const filled = Math.round((value / max) * width)
	const empty = width - filled
	return '█'.repeat(filled) + '░'.repeat(empty)
}

// =============================================
// FACILITY CARD
// =============================================

export function formatFacilityCard(facility: OdcafFacility): string {
	const icon = getTypeIcon(facility.odcafFacilityType)
	const provinceName = getProvinceName(facility.provTerr)

	const lines = [
		'---',
		'',
		`## ${icon} ${facility.facilityName}`,
		'',
		`> **${facility.odcafFacilityType.toUpperCase()}**`,
		'',
		'| 📍 Location | 📋 Details |',
		'|:--|:--|',
		`| **City** | ${facility.city} |`,
		`| **Province** | ${provinceName} (${facility.provTerr}) |`,
	]

	// Address
	const address = [facility.streetNo, facility.streetName].filter(Boolean).join(' ')
	if (address) {
		lines.push(`| **Address** | ${address} |`)
	}

	if (facility.postalCode && facility.postalCode !== '..') {
		lines.push(`| **Postal Code** | ${facility.postalCode} |`)
	}

	// Coordinates with map link
	if (facility.latitude && facility.longitude) {
		const mapLink = `[📍 View on Map](https://www.google.com/maps?q=${facility.latitude},${facility.longitude})`
		lines.push(`| **Coordinates** | ${facility.latitude.toFixed(4)}, ${facility.longitude.toFixed(4)} |`)
		lines.push(`| **Map** | ${mapLink} |`)
	}

	// Data source
	if (facility.provider) {
		lines.push(`| **Source** | ${facility.provider} |`)
	}

	lines.push('', `\`ID: ${facility.index}\``, '', '---')

	return lines.join('\n')
}

// =============================================
// SEARCH RESULTS CARDS
// =============================================

export function formatSearchResultsCards(results: SearchResult, query?: string): string {
	if (results.preview.length === 0) {
		return [
			'---',
			'',
			'## 🔍 No Results Found',
			'',
			query ? `> No facilities found matching **"${query}"**` : '> No facilities match your criteria',
			'',
			'💡 **Try:**',
			'- Using broader search terms',
			'- Checking spelling',
			'- Searching by city or province code (ON, QC, BC...)',
			'',
			'---',
		].join('\n')
	}

	const lines = [
		'---',
		'',
		`## 🔍 Search Results`,
		'',
		query
			? `> Found **${results.totalCount.toLocaleString()}** facilities matching **"${query}"**`
			: `> Found **${results.totalCount.toLocaleString()}** facilities`,
		'',
	]

	// Compact card list
	for (const item of results.preview) {
		const icon = getTypeIcon(item.type)
		lines.push(`### ${icon} ${item.name}`)
		lines.push(`📍 ${item.city}, ${item.province} • \`${item.type}\` • ID: \`${item.id}\``)
		lines.push('')
	}

	if (results.totalCount > results.preview.length) {
		lines.push('---')
		lines.push(`*📊 Showing ${results.preview.length} of ${results.totalCount.toLocaleString()} results*`)
		lines.push('')
		lines.push('💡 Use **filter** tool for more specific results')
	}

	lines.push('', '---')

	return lines.join('\n')
}

// =============================================
// FILTER RESULTS TABLE
// =============================================

export function formatFilterResultsTable(
	results: SearchResult,
	filters?: { province?: string; city?: string; facilityType?: string }
): string {
	if (results.preview.length === 0) {
		return formatSearchResultsCards(results)
	}

	const filterDesc = []
	if (filters?.province) filterDesc.push(`Province: **${getProvinceName(filters.province)}**`)
	if (filters?.city) filterDesc.push(`City: **${filters.city}**`)
	if (filters?.facilityType) filterDesc.push(`Type: **${filters.facilityType}**`)

	const lines = [
		'---',
		'',
		'## 🎯 Filtered Results',
		'',
		filterDesc.length > 0 ? `> ${filterDesc.join(' • ')}` : '',
		'',
		`**${results.totalCount.toLocaleString()}** facilities found`,
		'',
		'| # | 🏛️ Facility | 🏷️ Type | 📍 Location | ID |',
		'|:--:|:--|:--|:--|:--:|',
	]

	results.preview.forEach((item, idx) => {
		const icon = getTypeIcon(item.type)
		lines.push(`| ${idx + 1} | ${icon} ${item.name} | ${item.type} | ${item.city}, ${item.province} | \`${item.id}\` |`)
	})

	if (results.totalCount > results.preview.length) {
		lines.push('')
		lines.push(
			`*Showing ${results.preview.length} of ${results.totalCount.toLocaleString()} • Increase \`limit\` for more*`
		)
	}

	lines.push('', '---')

	return lines.join('\n')
}

// =============================================
// STATS DASHBOARD
// =============================================

export function formatStatsDashboard(stats: StatsResult): string {
	const maxByType = Math.max(...Object.values(stats.byType))

	const lines = [
		'---',
		'',
		'# 📊 ODCAF Cultural Facilities Dashboard',
		'',
		'> 🇨🇦 **Open Database of Cultural and Art Facilities - Canada**',
		'',
		'---',
		'',
		`## 📈 Total Facilities: **${stats.totalFacilities.toLocaleString()}**`,
		'',
		'---',
		'',
		'## 🏷️ By Facility Type',
		'',
	]

	// Sort by count
	const sortedTypes = Object.entries(stats.byType).sort((a, b) => b[1] - a[1])

	for (const [type, count] of sortedTypes) {
		const icon = getTypeIcon(type)
		const bar = progressBar(count, maxByType, 15)
		const pct = ((count / stats.totalFacilities) * 100).toFixed(1)
		lines.push(`${icon} **${type}**`)
		lines.push(`\`${bar}\` ${count.toLocaleString()} (${pct}%)`)
		lines.push('')
	}

	lines.push('---')
	lines.push('')
	lines.push('## 🗺️ By Province/Territory')
	lines.push('')
	lines.push('| Province | Count | % |')
	lines.push('|:--|--:|--:|')

	const sortedProvinces = Object.entries(stats.byProvince)
		.filter(([code]) => code !== '..')
		.sort((a, b) => b[1] - a[1])

	for (const [code, count] of sortedProvinces) {
		const name = getProvinceName(code)
		const pct = ((count / stats.totalFacilities) * 100).toFixed(1)
		lines.push(`| 🍁 ${name} (${code}) | ${count.toLocaleString()} | ${pct}% |`)
	}

	lines.push('')
	lines.push('---')
	lines.push('')
	lines.push('## 🏙️ Top 10 Cities')
	lines.push('')

	stats.topCities.forEach((item, idx) => {
		const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}.`
		lines.push(`${medal} **${item.city}** — ${item.count.toLocaleString()} facilities`)
	})

	lines.push('')
	lines.push('---')

	return lines.join('\n')
}

// =============================================
// TYPES LIST
// =============================================

export function formatTypesList(types: string[]): string {
	const lines = ['---', '', '## 🏷️ Cultural Facility Types', '', '> Available categories in the ODCAF database', '']

	for (const type of types) {
		const icon = getTypeIcon(type)
		lines.push(`- ${icon} **${type}**`)
	}

	lines.push('')
	lines.push('---')
	lines.push('')
	lines.push(`*${types.length} facility types available*`)
	lines.push('')
	lines.push('💡 Use these in the **filter** tool with `facilityType` parameter')
	lines.push('')
	lines.push('---')

	return lines.join('\n')
}

// =============================================
// PROVINCES LIST
// =============================================

export function formatProvincesList(provinces: Array<{ code: string; count: number }>): string {
	const total = provinces.reduce((sum, p) => sum + p.count, 0)
	const maxCount = Math.max(...provinces.map(p => p.count))

	const lines = ['---', '', '## 🗺️ Provinces & Territories', '', '> Cultural facilities across Canada', '']

	for (const p of provinces) {
		if (p.code === '..') continue
		const name = getProvinceName(p.code)
		const bar = progressBar(p.count, maxCount, 12)
		const pct = ((p.count / total) * 100).toFixed(1)
		lines.push(`🍁 **${name}** (\`${p.code}\`)`)
		lines.push(`   \`${bar}\` ${p.count.toLocaleString()} facilities (${pct}%)`)
		lines.push('')
	}

	lines.push('---')
	lines.push('')
	lines.push(`*Total: **${total.toLocaleString()}** facilities across **${provinces.length}** provinces/territories*`)
	lines.push('')
	lines.push('💡 Use province codes in **filter** tool: `province: "ON"`, `province: "QC"`, etc.')
	lines.push('')
	lines.push('---')

	return lines.join('\n')
}
