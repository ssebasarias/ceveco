/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './pages/**/*.html',
        './components/**/*.html',
        './assets/js/**/*.js'
    ],
    theme: {
        extend: {
            colors: {
                primary: '#FE2418',
                'primary-dark': '#d91b10',
                'primary-light': '#ff4d43',
                secondary: '#00458E',
                'secondary-dark': '#002a5c',
                navy: '#091C49',
                accent: '#FFD23F'
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                heading: ['Manrope', 'Inter', 'sans-serif']
            }
        }
    },
    safelist: [
        // Dynamic classes used in JS template literals — preserve them
        'bg-green-100','text-green-800','bg-red-100','text-red-800','bg-amber-100','text-amber-800',
        'bg-blue-100','text-blue-800','bg-purple-100','text-purple-800','bg-gray-100','text-gray-800',
        'border-l-[#FE2418]','border-l-[#00458E]','border-l-[#091C49]','border-l-[#FFD23F]',
        'bg-[#FE2418]','hover:bg-[#d91b10]','text-[#FE2418]','text-[#091C49]','bg-[#FFD23F]',
        'border-[#FE2418]','focus:ring-[#FE2418]','focus:border-[#FE2418]',
        'animate-pulse','animate-spin'
    ]
};
