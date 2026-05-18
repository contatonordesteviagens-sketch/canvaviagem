const fs = require('fs');
let c = fs.readFileSync('src/pages/fabrica/Phase1DiagnosticoES.tsx', 'utf8');

const replacements = {
  // AGENCY_TYPES
  '"Agente autônomo / Freelancer"': '"Agente autónomo / Freelancer"',
  '"Pequena agência (até 3 pessoas)"': '"Agencia pequeña (hasta 3 personas)"',
  '"Agência média (4-10 pessoas)"': '"Agencia mediana (4-10 personas)"',
  '"Franquia"': '"Franquicia"',
  '"Consolidadora"': '"Consolidador"',
  '"Agência Receptiva"': '"Agencia Receptiva"',
  '"Especialista em Milhas"': '"Especialista en Millas"',
  '"Agência de Luxo / Alto Padrão"': '"Agencia de Lujo / Alto Nivel"',
  '"Agência Corporativa (B2B)"': '"Agencia Corporativa (B2B)"',
  '"Especialista em Grupos / Excursões"': '"Especialista en Grupos / Excursiones"',
  '"Especialista em Cruzeiros"': '"Especialista en Cruceros"',
  '"Ecoturismo / Aventura"': '"Ecoturismo / Aventura"',
  '"Turismo Religioso"': '"Turismo Religioso"',
  '"Outro tipo"': '"Otro tipo"',

  // Emojis (mojibake)
  '"ðŸ –ï¸ "': '"🏖️"', '"ðŸŒ…"': '"🌅"', '"âœˆï¸ "': '"✈️"', '"ðŸš¢"': '"🚢"', '"â›°ï¸ "': '"⛰️"', '"ðŸ’•"': '"💕"',
  '"ðŸ ™ï¸ "': '"🏙️"', '"ðŸ ¢"': '"🏢"', '"ðŸŽ¯"': '"🎯"', '"ðŸ¤ "': '"🤝"', '"ðŸ’¼"': '"💼"',
  '"ðŸ•Šï¸ "': '"🕊️"', '"â›ª"': '"⛪"', '"ðŸ™ "': '"🙏"', '"ðŸ¥¾"': '"🥾"', '"âœ ï¸ "': '"✍️"',
  '"ðŸ›«"': '"🛫"', '"ðŸ¥‚"': '"🥂"', '"ðŸ‡ªðŸ‡º"': '"🇪🇺"', '"ðŸ  ï¸ "': '"🏝️"', '"ðŸ¦ "': '"🦁"', '"ðŸ ·"': '"🍷"',
  '"ðŸšŒ"': '"🚌"', '"ðŸ‘µ"': '"👵"', '"ðŸ‡§ðŸ‡·"': '"🇧🇷"', '"ðŸŒ´"': '"🌴"', '"ðŸ›³ï¸ "': '"🛳️"', '"ðŸ§Š"': '"🧊"', '"ðŸŽ¤"': '"🎤"',
  '"ðŸ œï¸ "': '"🏜️"', '"ðŸ  "': '"🐆"', '"ðŸ ”ï¸ "': '"🏔️"', '"ðŸŒ¿"': '"🌿"', '"ðŸ›¶"': '"🛶"', '"ðŸ ¨"': '"🏨"',
  '"ðŸ“¦"': '"📦"', '"ðŸ’¡"': '"💡"', '"ðŸ”¥"': '"🔥"',

  // Step Indicators
  '"Perfil Estratégico"': '"Perfil Estratégico"',
  '"Maturidade Digital"': '"Madurez Digital"',
  '1. Identidade & Perfil da Agência': '1. Identidad y Perfil de la Agencia',
  'Sua Logo': 'Tu Logo',
  'Logo atualizada!': '¡Logo actualizado!',

  // Form Fields
  'Tipo de agência *': 'Tipo de agencia *',
  '"Selecione..."': '"Seleccione..."',
  '@ do Instagram Profissional': '@ de Instagram Profesional',
  'Nicho / Carro-chefe *': 'Nicho / Producto Estrella *',
  'Seus principais destinos *': 'Tus principales destinos *',
  'Digite e aperte Enter (ex: Paris, Gramado)...': 'Escribe y presiona Enter (ej: Cancún, Madrid)...',
  'Nenhum adicionado ainda.': 'Aún no se ha añadido ninguno.',
  'Sugestões Rápidas': 'Sugerencias Rápidas',

  // Maturidade Digital
  '2. Raio-X de Maturidade Digital': '2. Radiografía de Madurez Digital',
  'Frequência de Postagem *': 'Frecuencia de Publicación *',
  '"Diário (Consistente)"': '"Diario (Consistente)"',
  '"Semanal (Algumas vezes)"': '"Semanal (Algunas veces)"',
  '"Mensal (Muito esporádico)"': '"Mensual (Muy esporádico)"',
  '"Raramente publico"': '"Raramente publico"',

  'Tamanho da Audiência *': 'Tamaño de la Audiencia *',
  '"0 a 500 seguidores"': '"0 a 500 seguidores"',
  '"500 a 2.000 seguidores"': '"500 a 2.000 seguidores"',
  '"2.000 a 10.000 seguidores"': '"2.000 a 10.000 seguidores"',
  '"Acima de 10.000"': '"Más de 10.000"',

  'Linha Editorial / Conteúdo *': 'Línea Editorial / Contenido *',
  '"Foco 100% em Promoções / Ofertas"': '"Enfoque 100% en Promociones / Ofertas"',
  '"Misto (Dicas de valor + Promoções)"': '"Mixto (Consejos de valor + Promociones)"',

  'Vendas no mês (Média de Fechamentos) *': 'Ventas por mes (Promedio de Cierres) *',
  'Aparecem pessoas reais (donos/equipe)?': '¿Aparecen personas reales (dueños/equipo)?',
  'Posta Reels com frequência?': '¿Publicas Reels con frecuencia?',
  'Investe em Anúncios Pagos (Tráfego)?': '¿Inviertes en Anuncios Pagados (Tráfico)?',
  'Tem Depoimentos de Clientes em Destaque?': '¿Tienes Testimonios de Clientes Destacados?',

  'Seja 100% transparente! Esse diagnóstico é para VOCÊ descobrir exatamente onde está o gargalo que te impede de faturar mais.': '¡Sé 100% transparente! Este diagnóstico es para que TÚ descubras exactamente dónde está el cuello de botella que te impide facturar más.',

  // Buttons
  '"Voltar"': '"Volver"',
  'Próxima Etapa: Diagnóstico': 'Siguiente Etapa: Diagnóstico',
  'Gerar Meu Dossiê Completo': 'Generar Mi Dossier Completo',

  // DiagnosticoResult
  'Faça login para salvar seu diagnóstico': 'Inicia sesión para guardar tu diagnóstico',
  '"Entrar"': '"Entrar"',
  'DIAGNÓSTICO TRAVELBOOST': 'DIAGNÓSTICO TRAVELBOOST',
  'Nível': 'Nivel',
  'Gargalos identificados': 'Cuellos de botella identificados',
  'Plano de Ação': 'Plan de Acción',
  '"Imediato (até 7 dias)"': '"Inmediato (hasta 7 días)"',
  '"Próximos 15 dias"': '"Próximos 15 días"',
  '"Mês 2 em diante"': '"Mes 2 en adelante"',
  '"Salvando..."': '"Guardando..."',
  '"Salvar na minha conta"': '"Guardar en mi cuenta"',
  '"Baixar PDF"': '"Descargar PDF"',
  '"Enviar no WhatsApp"': '"Enviar por WhatsApp"',
  'Editar / complementar dados (acumula sem apagar)': 'Editar / complementar datos (se acumula sin borrar)',
  'Seus dados são preservados. Adicione novos destinos, pacotes e ajustes a qualquer momento — tudo fica salvo na sua conta.': 'Tus datos se conservan. Añade nuevos destinos, paquetes y ajustes en cualquier momento — todo queda guardado en tu cuenta.',
  'Avançar para Plano': 'Avanzar al Plan',

  // Phone Field
  '"Número de telefone"': '"Número de teléfono"',
  'Selecionar país': 'Seleccionar país',

  // Country labels and flags
  '"Brasil"': '"Brasil"',
  '"Estados Unidos"': '"Estados Unidos"',
  '"Portugal"': '"Portugal"',
  '"Espanha"': '"España"',
  '"Argentina"': '"Argentina"',
  '"México"': '"México"',
  '"Chile"': '"Chile"',
  '"Colômbia"': '"Colombia"',
  '"Peru"': '"Perú"',
  '"Uruguai"': '"Uruguay"',
  '"Paraguai"': '"Paraguay"',
  '"França"': '"Francia"',
  '"Itália"': '"Italia"',
  '"Alemanha"': '"Alemania"',
  '"Reino Unido"': '"Reino Unido"',

  '"ðŸ‡ºðŸ‡¸"': '"🇺🇸"', '"ðŸ‡µðŸ‡¹"': '"🇵🇹"', '"ðŸ‡ªðŸ‡¸"': '"🇪🇸"', '"ðŸ‡¦ðŸ‡·"': '"🇦🇷"', '"ðŸ‡²ðŸ‡½"': '"🇲🇽"',
  '"ðŸ‡¨ðŸ‡±"': '"🇨🇱"', '"ðŸ‡¨ðŸ‡´"': '"🇨🇴"', '"ðŸ‡µðŸ‡ª"': '"🇵🇪"', '"ðŸ‡ºðŸ‡¾"': '"🇺🇾"', '"ðŸ‡µðŸ‡¾"': '"🇵🇾"',
  '"ðŸ‡«ðŸ‡·"': '"🇫🇷"', '"ðŸ‡®ðŸ‡¹"': '"🇮🇹"', '"ðŸ‡©ðŸ‡ª"': '"🇩🇪"', '"ðŸ‡¬ðŸ‡§"': '"🇬🇧"',
  'DIAGNÃ“STICO TRAVELBOOST': 'DIAGNÓSTICO TRAVELBOOST'
};

for (const [pt, es] of Object.entries(replacements)) {
  c = c.split(pt).join(es);
}

// Regex replacements for DESTINOS_BY_AGENCY and DESTINOS_SUGERIDOS and NICHES labels to ensure they are fully translated
c = c.replace(/"Receptivo Nordeste"/g, '"Receptivo Caribe"');
c = c.replace(/"Receptivo Sul \/ Serra"/g, '"Receptivo Pacífico"');
c = c.replace(/"Receptivo Ecoturismo"/g, '"Receptivo Ecoturismo"');
c = c.replace(/"City Tour \/ Urbano"/g, '"City Tour / Urbano"');
c = c.replace(/"Transfer Portuário"/g, '"Transfer Portuario"');
c = c.replace(/"Roteiros Privativos"/g, '"Rutas Privadas"');

c = c.replace(/"Viagens Internacionais Executivas"/g, '"Viajes Internacionales Ejecutivos"');
c = c.replace(/"Viagens Nacionais Corporativas"/g, '"Viajes Nacionales Corporativos"');
c = c.replace(/"Eventos & Incentivo"/g, '"Eventos e Incentivos"');
c = c.replace(/"Convenções & MICE"/g, '"Convenciones y MICE"');
c = c.replace(/"Team Building \/ Retiros"/g, '"Team Building / Retiros"');
c = c.replace(/"Workation \/ Bleisure"/g, '"Workation / Bleisure"');

c = c.replace(/"Terra Santa"/g, '"Tierra Santa"');
c = c.replace(/"Fátima & Santuários \(Europa\)"/g, '"Fátima y Santuarios (Europa)"');
c = c.replace(/"Aparecida & Santuários BR"/g, '"Santuarios Nacionales"');
c = c.replace(/"Caminho de Santiago"/g, '"Camino de Santiago"');
c = c.replace(/"Juazeiro \/ Canindé"/g, '"Rutas de Peregrinación"');
c = c.replace(/"Cruzeiros Religiosos"/g, '"Cruceros Religiosos"');

c = c.replace(/"Emissões Internacionais"/g, '"Emisiones Internacionales"');
c = c.replace(/"Emissões Domésticas"/g, '"Emisiones Domésticas"');
c = c.replace(/"Lua de Mel com Milhas"/g, '"Luna de Miel con Millas"');
c = c.replace(/"Pacotes Nordeste com Milhas"/g, '"Paquetes Caribe con Millas"');
c = c.replace(/"Cruzeiros \+ Aéreo Pontos"/g, '"Cruceros + Vuelos con Puntos"');
c = c.replace(/"Roteiros Premium \/ Executiva"/g, '"Rutas Premium / Ejecutiva"');

c = c.replace(/"Europa Luxo"/g, '"Europa Lujo"');
c = c.replace(/"Maldivas \/ Bora Bora"/g, '"Maldivas / Bora Bora"');
c = c.replace(/"Resorts Premium Nordeste"/g, '"Resorts Premium Caribe"');
c = c.replace(/"Cruzeiros de Luxo"/g, '"Cruceros de Lujo"');
c = c.replace(/"Safáris \/ Expedições"/g, '"Safaris / Expediciones"');
c = c.replace(/"Serra Gaúcha Premium"/g, '"Destinos de Nieve Premium"');

c = c.replace(/"Excursões Internacionais"/g, '"Excursiones Internacionales"');
c = c.replace(/"Excursões Sul \/ Serra"/g, '"Excursiones Pacífico / Nieve"');
c = c.replace(/"Caravanas Nordeste"/g, '"Caravanas Caribe"');
c = c.replace(/"Grupos da Terceira Idade"/g, '"Grupos de Tercera Edad"');
c = c.replace(/"Grupos de Ecoturismo"/g, '"Grupos de Ecoturismo"');
c = c.replace(/"Grupos em Cruzeiros"/g, '"Grupos en Cruceros"');

c = c.replace(/"Cruzeiros pela Costa BR"/g, '"Cruceros por la Costa LATAM"');
c = c.replace(/"Cruzeiros Caribe"/g, '"Cruceros Caribe"');
c = c.replace(/"Cruzeiros Mediterrâneo"/g, '"Cruceros Mediterráneo"');
c = c.replace(/"Cruzeiros Fiordes \/ Alasca"/g, '"Cruceros Fiordos / Alaska"');
c = c.replace(/"Cruzeiros Temáticos"/g, '"Cruceros Temáticos"');
c = c.replace(/"Cruzeiros Fluviais"/g, '"Cruceros Fluviales"');

c = c.replace(/"Chapadas & Trilhas"/g, '"Montañas y Senderos"');
c = c.replace(/"Lençóis \/ Jalapão"/g, '"Desiertos / Oasis"');
c = c.replace(/"Bonito \/ Pantanal"/g, '"Selvas / Pantanales"');
c = c.replace(/"Patagônia \/ Atacama"/g, '"Patagonia / Atacama"');
c = c.replace(/"Eco Lodges"/g, '"Eco Lodges"');
c = c.replace(/"Expedições Amazônia"/g, '"Expediciones Amazonia"');

c = c.replace(/"Aéreo Internacional"/g, '"Aéreo Internacional"');
c = c.replace(/"Aéreo Doméstico"/g, '"Aéreo Doméstico"');
c = c.replace(/"Hotelaria Internacional"/g, '"Hotelería Internacional"');
c = c.replace(/"Hotelaria Nacional"/g, '"Hotelería Nacional"');
c = c.replace(/"Cruzeiros \(B2B\)"/g, '"Cruceros (B2B)"');
c = c.replace(/"Pacotes Operadores"/g, '"Paquetes Operadores"');

// Suggestion arrays
c = c.replace(/"Maragogi"/g, '"Cancún"');
c = c.replace(/"Jericoacoara"/g, '"Punta Cana"');
c = c.replace(/"Fernando de Noronha"/g, '"Riviera Maya"');
c = c.replace(/"Maceió"/g, '"Cartagena"');
c = c.replace(/"Natal"/g, '"San Andrés"');
c = c.replace(/"Porto de Galinhas"/g, '"Los Cabos"');
c = c.replace(/"Salvador"/g, '"Acapulco"');
c = c.replace(/"Pipa"/g, '"Varadero"');

c = c.replace(/"Florianópolis"/g, '"Santiago"');
c = c.replace(/"Gramado"/g, '"Bariloche"');
c = c.replace(/"Balneário Camboriú"/g, '"Viña del Mar"');
c = c.replace(/"Bombinhas"/g, '"Mendoza"');
c = c.replace(/"Curitiba"/g, '"Bogotá"');
c = c.replace(/"Foz do Iguaçu"/g, '"Machu Picchu"');

fs.writeFileSync('src/pages/fabrica/Phase1DiagnosticoES.tsx', c);
