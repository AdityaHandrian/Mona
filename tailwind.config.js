import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Lato', ...defaultTheme.fontFamily.sans],
                lato: ['Lato', 'sans-serif'],
            },
            colors: {
                'growth-green': {
                    50: '#f0f9f4',
                    100: '#dcf2e3',
                    200: '#bbe5c9',
                    300: '#8fd1a4',
                    400: '#5bb377',
                    500: '#058743', // Main growth green
                    600: '#047a3b',
                    700: '#046830',
                    800: '#045428',
                    900: '#034521',
                    950: '#012611',
                },
                'growth-green-light': '#6FB386', // Hover/secondary green
                
                // Custom named colors
                'warm-ivory': '#F8F7F0',
                'white': '#FFFFFF',
                'charcoal': '#2C2C2C',
                'goal-gold': '#EFBF04',
                'warning-amber': '#F0AD4E',
                'medium-gray': '#757575',
                'light-gray': '#E0E0E0',
                
                'expense-red': {
                    50: '#fef2f2',
                    100: '#fee2e2',
                    200: '#fecaca',
                    300: '#fca5a5',
                    400: '#f87171',
                    500: '#D9534F', // Main expense red
                    600: '#dc2626',
                    700: '#b91c1c',
                    800: '#991b1b',
                    900: '#7f1d1d',
                    950: '#450a0a',
                },
            },
            animation: {
                'slide-in-right': 'slideInRight 0.3s ease-out',
            },
            keyframes: {
                slideInRight: {
                    '0%': { transform: 'translateX(100%)', opacity: '0' },
                    '100%': { transform: 'translateX(0)', opacity: '1' },
                },
            },
        },
    },

    plugins: [forms],
};
