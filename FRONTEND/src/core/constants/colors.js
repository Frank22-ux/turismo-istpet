// Paleta de colores unificada para todo el sistema
// Basada en la guía de estilo de ECURUT Travel

export const COLORS = {
  // Colores primarios
  navy: '#022B3A',       // Azul oscuro
  teal: '#1F7A8C',       // Azul verde
  sky: '#BFDBF7',        // Azul cielo
  lavender: '#E1E5F2',   // Lavanda
  white: '#FFFFFF',      // Blanco

  // Colores con transparencia
  teal_10: 'rgba(31, 122, 140, 0.10)',
  teal_20: 'rgba(31, 122, 140, 0.20)',
  teal_25: 'rgba(31, 122, 140, 0.25)',

  // Colores complementarios
  darkTeal: '#1a6478',   // Teal oscuro para hover
  lightTeal: 'rgba(31, 122, 140, 0.15)',

  // Grises auxiliares
  textPrimary: '#1e293b',
  textSecondary: '#64748b',
  borderColor: '#e2e8f0',
  bgLight: '#f8fafc',
  bgDark: '#f0f2f5',
};

// Exportar como CSS variables string para inyectar en estilos globales
export const cssVariables = `
  --navy: ${COLORS.navy};
  --teal: ${COLORS.teal};
  --sky: ${COLORS.sky};
  --lavender: ${COLORS.lavender};
  --white: ${COLORS.white};
  --teal-10: ${COLORS.teal_10};
  --teal-20: ${COLORS.teal_20};
  --dark-teal: ${COLORS.darkTeal};
  --light-teal: ${COLORS.lightTeal};
  --text-primary: ${COLORS.textPrimary};
  --text-secondary: ${COLORS.textSecondary};
  --border-color: ${COLORS.borderColor};
  --bg-light: ${COLORS.bgLight};
  --bg-dark: ${COLORS.bgDark};
`;
