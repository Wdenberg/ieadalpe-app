/** @type {const} */
const themeColors = {
  // 🎯 Cores principais
  primary: { light: '#5A0A0A', dark: '#7A2E2E' },   // vinho mais fiel ao site
  secondary: { light: '#D9A441', dark: '#D9A441' }, // dourado (ANTES era tertiary)
  tertiary: { light: '#2F6F55', dark: '#2F6F55' },  // verde vira apoio
  
  action: { light: '#D9A441', dark: '#D9A441' },    // ações = dourado (mais consistente)

  // 🧱 Backgrounds
  background: { light: '#F4E6D2', dark: '#2B1F1F' },
  surface: { light: '#FFFFFF', dark: '#3D2F2F' },

  // 📝 Texto
  foreground: { light: '#7A2E2E', dark: '#F5F2EF' },
  muted: { light: '#7A6A60', dark: '#B8A89F' },

  // 🔧 Utilitários
  border: { light: '#E8D4C0', dark: '#4D3F38' },
  success: { light: '#2F6F55', dark: '#5FBF8F' },
  warning: { light: '#D9A441', dark: '#FFB84D' },
  error: { light: '#7A2E2E', dark: '#D97070' },
};

module.exports = { themeColors };
