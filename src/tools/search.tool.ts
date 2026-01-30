import { z } from 'zod'
import { odcafService } from '../services/odcaf.service.js'
import type { SearchResult } from '../types/odcaf.js'

/**
 * Search tool - Search cultural facilities by name, type, city, or province
 * Returns a list of IDs that can be fetched with the fetch tool
 */
export const searchToolDefinition = {
	name: 'search',
	title: 'Search Cultural Facilities',
	description:
		'Search for cultural and art facilities in Canada by name, type, city, or province. Returns a list of matching facilities that can be fetched for full details.',
	inputSchema: {
		query: z
			.string()
			.describe(
				'Search query - can include facility name, type (museum, gallery, library, theatre, heritage), city, or province code (ON, QC, BC, AB, etc.)'
			),
		maxResults: z.number().default(20).describe('Maximum number of results to return (default: 20)'),
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

export async function executeSearch(params: { query: string; maxResults?: number }): Promise<SearchResult> {
	const { query, maxResults = 20 } = params

	if (!query || query.trim().length === 0) {
		return {
			ids: [],
			totalCount: 0,
			preview: [],
		}
	}

	try {
		return odcafService.search(query, maxResults)
	} catch (error) {
		console.error('Search error:', error)
		throw new Error(`Failed to search facilities: ${error instanceof Error ? error.message : 'Unknown error'}`)
	}
}
