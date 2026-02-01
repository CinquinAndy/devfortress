import { randomUUID } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js'
import express from 'express'
import { env } from './config/env.js'
import { createMcpServer } from './server.js'
import { odcafService } from './services/odcaf.service.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')

const app = express()
app.use(express.json())

// Enable CORS for REST API and SSE
app.use((_req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*')
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, mcp-session-id')
	res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
	next()
})

// Handle OPTIONS preflight
app.options('*', (_req, res) => {
	res.sendStatus(200)
})

// Store active sessions for Streamable HTTP transport
const sessions: Map<string, StreamableHTTPServerTransport> = new Map()

// Store active SSE transports (for OpenAI MCP)
const sseTransports: Map<string, SSEServerTransport> = new Map()

// =============================================
// REST API ENDPOINTS (for ChatGPT / direct use)
// =============================================

/**
 * Health check endpoint
 */
app.get('/health', (_req, res) => {
	res.json({
		status: 'healthy',
		server: 'odcaf-mcp-server',
		version: '1.0.0',
		transports: {
			sse: sseTransports.size,
			streamableHttp: sessions.size,
		},
	})
})

/**
 * GET /api/search - Search facilities
 * Query params: query (required), maxResults (optional, default 20)
 */
app.get('/api/search', (req, res) => {
	try {
		const query = req.query.query as string
		const maxResults = Number.parseInt(req.query.maxResults as string, 10) || 20

		if (!query) {
			res.status(400).json({ error: 'Query parameter "query" is required' })
			return
		}

		const result = odcafService.search(query, maxResults)
		res.json({
			success: true,
			...result,
			table: odcafService.formatResultsAsTable(result),
		})
	} catch (error) {
		res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' })
	}
})

/**
 * GET /api/facility/:id - Get facility details by ID
 */
app.get('/api/facility/:id', (req, res) => {
	try {
		const id = Number.parseInt(req.params.id, 10)

		if (Number.isNaN(id)) {
			res.status(400).json({ error: 'Invalid facility ID' })
			return
		}

		const result = odcafService.fetch(id)

		if (!result) {
			res.status(404).json({ error: `Facility with ID ${id} not found` })
			return
		}

		res.json({
			success: true,
			...result,
		})
	} catch (error) {
		res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' })
	}
})

/**
 * GET /api/filter - Filter facilities
 * Query params: province, city, facilityType, limit (all optional, at least one required)
 */
app.get('/api/filter', (req, res) => {
	try {
		const province = req.query.province as string | undefined
		const city = req.query.city as string | undefined
		const facilityType = req.query.facilityType as string | undefined
		const limit = Number.parseInt(req.query.limit as string, 10) || 50

		if (!province && !city && !facilityType) {
			res.status(400).json({ error: 'At least one filter (province, city, or facilityType) is required' })
			return
		}

		const result = odcafService.filter({ province, city, facilityType, limit })
		res.json({
			success: true,
			...result,
			table: odcafService.formatResultsAsTable(result),
		})
	} catch (error) {
		res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' })
	}
})

/**
 * GET /api/types - List all facility types
 */
app.get('/api/types', (_req, res) => {
	try {
		const types = odcafService.listTypes()
		res.json({
			success: true,
			types,
			count: types.length,
		})
	} catch (error) {
		res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' })
	}
})

/**
 * GET /api/provinces - List all provinces with counts
 */
app.get('/api/provinces', (_req, res) => {
	try {
		const provinces = odcafService.listProvinces()
		res.json({
			success: true,
			provinces,
			count: provinces.length,
		})
	} catch (error) {
		res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' })
	}
})

/**
 * GET /api/stats - Get dataset statistics
 */
app.get('/api/stats', (_req, res) => {
	try {
		const stats = odcafService.getStats()
		res.json({
			success: true,
			...stats,
		})
	} catch (error) {
		res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' })
	}
})

// =============================================
// WIDGET SERVING (for ChatGPT Apps SDK)
// =============================================

/**
 * GET /widget - Serve the widget HTML template
 * This is the template that ChatGPT will load in an iframe
 * IMPORTANT: Must inline JS and CSS for ChatGPT iframe to work
 */
app.get('/widget', (_req, res) => {
	console.log('[Widget] Widget requested by:', _req.headers['user-agent'])
	try {
		// Read the built widget JS and CSS files
		const jsPath = join(rootDir, 'web', 'dist', 'app.js')
		const cssPath = join(rootDir, 'web', 'dist', 'app.css')

		let js: string
		let css: string

		try {
			js = readFileSync(jsPath, 'utf-8')
			css = readFileSync(cssPath, 'utf-8')
			console.log('[Widget] Loaded built assets:', { jsSize: js.length, cssSize: css.length })
		} catch (error) {
			console.error('[Widget] Build files not found. Run: cd web && npm run build')
			console.error('[Widget] Error:', error)
			res
				.status(500)
				.send(
					'Widget not built. Please run `npm run build` in /web directory.\n\n' +
						`Expected files:\n- ${jsPath}\n- ${cssPath}`
				)
			return
		}

		// Create self-contained HTML with inlined JS and CSS
		// This is critical for ChatGPT iframe - external scripts won't load
		const html = `<!DOCTYPE html>
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

		// Set headers for ChatGPT Apps SDK
		res.setHeader('Content-Type', 'text/html+skybridge')
		res.setHeader('Access-Control-Allow-Origin', '*')
		res.setHeader('Cache-Control', 'no-cache') // Avoid caching during development
		res.send(html)

		console.log('[Widget] Sent inlined HTML (length:', html.length, ')')
	} catch (error) {
		console.error('[Widget] Error serving widget:', error)
		res.status(500).send('Error loading widget')
	}
})

/**
 * Serve widget static assets (JS, CSS)
 */
app.use('/widget', express.static(join(rootDir, 'web', 'dist')))

// =============================================
// MCP SSE TRANSPORT (for OpenAI)
// =============================================

/**
 * SSE endpoint - GET to establish SSE connection
 * This is the entry point for OpenAI MCP clients
 */
app.get('/sse', async (_req, res) => {
	console.log('[SSE] New SSE connection request')

	try {
		// Create SSE transport - it will POST messages to /messages
		const transport = new SSEServerTransport('/messages', res)
		const sessionId = transport.sessionId

		// Store transport
		sseTransports.set(sessionId, transport)
		console.log(`[SSE] Session established: ${sessionId}`)

		// Cleanup on close
		transport.onclose = () => {
			console.log(`[SSE] Session closed: ${sessionId}`)
			sseTransports.delete(sessionId)
		}

		res.on('close', () => {
			console.log(`[SSE] Connection closed for session: ${sessionId}`)
			sseTransports.delete(sessionId)
		})

		// Create and connect MCP server
		const server = createMcpServer()
		await server.connect(transport)
	} catch (error) {
		console.error('[SSE] Error establishing SSE stream:', error)
		if (!res.headersSent) {
			res.status(500).send('Error establishing SSE stream')
		}
	}
})

/**
 * Messages endpoint - POST for SSE client messages
 * OpenAI sends messages here with ?sessionId=...
 */
app.post('/messages', async (req, res) => {
	const sessionId = req.query.sessionId as string

	if (!sessionId) {
		console.error('[SSE] No sessionId provided')
		res.status(400).json({ error: 'Missing sessionId query parameter' })
		return
	}

	const transport = sseTransports.get(sessionId)

	if (!transport) {
		console.error(`[SSE] No transport found for session: ${sessionId}`)
		res.status(404).json({ error: 'Session not found' })
		return
	}

	try {
		await transport.handlePostMessage(req, res, req.body)
	} catch (error) {
		console.error('[SSE] Error handling message:', error)
		if (!res.headersSent) {
			res.status(500).json({ error: 'Error handling message' })
		}
	}
})

// =============================================
// MCP STREAMABLE HTTP TRANSPORT (standard)
// =============================================

/**
 * MCP endpoint - POST for requests (Streamable HTTP)
 */
app.post('/mcp', async (req, res) => {
	const sessionId = req.headers['mcp-session-id'] as string | undefined
	let transport: StreamableHTTPServerTransport

	if (sessionId && sessions.has(sessionId)) {
		// Reuse existing session
		const existingTransport = sessions.get(sessionId)
		if (!existingTransport) {
			res.status(400).json({ error: 'Session not found' })
			return
		}
		transport = existingTransport
		console.log(`[MCP] Reusing session: ${sessionId}`)
	} else if (!sessionId && isInitializeRequest(req.body)) {
		// New session initialization
		console.log('[MCP] Initializing new session...')

		transport = new StreamableHTTPServerTransport({
			sessionIdGenerator: () => randomUUID(),
			onsessioninitialized: id => {
				sessions.set(id, transport)
				console.log(`[MCP] Session initialized: ${id}`)
			},
			onsessionclosed: id => {
				sessions.delete(id)
				console.log(`[MCP] Session closed: ${id}`)
			},
		})

		transport.onclose = () => {
			if (transport.sessionId) {
				sessions.delete(transport.sessionId)
				console.log(`[MCP] Transport closed for session: ${transport.sessionId}`)
			}
		}

		// Create and connect MCP server
		const server = createMcpServer()
		await server.connect(transport)
	} else {
		// Invalid request
		console.warn('[MCP] Invalid session request')
		res.status(400).json({
			jsonrpc: '2.0',
			error: {
				code: -32000,
				message: 'Invalid session. Send initialize request without session ID to start a new session.',
			},
			id: null,
		})
		return
	}

	// Handle the request
	await transport.handleRequest(req, res, req.body)
})

/**
 * MCP endpoint - GET for SSE streams (if needed)
 */
app.get('/mcp', async (req, res) => {
	const sessionId = req.headers['mcp-session-id'] as string
	const transport = sessions.get(sessionId)

	if (transport) {
		await transport.handleRequest(req, res)
	} else {
		res.status(400).json({
			error: 'Invalid or missing session ID',
		})
	}
})

/**
 * MCP endpoint - DELETE for session cleanup
 */
app.delete('/mcp', async (req, res) => {
	const sessionId = req.headers['mcp-session-id'] as string
	const transport = sessions.get(sessionId)

	if (transport) {
		await transport.handleRequest(req, res)
	} else {
		res.status(400).json({
			error: 'Invalid or missing session ID',
		})
	}
})

// Start server
const server = app.listen(env.PORT, env.HOST, () => {
	console.log('='.repeat(60))
	console.log('  ODCAF Server - Cultural Facilities Canada')
	console.log('='.repeat(60))
	console.log(`  Status: Running`)
	console.log(`  URL: http://${env.HOST}:${env.PORT}`)
	console.log('')
	console.log('  REST API Endpoints:')
	console.log(`    GET  /api/search?query=...&maxResults=20`)
	console.log(`    GET  /api/facility/:id`)
	console.log(`    GET  /api/filter?province=...&city=...&facilityType=...`)
	console.log(`    GET  /api/types`)
	console.log(`    GET  /api/provinces`)
	console.log(`    GET  /api/stats`)
	console.log('')
	console.log('  MCP SSE Transport (for OpenAI):')
	console.log(`    GET  /sse              - Establish SSE connection`)
	console.log(`    POST /messages?sessionId=...  - Send messages`)
	console.log('')
	console.log('  MCP Streamable HTTP Transport:')
	console.log(`    POST /mcp`)
	console.log('')
	console.log('='.repeat(60))
})

// Graceful shutdown
async function shutdown() {
	console.log('[Server] Shutting down...')

	// Close all SSE transports
	for (const [sessionId, transport] of sseTransports) {
		try {
			console.log(`[Server] Closing SSE session: ${sessionId}`)
			await transport.close()
		} catch (error) {
			console.error(`[Server] Error closing SSE session ${sessionId}:`, error)
		}
	}
	sseTransports.clear()

	// Close HTTP server
	server.close(() => {
		console.log('[Server] HTTP server closed')
		process.exit(0)
	})
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
