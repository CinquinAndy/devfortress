import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { env } from './config/env.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')

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

// Get widget HTML for inlining in ChatGPT responses
function getWidgetHtml(): string {
	const rootDir = process.cwd()
	const jsPath = join(rootDir, 'web', 'dist', 'app.js')
	const cssPath = join(rootDir, 'web', 'dist', 'app.css')

	try {
		const js = readFileSync(jsPath, 'utf-8')
		const css = readFileSync(cssPath, 'utf-8')

		return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>ODCAF Cultural Facilities</title>
	<style>${css}</style>
</head>
<body>
	<div id="root"></div>
	<script type="module">${js}</script>
</body>
</html>`.trim()
	} catch (error) {
		console.error('[Widget] Failed to load widget HTML:', error)
		return '<html><body><p>Widget build not found. Run: cd web && npm run build</p></body></html>'
	}
}


// Note: getWidgetHtml() removed - we now use resource references instead

export function createMcpServer(): McpServer {
	const server = new McpServer({
		name: 'odcaf-mcp-server',
		version: '1.0.0',
	})

	// =============================================
	// REGISTER WIDGET TEMPLATE RESOURCE
	// =============================================
	// Register the widget HTML template for ChatGPT Apps SDK
	// ChatGPT requires the widget to be registered as a ui://widget resource
	server.registerResource(
		'widget',
		'ui://widget/widget.html',
		{
			title: 'ODCAF Facilities Widget',
			description: 'Interactive widget for displaying Canadian cultural facilities',
			mimeType: 'text/html+skybridge',
		},
		async () => {
			// Return the widget HTML inline
			const widgetHtml = getWidgetHtml()
			return {
				contents: [
					{
						uri: 'ui://widget/widget.html',
						mimeType: 'text/html+skybridge',
						text: widgetHtml,
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
			// ChatGPT Apps SDK: specify widget to display for this tool
			_meta: {
				'openai/outputTemplate': 'ui://widget/widget.html',
			},
		},
		async params => {
			const { query, maxResults } = params as { query: string; maxResults?: number }
			const result = await executeSearch({ query, maxResults })

			console.log(`[Widget] Tool called: search`)
			console.log(`[Widget] Will render widget: ui://widget/widget.html`)
			console.log(`[Widget] Structured content:`, JSON.stringify({ toolName: 'search', query, ...result }, null, 2))

			// Return structured content - ChatGPT will load the widget from tool's outputTemplate
			return {
				content: [
					{
						type: 'text' as const,
						text: formatSearchResultsCards(result, query),
					},
				],
				structuredContent: {
					toolName: 'search',
					query,
					...result,
				},
			} as any // ChatGPT Apps SDK format - bypass MCP SDK type checking
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
					} as any,
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
			} as any
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
					} as any,
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
			} as any
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
					} as any,
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
			} as any
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
					} as any,
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
			} as any
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
					} as any,
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
			} as any
		}
	)

	return server
}
