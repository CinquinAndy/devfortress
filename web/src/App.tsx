import { FacilityCard } from './components/FacilityCard'
import { FilterResults } from './components/FilterResults'
import { ProvincesList } from './components/ProvincesList'
import { SearchResults } from './components/SearchResults'
import { StatsDashboard } from './components/StatsDashboard'
import { TypesList } from './components/TypesList'
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

	// Prioritize metadata (_meta) over toolOutput (structuredContent)
	// metadata contains full data for widget, toolOutput is minimal data for model
	const data = metadata || toolOutput

	if (!data) {
		return (
			<div className="flex items-center justify-center min-h-screen p-4">
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
					<p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Loading cultural facilities data...</p>
					<p className="text-xs text-gray-400 mt-2">
						{window.openai ? 'Waiting for data...' : 'Widget runtime not available'}
					</p>
				</div>
			</div>
		)
	}

	// Determine which component to render based on tool output
	const toolName = data.toolName || data._toolName

	switch (toolName) {
		case 'search':
			return <SearchResults data={data} theme={theme} />
		case 'fetch':
			return <FacilityCard data={data} theme={theme} />
		case 'filter':
			return <FilterResults data={data} theme={theme} />
		case 'stats':
			return <StatsDashboard data={data} theme={theme} />
		case 'list_types':
			return <TypesList data={data} theme={theme} />
		case 'list_provinces':
			return <ProvincesList data={data} theme={theme} />
		default:
			return (
				<div className="p-4">
					<pre
						className={`text-xs p-4 rounded overflow-auto ${
							theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'
						}`}
					>
						{JSON.stringify(data, null, 2)}
					</pre>
				</div>
			)
	}
}
