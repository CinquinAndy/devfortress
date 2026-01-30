import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import {
	executeFetch,
	executeFilter,
	executeListProvinces,
	executeListTypes,
	executeSearch,
	executeStats,
	fetchToolDefinition,
	filterToolDefinition,
	listProvincesToolDefinition,
	listTypesToolDefinition,
	searchToolDefinition,
	statsToolDefinition,
} from './tools/index.js'
import {
	formatFacilityCard,
	formatFilterResultsTable,
	formatProvincesList,
	formatSearchResultsCards,
	formatStatsDashboard,
	formatTypesList,
} from './utils/widgets.js'

export function createMcpServer(): McpServer {
	const server = new McpServer({
		name: 'odcaf-mcp-server',
		version: '1.0.0',
	})

	// =============================================
	// SEARCH TOOL
	// =============================================

	server.registerTool(
		searchToolDefinition.name,
		{
			title: searchToolDefinition.title,
			description: searchToolDefinition.description,
			inputSchema: searchToolDefinition.inputSchema,
		},
		async params => {
			const { query, maxResults } = params as { query: string; maxResults?: number }
			const result = await executeSearch({ query, maxResults })

			return {
				content: [
					{
						type: 'text' as const,
						text: formatSearchResultsCards(result, query),
					},
				],
			}
		}
	)

	// =============================================
	// FETCH TOOL
	// =============================================

	server.registerTool(
		fetchToolDefinition.name,
		{
			title: fetchToolDefinition.title,
			description: fetchToolDefinition.description,
			inputSchema: fetchToolDefinition.inputSchema,
		},
		async params => {
			const result = await executeFetch(params as { id: number })

			return {
				content: [
					{
						type: 'text' as const,
						text: formatFacilityCard(result.facility),
					},
				],
			}
		}
	)

	// =============================================
	// FILTER TOOL
	// =============================================

	server.registerTool(
		filterToolDefinition.name,
		{
			title: filterToolDefinition.title,
			description: filterToolDefinition.description,
			inputSchema: filterToolDefinition.inputSchema,
		},
		async params => {
			const { province, city, facilityType, limit } = params as {
				province?: string
				city?: string
				facilityType?: string
				limit?: number
			}
			const result = await executeFilter({ province, city, facilityType, limit })

			return {
				content: [
					{
						type: 'text' as const,
						text: formatFilterResultsTable(result, { province, city, facilityType }),
					},
				],
			}
		}
	)

	// =============================================
	// LIST TYPES TOOL
	// =============================================

	server.registerTool(
		listTypesToolDefinition.name,
		{
			title: listTypesToolDefinition.title,
			description: listTypesToolDefinition.description,
			inputSchema: {},
		},
		async () => {
			const result = await executeListTypes()

			return {
				content: [
					{
						type: 'text' as const,
						text: formatTypesList(result.types),
					},
				],
			}
		}
	)

	// =============================================
	// LIST PROVINCES TOOL
	// =============================================

	server.registerTool(
		listProvincesToolDefinition.name,
		{
			title: listProvincesToolDefinition.title,
			description: listProvincesToolDefinition.description,
			inputSchema: {},
		},
		async () => {
			const result = await executeListProvinces()

			return {
				content: [
					{
						type: 'text' as const,
						text: formatProvincesList(result.provinces),
					},
				],
			}
		}
	)

	// =============================================
	// STATS TOOL
	// =============================================

	server.registerTool(
		statsToolDefinition.name,
		{
			title: statsToolDefinition.title,
			description: statsToolDefinition.description,
			inputSchema: {},
		},
		async () => {
			const result = await executeStats()

			return {
				content: [
					{
						type: 'text' as const,
						text: formatStatsDashboard(result),
					},
				],
			}
		}
	)

	return server
}
