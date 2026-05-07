/** @type {const} */
const themeColors = {
  // 🎯 Cores extraídas diretamente da imagem
  primary: { 
    light: '#03318C', // Azul Royal profundo (topo da lista)
    dark: '#03318C'   // Mantendo a identidade no dark ou use um tom 10% mais claro
  },
  secondary: { 
    light: '#023E73', // Azul Marinho médio
    dark: '#023E73' 
  },
  tertiary: { 
    light: '#02730A', // Verde vibrante (ajustado para o Hex da imagem)
    dark: '#02730A' 
  },
  
  // ⚡ Ações e Destaques
  action: { 
    light: '#024959', // Azul Petróleo (ótimo para botões ou hover)
    dark: '#02730A'   // Verde para destaque no dark mode
  },

  // 🧱 Backgrounds (Usando o cinza claro da paleta)
  background: { 
    light: '#F2F2F2', // O cinza de fundo da sua lista
    dark: '#011F4B'   // Um azul quase preto para um dark mode elegante e fiel
  },
  surface: { 
    light: '#FFFFFF', 
    dark: '#023E73'   // Cards em azul marinho no dark mode
  },

  // 📝 Texto
  foreground: { 
    light: '#024959', // Texto principal em Azul Petróleo
    dark: '#F2F2F2'   // Texto claro no dark mode
  },
  muted: { 
    light: '#023E7399', // Azul com opacidade
    dark: '#F2F2F2B3' 
  },

  // 🔧 Utilitários
  border: { 
    light: '#03318C', 
    dark: '#02730A' 
  },
  success: { 
    light: '#02730A', 
    dark: '#02730A' 
  },
  warning: { 
    light: '#024959', 
    dark: '#024959' 
  },
  error: { 
    light: '#7A2E2E', // Mantido para erro (padrão semântico)
    dark: '#D97070' 
  },
};

module.exports = { themeColors };
