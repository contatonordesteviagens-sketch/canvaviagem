// Complete translation dictionary for Portuguese and Spanish
export type Language = 'pt' | 'es';

export const translations: Record<Language, Record<string, string>> = {
  pt: {
    // Header
    'header.home': 'Início',
    'header.calendar': 'Calendário',
    'header.plans': 'Planos',
    'header.login': 'Entrar',
    'header.logout': 'Sair',
    'header.freeTier': 'Conta Grátis',
    'header.premiumTier': 'Conta Premium',
    'header.changeLanguage': 'Idioma',
    'header.menu': 'Menu',

    // Hero
    'hero.title': 'O que você vai criar hoje?',
    'hero.searchPlaceholder': 'Busque conteúdo seu ou do Canva',

    // Categories
    'category.videos': 'Vídeos Reels',
    'category.feed': 'Arte Agência',
    'category.stories': 'Stories',
    'category.captions': 'Legendas',
    'category.downloads': 'Downloads',
    'category.tools': 'IA Tools',
    'category.videoaula': 'Videoaula',
    'category.favorites': 'Favoritos',

    // Bottom Nav
    'nav.home': 'Início',
    'nav.ai': 'IA',
    'nav.arts': 'Artes',
    'nav.class': 'Aula',
    'nav.favorites': 'Favoritos',

    // Filters
    'filter.all': 'Todos',
    'filter.national': 'Nacionais',
    'filter.international': 'Internacionais',

    // Sections
    'section.videos.title': 'Vídeos Reels Editáveis',
    'section.videos.subtitle': 'Templates prontos para editar no Canva e publicar',
    'section.feed.title': 'Arte para Agência de Viagens',
    'section.feed.subtitle': 'Posts prontos para engajar seu público',
    'section.stories.title': 'Stories Semanais',
    'section.stories.subtitle': 'Artes individuais para stories',
    'section.captions.title': 'Legendas Prontas',
    'section.captions.subtitle': 'Copie e cole legendas profissionais',
    'section.downloads.title': 'Downloads de Vídeos',
    'section.downloads.subtitle': 'Acesse vídeos prontos para usar',
    'section.tools.title': 'Ferramentas de Marketing',
    'section.tools.subtitle': 'Robôs de IA e recursos para agências',
    'section.favorites.title': 'Seus Favoritos',
    'section.favorites.subtitle': 'Itens que você salvou para acesso rápido',

    // Buttons
    'button.showMore': 'Ver mais ({count} restantes)',
    'button.showLess': 'Mostrar menos',
    'button.copy': 'Copiar',
    'button.copied': 'Copiado!',
    'button.openCanva': 'Abrir no Canva',
    'button.download': 'Baixar',
    'button.subscribe': 'Assinar',
    'button.upgrade': 'Fazer Upgrade',

    // Empty States
    'favorites.empty.title': 'Nenhum favorito ainda',
    'favorites.empty.subtitle': 'Clique no coração nos itens para salvá-los aqui',
    'content.empty': 'Nenhum conteúdo encontrado',
    'content.loading': 'Carregando...',

    // Auth
    'auth.title': 'Entre na sua conta',
    'auth.subtitle': 'Digite seu email para receber um link mágico',
    'auth.emailLabel': 'Email',
    'auth.emailPlaceholder': 'seu@email.com',
    'auth.nameLabel': 'Nome',
    'auth.namePlaceholder': 'Seu nome',
    'auth.phoneLabel': 'WhatsApp',
    'auth.phonePlaceholder': '(11) 99999-9999',
    'auth.sendLink': 'Enviar link mágico',
    'auth.sending': 'Enviando...',
    'auth.checkEmail': 'Verifique seu email!',
    'auth.checkEmailDesc': 'Enviamos um link de login para {email}',
    'auth.resendLink': 'Reenviar link',
    'auth.backToLogin': 'Voltar para login',
    'auth.support': 'Precisa de ajuda?',

    // Plans
    'plans.title': 'Escolha seu Plano',
    'plans.subtitle': 'Acesso ilimitado a todo conteúdo',
    'plans.price': 'R$ 37,90',
    'plans.period': '/mês',
    'plans.cta': 'Assinar Premium',
    'plans.ctaManage': 'Gerenciar assinatura',
    'plans.guarantee': 'Garantia de 7 dias',
    'plans.guaranteeDesc': 'Se não gostar, devolvemos seu dinheiro',
    'plans.benefit.1': 'Acesso ilimitado a todos os templates',
    'plans.benefit.2': 'Novos conteúdos toda semana',
    'plans.benefit.3': 'Legendas prontas para copiar',
    'plans.benefit.4': 'Ferramentas de IA exclusivas',
    'plans.benefit.5': 'Calendário editorial completo',
    'plans.benefit.6': 'Suporte prioritário',
    'plans.faq.1.question': 'Como funciona o acesso?',
    'plans.faq.1.answer': 'Após a assinatura, você recebe acesso imediato a todo conteúdo da plataforma.',
    'plans.faq.2.question': 'Posso cancelar quando quiser?',
    'plans.faq.2.answer': 'Sim! Você pode cancelar sua assinatura a qualquer momento, sem multas.',
    'plans.faq.3.question': 'Os templates são editáveis?',
    'plans.faq.3.answer': 'Sim, todos os templates abrem direto no Canva para você personalizar.',
    'plans.alreadySubscribed': 'Você já é assinante Premium!',
    'plans.subscribedDesc': 'Aproveite todo o conteúdo exclusivo.',

    // Premium Gate
    'premium.title': 'Conteúdo Premium',
    'premium.subtitle': 'Assine para desbloquear este conteúdo',
    'premium.cta': 'Ver planos',

    // Common
    'common.loading': 'Carregando...',
    'common.error': 'Erro ao carregar',
    'common.retry': 'Tentar novamente',
    'common.save': 'Salvar',
    'common.cancel': 'Cancelar',
    'common.close': 'Fechar',
    'common.search': 'Buscar',
    'common.noResults': 'Nenhum resultado encontrado',

    // Footer
    'footer.terms': 'Termos de Uso',
    'footer.privacy': 'Política de Privacidade',
    'footer.support': 'Suporte',
    'footer.copyright': '© 2025 Canva Viagem. Todos os direitos reservados.',

    // Calendar
    'calendar.title': 'Calendário Editorial',
    'calendar.subtitle': 'Planeje seu conteúdo para o mês',
    'calendar.today': 'Hoje',
    'calendar.noContent': 'Sem conteúdo agendado',
  },

  es: {
    // Header
    'header.home': 'Inicio',
    'header.calendar': 'Calendario',
    'header.plans': 'Planes',
    'header.login': 'Ingresar',
    'header.logout': 'Salir',
    'header.freeTier': 'Cuenta Gratis',
    'header.premiumTier': 'Cuenta Premium',
    'header.changeLanguage': 'Idioma',
    'header.menu': 'Menú',

    // Hero
    'hero.title': '¿Qué vas a crear hoy?',
    'hero.searchPlaceholder': 'Busca contenido tuyo o de Canva',

    // Categories
    'category.videos': 'Videos Reels',
    'category.feed': 'Arte Agencia',
    'category.stories': 'Stories',
    'category.captions': 'Subtítulos',
    'category.downloads': 'Descargas',
    'category.tools': 'IA Tools',
    'category.videoaula': 'Videoclases',
    'category.favorites': 'Favoritos',

    // Bottom Nav
    'nav.home': 'Inicio',
    'nav.ai': 'IA',
    'nav.arts': 'Artes',
    'nav.class': 'Clases',
    'nav.favorites': 'Favoritos',

    // Filters
    'filter.all': 'Todos',
    'filter.national': 'Nacionales',
    'filter.international': 'Internacionales',

    // Sections
    'section.videos.title': 'Videos Reels Editables',
    'section.videos.subtitle': 'Plantillas listas para editar en Canva y publicar',
    'section.feed.title': 'Arte para Agencia de Viajes',
    'section.feed.subtitle': 'Posts listos para interactuar con tu público',
    'section.stories.title': 'Stories Semanales',
    'section.stories.subtitle': 'Artes individuales para stories',
    'section.captions.title': 'Subtítulos Listos',
    'section.captions.subtitle': 'Copia y pega subtítulos profesionales',
    'section.downloads.title': 'Descargas de Videos',
    'section.downloads.subtitle': 'Accede a videos listos para usar',
    'section.tools.title': 'Herramientas de Marketing',
    'section.tools.subtitle': 'Robots de IA y recursos para agencias',
    'section.favorites.title': 'Tus Favoritos',
    'section.favorites.subtitle': 'Elementos que guardaste para acceso rápido',

    // Buttons
    'button.showMore': 'Ver más ({count} restantes)',
    'button.showLess': 'Mostrar menos',
    'button.copy': 'Copiar',
    'button.copied': '¡Copiado!',
    'button.openCanva': 'Abrir en Canva',
    'button.download': 'Descargar',
    'button.subscribe': 'Suscribirse',
    'button.upgrade': 'Mejorar Plan',

    // Empty States
    'favorites.empty.title': 'Ningún favorito todavía',
    'favorites.empty.subtitle': 'Haz clic en el corazón en los elementos para guardarlos aquí',
    'content.empty': 'Ningún contenido encontrado',
    'content.loading': 'Cargando...',

    // Auth
    'auth.title': 'Ingresa a tu cuenta',
    'auth.subtitle': 'Ingresa tu email para recibir un enlace mágico',
    'auth.emailLabel': 'Email',
    'auth.emailPlaceholder': 'tu@email.com',
    'auth.nameLabel': 'Nombre',
    'auth.namePlaceholder': 'Tu nombre',
    'auth.phoneLabel': 'WhatsApp',
    'auth.phonePlaceholder': '+54 9 11 1234-5678',
    'auth.sendLink': 'Enviar enlace mágico',
    'auth.sending': 'Enviando...',
    'auth.checkEmail': '¡Revisa tu email!',
    'auth.checkEmailDesc': 'Enviamos un enlace de inicio de sesión a {email}',
    'auth.resendLink': 'Reenviar enlace',
    'auth.backToLogin': 'Volver al login',
    'auth.support': '¿Necesitas ayuda?',

    // Plans
    'plans.title': 'Elige tu Plan',
    'plans.subtitle': 'Acceso ilimitado a todo el contenido',
    'plans.price': 'R$ 37,90',
    'plans.period': '/mes',
    'plans.cta': 'Suscribirse Premium',
    'plans.ctaManage': 'Gestionar suscripción',
    'plans.guarantee': 'Garantía de 7 días',
    'plans.guaranteeDesc': 'Si no te gusta, te devolvemos tu dinero',
    'plans.benefit.1': 'Acceso ilimitado a todas las plantillas',
    'plans.benefit.2': 'Nuevos contenidos cada semana',
    'plans.benefit.3': 'Subtítulos listos para copiar',
    'plans.benefit.4': 'Herramientas de IA exclusivas',
    'plans.benefit.5': 'Calendario editorial completo',
    'plans.benefit.6': 'Soporte prioritario',
    'plans.faq.1.question': '¿Cómo funciona el acceso?',
    'plans.faq.1.answer': 'Después de la suscripción, recibes acceso inmediato a todo el contenido de la plataforma.',
    'plans.faq.2.question': '¿Puedo cancelar cuando quiera?',
    'plans.faq.2.answer': '¡Sí! Puedes cancelar tu suscripción en cualquier momento, sin multas.',
    'plans.faq.3.question': '¿Las plantillas son editables?',
    'plans.faq.3.answer': 'Sí, todas las plantillas se abren directamente en Canva para que las personalices.',
    'plans.alreadySubscribed': '¡Ya eres suscriptor Premium!',
    'plans.subscribedDesc': 'Disfruta de todo el contenido exclusivo.',

    // Premium Gate
    'premium.title': 'Contenido Premium',
    'premium.subtitle': 'Suscríbete para desbloquear este contenido',
    'premium.cta': 'Ver planes',

    // Common
    'common.loading': 'Cargando...',
    'common.error': 'Error al cargar',
    'common.retry': 'Intentar de nuevo',
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.close': 'Cerrar',
    'common.search': 'Buscar',
    'common.noResults': 'Ningún resultado encontrado',

    // Footer
    'footer.terms': 'Términos de Uso',
    'footer.privacy': 'Política de Privacidad',
    'footer.support': 'Soporte',
    'footer.copyright': '© 2025 Canva Viagem. Todos los derechos reservados.',

    // Calendar
    'calendar.title': 'Calendario Editorial',
    'calendar.subtitle': 'Planifica tu contenido para el mes',
    'calendar.today': 'Hoy',
    'calendar.noContent': 'Sin contenido agendado',
  },
};

// Helper to interpolate variables in translation strings
export const interpolate = (str: string, vars: Record<string, string | number>): string => {
  return Object.entries(vars).reduce((result, [key, value]) => {
    return result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
  }, str);
};
