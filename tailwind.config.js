/** @type {import('tailwindcss').Config} */
// Configuración de Tailwind para NativeWind v4.
// FUENTE DE VERDAD de los tokens: Design System v2.0 (04-mecai-design-system.md).
// Mantener sincronizado con src/constants/theme.ts.
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // PRIMARY — Verde Petróleo (600 = main brand)
        primary: {
          50: '#EAF6F3',
          100: '#D1EDE8',
          400: '#3D9080',
          500: '#2D7A6B',
          600: '#1F6B5E', // main brand: headers, botones primarios, fondo monograma
          // 700/900 no están en el design system v2.0 — fallback del tech spec (tonos oscuros coherentes)
          700: '#1A4840',
          900: '#0D2420',
        },
        // ACCENT — Naranja Cálido (600 = alertas críticas / "AI" del wordmark)
        accent: {
          100: '#FDE8C8',
          400: '#F4A44A',
          500: '#F08C1F',
          600: '#E8780A',
        },
        // NEUTRAL — escala de grises cálidos
        neutral: {
          0: '#FFFFFF',
          50: '#F8F7F4', // fondo de pantalla — blanco hueso
          100: '#EFEFEC',
          200: '#DDDDD9',
          500: '#8A8A85',
          700: '#4A4A46',
          900: '#1C1C18', // texto principal
        },
        // SEMÁNTICOS
        success: '#22C55E',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
      },
      // Sistema de 8px (coincide con la escala por defecto de Tailwind)
      spacing: {
        1: 4,
        2: 8,
        3: 12,
        4: 16,
        5: 20,
        6: 24,
        8: 32,
        10: 40,
        12: 48,
        16: 64,
      },
      borderRadius: {
        sm: 8,
        md: 12,
        lg: 16,
        xl: 24,
        full: 9999,
      },
      fontFamily: {
        // Display: Sora (Bold / SemiBold)
        display: ['Sora_700Bold'],
        'display-semibold': ['Sora_600SemiBold'],
        // Body: Inter (Regular / Medium)
        body: ['Inter_400Regular'],
        'body-medium': ['Inter_500Medium'],
        // Mono: JetBrains Mono — datos técnicos
        mono: ['JetBrainsMono_400Regular'],
      },
      fontSize: {
        xs: 12,
        sm: 14,
        base: 16,
        lg: 18,
        xl: 20,
        '2xl': 24,
        '3xl': 30,
        '4xl': 36,
      },
    },
  },
  plugins: [],
}
