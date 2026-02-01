import { FacilityDetail } from './components/FacilityDetail'
import { FilterResults } from './components/FilterResults'
import { SearchResults } from './components/SearchResults'
import { StatsWidget } from './components/StatsWidget'
import { useDynamicHeight } from './hooks/useDynamicHeight'
import { useOpenAiGlobal } from './hooks/useOpenAiGlobal'

// Type definitions for window.openai
declare global {
	interface Window {
		openai?: {
			toolOutput?: any
			toolInput?: any
			toolResponseMetadata?: any
			widgetState?: any
			setWidgetState?: (state: any) => void
			callTool?: (name: string, args: any) => Promise<any>
			theme?: 'light' | 'dark'
			displayMode?: string
			locale?: string
			notifyIntrinsicHeight?: (height: number) => void
		}
	}
}

export default function App() {
	// Use optimized hooks for ChatGPT integration
	const toolOutput = useOpenAiGlobal('toolOutput')
	const metadata = useOpenAiGlobal('toolResponseMetadata')
	const theme = useOpenAiGlobal<'light' | 'dark'>('theme')

	// Notify ChatGPT of dynamic height changes
	useDynamicHeight()

	console.log('[App] Rendering with:', { toolOutput, metadata, theme })

	// Merge metadata (_meta) and toolOutput (structuredContent)
	// We prioritize toolOutput because it contains the dynamic execution results
	const data = { ...(metadata || {}), ...(toolOutput || {}) }

	console.log('[App] Resolved data:', data)

	if (!data || Object.keys(data).length === 0) {
		return (
			<div style={{
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				minHeight: '100vh',
				padding: '1rem',
			}}>
				<div style={{ textAlign: 'center' }}>
					<div style={{
						width: '2rem',
						height: '2rem',
						border: '2px solid #3b82f6',
						borderTopColor: 'transparent',
						borderRadius: '50%',
						margin: '0 auto 1rem',
						animation: 'spin 1s linear infinite',
					}} />
					<p style={{ color: theme === 'dark' ? '#d1d5db' : '#4b5563' }}>
						Loading cultural facilities data...
					</p>
					<p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.5rem' }}>
						{window.openai ? 'Waiting for data...' : 'Widget runtime not available'}
					</p>
				</div>
			</div>
		)
	}

	// Determine which component to render based on tool output
	const toolName = data.toolName || data._toolName || (toolOutput as any)?.toolName

	console.log('[App] Resolved toolName:', toolName)

	switch (toolName) {
		case 'search':
			return <SearchResults data={data} theme={theme} />
		case 'fetch':
			return <FacilityDetail data={data} theme={theme} />
		case 'filter':
			return <FilterResults data={data} theme={theme} />
		case 'stats':
			return <StatsWidget data={data} theme={theme} />
		default:
			return (
				<div style={{ padding: '1rem' }}>
					<pre style={{
						fontSize: '0.75rem',
						padding: '1rem',
						borderRadius: '0.5rem',
						overflow: 'auto',
						backgroundColor: theme === 'dark' ? '#1f2937' : '#f3f4f6',
						color: theme === 'dark' ? '#ffffff' : '#111827',
					}}>
						{JSON.stringify(data, null, 2)}
					</pre>
				</div>
			)
	}
}
