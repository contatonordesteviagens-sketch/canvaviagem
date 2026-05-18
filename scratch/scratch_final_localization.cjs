const fs = require('fs');
const path = require('path');

const files = [
  'src/pages/fabrica/Phase1DiagnosticoES.tsx',
  'src/pages/fabrica/Phase2AtivosES.tsx',
  'src/pages/fabrica/Phase3ArtFactoryES.tsx',
  'src/pages/fabrica/Phase4LandingBuilderES.tsx',
  'src/pages/fabrica/Phase5DashboardES.tsx',
  'src/lib/fabrica-scoring-es.ts',
  'src/pages/IndexES.tsx',
  'src/lib/fabrica-html-export-es.ts'
];

const translations = {
  // Common
  'Voltar': 'Volver',
  'Selecione...': 'Seleccione...',
  'Avançar': 'Avanzar',
  'Próximo': 'Siguiente',
  'Copiado!': '¡Copiado!',
  'Chamar no WhatsApp': 'Llamar por WhatsApp',
  'Falar no WhatsApp': 'Hablar por WhatsApp',
  'Título principal do site': 'Título principal del sitio',
  'Blindagem de Autoridade': 'Blindaje de Autoridad',
  'Testimonios Ativados': 'Testimonios Activados',
  'Diferenciais Ativados': 'Diferenciales Activados',
  'Hablar por WhatsApp': 'Hablar por WhatsApp',
  
  // HTML Export specific
  'Cada viagem começa com uma conversa real. Nosso time de especialistas conhece os destinos de perto — cada detalhe pensado para o seu perfil, seus sonhos e o seu momento.': 'Cada viaje comienza con una conversación real. Nuestro equipo de expertos conoce los destinos de cerca — cada detalle pensado para tu perfil, tus sueños y tu momento.',
  'Nosso time está disponível a qualquer hora. Qualquer imprevisto, resolvemos.': 'Nuestro equipo está disponible en cualquier momento. Cualquier imprevisto, lo resolvemos.',
  'Cada viagem começa com uma conversa real. Nuestro equipo de especialistas conhece os destinos de perto': 'Cada viaje comienza con una conversación real. Nuestro equipo de expertos conoce los destinos de cerca',
  'Nosso time está disponível a qualquer hora.': 'Nuestro equipo está disponible en cualquier momento.',
  'Qualquer imprevisto, resolvemos.': 'Cualquier imprevisto, lo resolvemos.',
  'Sáb 9h–15h': 'Sáb 9h–15h',
  'seu@email.com': 'su@email.com',
  'Selecionar…': 'Seleccionar...',
  'Adicione os seguintes pacotes atualizados na minha grade de destinos/pacotes existente.': 'Agrega los siguientes paquetes actualizados en mi cuadrícula de destinos/paquetes existente.',
  'lang=\"pt-BR\"': 'lang=\"es-ES\"',
  
  // IndexES specific
  'Se o item for explicitamente premium': 'Si el elemento es explícitamente premium',
  'Se categoria for premium (fallback)': 'Si la categoría es premium (fallback)',
  'Menos': 'Menos',
  'Más videos': 'Más videos',
  'R$ 57.83': '$ 57.83',
  'R$': '$',

  // Mojibake Emojis & Symbols
  'ðŸ™ ': '🙏',
  'ðŸ•Šï¸ ': '🕊️',
  'ðŸ ¨': '🏨',
  'ðŸ –ï¸ ': '🏖️',
  'ðŸ ™ï¸ ': '🏙️',
  'ðŸ¤ ': '🤝',
  'ðŸ• ': '🕌',
  'ðŸ ¢': '🏢',
  'ðŸ  ï¸ ': '🏝️',
  'ðŸ¦ ': '🦓',
  'ðŸ ·': '⛷️',
  'ðŸ›³ï¸ ': '🚢',
  'ðŸ œï¸ ': '🏜️',
  'ðŸ  ': '🌿',
  'ðŸ ”ï¸ ': '🏔️',
  'âœˆï¸ ': '✈️',
  'â›°ï¸ ': '⛰️',
  'âœ ï¸ ': '✍️',
  'âœ…': '✅',
  'âš ï¸ ': '⚠️',
  'â€¢': '•',
  'â€”': '—',
  'â”€': '─',
  'ðŸ”🔥': '🔥',
  'ðŸ”¥': '🔥',
  'ðŸ“ ': '📍',
  'ðŸ’¸': '💸',
  'ðŸš¨': '🚨',
  'ðŸ§³': '🧳',
  'ðŸ’Œ': '💌',
  'ðŸ‘‰': '👉',
  'ðŸ“¦': '📦',
  'ðŸ“²': '📱',
  'ðŸŽ¬': '🎬',
  'ðŸ¤–': '🤖',
  'ðŸ“…': '📅',
  'ðŸ‘‘': '👑',
  'ðŸš€': '🚀',
  'ðŸŒ±': '🌱',
  'ðŸŒŸ': '🌟',
  'ðŸ’¡': '💡',
  'ðŸŽ¨': '🎨',
  'ðŸ‘ ï¸ ': '👁️',
  'ðŸ‘ ': '👋',
  'ðŸ †': '🏆',
  'ðŸ £': '🐣',
  'ðŸ ™': '🏙️',
  'ðŸ“‹': '📋',
  'ðŸ“Š': '📊',
  'ðŸ’°': '💰',
  'ðŸ’³': '💳',
  'ðŸ’¬': '💬',
  'ðŸ” ': '🔍',
  'ðŸ” ': '🔔',
  'ðŸ“…': '📅',
  '🖼️š ï¸ ': '🚨',
  '🖼️œˆï¸ ': '✈️',
  '🖼️œ…': '✅',
  '🖼️€”': '—',
  'DIAGNÃ“STICO': 'DIAGNÓSTICO',
  'AGÃŠNCIA': 'AGENCIA',
};

files.forEach(file => {
  const filePath = path.resolve(file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace all Portuguese with Spanish
    Object.keys(translations).forEach(key => {
      const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escapedKey, 'g');
      content = content.replace(regex, translations[key]);
    });

    // Fix specific cases
    content = content.replace(/locale: ptBR/g, 'locale: es');
    content = content.replace(/import { ptBR } from \"date-fns\/locale\"/g, 'import { es } from \"date-fns\/locale\"');
    content = content.replace(/\"pt-BR\"/g, '\"es-ES\"');
    content = content.replace(/Añadir nuevo pacote/g, 'Añadir nuevo paquete');
    content = content.replace(/Nuevo pacote/g, 'Nuevo paquete');
    
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
  }
});
