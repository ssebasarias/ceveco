/**
 * Tailwind Configuration Global
 * Este archivo centraliza la configuración de Tailwind para todas las páginas
 */

tailwind.config = {
    theme: {
        extend: {
            colors: {
                // Colores Primarios (Naranja)
                primary: {
                    DEFAULT: '#FF6B35',
                    dark: '#E55A2B',
                    light: '#FF8C5F'
                },
                // Colores Secundarios (Azul)
                secondary: {
                    DEFAULT: '#004E89',
                    dark: '#003D6B',
                    light: '#1A6BA8'
                },
                // Colores de Acento (Amarillo)
                accent: {
                    DEFAULT: '#FFD23F',
                    dark: '#E6BD38'
                },
                // Colores de Estado
                success: '#10B981',
                warning: '#F59E0B',
                error: '#EF4444',
                info: '#3B82F6',
                // Mantener compatibilidad
                dark: '#1F2937',
            },
            fontFamily: {
                sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
                heading: ['Outfit', 'Inter', 'sans-serif']
            },
            borderRadius: {
                'sm': '0.25rem',
                'md': '0.5rem',
                'lg': '0.75rem',
                'xl': '1rem',
                '2xl': '1.5rem',
            },
            boxShadow: {
                'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }
        }
    }
}
