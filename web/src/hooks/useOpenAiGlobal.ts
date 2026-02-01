import { useEffect, useState } from 'react'

/**
 * Hook pour lire les valeurs de window.openai de manière réactive
 * Utilisé pour accéder aux données du MCP tool et au contexte ChatGPT
 * 
 * @example
 * ```tsx
 * const toolOutput = useOpenAiGlobal('toolOutput')
 * const theme = useOpenAiGlobal<'light' | 'dark'>('theme')
 * ```
 */
export function useOpenAiGlobal<T = any>(
	key: 'toolOutput' | 'toolInput' | 'toolResponseMetadata' | 'widgetState' | 'theme' | 'displayMode' | 'locale'
): T | undefined {
	const [value, setValue] = useState<T | undefined>(
		() => window.openai?.[key] as T | undefined
	)

	useEffect(() => {
		// Vérifier les changements
		const checkUpdates = () => {
			const current = window.openai?.[key] as T | undefined
			const currentStr = JSON.stringify(current)
			const valueStr = JSON.stringify(value)

			if (currentStr !== valueStr) {
				console.log(`[useOpenAiGlobal] ${key} updated:`, current)
				setValue(current)
			}
		}

		// Check initial
		checkUpdates()

		// Polling léger - ChatGPT met à jour window.openai de manière asynchrone
		const interval = setInterval(checkUpdates, 100)

		return () => clearInterval(interval)
	}, [key, value])

	return value
}
