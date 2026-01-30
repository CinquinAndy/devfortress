import { z } from 'zod'
import { odcafService } from '../services/odcaf.service.js'
import type { StatsResult } from '../types/odcaf.js'

/**
 * Stats tool - Get statistics about the ODCAF dataset
 */
export const statsToolDefinition = {
	name: 'stats',
	title: 'Get Dataset Statistics',
	description:
		'Get statistics about the cultural facilities database including total count, breakdown by type and province, and top cities.',
	inputSchema: {},
	outputSchema: {
		totalFacilities: z.number(),
		byType: z.record(z.number()),
		byProvince: z.record(z.number()),
		topCities: z.array(
			z.object({
				city: z.string(),
				count: z.number(),
			})
		),
	},
}

export async function executeStats(): Promise<StatsResult> {
	try {
		return odcafService.getStats()
	} catch (error) {
		console.error('Stats error:', error)
		throw new Error(`Failed to get stats: ${error instanceof Error ? error.message : 'Unknown error'}`)
	}
}

/**
 * Format stats as readable markdown
 */
export function formatStatsAsMarkdown(stats: StatsResult): string {
	const lines: string[] = [
		'# ODCAF Dataset Statistics',
		'',
		`**Total Facilities:** ${stats.totalFacilities.toLocaleString()}`,
		'',
		'## By Facility Type',
		'',
		'| Type | Count |',
		'| --- | --- |',
	]

	// Sort by count descending
	const sortedTypes = Object.entries(stats.byType).sort((a, b) => b[1] - a[1])
	for (const [type, count] of sortedTypes) {
		lines.push(`| ${type} | ${count.toLocaleString()} |`)
	}

	lines.push('')
	lines.push('## By Province/Territory')
	lines.push('')
	lines.push('| Province | Count |')
	lines.push('| --- | --- |')

	const sortedProvinces = Object.entries(stats.byProvince).sort((a, b) => b[1] - a[1])
	for (const [prov, count] of sortedProvinces) {
		lines.push(`| ${prov} | ${count.toLocaleString()} |`)
	}

	lines.push('')
	lines.push('## Top 10 Cities')
	lines.push('')
	lines.push('| City | Count |')
	lines.push('| --- | --- |')

	for (const { city, count } of stats.topCities) {
		lines.push(`| ${city} | ${count.toLocaleString()} |`)
	}

	return lines.join('\n')
}
