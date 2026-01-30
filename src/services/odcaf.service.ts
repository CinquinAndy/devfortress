import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { env } from '../config/env.js'
import type { FetchResult, FilterParams, OdcafFacility, SearchResult, StatsResult } from '../types/odcaf.js'

/**
 * ODCAF Service - Loads and queries the Cultural and Art Facilities dataset
 */
export class OdcafService {
	private facilities: OdcafFacility[] = []
	private facilitiesById: Map<number, OdcafFacility> = new Map()
	private loaded = false

	constructor() {
		this.loadData()
	}

	/**
	 * Load CSV data into memory
	 */
	private loadData(): void {
		if (this.loaded) return

		const filePath = resolve(process.cwd(), env.DATA_FILE_PATH)
		console.log(`[ODCAF] Loading data from: ${filePath}`)

		try {
			const content = readFileSync(filePath, 'utf-8')
			const lines = content.split('\n').filter(line => line.trim())

			// Parse header
			const header = this.parseCSVLine(lines[0])
			const headerMap = this.createHeaderMap(header)

			// Parse data rows
			for (let i = 1; i < lines.length; i++) {
				const values = this.parseCSVLine(lines[i])
				if (values.length < header.length) continue

				const facility = this.parseRow(values, headerMap)
				if (facility) {
					this.facilities.push(facility)
					this.facilitiesById.set(facility.index, facility)
				}
			}

			this.loaded = true
			console.log(`[ODCAF] Loaded ${this.facilities.length} facilities`)
		} catch (error) {
			console.error('[ODCAF] Failed to load data:', error)
			throw new Error(`Failed to load ODCAF data: ${error instanceof Error ? error.message : 'Unknown error'}`)
		}
	}

	/**
	 * Parse a CSV line handling quoted fields
	 */
	private parseCSVLine(line: string): string[] {
		const result: string[] = []
		let current = ''
		let inQuotes = false

		for (let i = 0; i < line.length; i++) {
			const char = line[i]

			if (char === '"') {
				inQuotes = !inQuotes
			} else if (char === ',' && !inQuotes) {
				result.push(current.trim())
				current = ''
			} else {
				current += char
			}
		}

		result.push(current.trim())
		return result
	}

	/**
	 * Create header to index map
	 */
	private createHeaderMap(header: string[]): Map<string, number> {
		const map = new Map<string, number>()
		for (let idx = 0; idx < header.length; idx++) {
			map.set(header[idx].trim(), idx)
		}
		return map
	}

	/**
	 * Parse a row into a facility object
	 */
	private parseRow(values: string[], headerMap: Map<string, number>): OdcafFacility | null {
		const get = (col: string): string => {
			const idx = headerMap.get(col)
			return idx !== undefined ? values[idx] || '' : ''
		}

		const indexVal = Number.parseInt(get('Index'), 10)
		if (Number.isNaN(indexVal)) return null

		const lat = Number.parseFloat(get('Latitude'))
		const lng = Number.parseFloat(get('Longitude'))

		return {
			index: indexVal,
			facilityName: get('Facility_Name'),
			sourceFacilityType: get('Source_Facility_Type'),
			odcafFacilityType: get('ODCAF_Facility_Type').toLowerCase(),
			provider: get('Provider'),
			unit: get('Unit'),
			streetNo: get('Street_No'),
			streetName: get('Street_Name'),
			postalCode: get('Postal_Code'),
			city: get('City'),
			provTerr: get('Prov_Terr').toUpperCase(),
			sourceFormatAddress: get('Source_Format_Address'),
			csdName: get('CSD_Name'),
			csduid: get('CSDUID'),
			pruid: get('PRUID'),
			latitude: Number.isNaN(lat) ? null : lat,
			longitude: Number.isNaN(lng) ? null : lng,
		}
	}

	/**
	 * Search facilities by query string
	 */
	search(query: string, maxResults = 20): SearchResult {
		const queryLower = query.toLowerCase().trim()
		const terms = queryLower.split(/\s+/).filter(Boolean)

		const matches = this.facilities.filter(f => {
			const searchable = `${f.facilityName} ${f.city} ${f.odcafFacilityType} ${f.provTerr} ${f.csdName}`.toLowerCase()
			return terms.every(term => searchable.includes(term))
		})

		const limited = matches.slice(0, maxResults)

		return {
			ids: limited.map(f => f.index),
			totalCount: matches.length,
			preview: limited.map(f => ({
				id: f.index,
				name: f.facilityName,
				type: f.odcafFacilityType,
				city: f.city,
				province: f.provTerr,
			})),
		}
	}

	/**
	 * Fetch a facility by ID
	 */
	fetch(id: number): FetchResult | null {
		const facility = this.facilitiesById.get(id)
		if (!facility) return null

		return {
			id: facility.index,
			facility,
			content: this.formatFacilityAsMarkdown(facility),
		}
	}

	/**
	 * Filter facilities by criteria
	 */
	filter(params: FilterParams): SearchResult {
		const { province, city, facilityType, limit = 50 } = params

		let results = this.facilities

		if (province) {
			const provUpper = province.toUpperCase()
			results = results.filter(f => f.provTerr === provUpper)
		}

		if (city) {
			const cityLower = city.toLowerCase()
			results = results.filter(f => f.city.toLowerCase().includes(cityLower))
		}

		if (facilityType) {
			const typeLower = facilityType.toLowerCase()
			results = results.filter(f => f.odcafFacilityType.includes(typeLower))
		}

		const limited = results.slice(0, limit)

		return {
			ids: limited.map(f => f.index),
			totalCount: results.length,
			preview: limited.map(f => ({
				id: f.index,
				name: f.facilityName,
				type: f.odcafFacilityType,
				city: f.city,
				province: f.provTerr,
			})),
		}
	}

	/**
	 * Get statistics about the dataset
	 */
	getStats(): StatsResult {
		const byType: Record<string, number> = {}
		const byProvince: Record<string, number> = {}
		const byCity: Record<string, number> = {}

		for (const f of this.facilities) {
			// By type
			byType[f.odcafFacilityType] = (byType[f.odcafFacilityType] || 0) + 1

			// By province
			byProvince[f.provTerr] = (byProvince[f.provTerr] || 0) + 1

			// By city
			const cityKey = `${f.city}, ${f.provTerr}`
			byCity[cityKey] = (byCity[cityKey] || 0) + 1
		}

		// Top 10 cities
		const topCities = Object.entries(byCity)
			.sort((a, b) => b[1] - a[1])
			.slice(0, 10)
			.map(([city, count]) => ({ city, count }))

		return {
			totalFacilities: this.facilities.length,
			byType,
			byProvince,
			topCities,
		}
	}

	/**
	 * List all unique facility types
	 */
	listTypes(): string[] {
		const types = new Set<string>()
		for (const f of this.facilities) {
			if (f.odcafFacilityType) {
				types.add(f.odcafFacilityType)
			}
		}
		return Array.from(types).sort()
	}

	/**
	 * List all provinces with facility counts
	 */
	listProvinces(): Array<{ code: string; count: number }> {
		const counts: Record<string, number> = {}
		for (const f of this.facilities) {
			counts[f.provTerr] = (counts[f.provTerr] || 0) + 1
		}
		return Object.entries(counts)
			.map(([code, count]) => ({ code, count }))
			.sort((a, b) => b.count - a.count)
	}

	/**
	 * Format facility as markdown for display
	 */
	private formatFacilityAsMarkdown(f: OdcafFacility): string {
		const lines = [`## ${f.facilityName}`, '', `**Type:** ${f.odcafFacilityType}`, `**City:** ${f.city}, ${f.provTerr}`]

		const address = [f.streetNo, f.streetName].filter(Boolean).join(' ')
		if (address) {
			lines.push(`**Address:** ${address}`)
		}

		if (f.postalCode && f.postalCode !== '..') {
			lines.push(`**Postal Code:** ${f.postalCode}`)
		}

		if (f.latitude && f.longitude) {
			lines.push(`**Coordinates:** ${f.latitude}, ${f.longitude}`)
		}

		if (f.provider) {
			lines.push(`**Data Source:** ${f.provider}`)
		}

		return lines.join('\n')
	}

	/**
	 * Format results as markdown table
	 */
	formatResultsAsTable(results: SearchResult): string {
		if (results.preview.length === 0) {
			return 'No results found.'
		}

		const header = '| ID | Name | Type | City | Province |'
		const separator = '| --- | --- | --- | --- | --- |'
		const rows = results.preview.map(p => `| ${p.id} | ${p.name} | ${p.type} | ${p.city} | ${p.province} |`)

		const table = [header, separator, ...rows].join('\n')

		if (results.totalCount > results.preview.length) {
			return `${table}\n\n*Showing ${results.preview.length} of ${results.totalCount} results*`
		}

		return table
	}
}

// Singleton instance
export const odcafService = new OdcafService()
