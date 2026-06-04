const fs = require('fs');
let code = fs.readFileSync('src/pages/fabrica/Phase3ArtFactoryES.tsx', 'utf8');

const dict = {
  'Provedor de IA configurado': 'Proveedor de IA configurado',
  'Tentaremos primeiro sua chave Gemini gratuita. Se falhar, cai pra créditos da plataforma. Imagens geradas nesta sessão:': 'Intentaremos primero con tu clave Gemini gratuita. Si falla, usará créditos de la plataforma. Imágenes generadas en esta sesión:',
  'Identidade Visual': 'Identidad Visual',
  'Canais de Atendimento': 'Canales de Atención',
  'WhatsApp Sólido': 'WhatsApp Sólido',
  'Website / Link': 'Sitio Web / Link',
  'Modo de Criação': 'Modo de Creación',
  'Foto Real': 'Foto Real',
  '(grátis)': '(gratis)',
  'Sua Imagem': 'Tu Imagen',
  'IA Pura': 'IA Pura',
  'A imagem é processada apenas em memória para gerar o anúncio.': 'La imagen se procesa solo en memoria para generar el anuncio.',
  'Versão do Layout': 'Versión del Diseño',
  'Rotação automática entre V0..V4 a cada clique.': 'Rotación automática entre V0..V4 en cada clic.',
  'Tipo de Anúncio': 'Tipo de Anuncio',
  'Oferta de Pacote': 'Oferta de Paquete',
  'Experiência de Destino': 'Experiencia de Destino',
  'Cada clique gera 1 imagem única. A próxima geração troca layout, texto e formatação automaticamente.': 'Cada clic genera 1 imagen única. La siguiente generación cambiará el diseño, texto y formato automáticamente.',
  'Formato do Anúncio': 'Formato del Anuncio',
  'Quadrado 1:1': 'Cuadrado 1:1',
  'Vertical com safe zones': 'Vertical con zonas seguras',
  'Escolha uma foto real': 'Elige una foto real',
  'Minha Galeria': 'Mi Galería',
  'Digite um destino e clique em buscar.': 'Ingresa un destino y haz clic en buscar.',
  'Dados do anúncio': 'Datos del anuncio',
  'Destino *': 'Destino *',
  'Nome da promoção': 'Nombre de la promoción',
  'Título do anúncio': 'Título del anuncio',
  'Dias / data da viagem': 'Días / fecha del viaje',
  'Modo de exibição do preço': 'Modo de visualización del precio',
  'Valor (R$)': 'Valor',
  'por pessoa': 'por persona',
  'Opções de preço': 'Opciones de precio',
  'Tipografia': 'Tipografía',
  'Cores': 'Colores',
  'Textos claros': 'Textos claros',
  'Benefícios / Inclusos': 'Beneficios / Incluidos',
  'Restaurar': 'Restaurar',
  'clique no ícone para trocar': 'haz clic en el icono para cambiar',
  'Transporte incluso': 'Transporte incluido',
  'Hospedagem': 'Alojamiento',
  'Café da manhã': 'Desayuno',
  'Guia local': 'Guía local',
  'Ex: Bebidas inclusas': 'Ej: Bebidas incluidas',
  'Pressione Enter ou clique em + para adicionar. Até 6 benefícios.': 'Presiona Enter o haz clic en + para agregar. Hasta 6 beneficios.',
  'Gerar Lote de Teste A/B': 'Generar Lote de Prueba A/B',
  'Gera 3 variações diferentes desta arte de uma vez só. Mais velocidade.': 'Genera 3 variaciones diferentes de este diseño a la vez. Más velocidad.',
  'Dados da Fase 1': 'Datos de la Fase 1',
  'Gerar Anúncio': 'Generar Anuncio',
  'âš¡': '⚡',
  'ðŸ’¡': '💡',
  'Â·': '·',
  'Ã—': '×',
  'ðŸ”’': '🔒',
  'â': '🖼️'
};

for (const [pt, es] of Object.entries(dict)) {
  code = code.split(pt).join(es);
}

fs.writeFileSync('src/pages/fabrica/Phase3ArtFactoryES.tsx', code);
console.log('Phase3 translated!');
