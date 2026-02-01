#!/usr/bin/env bun

/**
 * Script to run server + ngrok for ChatGPT testing
 * Usage: bun scripts/dev-with-ngrok.ts
 */

import { spawn, ChildProcess } from 'node:child_process'

const PORT = process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 3001
const NGROK_PORT = PORT

console.log('🚀 Starting ODCAF MCP Server with ngrok...\n')

// Kill existing processes
console.log('🧹 Cleaning up existing processes...')
try {
	const pkill1 = spawn('pkill', ['-f', 'bun.*dev'], { stdio: 'ignore' })
	const pkill2 = spawn('pkill', ['-f', 'ngrok.*http'], { stdio: 'ignore' })
	await Promise.all([
		new Promise<void>(resolve => {
			pkill1.on('close', () => resolve())
			pkill1.on('error', () => resolve())
		}),
		new Promise<void>(resolve => {
			pkill2.on('close', () => resolve())
			pkill2.on('error', () => resolve())
		}),
	])
} catch {
	// Ignore errors
}
await new Promise(resolve => setTimeout(resolve, 1000))

// Check if ngrok is installed
try {
	await new Promise<void>((resolve, reject) => {
		const check = spawn('which', ['ngrok'])
		check.on('close', code => {
			if (code !== 0) reject(new Error('ngrok not found'))
			else resolve()
		})
		check.on('error', reject)
	})
} catch {
	console.error('❌ ngrok is not installed!')
	console.error('   Install it from: https://ngrok.com/download')
	process.exit(1)
}

// Start ngrok first (so we can get the URL before starting server)
console.log('🌐 Starting ngrok tunnel...')
const ngrok: ChildProcess = spawn('ngrok', ['http', String(NGROK_PORT)], {
	stdio: ['ignore', 'pipe', 'pipe'],
})

let ngrokUrl: string | null = null

ngrok.on('error', err => {
	console.error('❌ Failed to start ngrok:', err)
	process.exit(1)
})

// Wait for ngrok to start and get URL
await new Promise(resolve => setTimeout(resolve, 3000))

for (let i = 0; i < 5; i++) {
	try {
		const response = await fetch('http://localhost:4040/api/tunnels')
		const data = (await response.json()) as { tunnels?: Array<{ public_url: string }> }
		if (data.tunnels && data.tunnels.length > 0) {
			ngrokUrl = data.tunnels[0].public_url
			console.log(`✅ Ngrok tunnel: ${ngrokUrl}`)
			break
		}
	} catch {
		// Ngrok not ready yet
	}
	await new Promise(resolve => setTimeout(resolve, 1000))
}

if (!ngrokUrl) {
	console.warn('⚠️  Could not get ngrok URL automatically')
	console.warn('   Check http://localhost:4040 for the ngrok dashboard')
	console.warn('   Server will start without PUBLIC_URL')
}

// Start server with PUBLIC_URL (if available)
console.log(`📦 Starting server on port ${PORT}...`)
const server: ChildProcess = spawn('bun', ['run', 'dev'], {
	env: { ...process.env, PORT: String(PORT), PUBLIC_URL: ngrokUrl || undefined },
	stdio: 'inherit',
})

server.on('error', err => {
	console.error('❌ Failed to start server:', err)
	ngrok.kill()
	process.exit(1)
})

server.on('exit', code => {
	if (code !== 0 && code !== null) {
		console.error(`❌ Server exited with code ${code}`)
		ngrok.kill()
		process.exit(1)
	}
})

// Wait for server to be ready
console.log('⏳ Waiting for server to start...')
let serverReady = false
for (let i = 0; i < 10; i++) {
	try {
		const response = await fetch(`http://localhost:${PORT}/health`)
		if (response.ok) {
			serverReady = true
			console.log('✅ Server is running!')
			break
		}
	} catch {
		// Server not ready yet
	}
	await new Promise(resolve => setTimeout(resolve, 1000))
}

if (!serverReady) {
	console.error('❌ Server failed to start')
	server.kill()
	ngrok.kill()
	process.exit(1)
}

// Display info
console.log('')
console.log('='.repeat(60))
console.log('  ✅ Server + ngrok are running!')
console.log('='.repeat(60))
console.log('')
console.log(`  📍 Local URL:  http://localhost:${PORT}`)
if (ngrokUrl) {
	console.log(`  🌐 Public URL: ${ngrokUrl}`)
	console.log('')
	console.log('  🔗 Use this URL in ChatGPT MCP settings:')
	console.log(`     ${ngrokUrl}/sse`)
} else {
	console.log('  🌐 Public URL: Check http://localhost:4040')
}
console.log('')
console.log('  📊 Ngrok UI:    http://localhost:4040')
console.log('')
console.log('  Press Ctrl+C to stop both processes')
console.log('')

// Cleanup on exit
const cleanup = () => {
	console.log('\n🛑 Shutting down...')
	if (server && !server.killed) {
		server.kill('SIGTERM')
	}
	if (ngrok && !ngrok.killed) {
		ngrok.kill('SIGTERM')
	}
	// Give processes time to cleanup
	setTimeout(() => {
		spawn('pkill', ['-f', 'bun.*dev'], { stdio: 'ignore' })
		spawn('pkill', ['-f', 'ngrok.*http'], { stdio: 'ignore' })
		console.log('✅ Cleaned up')
		process.exit(0)
	}, 1000)
}

process.on('SIGINT', cleanup)
process.on('SIGTERM', cleanup)

// Keep the process alive
// The script will keep running as long as the child processes are alive
// We need to prevent the script from exiting
process.stdin.resume()

// Keep event loop alive
const keepAlive = setInterval(() => {
	// Check if processes are still alive
	if (server.killed && ngrok.killed) {
		clearInterval(keepAlive)
		cleanup()
	}
}, 2000)

// Wait indefinitely
await new Promise(() => {
	// Never resolves - keeps script running
})
