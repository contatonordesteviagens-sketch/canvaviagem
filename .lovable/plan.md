Plano de Implementação: Suporte Completo para Espanhol com Checkout Separado
Resumo do que você pediu
Remover aba "Próximo Nível" - Apenas na versão em espanhol
Traduzir todas as páginas - Calendário, Planos (com nova página ES com preços em dólar)
Checkouts separados - PT: R$ 37,90 (existente) | ES: $9,09 USD (novo link Stripe)
Gestão aprimorada - Filtros de idioma, ordenação (mais recente padrão), destaques separados por idioma
Remover filtro "Nacionais" - Apenas na versão em espanhol
URLs em /es - Não vamos mudar isso (já está usando estado, não URL)
Remover popup inicial - Permitir navegação livre, popup só ao clicar para usar conteúdo, com botão de checkout por idioma
Dados Fornecidos
Idioma	Preço	Link Stripe	Product ID
Português	R$ 37,90/mês	https://buy.stripe.com/5kQdRa1LA4Iw42v8sQ8so00	(existente)
Espanhol	$9,09 USD	https://buy.stripe.com/bJedRa3TIej6cz15gE8so04	prod_TsnHjECj482iVM
Fase 1: Remover "Próximo Nível" em Espanhol
Arquivo: 
src/components/Header.tsx

Mudança:

O link "Próximo Nível" só aparece quando language === 'pt'
No mobile e desktop, condicionalmente renderizar com base no idioma
// Antes (desktop, linha ~179-186):
<NavLink to="/proximo-nivel">...</NavLink>
// Depois:
{language === 'pt' && (
  <NavLink to="/proximo-nivel">...</NavLink>
)}
O mesmo para a versão mobile (linhas ~254-263).

Fase 2: Traduzir Página de Planos + Checkout Separado
2.1 Atualizar Traduções
Arquivo: src/lib/translations.ts

Novas chaves para Planos (ES):

// Preço atualizado para dólar
'plans.price': '$9,09',
'plans.period': '/mes',
'plans.currency': 'USD',
'plans.priceOriginal': '$19,90',
// Novos textos para versão ES
'plans.heroTitle': '¡VENDE MÁS VIAJES TODO EL AÑO!',
'plans.heroSubtitle': 'Accede a +250 videos de viajes y publica en 2 minutos',
'plans.badgeOffer': 'OFERTA EXCLUSIVA',
'plans.lessThanPerVideo': 'Menos de $0,05 por video',
'plans.approvedAgencies': 'Aprobado por +500 Agencias',
// ... demais textos da página Planos
2.2 Modificar Página de Planos
Arquivo: 
src/pages/Planos.tsx

Mudanças principais:

Importar useLanguage:
import { useLanguage } from "@/contexts/LanguageContext";
const { language, t } = useLanguage();
Checkout condicional por idioma:
// Links de checkout
const STRIPE_PAYMENT_LINK_PT = "https://buy.stripe.com/5kQdRa1LA4Iw42v8sQ8so00";
const STRIPE_PAYMENT_LINK_ES = "https://buy.stripe.com/bJedRa3TIej6cz15gE8so04";
// Na função handleCheckout:
const checkoutLink = language === 'es' 
  ? STRIPE_PAYMENT_LINK_ES 
  : STRIPE_PAYMENT_LINK_PT;
// Track com moeda correta
trackInitiateCheckout(
  language === 'es' ? 9.09 : 37.90, 
  language === 'es' ? 'USD' : 'BRL'
);
Preços dinâmicos na UI:
// Antes: <span>R$ 37,90</span>
// Depois:
<span>{t('plans.price')}</span>
<span>{t('plans.period')}</span>
// Preço riscado (antes de desconto)
// PT: de R$ 197,00
// ES: de $19,90
Traduzir todos os textos estáticos:
Hero section
Benefícios (benefits array)
FAQs
Botões CTA
Badges de prova social
Fase 3: Traduzir Página do Calendário
Arquivo: 
src/pages/Calendar.tsx

Mudanças:

Importar useLanguage:
import { useLanguage } from "@/contexts/LanguageContext";
const { t, language } = useLanguage();
Traduzir nomes dos meses:
const monthNames = language === 'es' 
  ? ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", 
     "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
  : ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
     "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
Traduzir dias da semana:
const dayNames = language === 'es'
  ? ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
  : ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
Traduzir textos estáticos:
Título: "Calendário de Postagens" → "Calendario de Publicaciones"
"Hoje" → "Hoy"
"Agendado" → "Programado"
"Sugestão automática" → "Sugerencia automática"
Modal de dia: traduzir labels
Fase 4: Remover Filtro "Nacionais" em Espanhol
Arquivo: 
src/pages/Index.tsx

Mudança:

Importar idioma e filtrar array:
import { useLanguage } from "@/contexts/LanguageContext";
const { language, t } = useLanguage();
// Filtros condicionais
const videoFilters = language === 'es'
  ? [
      { id: 'todos' as const, label: t('filter.all') },
      { id: 'internacionais' as const, label: t('filter.international') },
      { id: 'favoritos' as const, label: '⭐ ' + t('category.favorites') },
    ]
  : [
      { id: 'todos' as const, label: t('filter.all') },
      { id: 'nacionais' as const, label: t('filter.national') },
      { id: 'internacionais' as const, label: t('filter.international') },
      { id: 'favoritos' as const, label: '⭐ ' + t('category.favorites') },
    ];
Ajustar estado inicial:
// Se usuário está em ES e tinha 'nacionais' selecionado, voltar para 'todos'
useEffect(() => {
  if (language === 'es' && videoFilter === 'nacionais') {
    setVideoFilter('todos');
  }
}, [language]);
Fase 5: Gestão Aprimorada com Filtros de Idioma
5.1 Atualizar ContentSection
Arquivo: 
src/components/gestao/ContentSection.tsx

Novas funcionalidades:

Adicionar filtro de idioma:
const [languageFilter, setLanguageFilter] = useState<"all" | "pt" | "es">("all");
// Componente de filtro
<Select value={languageFilter} onValueChange={(v) => setLanguageFilter(v)}>
  <SelectTrigger className="w-36">
    <Globe className="w-4 h-4 mr-2" />
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="all">Todos idiomas</SelectItem>
    <SelectItem value="pt">🇧🇷 Português</SelectItem>
    <SelectItem value="es">🇪🇸 Espanhol</SelectItem>
  </SelectContent>
</Select>
Aplicar filtro nos itens:
const filterByLanguage = <T extends { language?: string | null }>(items: T[]): T[] => {
  if (languageFilter === "all") return items;
  return items.filter(item => (item.language || 'pt') === languageFilter);
};
Alterar ordenação padrão para "mais recentes":
// Antes: const [sortOrder, setSortOrder] = useState<SortOrder>("custom");
// Depois:
const [sortOrder, setSortOrder] = useState<SortOrder>("recent");
5.2 Seção de Destaques por Idioma
Arquivo: 
src/components/gestao/ContentSection.tsx

Nova seção de Destaques com abas por idioma:

// Destaques separados por idioma
const featuredPT = useMemo(() => 
  contentItems.filter(item => item.is_featured && (item.language || 'pt') === 'pt'),
  [contentItems]
);
const featuredES = useMemo(() => 
  contentItems.filter(item => item.is_featured && item.language === 'es'),
  [contentItems]
);
// UI com tabs
<Tabs defaultValue="pt">
  <TabsList>
    <TabsTrigger value="pt">🇧🇷 Destaques PT ({featuredPT.length}/10)</TabsTrigger>
    <TabsTrigger value="es">🇪🇸 Destaques ES ({featuredES.length}/10)</TabsTrigger>
  </TabsList>
  <TabsContent value="pt">
    {/* Grid de destaques PT */}
  </TabsContent>
  <TabsContent value="es">
    {/* Grid de destaques ES */}
  </TabsContent>
</Tabs>
5.3 Adicionar campo de idioma no modal de criação
Arquivo: 
src/components/gestao/CreateItemModal.tsx

Adicionar seletor de idioma:

<Select value={language} onValueChange={setLanguage}>
  <SelectTrigger>
    <SelectValue placeholder="Idioma" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="pt">🇧🇷 Português</SelectItem>
    <SelectItem value="es">🇪🇸 Espanhol</SelectItem>
  </SelectContent>
</Select>
Fase 6: Atualizar Edge Function de Checkout (Opcional)
Arquivo: 
supabase/functions/create-checkout/index.ts

Se quiser usar checkout via edge function para ES:

// Receber idioma do body
const { language = 'pt' } = await req.json();
// Price IDs por idioma
const PRICE_IDS = {
  pt: "price_1SnPjZLXUoWoiE4TWVWEP6TZ", // R$ 37,90
  es: "price_XXXXXXXX", // $9.09 USD - você precisa criar o Price ID
};
const priceId = PRICE_IDS[language] || PRICE_IDS.pt;
// Criar sessão com o price ID correto
const session = await stripe.checkout.sessions.create({
  line_items: [{ price: priceId, quantity: 1 }],
  // ...
});
Nota: Como você forneceu um link de pagamento direto do Stripe, podemos usar ele diretamente no frontend sem precisar modificar a edge function.

Fase 7: Remover Popup Inicial e Bloquear ao Uso
7.1 Comportamento Atual vs Novo
Estado Atual	Novo Comportamento
Popup aparece na tela inicial para não-assinantes	❌ Remover popup inicial
Bloqueia acesso imediato	✅ Permitir navegação livre no app
Não há popup ao clicar em ações	✅ Mostrar popup APENAS ao tentar usar conteúdo
Sem botão de checkout no popup	✅ Adicionar botão de checkout por idioma
7.2 Lógica do Novo Popup
Trigger para mostrar popup:

Usuário NÃO assinante clica em:
"Copiar" legenda
"Usar Template" (abrir no Canva)
"Baixar" vídeo/recurso
Qualquer ferramenta de marketing
Qualquer ação que use conteúdo premium
Conteúdo do popup por idioma:

Idioma	Título	Descrição	Botão
PT	"Conteúdo Exclusivo"	"Este conteúdo é exclusivo para assinantes Premium"	"Assinar Premium - R$ 37,90/mês" → Link PT
ES	"Contenido Exclusivo"	"Este contenido es exclusivo para suscriptores Premium"	"Suscribirse Premium - $9,09/mes" → Link ES
7.3 Modificações de Código
Arquivo: 
src/pages/Index.tsx

Mudanças:

Remover PromoPopup da renderização inicial:
// Antes (linha ~640-650):
<PromoPopup 
  isOpen={showPromoPopup}
  onClose={() => setShowPromoPopup(false)}
/>
// REMOVER completamente da página inicial
Adicionar PremiumGate com checkout por idioma:
import { useLanguage } from "@/contexts/LanguageContext";
// No componente Index:
const { language } = useLanguage();
const [showPremiumGate, setShowPremiumGate] = useState(false);
const [gateAction, setGateAction] = useState<string>('');
// Função para verificar e bloquear ação
const handlePremiumAction = (action: string, callback: () => void) => {
  if (!subscription.subscribed) {
    setGateAction(action);
    setShowPremiumGate(true);
    return;
  }
  callback();
};
// Renderizar PremiumGate com checkout
<PremiumGate
  isOpen={showPremiumGate}
  onClose={() => setShowPremiumGate(false)}
  checkoutUrl={
    language === 'es' 
      ? 'https://buy.stripe.com/bJedRa3TIej6cz15gE8so04'
      : 'https://buy.stripe.com/5kQdRa1LA4Iw42v8sQ8so00'
  }
  language={language}
/>
Aplicar verificação em todas as ações:
// Exemplo: botão "Copiar" de legenda
<Button onClick={() => handlePremiumAction('copy_caption', () => {
  navigator.clipboard.writeText(caption.text);
  toast.success("Legenda copiada!");
})}>
  Copiar
</Button>
// Exemplo: link "Usar Template"
<a onClick={(e) => {
  if (!subscription.subscribed) {
    e.preventDefault();
    handlePremiumAction('use_template', () => {});
  }
}} href={item.url}>
  Usar Template
</a>
Arquivo: 
src/components/PremiumGate.tsx

Atualizar componente para aceitar checkout por idioma:

interface PremiumGateProps {
  isOpen: boolean;
  onClose: () => void;
  checkoutUrl: string;
  language: 'pt' | 'es';
}
export const PremiumGate = ({ isOpen, onClose, checkoutUrl, language }: PremiumGateProps) => {
  const translations = {
    pt: {
      title: "Conteúdo Exclusivo 🔒",
      description: "Este conteúdo é exclusivo para assinantes Premium",
      cta: "Assinar Premium - R$ 37,90/mês",
      close: "Voltar",
    },
    es: {
      title: "Contenido Exclusivo 🔒",
      description: "Este contenido es exclusivo para suscriptores Premium",
      cta: "Suscribirse Premium - $9,09/mes",
      close: "Volver",
    }
  };
  const t = translations[language];
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{t.title}</DialogTitle>
          <DialogDescription className="text-lg">
            {t.description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-3 mt-4">
          <Button 
            onClick={() => window.open(checkoutUrl, '_blank')}
            size="lg"
            className="w-full"
          >
            {t.cta}
          </Button>
          
          <Button 
            onClick={onClose}
            variant="ghost"
            size="lg"
          >
            {t.close}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
Arquivo: src/components/canva/VideoTemplateCard.tsx

Bloquear clique em card de vídeo:

<Card 
  onClick={() => {
    if (!subscription.subscribed) {
      onPremiumRequired?.();
      return;
    }
    window.open(item.url, '_blank');
  }}
  className="cursor-pointer hover:shadow-lg transition-shadow"
>
  {/* ... conteúdo do card */}
</Card>
7.4 Componentes a Modificar
Componente	Tipo de Bloqueio	Ação Premium
VideoTemplateCard.tsx	Clique no card	Abrir template no Canva
CaptionCard.tsx	Botão "Copiar"	Copiar texto da legenda
ToolCard.tsx	Clique no card	Acessar ferramenta
DownloadCard.tsx	Botão "Baixar"	Download de vídeo
FeedCard.tsx	Clique no card	Abrir arte no Canva
StoryCard.tsx	Clique no card	Abrir story no Canva
7.5 Adicionar Traduções para o Popup
Arquivo: src/lib/translations.ts

// Adicionar chaves de premium gate
pt: {
  // ... chaves existentes
  'premium.title': 'Conteúdo Exclusivo 🔒',
  'premium.description': 'Este conteúdo é exclusivo para assinantes Premium',
  'premium.cta': 'Assinar Premium - R$ 37,90/mês',
  'premium.close': 'Voltar',
},
es: {
  // ... chaves existentes
  'premium.title': 'Contenido Exclusivo 🔒',
  'premium.description': 'Este contenido es exclusivo para suscriptores Premium',
  'premium.cta': 'Suscribirse Premium - $9,09/mes',
  'premium.close': 'Volver',
}
Arquivos a Criar
Arquivo	Descrição
Nenhum	Todas as mudanças são em arquivos existentes
Arquivos a Modificar
Arquivo	Mudanças
src/lib/translations.ts	Adicionar ~60 novas chaves (Planos, Calendário, Premium Gate)
src/components/Header.tsx
Esconder "Próximo Nível" em ES
src/pages/Planos.tsx
Traduzir toda a UI + checkout separado por idioma
src/pages/Calendar.tsx
Traduzir meses, dias, labels
src/pages/Index.tsx
Remover filtro "Nacionais" em ES + remover PromoPopup inicial + adicionar verificação premium
src/components/PremiumGate.tsx
Atualizar para aceitar checkout por idioma
src/components/canva/VideoTemplateCard.tsx	Bloquear clique para não-assinantes
src/components/canva/CaptionCard.tsx
Bloquear botão "Copiar" para não-assinantes
src/components/canva/ToolCard.tsx
Bloquear acesso a ferramentas
src/components/canva/DownloadCard.tsx	Bloquear downloads
src/components/canva/FeedCard.tsx	Bloquear clique para não-assinantes
src/components/canva/StoryCard.tsx	Bloquear clique para não-assinantes
src/components/gestao/ContentSection.tsx
Filtro de idioma, ordenação padrão "recentes", destaques por idioma
src/components/gestao/CreateItemModal.tsx
Campo de seleção de idioma ao criar item
Resumo Visual das Diferenças PT vs ES
Feature	Português (PT)	Espanhol (ES)
Aba "Próximo Nível"	✅ Visível	❌ Oculta
Filtro "Nacionais"	✅ Visível	❌ Oculto
Preço	R$ 37,90/mês	$9,09/mês (USD)
Checkout Link	Link PT existente	Novo link ES
Moeda no tracking	BRL	USD
Popup Premium	"Assinar Premium - R$ 37,90"	"Suscribirse Premium - $9,09"
Ordem de Implementação
✅ Atualizar translations.ts com novas chaves (Planos, Calendário, Premium)
✅ Modificar 
Header.tsx
 - esconder Próximo Nível em ES
✅ Modificar 
Index.tsx
 - remover filtro Nacionais em ES + remover PromoPopup inicial
✅ Modificar PremiumGate.tsx - adicionar checkout por idioma
✅ Modificar cards (VideoTemplate, Caption, Tool, Download, Feed, Story) - bloquear ações premium
✅ Modificar Planos.tsx - traduzir + checkout separado
✅ Modificar Calendar.tsx - traduzir interface
✅ Modificar ContentSection.tsx - filtros de idioma e ordenação
✅ Modificar CreateItemModal.tsx - campo de idioma
✅ Testar fluxo completo (navegação livre → clique → popup → checkout)
Verificação Final
Comportamento Geral:

 Não-assinante pode navegar livremente no app (ver todos os cards, abas, filtros)
 Popup NÃO aparece na tela inicial
 Popup aparece APENAS ao clicar para usar conteúdo premium
Verificação por Idioma:

 PT: Aba "Próximo Nível" visível, filtro "Nacionais" visível
 ES: Aba "Próximo Nível" oculta, filtro "Nacionais" oculto
 PT: Popup mostra "R$ 37,90/mês" e link PT
 ES: Popup mostra "$9,09/mes" e link ES
 Calendário traduzido corretamente em ambos idiomas
 Planos traduzidos e preços corretos
Verificação Premium:

 Clicar em "Copiar legenda" → Popup (não-assinante)
 Clicar em "Usar Template" → Popup (não-assinante)
 Clicar em "Baixar vídeo" → Popup (não-assinante)
 Clicar em card de ferramenta → Popup (não-assinante)
 Assinante pode usar tudo sem popup
Verificação Admin:

 Gestão: filtro de idioma funciona
 Gestão: ordenação padrão é "mais recentes"
 Gestão: destaques separados por idioma (PT/ES)
 Ao criar item, pode selecionar idioma