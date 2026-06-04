const fs = require('fs');
let c = fs.readFileSync('src/pages/fabrica/Phase4LandingBuilderES.tsx', 'utf8');

const replacements = {
  '"Novo pacote"': '"Nuevo paquete"',
  '"Descreva o que está incluso"': '"Describe lo que está incluido"',
  '"Quero esse"': '"Quiero este"',
  '"Cliente feliz"': '"Cliente feliz"',
  '"Atendimento incrível!"': '"¡Atención increíble!"',
  '"Nova pergunta?"': '"¿Nueva pregunta?"',
  '"Resposta..."': '"Respuesta..."',
  'Ex: Jericoacoara 5 dias': 'Ej: Cancún 5 días',
  'Descrição (o que está incluso)': 'Descripción (lo que está incluido)',
  'Botão:': 'Botón:',
  '"Olá, tenho interesse em ': '"Hola, tengo interés en ',
  'Escolher imagem': 'Elegir imagen',
  'Do seu banco:': 'De tu banco:',
  'Imagem aplicada!': '¡Imagen aplicada!',
  'Cole a URL da imagem (https://...)': 'Pega la URL de la imagen (https://...)',
  'Sua próxima viagem começa aqui': 'Tu próximo viaje empieza aquí',
  'Atendimento personalizado, roteiros sob medida...': 'Atención personalizada, rutas a medida...',
  'Falar no WhatsApp': 'Hablar por WhatsApp',
  'Selecione uma imagem do seu banco gerado automaticamente:': 'Selecciona una imagen de tu banco generado automáticamente:',
  'Ainda não há imagens geradas no seu banco.': 'Aún no hay imágenes generadas en tu banco.',
  'Cole link externo (https://...)': 'Pega un enlace externo (https://...)',
  'Link de fundo aplicado!': '¡Enlace de fondo aplicado!',
  'Fundo resetado ao padrão': 'Fondo restaurado al predeterminado',
  'Limpar': 'Limpiar',
  'Nome do cliente': 'Nombre del cliente',
  'Depoimento': 'Testimonio',
  'Pergunta': 'Pregunta',
  'Resposta': 'Respuesta',
  'Sua Agência': 'Tu Agencia',
  'Pacotes para': 'Paquetes para',
  'e muito mais!': 'y mucho más!',
  'Sua próxima viagem é': 'Tu próximo viaje es',
  'Roteiros para': 'Rutas para',
  'e outros destinos incríveis. Atendimento personalizado e suporte 24h.': 'y otros destinos increíbles. Atención personalizada y soporte 24h.',
  'Vai para': '¿Vas a',
  'Fala comigo agora!': '¡Habla conmigo ahora!',
  'Pronto para sua próxima viagem?': '¿Listo para tu próximo viaje?',
  'Blindagem de Autoridade (Depoimentos Ativados)': 'Blindaje de Autoridad (Testimonios Activados)',
  'Blindagem de Autoridade (Diferenciais Ativados)': 'Blindaje de Autoridad (Diferenciales Activados)',
  'Site resetado para o modelo em branco.': 'Sitio restaurado a la plantilla en blanco.',
  'Imagem adicionada ao banco!': '¡Imagen añadida al banco!',
  'Versão': 'Versión',
  'baixada! Suba pro Lovable, Vercel ou Netlify.': 'descargada! Súbela a Lovable, Vercel o Netlify.',
  'Dados da Fábrica já sincronizados com este site.': 'Datos de la Fábrica ya sincronizados con este sitio.',
  'Edite os campos abaixo ou': 'Edita los campos de abajo o',
  'Começar do zero': 'Empezar de cero',
  'Título do site': 'Título del sitio',
  'Subtítulo do site': 'Subtítulo del sitio',
  'Imagem do anúncio': 'Imagen del anuncio',
  'CTA final': 'CTA final'
};

for (const [pt, es] of Object.entries(replacements)) {
  c = c.split(pt).join(es);
}

fs.writeFileSync('src/pages/fabrica/Phase4LandingBuilderES.tsx', c);
