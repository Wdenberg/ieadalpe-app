/** @type {const} */
const themeColors = {
  // Cores Oficiais IEADALPE - Baseadas no Design do Site
  primary: { light: '#5A0A0A', dark: '#5A0A0A' },        // Vinho/Bordô Profundo
  secondary: { light: '#2F6F55', dark: '#2F6F55' },      // Verde Escuro
  tertiary: { light: '#E8A430', dark: '#E8A430' },       // Dourado
  
  // Backgrounds e Surfaces
  background: { light: '#F4E6D2', dark: '#2B1F1F' },     // Bege Claro (light), Escuro (dark)
  surface: { light: '#FFFFFF', dark: '#3D2F2F' },        // Branco (light), Escuro (dark)
  
  // Text Colors
  foreground: { light: '#2B1F1F', dark: '#F4E6D2' },     // Escuro (light), Bege (dark)
  muted: { light: '#6B5B52', dark: '#B8A89F' },          // Cinza Médio
  
  // Utility Colors
  border: { light: '#E8D4C0', dark: '#4D3F38' },         // Borde claro/escuro
  success: { light: '#2F6F55', dark: '#5FBF8F' },        // Verde
  warning: { light: '#E8A430', dark: '#FFB84D' },        // Dourado/Laranja
  error: { light: '#5A0A0A', dark: '#D97070' },          // Vinho/Rosa
};

module.exports = { themeColors };
