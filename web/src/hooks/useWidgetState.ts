import { useEffect, useState } from 'react'

/**
 * Hook pour gérer l'état persisté du widget
 * L'état est synchronisé avec window.openai.setWidgetState
 *
 * @example
 * ```tsx
 * const [selectedTask, setSelectedTask] = useWidgetState({ taskId: null })
 * ```
 */
export function useWidgetState<T>(initialState: T | (() => T)) {
	const [state, setState] = useState<T>(() => {
		// Lire l'état initial depuis window.openai si disponible
		const existing = window.openai?.widgetState
		if (existing) return existing as T

		return typeof initialState === 'function' ? (initialState as () => T)() : initialState
	})

	// Synchroniser avec window.openai.setWidgetState
	useEffect(() => {
		if (window.openai?.setWidgetState && state) {
			window.openai.setWidgetState(state)
		}
	}, [state])

	return [state, setState] as const
}
