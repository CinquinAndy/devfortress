import { z } from 'zod'
import { odcafService } from '../services/odcaf.service.js'
import type { SearchResult } from '../types/odcaf.js'

/**
 * Filter tool - Filter facilities by province, city, or facility type
 */
export const filterToolDefinition = {
	name: 'filter',
	title: 'Filter Cultural Facilities',
	description:
		'Filter cultural facilities by province, city, and/or facility type. Use this for precise filtering when you know the exact criteria.',
	inputSchema: {
		province: z
			.string()
			.optional()
			.describe('Province/territory code (AB, BC, MB, NB, NL, NS, NT, NU, ON, PE, QC, SK, YT)'),
		city: z.string().optional().describe('City name (partial match supported)'),
		facilityType: z
			.string()
			.optional()
			.describe(
				'Facility type (museum, gallery, library, theatre, heritage or historic site, community cultural centre, performing arts facility, archive)'
			),
		limit: z.coerce.number().default(50).describe('Maximum number of results (default: 50)'),
	},
	outputSchema: {
		ids: z.array(z.number()),
		totalCount: z.number(),
		preview: z.array(
			z.object({
				id: z.number(),
				name: z.string(),
				type: z.string(),
				city: z.string(),
				province: z.string(),
			})
		),
	},
}

export async function executeFilter(params: {
	province?: string
	city?: string
	facilityType?: string
	limit?: number
}): Promise<SearchResult> {
	const { province, city, facilityType, limit = 50 } = params

	// Validate at least one filter is provided
	if (!province && !city && !facilityType) {
		throw new Error('At least one filter (province, city, or facilityType) must be provided')
	}

	try {
		return odcafService.filter({ province, city, facilityType, limit })
	} catch (error) {
		console.error('Filter error:', error)
		throw new Error(`Failed to filter facilities: ${error instanceof Error ? error.message : 'Unknown error'}`)
	}
}

/**
 * List Types tool - List all available facility types
 */
export const listTypesToolDefinition = {
	name: 'list_types',
	title: 'List Facility Types',
	description: 'List all available cultural facility types in the database.',
	inputSchema: {},
	outputSchema: {
		types: z.array(z.string()),
	},
}

export async function executeListTypes(): Promise<{ types: string[] }> {
	try {
		const types = odcafService.listTypes()
		return { types }
	} catch (error) {
		console.error('List types error:', error)
		throw new Error(`Failed to list types: ${error instanceof Error ? error.message : 'Unknown error'}`)
	}
}

/**
 * List Provinces tool - List all provinces with facility counts
 */
export const listProvincesToolDefinition = {
	name: 'list_provinces',
	title: 'List Provinces',
	description: 'List all Canadian provinces and territories with their facility counts.',
	inputSchema: {},
	outputSchema: {
		provinces: z.array(
			z.object({
				code: z.string(),
				count: z.number(),
			})
		),
	},
}

export async function executeListProvinces(): Promise<{
	provinces: Array<{ code: string; count: number }>
}> {
	try {
		const provinces = odcafService.listProvinces()
		return { provinces }
	} catch (error) {
		console.error('List provinces error:', error)
		throw new Error(`Failed to list provinces: ${error instanceof Error ? error.message : 'Unknown error'}`)
	}
}
