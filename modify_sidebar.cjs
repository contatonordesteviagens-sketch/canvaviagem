const fs = require('fs');

const content = fs.readFileSync('src/components/SidebarNav.tsx', 'utf-8');

const newSections = `
          <div className="space-y-1">
            <button
              onClick={() => handleNavClick('all')}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors group",
                activeCategory === 'all' || (!activeCategory && location.pathname === homeRoute)
                  ? "bg-slate-200/50 text-slate-900 font-semibold dark:bg-white/10 dark:text-white"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/30 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5"
              )}
            >
              <div className="flex items-center gap-3">
                <LayoutGrid className={cn(
                  "w-[18px] h-[18px] shrink-0 transition-colors",
                  activeCategory === 'all' || (!activeCategory && location.pathname === homeRoute)
                    ? "text-slate-900 dark:text-white"
                    : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                )} />
                <span>Início</span>
              </div>
            </button>

            <button
              onClick={() => handleNavClick(undefined, isESRoute ? "/es/fabrica" : "/fabrica", true)}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors group",
                location.pathname === '/fabrica' || location.pathname === '/es/fabrica'
                  ? "bg-slate-200/50 text-slate-900 font-semibold dark:bg-white/10 dark:text-white"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/30 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5"
              )}
            >
              <div className="flex items-center gap-3">
                <Wand2 className={cn(
                  "w-[18px] h-[18px] shrink-0 transition-colors",
                  (location.pathname === '/fabrica' || location.pathname === '/es/fabrica') ? "text-violet-500" : "text-slate-400 group-hover:text-violet-500"
                )} />
                <span>Fábrica</span>
              </div>
            </button>

            <button
              onClick={() => handleNavClick(undefined, "/fabrica/crm", true)}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors group",
                location.pathname.includes('/fabrica/crm')
                  ? "bg-slate-200/50 text-slate-900 font-semibold dark:bg-white/10 dark:text-white"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/30 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5"
              )}
            >
              <div className="flex items-center gap-3">
                <Users className={cn(
                  "w-[18px] h-[18px] shrink-0 transition-colors",
                  location.pathname.includes('/fabrica/crm') ? "text-emerald-500" : "text-slate-400 group-hover:text-emerald-500"
                )} />
                <span>CRM e Leads</span>
              </div>
              {newLeadsCount > 0 && (
                <span className="bg-red-500 text-white font-extrabold text-[9px] px-2 py-0.5 rounded-full animate-pulse shadow-md">
                  {newLeadsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => handleNavClick(undefined, "/fabrica/anuncio", true)}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors group",
                location.pathname.includes('/fabrica/anuncio')
                  ? "bg-slate-200/50 text-slate-900 font-semibold dark:bg-white/10 dark:text-white"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/30 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5"
              )}
            >
              <div className="flex items-center gap-3">
                <MousePointerClick className={cn(
                  "w-[18px] h-[18px] shrink-0 transition-colors",
                  location.pathname.includes('/fabrica/anuncio') ? "text-[#00D4FF]" : "text-slate-400 group-hover:text-[#00D4FF]"
                )} />
                <span>Criador de Anúncios</span>
              </div>
            </button>

            <button
              onClick={() => handleNavClick(undefined, "/fabrica/site", true)}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors group",
                location.pathname.includes('/fabrica/site')
                  ? "bg-slate-200/50 text-slate-900 font-semibold dark:bg-white/10 dark:text-white"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/30 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5"
              )}
            >
              <div className="flex items-center gap-3">
                <Globe className={cn(
                  "w-[18px] h-[18px] shrink-0 transition-colors",
                  location.pathname.includes('/fabrica/site') ? "text-[#FF9900]" : "text-slate-400 group-hover:text-[#FF9900]"
                )} />
                <span>Construtor de Sites</span>
              </div>
            </button>

            <button
              onClick={() => handleNavClick(undefined, "/fabrica/carrossel", true)}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors group",
                location.pathname.includes('/fabrica/carrossel')
                  ? "bg-slate-200/50 text-slate-900 font-semibold dark:bg-white/10 dark:text-white"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/30 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5"
              )}
            >
              <div className="flex items-center gap-3">
                <Layers className={cn(
                  "w-[18px] h-[18px] shrink-0 transition-colors",
                  location.pathname.includes('/fabrica/carrossel') ? "text-[#F72585]" : "text-slate-400 group-hover:text-[#F72585]"
                )} />
                <span>Gerador de Carrosséis</span>
              </div>
            </button>

            <button
              onClick={() => handleNavClick('videos')}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors group",
                activeCategory === 'videos' && location.pathname === homeRoute
                  ? "bg-slate-200/50 text-slate-900 font-semibold dark:bg-white/10 dark:text-white"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/30 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5"
              )}
            >
              <div className="flex items-center gap-3">
                <Video className={cn(
                  "w-[18px] h-[18px] shrink-0 transition-colors",
                  activeCategory === 'videos' ? "text-slate-900 dark:text-white" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                )} />
                <span>Vídeos Reels</span>
              </div>
            </button>

            <button
              onClick={() => handleNavClick('feed')}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors group",
                activeCategory === 'feed' && location.pathname === homeRoute
                  ? "bg-slate-200/50 text-slate-900 font-semibold dark:bg-white/10 dark:text-white"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/30 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5"
              )}
            >
              <div className="flex items-center gap-3">
                <Image className={cn(
                  "w-[18px] h-[18px] shrink-0 transition-colors",
                  activeCategory === 'feed' ? "text-slate-900 dark:text-white" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                )} />
                <span>Feed & Stories</span>
              </div>
            </button>

            <button
              onClick={() => handleNavClick('offers')}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors group",
                activeCategory === 'offers' && location.pathname === homeRoute
                  ? "bg-slate-200/50 text-slate-900 font-semibold dark:bg-white/10 dark:text-white"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/30 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5"
              )}
            >
              <div className="flex items-center gap-3">
                <Megaphone className={cn(
                  "w-[18px] h-[18px] shrink-0 transition-colors",
                  activeCategory === 'offers' ? "text-slate-900 dark:text-white" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                )} />
                <span>Ofertas & Legendas</span>
              </div>
            </button>

            <button
              onClick={() => handleNavClick('videoaula')}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors group",
                activeCategory === 'videoaula' && location.pathname === homeRoute
                  ? "bg-slate-200/50 text-slate-900 font-semibold dark:bg-white/10 dark:text-white"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/30 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5"
              )}
            >
              <div className="flex items-center gap-3">
                <GraduationCap className={cn(
                  "w-[18px] h-[18px] shrink-0 transition-colors",
                  activeCategory === 'videoaula' ? "text-slate-900 dark:text-white" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                )} />
                <span>Videoaulas</span>
              </div>
            </button>

            <button
              onClick={() => handleNavClick('downloads')}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors group",
                activeCategory === 'downloads' && location.pathname === homeRoute
                  ? "bg-slate-200/50 text-slate-900 font-semibold dark:bg-white/10 dark:text-white"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/30 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5"
              )}
            >
              <div className="flex items-center gap-3">
                <Download className={cn(
                  "w-[18px] h-[18px] shrink-0 transition-colors",
                  activeCategory === 'downloads' ? "text-slate-900 dark:text-white" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                )} />
                <span>Pacotes de Vídeos & Drive</span>
              </div>
            </button>

            <button
              onClick={() => handleNavClick(undefined, isESRoute ? "/es/downloads" : "/downloads")}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors group",
                location.pathname.includes('/downloads')
                  ? "bg-slate-200/50 text-slate-900 font-semibold dark:bg-white/10 dark:text-white"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/30 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5"
              )}
            >
              <div className="flex items-center gap-3">
                <Download className={cn(
                  "w-[18px] h-[18px] shrink-0 transition-colors",
                  location.pathname.includes('/downloads') ? "text-slate-900 dark:text-white" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                )} />
                <span>Central de Downloads</span>
              </div>
            </button>

            <button
              onClick={() => handleNavClick('tools')}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors group",
                activeCategory === 'tools' && location.pathname === homeRoute
                  ? "bg-slate-200/50 text-slate-900 font-semibold dark:bg-white/10 dark:text-white"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/30 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5"
              )}
            >
              <div className="flex items-center gap-3">
                <Bot className={cn(
                  "w-[18px] h-[18px] shrink-0 transition-colors",
                  activeCategory === 'tools' ? "text-slate-900 dark:text-white" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                )} />
                <span>Ferramentas de IA</span>
              </div>
            </button>
            
            <button
              onClick={() => handleNavClick(undefined, "/vendedor-ia")}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors group",
                location.pathname.includes('/vendedor-ia')
                  ? "bg-slate-200/50 text-slate-900 font-semibold dark:bg-white/10 dark:text-white"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/30 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5"
              )}
            >
              <div className="flex items-center gap-3">
                <MessageCircle className={cn(
                  "w-[18px] h-[18px] shrink-0 transition-colors",
                  location.pathname.includes('/vendedor-ia') ? "text-blue-500 dark:text-blue-400" : "text-slate-400 group-hover:text-blue-500 dark:group-hover:text-blue-400"
                )} />
                <span>Vendedor IA</span>
              </div>
            </button>

            <button
              onClick={() => handleNavClick(undefined, !user ? "/auth" : "/minha-conta")}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors group",
                location.pathname.includes('/minha-conta') || location.pathname.includes('/auth')
                  ? "bg-slate-200/50 text-slate-900 font-semibold dark:bg-white/10 dark:text-white"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/30 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5"
              )}
            >
              <div className="flex items-center gap-3">
                <User className={cn(
                  "w-[18px] h-[18px] shrink-0 transition-colors",
                  location.pathname.includes('/minha-conta') || location.pathname.includes('/auth') ? "text-slate-900 dark:text-white" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                )} />
                <span>Minha Conta</span>
              </div>
            </button>

            {user && (
              <button
                onClick={() => handleNavClick(undefined, isESRoute ? "/es/progresso" : "/progresso")}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors group",
                  location.pathname.includes('/progresso')
                    ? "bg-slate-200/50 text-slate-900 font-semibold dark:bg-white/10 dark:text-white"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/30 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5"
                )}
              >
                <div className="flex items-center gap-3">
                  <TrendingUp className={cn(
                    "w-[18px] h-[18px] shrink-0 transition-colors",
                    location.pathname.includes('/progresso') ? "text-slate-900 dark:text-white" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                  )} />
                  <span>Meu Progresso</span>
                </div>
              </button>
            )}

            <button
              onClick={() => handleNavClick(undefined, isESRoute ? "/es/inicio" : "/inicio")}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors group",
                location.pathname === (isESRoute ? "/es/inicio" : "/inicio")
                  ? "bg-slate-200/50 text-slate-900 font-semibold dark:bg-white/10 dark:text-white"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/30 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5"
              )}
            >
              <div className="flex items-center gap-3">
                <CreditCard className={cn(
                  "w-[18px] h-[18px] shrink-0 transition-colors",
                  location.pathname === (isESRoute ? "/es/inicio" : "/inicio") ? "text-slate-900 dark:text-white" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                )} />
                <span>Planos & Upgrade</span>
              </div>
            </button>

            <button
              onClick={() => handleNavClick(undefined, "/blog")}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors group",
                location.pathname.includes('/blog')
                  ? "bg-slate-200/50 text-slate-900 font-semibold dark:bg-white/10 dark:text-white"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/30 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5"
              )}
            >
              <div className="flex items-center gap-3">
                <BookmarkCheck className={cn(
                  "w-[18px] h-[18px] shrink-0 transition-colors",
                  location.pathname.includes('/blog') ? "text-slate-900 dark:text-white" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                )} />
                <span>Blog de Estratégias</span>
              </div>
            </button>

            {language === 'pt' && (
              <button
                onClick={() => handleNavClick(undefined, "/proximo-nivel")}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors group",
                  location.pathname.includes('/proximo-nivel')
                    ? "bg-slate-200/50 text-slate-900 font-semibold dark:bg-white/10 dark:text-white"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/30 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5"
                )}
              >
                <div className="flex items-center gap-3">
                  <Star className={cn(
                    "w-[18px] h-[18px] shrink-0 transition-colors",
                    location.pathname.includes('/proximo-nivel') ? "text-slate-900 dark:text-white" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                  )} />
                  <span>Curso Tráfego Pago</span>
                </div>
              </button>
            )}

            <button
              onClick={() => handleNavClick(undefined, isESRoute ? "/es/calendar" : "/calendar")}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors group",
                location.pathname.includes('/calendar')
                  ? "bg-slate-200/50 text-slate-900 font-semibold dark:bg-white/10 dark:text-white"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/30 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5"
              )}
            >
              <div className="flex items-center gap-3">
                <Calendar className={cn(
                  "w-[18px] h-[18px] shrink-0 transition-colors",
                  location.pathname.includes('/calendar') ? "text-slate-900 dark:text-white" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                )} />
                <span>Calendário</span>
              </div>
            </button>

            <button
              onClick={() => handleNavClick('favorites')}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors group",
                activeCategory === 'favorites' && location.pathname === homeRoute
                  ? "bg-slate-200/50 text-slate-900 font-semibold dark:bg-white/10 dark:text-white"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/30 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5"
              )}
            >
              <div className="flex items-center gap-3">
                <Heart className={cn(
                  "w-[18px] h-[18px] shrink-0 transition-colors",
                  activeCategory === 'favorites' ? "text-slate-900 dark:text-white" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                )} />
                <span>Favoritos</span>
              </div>
            </button>

            <button
              onClick={() => window.open("https://api.whatsapp.com/send/?phone=5585998458995&text=Ol%C3%A1%2C+quero+suporte+do+Canva+Viagem", "_blank")}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors group text-slate-500 hover:text-slate-900 hover:bg-slate-200/30 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5"
            >
              <div className="flex items-center gap-3">
                <MessageCircle className="w-[18px] h-[18px] shrink-0 text-slate-400 group-hover:text-emerald-500" />
                <span>Suporte WhatsApp</span>
              </div>
            </button>
          </div>
`;

const startIndex = content.indexOf('          {/* SEÇÃO 1: PRINCIPAL */}');
const endIndex = content.indexOf('        {/* Rodapé do Menu Lateral */}');

if (startIndex !== -1 && endIndex !== -1) {
  // Let's remove openSections logic from the state too
  let newContent = content.substring(0, startIndex) + newSections + '\n        </div>\n\n' + content.substring(endIndex);
  
  // Remove openSections state
  newContent = newContent.replace(/  \/\/ Controle de seções recolhíveis[\s\S]*?const toggleSection =[\s\S]*?};\n\n/, '');
  
  fs.writeFileSync('src/components/SidebarNav.tsx', newContent);
  console.log('SidebarNav replaced successfully!');
} else {
  console.error('Could not find markers');
}
