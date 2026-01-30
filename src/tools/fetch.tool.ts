import { z } from 'zod'
import { odcafService } from '../services/odcaf.service.js'
import type { FetchResult } from '../types/odcaf.js'

/**
 * Fetch tool - Retrieve full details of a cultural facility by ID
 */
export const fetchToolDefinition = {
	name: 'fetch',
	title: 'Fetch Facility Details',
	description:
		'Fetch the complete details of a cultural facility by its ID. Returns full information including address, coordinates, and data source.',
	inputSchema: {
		id: z.number().describe('The facility ID returned from a search'),
	},
	outputSchema: {
		id: z.number(),
		facility: z.object({
			index: z.number(),
			facilityName: z.string(),
			sourceFacilityType: z.string(),
			odcafFacilityType: z.string(),
			provider: z.string(),
			unit: z.string(),
			streetNo: z.string(),
			streetName: z.string(),
			postalCode: z.string(),
			city: z.string(),
			provTerr: z.string(),
			sourceFormatAddress: z.string(),
			csdName: z.string(),
			csduid: z.string(),
			pruid: z.string(),
			latitude: z.number().nullable(),
			longitude: z.number().nullable(),
		}),
		content: z.string(),
	},
}

export async function executeFetch(params: { id: number }): Promise<FetchResult> {
	const { id } = params

	try {
		const result = odcafService.fetch(id)

		if (!result) {
			throw new Error(`Facility with ID ${id} not found`)
		}

		return result
	} catch (error) {
		console.error('Fetch error:', error)
		throw new Error(`Failed to fetch facility: ${error instanceof Error ? error.message : 'Unknown error'}`)
	}
}
