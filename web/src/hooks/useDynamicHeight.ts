import { useEffect } from 'react'

/**
 * Hook pour notifier ChatGPT de la hauteur du widget
 * Permet à l'iframe de s'ajuster automatiquement au contenu
 * 
 * @example
 * ```tsx
 * function App() {
 *   useDynamicHeight()
 *   // ... rest of component
 * }
 * ```
 */
export function useDynamicHeight() {
	useEffect(() => {
		const updateHeight = () => {
			const height = document.body.scrollHeight
			window.openai?.notifyIntrinsicHeight?.(height)
		}

		// Update initial
		updateHeight()

		// Observer les changements de taille
		const observer = new ResizeObserver(updateHeight)
		observer.observe(document.body)

		// Aussi sur mutation du DOM
		const mutationObserver = new MutationObserver(updateHeight)
		mutationObserver.observe(document.body, {
			childList: true,
			subtree: true,
			attributes: true,
		})

		return () => {
			observer.disconnect()
			mutationObserver.disconnect()
		}
	}, [])
}
