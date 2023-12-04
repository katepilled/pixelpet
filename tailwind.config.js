/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['src/views/**.{html,hbs}'],

	theme: {
		extend: {
			backgroundColor: {
				'sky-blue': '#D7F0FF',
				grass: '#8be265',
				'grass-hover': '#6ebc4b',
				yellow: '#FFFCE8',
			},
			textColor: {
				grass: '#8be265',
				'grass-hover': '#6ebc4b',
				'light-brown': '#EADDCA',
			},
			borderColor: {
				grass: '#8be265',
			},
			fontFamily: {
				cherry: ['Cherry Bomb', 'serif'],
				norm: ['Reem Kufi Fun', 'serif'],
				pixel: ['Pixelify Sans', 'sans-serif'],
			},
		},
	},
	plugins: [
		function ({ addUtilities }) {
			const newUtilities = {
				'.text-stroke': {
					WebkitTextStroke: '2px white',
					textStroke: '2px white',
				},
			};
			addUtilities(newUtilities, ['responsive', 'hover']);
		},
	],
};
//  npx tailwindcss build -o public/dist/output.css
