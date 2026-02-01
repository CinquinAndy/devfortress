import { useEffect, useState } from 'react'
import { SearchResults } from './components/SearchResults'
import { FacilityCard } from './components/FacilityCard'
import { StatsDashboard } from './components/StatsDashboard'
import { FilterResults } from './components/FilterResults'
import { TypesList } from './components/TypesList'
import { ProvincesList } from './components/ProvincesList'

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
		}
	}
}

export default function App() {
	const [toolOutput, setToolOutput] = useState<any>(null)
	const [widgetState, setWidgetState] = useState<any>({})

	useEffect(() => {
		// Read initial data from window.openai
		if (window.openai?.toolOutput) {
			setToolOutput(window.openai.toolOutput)
		}

		// Subscribe to changes
		const checkForUpdates = () => {
			if (window.openai?.toolOutput !== toolOutput) {
				setToolOutput(window.openai.toolOutput)
			}
			if (window.openai?.widgetState !== widgetState) {
				setWidgetState(window.openai.widgetState || {})
			}
		}

		const interval = setInterval(checkForUpdates, 100)
		return () => clearInterval(interval)
	}, [])

	// Update widget state when it changes
	useEffect(() => {
		if (window.openai?.setWidgetState && widgetState) {
			window.openai.setWidgetState(widgetState)
		}
	}, [widgetState])

	if (!toolOutput) {
		return (
			<div className="flex items-center justify-center min-h-screen p-4">
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
					<p className="text-gray-600">Loading...</p>
				</div>
			</div>
		)
	}

	// Determine which component to render based on tool output
	const toolName = toolOutput.toolName || toolOutput._toolName

	switch (toolName) {
		case 'search':
			return <SearchResults data={toolOutput} />
		case 'fetch':
			return <FacilityCard data={toolOutput} />
		case 'filter':
			return <FilterResults data={toolOutput} />
		case 'stats':
			return <StatsDashboard data={toolOutput} />
		case 'list_types':
			return <TypesList data={toolOutput} />
		case 'list_provinces':
			return <ProvincesList data={toolOutput} />
		default:
			return (
				<div className="p-4">
					<pre className="text-xs bg-gray-100 p-4 rounded overflow-auto">
						{JSON.stringify(toolOutput, null, 2)}
					</pre>
				</div>
			)
	}
}
