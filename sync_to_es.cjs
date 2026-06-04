const fs = require('fs');

let pt = fs.readFileSync('src/pages/fabrica/Phase3ArtFactory.tsx', 'utf8');

// 1. Rename Component and Context
let es = pt.replace(/Phase3ArtFactory/g, 'Phase3ArtFactoryES');
es = es.replace(/useFabricaContext/g, 'useFabricaESContext');
es = es.replace(/'\.\/FabricaContext'/g, "'./FabricaESContext'");

// 2. Unlock IA Pura
es = es.replace(/disabled\s+title="Em manutenção — reativaremos em breve"\s+aria-disabled="true"\s+className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-\[10px\] font-bold text-white\/30 cursor-not-allowed opacity-50"/g, `onClick={() => setGenMode("ai")}
                    className={\`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-[10px] font-bold transition-all disabled:opacity-30 \${genMode === "ai" ? "bg-white/10 text-white shadow-sm" : "text-white/50 hover:text-white"}\``);
es = es.replace(/<Sparkles className="w-3.5 h-3.5 inline mr-1" \/> Imagem IA <span className="hidden sm:inline font-normal opacity-70">\(desativado\)<\/span>/g, `<Sparkles className="w-3.5 h-3.5 inline mr-1" /> Imagen IA`);

// Add IA Pura message
es = es.replace(/(<button[^>]*>[\s\S]*?<Sparkles[^>]*> Imagen IA[\s\S]*?<\/button>\s*<\/div>\s*<\/div>)/, `$1
              {genMode === "ai" && (
                <div className="mt-3 p-3 rounded-xl border border-blue-500/20 bg-blue-500/10">
                  <p className="text-[11px] text-blue-200/90 leading-relaxed">
                    ✨ <strong>Modo IA Pura activado.</strong> Genera escenarios hiper-realistas y únicos con inteligencia artificial.
                  </p>
                </div>
              )}`);

// 3. Translations
const dict = {
  "🛠️ Identidade Visual e Canais": "🛠️ Identidad Visual y Canales",
  "IDENTIDADE VISUAL": "IDENTIDAD VISUAL",
  "CANAIS DE ATENDIMENTO": "CANALES DE ATENCIÓN",
  "WhatsApp Oficial": "WhatsApp Oficial",
  "Instagram Color": "Instagram Color",
  "Modo de Criação": "Modo de Creación",
  "Foto Real": "Foto Real",
  "ilimitada": "ilimitada",
  "Sua Foto": "Tu Foto",
  "Versão do Layout": "Versión del Diseño",
  "Texto Integrado (Nova)": "Texto Integrado (Nueva)",
  "Estilo Clásico": "Estilo Clásico", // already mixed in pt?
  "Design minimalista focado na foto": "Diseño minimalista enfocado en la foto",
  "Melhor": "Mejor",
  "Original": "Original",
  "Sutil": "Sutil",
  "Categoria do Post": "Categoría de la Publicación",
  "Destinos Nacionais": "Destinos Nacionales",
  "Destinos Internacionais": "Destinos Internacionales",
  "Cruzeiros": "Cruceros",
  "Resorts": "Resorts",
  "Selecione uma imagem de destino abaixo": "Selecciona una imagen de destino a continuación",
  "Procurar fotos de": "Buscar fotos de",
  "Gerar Imagem no Canva": "Generar Imagen en Canva",
  "Buscando imagens premium...": "Buscando imágenes premium...",
  "Nenhuma imagem encontrada para": "No se encontraron imágenes para",
  "Tentando buscar algo relacionado...": "Intentando buscar algo relacionado...",
  "Tente usar termos mais simples": "Intenta usar términos más simples",
  "Ex: Praia, Neve, Paris, Resort": "Ej: Playa, Nieve, París, Resort",
  "Tentar Outra Busca": "Intentar Otra Búsqueda",
  "Busque por lugares...": "Busca por lugares...",
  "Opcional: Faça upload de uma foto que você já tem do destino": "Opcional: Sube una foto que ya tengas del destino",
  "Carregar Foto da Galeria": "Cargar Foto de la Galería",
  "Clique ou arraste a foto do destino": "Haz clic o arrastra la foto del destino",
  "JPG ou PNG": "JPG o PNG",
  "Remover Foto": "Eliminar Foto",
  "Trocar Foto": "Cambiar Foto",
  "Destino / Tema": "Destino / Tema",
  "Chamada Principal": "Llamada Principal",
  "Chamada Curta": "Llamada Corta",
  "Adicione itens ao pacote ou diferenciais": "Añade elementos al paquete o diferenciales",
  "Adicionar Item": "Añadir Elemento",
  "Valor (opcional)": "Valor (opcional)",
  "A partir de": "A partir de",
  "Por pessoa": "Por persona",
  "GERAR ANÚNCIO": "GENERAR ANUNCIO",
  "ESPERANDO GERAÇÃO DA ARTE": "ESPERANDO GENERACIÓN DEL ARTE",
  "Defina os parâmetros no painel lateral esquerdo": "Define los parámetros en el panel lateral",
  "e clique no botão para gerar um criativo de vendas ultra profissional em segundos!": "y haz clic en el botón para generar un creativo de ventas ultra profesional en segundos!",
  "BAIXAR IMAGEM": "DESCARGAR IMAGEN",
  "Aviso: Não garantimos o uso das imagens em anúncios ADS Face/Insta.": "Aviso: No garantizamos el uso de las imágenes en anuncios ADS Face/Insta.",
  "Dica": "Consejo",
  "Se o download não funcionar": "Si la descarga no funciona",
  'clique com botão direito e "Salvar Imagem"': 'haz clic derecho y "Guardar Imagen"',
  "Gerando Design Premium...": "Generando Diseño Premium...",
  "Quase pronto...": "Casi listo...",
  "AVANÇAR PARA A FASE 2 — SEU SITE": "AVANZAR A LA FASE 2 — TU SITIO",
  "Crie a página de vendas da sua agência no próximo passo": "Crea la página de ventas de tu agencia en el siguiente paso",
  "🛠️ Modo de Criação e Categoria": "🛠️ Modo de Creación y Categoría",
  "🖼️ Escolher Imagem de Destino": "🖼️ Elegir una foto real",
  "🏷️ Dados do Anúncio": "🏷️ Datos del Anuncio"
};

for (const [ptText, esText] of Object.entries(dict)) {
  es = es.split(ptText).join(esText);
}

fs.writeFileSync('src/pages/fabrica/Phase3ArtFactoryES.tsx', es, 'utf8');
console.log('Done syncing to ES');
