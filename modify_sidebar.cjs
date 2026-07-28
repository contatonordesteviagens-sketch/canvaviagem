const fs = require('fs');

const content = fs.readFileSync('src/components/SidebarNav.tsx', 'utf-8');

const newSections = `
          {/* SEÇÃO 1: PRINCIPAL */}
          <div className="space-y-1">
            <button
              onClick={() => toggleSection('principal')}
              className="w-full flex items-center justify-between text-[10px] font-black text-slate-500 dark:text-white/50 tracking-wider uppercase px-2.5 py-1.5 hover:text-slate-900 dark:hover:text-white/80 transition-colors"
            >
              <span>PRINCIPAL & IA</span>
              {openSections.principal ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>

            {openSections.principal && (
              <div className="space-y-1 pt-0.5">
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
                    <span>Início (Tudo)</span>
                  </div>
                </button>

                {/* Ferramentas de IA */}
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
                
                {/* Vendedor IA */}
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
              </div>
            )}
          </div>

          {/* SEÇÃO FABRICA */}
          <div className="space-y-1">
            <button
              onClick={() => toggleSection('fabrica')}
              className="w-full flex items-center justify-between text-[10px] font-black text-slate-500 dark:text-white/50 tracking-wider uppercase px-2.5 py-1.5 hover:text-slate-900 dark:hover:text-white/80 transition-colors"
            >
              <span>FERRAMENTAS (FÁBRICA)</span>
              {openSections.fabrica ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>

            {openSections.fabrica && (
              <div className="space-y-1 pt-0.5">
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
                      (location.pathname === '/fabrica' || location.pathname === '/es/fabrica') ? "text-violet-500" : "text-violet-500/70 group-hover:text-violet-500"
                    )} />
                    <span className="leading-snug">Fábrica (Início)</span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded flex items-center gap-1 bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300 font-extrabold uppercase shrink-0">
                    <Crown className="w-2.5 h-2.5" /> PRO
                  </span>
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
                      location.pathname.includes('/fabrica/crm') ? "text-emerald-500" : "text-emerald-500/70 group-hover:text-emerald-500"
                    )} />
                    <span>CRM e Leads</span>
                  </div>
                  {newLeadsCount > 0 ? (
                    <span className="bg-red-500 text-white font-extrabold text-[9px] px-2 py-0.5 rounded-full animate-pulse shadow-md">
                      {newLeadsCount}
                    </span>
                  ) : (
                    <span className="bg-red-500 text-white font-extrabold text-[9px] px-2 py-0.5 rounded-full shadow-md opacity-90">
                      2
                    </span>
                  )}
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
                      location.pathname.includes('/fabrica/carrossel') ? "text-[#F72585]" : "text-[#F72585]/70 group-hover:text-[#F72585]"
                    )} />
                    <span>Carrosséis IA</span>
                  </div>
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
                      location.pathname.includes('/fabrica/anuncio') ? "text-[#00D4FF]" : "text-[#00D4FF]/70 group-hover:text-[#00D4FF]"
                    )} />
                    <span>Anúncios Prontos</span>
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
                      location.pathname.includes('/fabrica/site') ? "text-[#FF9900]" : "text-[#FF9900]/70 group-hover:text-[#FF9900]"
                    )} />
                    <span>Criador de Sites</span>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* SEÇÃO 2: CONTEÚDOS & MATERIAIS */}
          <div className="space-y-1">
            <button
              onClick={() => toggleSection('conteudos')}
              className="w-full flex items-center justify-between text-[10px] font-black text-slate-500 dark:text-white/50 tracking-wider uppercase px-2.5 py-1.5 hover:text-slate-900 dark:hover:text-white/80 transition-colors"
            >
              <span>CONTEÚDOS & MATERIAIS</span>
              {openSections.conteudos ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>

            {openSections.conteudos && (
              <div className="space-y-1 pt-0.5">
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
                      ? "bg-blue-50 text-blue-600 font-semibold dark:bg-white/10 dark:text-white"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/30 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Download className={cn(
                      "w-[18px] h-[18px] shrink-0 transition-colors",
                      activeCategory === 'downloads' ? "text-blue-600 dark:text-blue-400" : "text-slate-400 group-hover:text-blue-600 dark:text-white/45 dark:group-hover:text-amber-400"
                    )} />
                    <span>{isESRoute ? "Paquetes de Videos & Drive" : "Pacotes de Vídeos & Drive"}</span>
                  </div>
                </button>

                <div className="w-full flex justify-center py-1">
                  <button
                    onClick={() => handleNavClick(undefined, isESRoute ? "/es/downloads" : "/downloads")}
                    className={cn(
                      "flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors group border border-slate-200 dark:border-white/10",
                      location.pathname.includes('/downloads')
                        ? "bg-slate-200/50 text-slate-900 dark:bg-white/10 dark:text-white"
                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/30 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5"
                    )}
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Central de Downloads</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* SEÇÃO 3: GESTÃO & ESTRATÉGIA */}
          <div className="space-y-1">
            <button
              onClick={() => toggleSection('gestao')}
              className="w-full flex items-center justify-between text-[10px] font-black text-slate-500 dark:text-white/50 tracking-wider uppercase px-2.5 py-1.5 hover:text-slate-900 dark:hover:text-white/80 transition-colors"
            >
              <span>GESTÃO & ESTRATÉGIA</span>
              {openSections.gestao ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>

            {openSections.gestao && (
              <div className="space-y-1 pt-0.5">
                <button
                  onClick={() => handleNavClick('contracts')}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors group",
                    activeCategory === 'contracts' && location.pathname === homeRoute
                      ? "bg-slate-200/50 text-slate-900 font-semibold dark:bg-white/10 dark:text-white"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/30 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <FileText className={cn(
                      "w-[18px] h-[18px] shrink-0 transition-colors",
                      activeCategory === 'contracts' ? "text-slate-900 dark:text-white" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                    )} />
                    <span>Contratos Prontos</span>
                  </div>
                </button>

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
                    <span>Datas & Calendário</span>
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
                      location.pathname === (isESRoute ? "/es/inicio" : "/inicio") ? "text-amber-500" : "text-amber-500/70 group-hover:text-amber-500"
                    )} />
                    <span className="leading-snug">Planos & Upgrade</span>
                  </div>
                  {!isElite && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 font-extrabold shrink-0 shadow-sm uppercase">
                      Elite
                    </span>
                  )}
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
                        location.pathname.includes('/proximo-nivel') ? "text-amber-500" : "text-amber-500/70 group-hover:text-amber-500"
                      )} />
                      <span>Curso Tráfego Pago</span>
                    </div>
                  </button>
                )}

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
                  onClick={() => window.open("https://api.whatsapp.com/send/?phone=5585998458995&text=Ol%C3%A1%2C+quero+suporte+do+Canva+Viagem", "_blank")}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors group text-slate-500 hover:text-slate-900 hover:bg-slate-200/30 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5"
                >
                  <div className="flex items-center gap-3">
                    <MessageCircle className="w-[18px] h-[18px] shrink-0 text-emerald-500 dark:text-emerald-400 group-hover:text-emerald-600" />
                    <span>Suporte WhatsApp</span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 font-extrabold uppercase shrink-0">
                    Online
                  </span>
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
              </div>
            )}
          </div>
`;

const startIndex = content.indexOf('          {/* SEÇÃO 1: PRINCIPAL */}');
const endIndex = content.indexOf('        {/* Rodapé do Menu Lateral */}');
const endReplacementIndex = content.lastIndexOf('</div>', endIndex) + 6;

if (startIndex !== -1 && endIndex !== -1) {
  const newContent = content.substring(0, startIndex) + newSections + '\n        </div>\n\n' + content.substring(endIndex);
  fs.writeFileSync('src/components/SidebarNav.tsx', newContent);
  console.log('SidebarNav replaced successfully!');
} else {
  console.error('Could not find markers');
}
