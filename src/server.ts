import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { env } from './config/env.js'
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

// Get widget URL (use PUBLIC_URL if set, otherwise construct from HOST:PORT)
function getWidgetUrl(): string {
	if (env.PUBLIC_URL) {
		return `${env.PUBLIC_URL}/widget`
	}
	// For local development, use localhost
	const host = env.HOST === '0.0.0.0' ? 'localhost' : env.HOST
	return `http://${host}:${env.PORT}/widget`
}

export function createMcpServer(): McpServer {
	const server = new McpServer({
		name: 'odcaf-mcp-server',
		version: '1.0.0',
	})

	// =============================================
	// REGISTER WIDGET TEMPLATE RESOURCE
	// =============================================
	// Register the widget HTML template for ChatGPT Apps SDK
	// ChatGPT will fetch this resource when tools return it in their responses
	// The actual HTML is served via Express GET /widget endpoint
	const widgetUrl = getWidgetUrl()
	server.registerResource(
		'widget-template',
		widgetUrl,
		{
			title: 'ODCAF Facilities Widget',
			description: 'Interactive widget for displaying Canadian cultural facilities',
			mimeType: 'text/html+skybridge',
		},
		async () => {
			// Return the widget template
			// The HTML is served via Express /widget endpoint
			return {
				contents: [
					{
						uri: widgetUrl,
						mimeType: 'text/html+skybridge',
						text: '', // HTML is served via Express static file serving
					},
				],
			}
		}
	)

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

			// Return both text (for narration) and widget HTML (for UI)
			return {
				content: [
					{
						type: 'text' as const,
						text: formatSearchResultsCards(result, query),
					},
					{
						type: 'resource' as const,
						resource: {
							uri: getWidgetUrl(),
							mimeType: 'text/html+skybridge',
						},
					},
				],
				structuredContent: {
					toolName: 'search',
					query,
					...result,
				},
				_meta: {
					'openai/widgetCSP': {
						connect_domains: [],
						resource_domains: [],
					},
					'openai/widgetDomain':
						env.PUBLIC_URL || `http://${env.HOST === '0.0.0.0' ? 'localhost' : env.HOST}:${env.PORT}`,
				},
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
					{
						type: 'resource' as const,
						resource: {
							uri: getWidgetUrl(),
							mimeType: 'text/html+skybridge',
						},
					},
				],
				structuredContent: {
					toolName: 'fetch',
					facility: result.facility,
				},
				_meta: {
					'openai/widgetCSP': {
						connect_domains: [],
						resource_domains: [],
					},
					'openai/widgetDomain':
						env.PUBLIC_URL || `http://${env.HOST === '0.0.0.0' ? 'localhost' : env.HOST}:${env.PORT}`,
				},
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
					{
						type: 'resource' as const,
						resource: {
							uri: getWidgetUrl(),
							mimeType: 'text/html+skybridge',
						},
					},
				],
				structuredContent: {
					toolName: 'filter',
					filters: { province, city, facilityType },
					...result,
				},
				_meta: {
					'openai/widgetCSP': {
						connect_domains: [],
						resource_domains: [],
					},
					'openai/widgetDomain':
						env.PUBLIC_URL || `http://${env.HOST === '0.0.0.0' ? 'localhost' : env.HOST}:${env.PORT}`,
				},
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
					{
						type: 'resource' as const,
						resource: {
							uri: getWidgetUrl(),
							mimeType: 'text/html+skybridge',
						},
					},
				],
				structuredContent: {
					toolName: 'list_types',
					types: result.types,
				},
				_meta: {
					'openai/widgetCSP': {
						connect_domains: [],
						resource_domains: [],
					},
					'openai/widgetDomain':
						env.PUBLIC_URL || `http://${env.HOST === '0.0.0.0' ? 'localhost' : env.HOST}:${env.PORT}`,
				},
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
					{
						type: 'resource' as const,
						resource: {
							uri: getWidgetUrl(),
							mimeType: 'text/html+skybridge',
						},
					},
				],
				structuredContent: {
					toolName: 'list_provinces',
					provinces: result.provinces,
				},
				_meta: {
					'openai/widgetCSP': {
						connect_domains: [],
						resource_domains: [],
					},
					'openai/widgetDomain':
						env.PUBLIC_URL || `http://${env.HOST === '0.0.0.0' ? 'localhost' : env.HOST}:${env.PORT}`,
				},
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
					{
						type: 'resource' as const,
						resource: {
							uri: getWidgetUrl(),
							mimeType: 'text/html+skybridge',
						},
					},
				],
				structuredContent: {
					toolName: 'stats',
					...result,
				},
				_meta: {
					'openai/widgetCSP': {
						connect_domains: [],
						resource_domains: [],
					},
					'openai/widgetDomain':
						env.PUBLIC_URL || `http://${env.HOST === '0.0.0.0' ? 'localhost' : env.HOST}:${env.PORT}`,
				},
			}
		}
	)

	return server
}
