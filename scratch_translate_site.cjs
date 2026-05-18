const fs = require('fs');
let c = fs.readFileSync('src/pages/fabrica/Phase4LandingBuilderES.tsx', 'utf8');

const replacements = {
  'Site pré-preenchido com seus dados da Fábrica!': '¡Sitio pre-llenado con tus datos de la Fábrica!',
  'Importamos automaticamente: Imagem do anúncio. Você pode editar qualquer campo abaixo.': 'Importamos automáticamente: Imagen del anuncio. Puedes editar cualquier campo a continuación.',
  'Limpar site': 'Limpiar sitio',
  'Cor primária do site': 'Color primario del sitio',
  'Aplicada em botões, headers e CTAs.': 'Aplicado en botones, encabezados y CTAs.',
  'Seções do site': 'Secciones del sitio',
  'Escolha o que aparece no site. Desmarque qualquer seção pra removê-la (some também do HTML exportado).': 'Elige lo que aparece en el sitio. Desmarca cualquier sección para eliminarla (también desaparece del HTML exportado).',
  '"Topo (Hero)"': '"Encabezado (Hero)"',
  '"Como funciona (3 passos)"': '"Cómo funciona (3 pasos)"',
  '"Destinos / Pacotes"': '"Destinos / Paquetes"',
  '"Por que nós / Equipe"': '"Por qué nosotros / Equipo"',
  '"Depoimentos"': '"Testimonios"',
  '"Formulário de orçamento"': '"Formulario de presupuesto"',
  '"Perguntas Frequentes"': '"Preguntas Frecuentes"',
  'Topo do site (Hero)': 'Encabezado del sitio (Hero)',
  'Título principal': 'Título principal',
  '"Subtítulo"': '"Subtítulo"',
  'Texto do botão principal': 'Texto del botón principal',
  'Fundo do Site (Banner)': 'Fondo del Sitio (Banner)',
  'Trocar Imagem': 'Cambiar Imagen',
  'Banner atual': 'Banner actual',
  'Imagem de Fundo Ativa': 'Imagen de Fondo Activa',
  'Banco de imagens': 'Banco de imágenes',
  'Cole link da imagem (https://...)': 'Pega el enlace de la imagen (https://...)',
  'Ou faça upload do seu computador': 'O sube desde tu computadora',
  '"Adicionar"': '"Añadir"',
  'Pacotes oferecidos': 'Paquetes ofrecidos',
  'Título da seção': 'Título de la sección',
  '"Nossos Pacotes"': '"Nuestros Paquetes"',
  '"Transporte incluso"': '"Transporte incluido"',
  '"Hospedagem"': '"Alojamiento"',
  '"Café da manhã"': '"Desayuno"',
  '"Guia local"': '"Guía local"',
  'Adicionar pacote': 'Añadir paquete',
  'Adicionar depoimento': 'Añadir testimonio',
  'Perguntas Frequentes (FAQ)': 'Preguntas Frecuentes (FAQ)',
  'Adicionar pergunta': 'Añadir pregunta',
  'CTA Final': 'CTA Final',
  '"Título"': '"Título"',
  'Texto do botão': 'Texto del botón',
  '"Voltar"': '"Volver"',
  '"Esconder"': '"Ocultar"',
  '"Baixar HTML"': '"Descargar HTML"',
  'Preview ao vivo': 'Vista previa en vivo',
  'Atualiza a cada edição': 'Se actualiza con cada edición',
  'PASSO FINAL · 100% GRÁTIS': 'PASO FINAL · 100% GRATIS',
  'Publique seu site no ar em 2 minutos': 'Publica tu sitio en línea en 2 minutos',
  'Para colocar seu site no ar, conecte-se ao Lovable e cole o seu código gerado:': 'Para publicar tu sitio, conéctate a Lovable y pega tu código generado:',
  'Para personalizar fontes, alterar o layout avançado ou conectar seu próprio domínio oficial, use o Lovable:': 'Para personalizar fuentes, cambiar el diseño avanzado o conectar tu propio dominio oficial, usa Lovable:',
  'Baixe ou copie o HTML do seu site (botões acima)': 'Descarga o copia el HTML de tu sitio (botones de arriba)',
  'Crie sua conta grátis no Lovable usando o link abaixo': 'Crea tu cuenta gratis en Lovable usando el enlace de abajo',
  'Cole o HTML, clique em Publicar e seu site está no ar': 'Pega el HTML, haz clic en Publicar y tu sitio estará en línea',
  'Copiar HTML Completo': 'Copiar HTML Completo',
  '"Abrir Lovable"': '"Abrir Lovable"',
  'Copiar Atualização (Só Pacotes Novos)': 'Copiar Actualización (Solo Paquetes Nuevos)',
  'Use este botão caso seu site já esteja pronto e queira apenas adicionar novos pacotes sem reconstruir tudo.': 'Usa este botón si tu sitio ya está listo y solo quieres añadir paquetes nuevos sin reconstruir todo.',
  'Sem cartão de crédito': 'Sin tarjeta de crédito',
  'Domínio grátis incluído': 'Dominio gratis incluido',
  'Suporte a domínio próprio': 'Soporte para dominio propio',
  'Voltar ao topo': 'Volver arriba',
  'Próximo Passo: Dashboard': 'Siguiente Paso: Dashboard',
  'Próximo Passo: Diagnóstico': 'Siguiente Paso: Diagnóstico'
};

for (const [pt, es] of Object.entries(replacements)) {
  c = c.split(pt).join(es);
}

// Mojibake Emojis in Phase 4
c = c.replace(/"ðŸŽ¨"/g, '"🎨"');
c = c.replace(/"ðŸ‘ï¸ "/g, '"👁️"');
c = c.replace(/"âœï¸ "/g, '"🖼️"');
c = c.replace(/"ðŸ–¼ï¸ "/g, '"🖼️"');
c = c.replace(/"ðŸ“¦"/g, '"📦"');
c = c.replace(/"â "/g, '"💬"');
c = c.replace(/"â“ "/g, '"ℹ️"');
c = c.replace(/"ðŸŽ¯"/g, '"🎯"');
c = c.replace(/"âœ¨"/g, '"✨"');
c = c.replace(/"ðŸš€"/g, '"🚀"');
c = c.replace(/"âš¡"/g, '"⚡"');
c = c.replace(/"âœ“"/g, '"✓"');

fs.writeFileSync('src/pages/fabrica/Phase4LandingBuilderES.tsx', c);
