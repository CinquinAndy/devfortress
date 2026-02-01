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
				'openai/widgetCSP': {
					connect_domains: [],
					resource_domains: [],
				},
				'openai/widgetDomain':
					env.PUBLIC_URL || `http://${env.HOST === '0.0.0.0' ? 'localhost' : env.HOST}:${env.PORT}`,
			},
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
				structuredContent: {
					toolName: 'search',
					query,
					...result,
				},
			} as any
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
			_meta: {
				'openai/outputTemplate': 'ui://widget/widget.html',
				'openai/widgetCSP': {
					connect_domains: [],
					resource_domains: [],
				},
				'openai/widgetDomain':
					env.PUBLIC_URL || `http://${env.HOST === '0.0.0.0' ? 'localhost' : env.HOST}:${env.PORT}`,
			},
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
				structuredContent: {
					// Spread raw data first
					...result.facility,
					// Standardized keys for widgets
					toolName: 'fetch',
					id: result.facility.index,
					name: result.facility.facilityName,
					type: result.facility.odcafFacilityType,
					province: result.facility.provTerr,
					address: ([result.facility.streetNo, result.facility.streetName].filter(Boolean).join(' ') || result.facility.sourceFormatAddress || ''),
					// Add internal aliases just in case
					_id: result.facility.index,
					_name: result.facility.facilityName,
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
			_meta: {
				'openai/outputTemplate': 'ui://widget/widget.html',
				'openai/widgetCSP': {
					connect_domains: [],
					resource_domains: [],
				},
				'openai/widgetDomain':
					env.PUBLIC_URL || `http://${env.HOST === '0.0.0.0' ? 'localhost' : env.HOST}:${env.PORT}`,
			},
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
				structuredContent: {
					toolName: 'filter',
					filters: { province, city, facilityType },
					...result,
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
				],
				structuredContent: {
					toolName: 'list_types',
					types: result.types,
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
				],
				structuredContent: {
					toolName: 'list_provinces',
					provinces: result.provinces,
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
			_meta: {
				'openai/outputTemplate': 'ui://widget/widget.html',
				'openai/widgetCSP': {
					connect_domains: [],
					resource_domains: [],
				},
				'openai/widgetDomain':
					env.PUBLIC_URL || `http://${env.HOST === '0.0.0.0' ? 'localhost' : env.HOST}:${env.PORT}`,
			},
		},
		async () => {
		const result = await executeStats()

		// Transform data for widget: convert records to arrays
		const byProvince = Object.entries(result.byProvince).map(([province, count]) => ({
			province,
			count,
		}))

		const byType = Object.entries(result.byType).map(([type, count]) => ({
			type,
			count,
		}))

		return {
			content: [
				{
					type: 'text' as const,
					text: formatStatsDashboard(result),
				},
			],
			structuredContent: {
				toolName: 'stats',
				totalFacilities: result.totalFacilities,
				byProvince, // Array format for widget
				byType, // Array format for widget
			},
		} as any
	}
	)

	return server
}
