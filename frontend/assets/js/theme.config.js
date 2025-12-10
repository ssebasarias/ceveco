// Tailwind CSS Configuration
tailwind.config = {
    theme: {
        extend: {
            colors: {
                primary: { DEFAULT: 'var(--brand-red)', dark: '#d91b10', light: '#ff4d4d' },
                secondary: { DEFAULT: 'var(--brand-blue-royal)', dark: '#002a5c', light: '#3366cc' },
                accent: { DEFAULT: '#FFD23F', dark: '#E6BD38' },
                dark: 'var(--brand-navy)',
                white: 'var(--surface-white)',
                gray: {
                    50: 'var(--surface-off-white)',
                    100: '#f1f5f9',
                    200: 'var(--border-color)',
                    800: 'var(--text-primary)',
                    900: 'var(--brand-navy)',
                },
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                heading: ['Montserrat', 'sans-serif'],
            }
        }
    }
};
