/** @type {import('tailwindcss').Config} */
export default {
	content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
	theme: {
		extend: {
			// Support pour columns-X pour masonry
			columns: {
				1: '1',
				2: '2',
				3: '3',
				4: '4',
			},
		},
	},
	// Safelist pour les classes dynamiques générées par JS
	safelist: [
		// Colors par type
		'text-purple-600',
		'text-purple-400',
		'bg-purple-50',
		'bg-purple-900/20',
		'text-pink-600',
		'text-pink-400',
		'bg-pink-50',
		'bg-pink-900/20',
		'text-blue-600',
		'text-blue-400',
		'bg-blue-50',
		'bg-blue-900/20',
		'text-red-600',
		'text-red-400',
		'bg-red-50',
		'bg-red-900/20',
		'text-amber-600',
		'text-amber-400',
		'bg-amber-50',
		'bg-amber-900/20',
		'text-green-600',
		'text-green-400',
		'bg-green-50',
		'bg-green-900/20',
		'text-indigo-600',
		'text-indigo-400',
		'bg-indigo-50',
		'bg-indigo-900/20',
		'text-teal-600',
		'text-teal-400',
		'bg-teal-50',
		'bg-teal-900/20',
		// Masonry columns
		'columns-1',
		'columns-2',
		'columns-3',
		'columns-4',
		'sm:columns-2',
		'lg:columns-3',
		'xl:columns-4',
		// Break-inside
		'break-inside-avoid',
		// Hover states
		'hover:opacity-70',
		'group-hover:opacity-100',
		'group-hover:scale-105',
		// Animations
		'scale-110',
		'rotate-6',
	],
	plugins: [],
}
