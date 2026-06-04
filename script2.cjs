const fs = require('fs');

const esPath = 'c:/Users/win 10/Desktop/CANVA_VIAGEM_ESTAVEL_24_ABRIL/src/pages/fabrica/Phase3ArtFactoryES.tsx';
const ptPath = 'c:/Users/win 10/Desktop/CANVA_VIAGEM_ESTAVEL_24_ABRIL/src/pages/fabrica/Phase3ArtFactory.tsx';
let esCode = fs.readFileSync(esPath, 'utf8');
let ptCode = fs.readFileSync(ptPath, 'utf8');

// Consertar o default_highlights no Espanhol, que estava usando cache PT.
esCode = esCode.replace(/Melhores lugares/g, 'Mejores lugares');
esCode = esCode.replace(/Saídas todos os dias/g, 'Salidas todos los días');
esCode = esCode.replace(/Guia local/g, 'Guía local');
esCode = esCode.replace(/por pessoa/g, 'por persona');

// Regex refinado para extrair o componente MinimizableCard do ES (que está no final do arquivo)
const cardMatch = esCode.match(/const MinimizableCard = \([\s\S]*?\n\};\n/);
const cardCode = cardMatch ? cardMatch[0] : '';

// Extrair APENAS o bloco de return do Phase3ArtFactoryES (ele começa com return ( \n <div className="max-w-[1400px] mx-auto")
const returnMatch = esCode.match(/return \(\s*<div className=\"max-w-\[1400px\] mx-auto\"[\s\S]*?\n  \);\n};/);

if (returnMatch && cardCode) {
  let newReturn = returnMatch[0];
  
  // Traduzir textos fixos da UI do ES -> PT
  const dict = {
    'Vista Previa en Vivo': 'Visualização em Tempo Real',
    'Resultados Generados': 'Resultados Gerados',
    'Tu anuncio aparecerá aquí...': 'Seu anúncio aparecerá aqui...',
    'Llena los datos para ver la magia.': 'Preencha os dados para ver a mágica.',
    'Última generación': 'Última geração',
    'Avanzar a Fase 2 — Tu Sitio': 'Avançar para Fase 2 — Seu Site',
    'Generar Anuncio': 'Gerar Anúncio',
    'Descargar Todo (ZIP)': 'Baixar Tudo (ZIP)',
    'Descargar PNG': 'Baixar PNG',
    'Generando con IA...': 'Gerando com IA...',
    'Perfil y Canales de Atención': 'Perfil e Canais de Atendimento',
    'Modo de Creación y Categoría': 'Modo de Criação e Categoria',
    'Elegir una foto real': 'Escolher uma foto real',
    'Su imagen de referencia': 'Sua imagem de referência',
    'Datos del anuncio': 'Dados do anúncio',
    'Opciones Avanzadas (Colores y Textos)': 'Opções Avançadas (Cores e Textos)',
    'Identidad Visual': 'Identidade Visual',
    'Canales de Atención': 'Canais de Atendimento',
    'Modo de Creación': 'Modo de Criação',
    'Tipo de Anuncio': 'Tipo de Anúncio',
    'Formato del Anuncio': 'Formato do Anúncio',
    'Buscar destino (ej: Cancún, Orlando, Madrid...)': 'Buscar destino (ex: Cancún, Orlando, Paris...)',
    'Subir Logo': 'Subir Logo',
    'Archivo de Computadora': 'Arquivo do Computador',
    'Enlace de Internet (URL)': 'Link da Internet (URL)',
    'Elegir imagen de anuncio': 'Escolher imagem de anúncio',
    'Cambiar Logo': 'Trocar Logo',
    'Nombre del Destino': 'Nome do Destino',
    'Precio Base': 'Preço Base',
    'Moneda': 'Moeda',
    'Opción de Pago': 'Opção de Pagamento',
    'Sufijo del Precio (ej: por persona)': 'Sufixo do Preço (ex: por pessoa)',
    'Ocultar Centavos (,00)': 'Ocultar Centavos (,00)',
    'Mostrar Valor Total del Paquete': 'Mostrar Valor Total do Pacote',
    'Sobrescrever Valor Total (Opcional)': 'Sobrescrever Valor Total (Opcional)',
    'Mostrar Destacado Transferencia / Pix': 'Mostrar Faixa Desconto / Pix',
    'Familia de Fuentes': 'Família de Fontes',
    'Escala y Ajustes de Tamaño': 'Escala e Ajustes de Tamanho',
    'Generar Lote de Prueba A/B': 'Gerar Lote de Teste A/B',
    'Crea la página de ventas de tu agencia en el próximo paso': 'Crie a página de vendas da sua agência no próximo passo',
    'Proyectos Guardados': 'Projetos Salvos',
    'Contraer': 'Recolher',
    'Expandir / Cargar': 'Expandir / Carregar',
    'Seleccionar un proyecto...': 'Selecionar um projeto...',
    'No se encontraron proyectos guardados': 'Nenhum projeto salvo encontrado',
    'Nuevo': 'Novo',
    'Sin Nombre': 'Sem Nome',
    'Limpiar': 'Limpar',
    'Color de los textos base': 'Cor dos Textos Base',
    'Textos claros': 'Textos claros',
    'Textos oscuros': 'Textos escuros',
    'Color primario': 'Cor primária',
    'Color secundario': 'Cor secundária',
    'Fondo principal': 'Fundo principal',
    'Acento': 'Acento',
    'Restaurar': 'Restaurar',
    'beneficios.': 'benefícios.',
    'Color del texto': 'Cor do texto',
    'Versión del Layout': 'Versão do Layout',
    'Texto Integrado (Nueva)': 'Texto Integrado (Nova)',
    'Texto con fondo semi-transparente clásico': 'Texto com fundo semi-transparente clássico',
    'Diseño minimalista enfocado en la foto': 'Design minimalista focado na foto',
    'Mejor': 'Melhor',
    'Original': 'Original',
    'Sutil': 'Sutil',
    'Story / Reels': 'Story / Reels',
    'Cuadrado Feed': 'Quadrado Feed',
    'Ideal para Stories y Reels de Instagram': 'Ideal para Stories e Reels do Instagram',
    'Ideal para Feed y WhatsApp': 'Ideal para Feed e WhatsApp',
    'Ej: Cancún, Porto de Galinhas, Buenos Aires...': 'Ex: Cancún, Porto de Galinhas, Buenos Aires...',
    'Ej:': 'Ex:',
    'Campo Obligatorio': 'Campo Obrigatório',
    'Oferta de Paquete': 'Oferta de Pacote',
    'Foco en precio, cuotas, salidas e incluidos. Ideal para cerrar ventas rápidas.': 'Foco em preço, parcelas, saídas e inclusos. Ideal para fechar vendas rápidas.',
    'Experiencia de Destino': 'Experiência de Destino',
    'Foco visual, sentimento y exclusividad. Ideal para atraer leads cualificados.': 'Foco visual, sentimento e exclusividade. Ideal para atrair leads qualificados.',
    'Ventas': 'Vendas',
    'Lujo': 'Luxo',
    'Foto Real': 'Foto Real',
    'Tu Foto': 'Sua Foto',
    'Imagen IA': 'Imagem IA'
  };

  for (const [es, pt] of Object.entries(dict)) {
    newReturn = newReturn.split(es).join(pt);
  }

  // Inserir MinimizableCard no topo do arquivo PT (depois dos imports)
  if (!ptCode.includes('MinimizableCard')) {
    ptCode = ptCode.replace('const Phase3ArtFactory =', cardCode + '\n\nconst Phase3ArtFactory =');
  }

  // Substituir o return inteiro do arquivo PT
  // O PT acaba com \n  );\n};\n
  ptCode = ptCode.replace(/return \(\s*<div className=\"max-w-3xl mx-auto space-y-6\"[\s\S]*?\n  \);\n};/, newReturn);

  fs.writeFileSync(ptPath, ptCode);
  fs.writeFileSync(esPath, esCode);
  console.log('SUCCESS');
} else {
  console.log('FAILED TO MATCH: returnMatch=' + !!returnMatch + ', cardMatch=' + !!cardMatch);
}
