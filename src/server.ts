import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { odcafService } from './services/odcaf.service.js'
import {
	executeFetch,
	executeFilter,
	executeListProvinces,
	executeListTypes,
	executeSearch,
	executeStats,
	fetchToolDefinition,
	filterToolDefinition,
	formatStatsAsMarkdown,
	listProvincesToolDefinition,
	listTypesToolDefinition,
	searchToolDefinition,
	statsToolDefinition,
} from './tools/index.js'

export function createMcpServer(): McpServer {
	const server = new McpServer({
		name: 'odcaf-mcp-server',
		version: '1.0.0',
	})

	// =============================================
	// REQUIRED TOOLS FOR CHATGPT DEEP RESEARCH MODE
	// =============================================

	// Search tool - finds facilities by query
	server.registerTool(
		searchToolDefinition.name,
		{
			title: searchToolDefinition.title,
			description: searchToolDefinition.description,
			inputSchema: searchToolDefinition.inputSchema,
		},
		async params => {
			const result = await executeSearch(
				params as {
					query: string
					maxResults?: number
				}
			)

			// Format as table for better display
			const content = odcafService.formatResultsAsTable(result)

			return {
				content: [
					{
						type: 'text' as const,
						text: content,
					},
				],
			}
		}
	)

	// Fetch tool - retrieves full facility details by ID
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
						text: result.content,
					},
				],
			}
		}
	)

	// =============================================
	// FILTER TOOLS
	// =============================================

	// Filter by province, city, type
	server.registerTool(
		filterToolDefinition.name,
		{
			title: filterToolDefinition.title,
			description: filterToolDefinition.description,
			inputSchema: filterToolDefinition.inputSchema,
		},
		async params => {
			const result = await executeFilter(
				params as {
					province?: string
					city?: string
					facilityType?: string
					limit?: number
				}
			)

			const content = odcafService.formatResultsAsTable(result)

			return {
				content: [
					{
						type: 'text' as const,
						text: content,
					},
				],
			}
		}
	)

	// List facility types
	server.registerTool(
		listTypesToolDefinition.name,
		{
			title: listTypesToolDefinition.title,
			description: listTypesToolDefinition.description,
			inputSchema: {},
		},
		async () => {
			const result = await executeListTypes()

			const content = ['**Available Facility Types:**', '', ...result.types.map(t => `- ${t}`)].join('\n')

			return {
				content: [
					{
						type: 'text' as const,
						text: content,
					},
				],
			}
		}
	)

	// List provinces
	server.registerTool(
		listProvincesToolDefinition.name,
		{
			title: listProvincesToolDefinition.title,
			description: listProvincesToolDefinition.description,
			inputSchema: {},
		},
		async () => {
			const result = await executeListProvinces()

			const content = [
				'**Provinces/Territories with Cultural Facilities:**',
				'',
				'| Code | Count |',
				'| --- | --- |',
				...result.provinces.map(p => `| ${p.code} | ${p.count.toLocaleString()} |`),
			].join('\n')

			return {
				content: [
					{
						type: 'text' as const,
						text: content,
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
			const content = formatStatsAsMarkdown(result)

			return {
				content: [
					{
						type: 'text' as const,
						text: content,
					},
				],
			}
		}
	)

	return server
}
