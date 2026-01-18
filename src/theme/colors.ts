// Paleta de colores moderna y hermosa con soporte Dark Mode
// LIGHT MODE: Limpio, moderno y profesional
// DARK MODE: Premium, elegante y futurista

export const lightColors = {
  // Primario: Azul vibrante
  navy: {
    dark: '#2563EB',
    main: '#3B82F6',    // Azul principal
    light: '#DBEAFE',   // Azul muy claro
  },
  // Secundario
  slate: {
    dark: '#1E40AF',
    main: '#3B82F6',
    light: '#DBEAFE',
  },
  // Neutrales
  neutral: {
    white: '#FFFFFF',
    gray50: '#FAFAFA',
    gray100: '#F3F4F6',
    gray200: '#E5E7EB',
    gray300: '#D1D5DB',
    gray400: '#9CA3AF',
    black: '#111827',
  },
  // Mensajes del usuario: Azul vibrante
  user: {
    bg: '#3B82F6',
    text: '#FFFFFF',
  },
  // Mensajes del bot: Gris más oscuro para que se note bien
  bot: {
    bg: '#9CA3AF',
    text: '#FFFFFF',
  },
  // Estados
  status: {
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
  },
  // Sombras suaves
  shadow: {
    sm: 'rgba(59, 130, 246, 0.08)',
    md: 'rgba(59, 130, 246, 0.12)',
    lg: 'rgba(59, 130, 246, 0.15)',
  },
};

export const darkColors = {
  // Primario: Azul para dark mode
  navy: {
    dark: '#1e3a8a',
    main: '#1e3a8a',    // Azul oscuro
    light: '#334155',
  },
  // Secundario
  slate: {
    dark: '#1e3a8a',
    main: '#64748B',
    light: '#94A3B8',
  },
  // Neutrales: Grises oscuros
  neutral: {
    white: '#1e3a8a',   // Fondo oscuro principal
    gray50: '#1f2937',  // Muy oscuro
    gray100: '#2d3748', // Oscuro
    gray200: '#374151', // Gris oscuro
    gray300: '#4B5563',
    gray400: '#6B7280',
    black: '#F9FAFB',   // Texto claro
  },
  // Mensajes del usuario: Azul brillante
  user: {
    bg: '#3B82F6',
    text: '#FFFFFF',
  },
  // Mensajes del bot: Gris oscuro pero visible
  bot: {
    bg: '#374151',
    text: '#F3F4F6',
  },
  // Estados
  status: {
    success: '#10B981',
    error: '#FF6B6B',
    warning: '#FFD93D',
    info: '#3B82F6',
  },
  // Sombras
  shadow: {
    sm: 'rgba(59, 130, 246, 0.1)',
    md: 'rgba(59, 130, 246, 0.15)',
    lg: 'rgba(59, 130, 246, 0.2)',
  },
};

// Paleta activa (se cambia según tema)
export const colors = lightColors;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};
