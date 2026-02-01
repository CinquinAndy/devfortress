import { useState } from 'react'

interface SearchResult {
	ids: number[]
	totalCount: number
	preview: Array<{
		id: number
		name: string
		type: string
		city: string
		province: string
	}>
	query?: string
}

interface Props {
	data: {
		ids?: number[]
		totalCount?: number
		preview?: Array<{
			id: number
			name: string
			type: string
			city: string
			province: string
		}>
		query?: string
	}
	theme?: 'light' | 'dark'
}

const TYPE_ICONS: Record<string, string> = {
	museum: '🏛️',
	gallery: '🖼️',
	'library or archives': '📚',
	'theatre/performance and concert hall': '🎭',
	'heritage or historic site': '🏰',
	'festival site': '🎪',
	'art or cultural centre': '🎨',
	artist: '👨‍🎨',
	miscellaneous: '📍',
}

const TYPE_COLORS: Record<string, { light: string; dark: string; bg: string; bgDark: string }> = {
	museum: { light: 'text-purple-600', dark: 'text-purple-400', bg: 'bg-purple-50', bgDark: 'bg-purple-900/20' },
	gallery: { light: 'text-pink-600', dark: 'text-pink-400', bg: 'bg-pink-50', bgDark: 'bg-pink-900/20' },
	'library or archives': { light: 'text-blue-600', dark: 'text-blue-400', bg: 'bg-blue-50', bgDark: 'bg-blue-900/20' },
	'theatre/performance and concert hall': { light: 'text-red-600', dark: 'text-red-400', bg: 'bg-red-50', bgDark: 'bg-red-900/20' },
	'heritage or historic site': { light: 'text-amber-600', dark: 'text-amber-400', bg: 'bg-amber-50', bgDark: 'bg-amber-900/20' },
	'festival site': { light: 'text-green-600', dark: 'text-green-400', bg: 'bg-green-50', bgDark: 'bg-green-900/20' },
	'art or cultural centre': { light: 'text-indigo-600', dark: 'text-indigo-400', bg: 'bg-indigo-50', bgDark: 'bg-indigo-900/20' },
	artist: { light: 'text-teal-600', dark: 'text-teal-400', bg: 'bg-teal-50', bgDark: 'bg-teal-900/20' },
}

function getTypeIcon(type: string): string {
	return TYPE_ICONS[type.toLowerCase()] || '📍'
}

function getTypeColor(type: string, theme: 'light' | 'dark') {
	const colors = TYPE_COLORS[type.toLowerCase()] || TYPE_COLORS['museum']
	return theme === 'dark' ? colors.dark : colors.light
}

function getTypeBg(type: string, theme: 'light' | 'dark') {
	const colors = TYPE_COLORS[type.toLowerCase()] || TYPE_COLORS['museum']
	return theme === 'dark' ? colors.bgDark : colors.bg
}

function FacilityCard({ 
	item, 
	theme 
}: { 
	item: { id: number; name: string; type: string; city: string; province: string }
	theme: 'light' | 'dark'
}) {
	const [isHovered, setIsHovered] = useState(false)
	
	const bgClass = theme === 'dark' ? 'bg-gray-800' : 'bg-white'
	const borderClass = theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
	const textClass = theme === 'dark' ? 'text-white' : 'text-gray-900'
	const textSecondaryClass = theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
	const hoverBgClass = theme === 'dark' ? 'hover:bg-gray-750' : 'hover:bg-gray-50'
	
	const typeColor = getTypeColor(item.type, theme)
	const typeBg = getTypeBg(item.type, theme)
	
	return (
		<div
			className={`
				group relative overflow-hidden rounded-xl border ${borderClass} ${bgClass}
				transition-all duration-300 ease-out
				${hoverBgClass}
				${isHovered ? 'shadow-xl scale-[1.02]' : 'shadow-md'}
				cursor-pointer break-inside-avoid mb-4
			`}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			{/* Gradient overlay */}
			<div className={`absolute inset-0 bg-gradient-to-br ${typeBg} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
			
			<div className="relative p-5">
				{/* Header with icon */}
				<div className="flex items-start gap-3 mb-3">
					<div className={`
						text-3xl transition-transform duration-300
						${isHovered ? 'scale-110 rotate-6' : 'scale-100'}
					`}>
						{getTypeIcon(item.type)}
					</div>
					
					<div className="flex-1 min-w-0">
						<h3 className={`
							font-bold text-lg leading-tight mb-1 ${textClass}
							line-clamp-2 transition-colors duration-200
						`}>
							{item.name}
						</h3>
						
						{/* Type badge */}
						<div className="flex items-center gap-2 flex-wrap">
							<span className={`
								inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium
								${typeBg} ${typeColor}
								transition-all duration-200
								${isHovered ? 'scale-105' : ''}
							`}>
								{item.type}
							</span>
						</div>
					</div>
				</div>
				
				{/* Location info */}
				<div className="space-y-2 mt-4">
					<div className="flex items-center gap-2">
						<span className="text-lg">📍</span>
						<div className="flex-1">
							<p className={`text-sm font-medium ${textClass} capitalize`}>
								{item.city}
							</p>
							<p className={`text-xs ${textSecondaryClass}`}>
								{item.province}
							</p>
						</div>
					</div>
				</div>
				
				{/* Facility ID badge */}
				<div className="mt-4 pt-3 border-t border-opacity-50" style={{ borderColor: 'currentColor', opacity: 0.1 }}>
					<div className="flex items-center justify-between">
						<span className={`text-xs font-mono ${textSecondaryClass}`}>
							ID: {item.id}
						</span>
						
						{/* Hover indicator */}
						<div className={`
							flex items-center gap-1 text-xs font-medium
							transition-all duration-200
							${isHovered ? `opacity-100 ${typeColor}` : 'opacity-0'}
						`}>
							View details
							<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
							</svg>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export function SearchResults({ data, theme = 'light' }: Props) {
	const result: SearchResult = {
		ids: data.ids || [],
		totalCount: data.totalCount || 0,
		preview: data.preview || [],
		query: data.query,
	}

	const bgClass = theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
	const textClass = theme === 'dark' ? 'text-white' : 'text-gray-900'
	const textSecondaryClass = theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
	const borderClass = theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
	const cardBgClass = theme === 'dark' ? 'bg-gray-800' : 'bg-white'

	if (result.preview.length === 0) {
		return (
			<div className={`min-h-screen p-6 ${bgClass}`}>
				<div className={`max-w-2xl mx-auto p-8 rounded-2xl shadow-lg border ${cardBgClass} ${borderClass}`}>
					<div className="text-center py-12">
						<div className="text-6xl mb-6 animate-bounce">🔍</div>
						<h2 className={`text-2xl font-bold mb-3 ${textClass}`}>No Results Found</h2>
						{result.query && (
							<p className={`text-lg mb-6 ${textSecondaryClass}`}>
								No facilities found matching <span className="font-semibold">"{result.query}"</span>
							</p>
						)}
						<div className={`text-sm space-y-2 mt-8 ${textSecondaryClass}`}>
							<p className="font-semibold text-base">💡 Try:</p>
							<ul className="space-y-2 text-left max-w-md mx-auto">
								<li className="flex items-start gap-2">
									<span>•</span>
									<span>Using broader search terms</span>
								</li>
								<li className="flex items-start gap-2">
									<span>•</span>
									<span>Checking spelling</span>
								</li>
								<li className="flex items-start gap-2">
									<span>•</span>
									<span>Searching by city or province code (ON, QC, BC...)</span>
								</li>
							</ul>
						</div>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className={`min-h-screen p-6 ${bgClass}`}>
			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<div className="mb-8 sticky top-0 z-10 pb-4" style={{ backdropFilter: 'blur(12px)' }}>
					<div className={`p-6 rounded-2xl shadow-lg border ${cardBgClass} ${borderClass}`}>
						<div className="flex items-center gap-3 mb-3">
							<div className="text-3xl">🔍</div>
							<h2 className={`text-3xl font-bold ${textClass}`}>
								Search Results
							</h2>
						</div>
						{result.query ? (
							<p className={`text-lg ${textSecondaryClass}`}>
								Found <span className="font-bold text-blue-500">{result.totalCount.toLocaleString()}</span>{' '}
								facilities matching <span className="font-semibold">"{result.query}"</span>
							</p>
						) : (
							<p className={`text-lg ${textSecondaryClass}`}>
								Found <span className="font-bold text-blue-500">{result.totalCount.toLocaleString()}</span>{' '}
								facilities
							</p>
						)}
					</div>
				</div>

				{/* Masonry Grid */}
				<div 
					className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4"
					style={{ columnGap: '1rem' }}
				>
					{result.preview.map(item => (
						<FacilityCard
							key={item.id}
							item={item}
							theme={theme}
						/>
					))}
				</div>

				{/* Footer */}
				{result.totalCount > result.preview.length && (
					<div className={`mt-8 p-6 rounded-2xl shadow-lg border ${cardBgClass} ${borderClass}`}>
						<div className="text-center">
							<p className={`text-base font-medium mb-2 ${textClass}`}>
								📊 Showing {result.preview.length} of {result.totalCount.toLocaleString()} results
							</p>
							<p className={`text-sm ${textSecondaryClass}`}>
								💡 Use <span className="font-semibold">filter</span> tool for more specific results
							</p>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}
