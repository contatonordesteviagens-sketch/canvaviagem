const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'fabrica', 'Phase3ArtFactory.tsx');
const content = fs.readFileSync(filePath, 'utf8');

const returnIndex = content.includes('  return (\r\n    <div className="max-w-3xl mx-auto space-y-6">')
  ? content.indexOf('  return (\r\n    <div className="max-w-3xl mx-auto space-y-6">')
  : content.indexOf('  return (\n    <div className="max-w-3xl mx-auto space-y-6">');
if (returnIndex === -1) {
  console.log("Could not find the return statement start.");
  process.exit(1);
}

console.log("Original total lines:", content.split('\n').length);
console.log("Found return statement at index:", returnIndex);

const linesBefore = content.substring(0, returnIndex).split('\n');

const newReturnBlock = `  // Helper para seções minimizáveis
  const MinimizableCard = ({ title, emoji, children, defaultOpen = false }: { title: string; emoji: string; children: React.ReactNode; defaultOpen?: boolean }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    const borderStyle = isOpen
      ? { borderColor: \`\${primaryColor}66\`, boxShadow: \`0 10px 30px \${primaryColor}15\` }
      : { borderColor: 'rgba(255,255,255,0.08)' };

    return (
      <div 
        className="bg-white/[0.04] backdrop-blur-md border rounded-2xl transition-all duration-300 overflow-hidden" 
        style={borderStyle}
      >
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-5 text-left hover:bg-white/[0.02] transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <span className="text-lg leading-none">{emoji}</span>
            <span className="text-xs font-bold text-white uppercase tracking-wider">{title}</span>
          </div>
          <span 
            className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black transition-colors"
            style={{ 
              background: isOpen ? primaryColor : 'rgba(255,255,255,0.08)',
              color: isOpen ? '#000' : '#fff'
            }}
          >
            {isOpen ? '–' : '+'}
          </span>
        </button>
        {isOpen && (
          <div className="p-5 border-t border-white/[0.06] space-y-5">
            {children}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-3xl lg:max-w-[1550px] mx-auto transition-all duration-300">
      {/* Banner de provedor de IA */}
      <div className={\`rounded-2xl p-4 border mb-6 \${
        lastProvider === "user_gemini"
          ? "bg-emerald-500/15 border-emerald-500/30"
          : lastProvider === "lovable_ai"
            ? "bg-blue-500/15 border-blue-500/30"
            : "bg-white/[0.05] border-white/10"
      }\`}>
        <div className="flex items-start gap-3">
          <div className="text-2xl">
            {lastProvider === "user_gemini" ? "🟢" : lastProvider === "lovable_ai" ? "🔵" : "⚡"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-white">
              {lastProvider === "user_gemini" && "Usando sua chave Gemini (grátis)"}
              {lastProvider === "lovable_ai" && "Usando créditos da plataforma"}
              {!lastProvider && "Provedor de IA configurado"}
            </div>
            <p className="text-[11px] text-white/60 leading-snug mt-0.5">
              {lastProvider === "user_gemini" && (
                <>Cota gratuita do Google: ~1.500 imagens/dia. Cheque seu uso em <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline text-emerald-300">aistudio.google.com</a>.</>
              )}
              {lastProvider === "lovable_ai" && (
                <>Cada imagem consome créditos. Se acabar, sua chave Gemini gratuita será usada automaticamente.</>
              )}
              {!lastProvider && (
                <>Tentaremos primeiro sua chave Gemini gratuita. Se falhar, cai pra créditos da plataforma. Imagens geradas nesta sessão: <strong className="text-white">{generationCount}</strong></>
              )}
            </p>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[10px] text-white/40 uppercase tracking-wider">Geradas</div>
            <div className="text-lg font-bold text-white">{generationCount}</div>
          </div>
        </div>
      </div>

      {/* Grid responsivo em Desktop (12 colunas) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Painel Esquerdo (Opções - 5 colunas em lg) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Cartão 1: Perfil e Canais de Atendimento */}
          <MinimizableCard title="Perfil e Canais de Atendimento" emoji="👤" defaultOpen={true}>
            {user && savedProjects && savedProjects.length > 0 && (
              <div className="p-4 bg-white/[0.04] border border-white/10 rounded-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full" style={{ background: primaryColor }}></div>
                <label className="text-[10px] text-white/60 uppercase tracking-wider font-semibold block mb-2">📂 Carregar Cliente / Projeto Salvo</label>
                <select
                  onChange={(e) => {
                    const p = savedProjects.find(x => x.id === e.target.value);
                    if (p && p.state_snapshot) {
                       update({ ...p.state_snapshot, diagnosticoCompleto: false });
                       toast.success(\`Cliente "\${p.agency_name}" carregado! Todas as configs (logo, cor, etc) foram restauradas.\`);
                    }
                    e.target.value = "";
                  }}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-white/40 transition-colors"
                >
                  <option value="" className="bg-zinc-900">Selecione um cliente salvo...</option>
                  {savedProjects.map((p) => (
                    <option key={p.id} value={p.id} className="bg-zinc-900">{p.agency_name || "Sem Nome"} (Salvo em {new Date(p.updated_at).toLocaleDateString()})</option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
              {/* Coluna Logo */}
              <div className="sm:col-span-4">
                <label className="text-[9px] font-bold text-white/30 uppercase tracking-[0.15em] mb-1.5 block">Identidade Visual</label>
                {!state.logoBase64 ? (
                  <label className="flex flex-col items-center justify-center gap-2 p-4 bg-white/[0.02] border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:border-white/20 hover:bg-white/[0.04] transition-all group h-[90px]">
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Upload className="w-4 h-4 text-white/40 group-hover:text-white/70" />
                    </div>
                    <span className="text-[9px] font-bold text-white/40 uppercase tracking-tighter group-hover:text-white/60">Subir Logo</span>
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  </label>
                ) : (
                  <div className="relative group rounded-xl overflow-hidden bg-white/[0.03] p-2 border border-white/10 h-[90px] flex items-center justify-center">
                    <img src={state.logoBase64} alt="Logo" className="max-w-full max-h-full object-contain" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 cursor-pointer transition-all backdrop-blur-sm">
                      <label className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full cursor-pointer transition-colors" title="Trocar Logo">
                        <RotateCcw className="w-3.5 h-3.5 text-white" />
                        <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                      </label>
                      <button
                        type="button"
                        onClick={() => { update({ logoBase64: "" }); toast.success("Logo removida"); }}
                        className="p-1.5 bg-red-500/20 hover:bg-red-500/40 rounded-full transition-colors"
                        title="Remover"
                      >
                        <X className="w-3.5 h-3.5 text-white" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Coluna Contatos */}
              <div className="sm:col-span-8 space-y-2.5">
                <label className="text-[9px] font-bold text-white/30 uppercase tracking-[0.15em] mb-1 block">Canais de Atendimento</label>
                
                {/* Contato 1 */}
                <div className="flex items-center gap-1.5 bg-white/[0.02] p-0.5 rounded-lg border border-white/5 focus-within:border-white/20 transition-colors">
                  <div className="w-[45%] relative">
                    <select
                      value={state.footerContact1Icon || "whatsapp_green"}
                      onChange={(e) => update({ footerContact1Icon: e.target.value as any })}
                      className="w-full bg-white/5 border-none rounded-md pl-2 pr-6 py-1.5 text-[10px] font-medium text-white outline-none appearance-none cursor-pointer"
                    >
                      <option value="whatsapp_green" className="bg-zinc-900">WhatsApp Oficial</option>
                      <option value="whatsapp_custom" className="bg-zinc-900">WhatsApp Sólido</option>
                      <option value="instagram_gradient" className="bg-zinc-900">Instagram Color</option>
                      <option value="instagram_custom" className="bg-zinc-900">Instagram Sólido</option>
                      <option value="website" className="bg-zinc-900">Website / Link</option>
                      <option value="none" className="bg-zinc-900">Ocultar</option>
                    </select>
                    <div className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-30">
                      <ChevronDown className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <div className="w-[55%]">
                    <input
                      value={state.footerContact1Value ?? formatAdPhone(state.whatsapp || "")}
                      onChange={(e) => {
                        const isPhone = state.footerContact1Icon?.startsWith("whatsapp");
                        const val = isPhone ? formatAdPhone(e.target.value) : e.target.value;
                        update({ footerContact1Value: val });
                      }}
                      placeholder={state.footerContact1Icon?.startsWith("whatsapp") ? "(00) 9 0000-0000" : "Link ou Telefone"}
                      className="w-full bg-transparent border-none px-2 py-1.5 text-[10px] text-white outline-none placeholder:text-white/10"
                    />
                  </div>
                </div>

                {/* Contato 2 */}
                <div className="flex items-center gap-1.5 bg-white/[0.02] p-0.5 rounded-lg border border-white/5 focus-within:border-white/20 transition-colors">
                  <div className="w-[45%] relative">
                    <select
                      value={state.footerContact2Icon || "instagram_gradient"}
                      onChange={(e) => update({ footerContact2Icon: e.target.value as any })}
                      className="w-full bg-white/5 border-none rounded-md pl-2 pr-6 py-1.5 text-[10px] font-medium text-white outline-none appearance-none cursor-pointer"
                    >
                      <option value="whatsapp_green" className="bg-zinc-900">WhatsApp Oficial</option>
                      <option value="whatsapp_custom" className="bg-zinc-900">WhatsApp Sólido</option>
                      <option value="instagram_gradient" className="bg-zinc-900">Instagram Color</option>
                      <option value="instagram_custom" className="bg-zinc-900">Instagram Sólido</option>
                      <option value="website" className="bg-zinc-900">Website / Link</option>
                      <option value="none" className="bg-zinc-900">Ocultar</option>
                    </select>
                    <div className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-30">
                      <ChevronDown className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <div className="w-[55%]">
                    <input
                      value={state.footerContact2Value ?? (state.instagram || "")}
                      onChange={(e) => {
                        const isPhone = state.footerContact2Icon?.startsWith("whatsapp");
                        const isInsta = state.footerContact2Icon?.startsWith("instagram");
                        let val = e.target.value;
                        if (isPhone) val = formatAdPhone(val);
                        else if (isInsta) val = val.replace(/^@/, "");
                        update({ footerContact2Value: val });
                      }}
                      placeholder={state.footerContact2Icon?.startsWith("instagram") ? "@usuario" : "Perfil ou Link"}
                      className="w-full bg-transparent border-none px-2 py-1.5 text-[10px] text-white outline-none placeholder:text-white/10"
                    />
                  </div>
                </div>
              </div>
            </div>
          </MinimizableCard>

          {/* Cartão 2: Modo de Criação e Categorias */}
          <MinimizableCard title="Modo de Criação e Categoria" emoji="🛠️" defaultOpen={true}>
            {/* Modo de Geração */}
            <div>
              <h3 className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1.5">0 · Modo de Criação</h3>
              <div className="flex bg-black/40 p-0.5 rounded-lg border border-white/5 w-full">
                <button
                  onClick={() => setGenMode("photo")}
                  className={\`flex-1 flex items-center justify-center gap-1 py-1.5 rounded text-[10px] font-bold transition-all disabled:opacity-30 \${genMode === "photo" ? "bg-white/10 text-white shadow-sm" : "text-white/50 hover:text-white"}\`}
                >
                  <ImageIcon className="w-3 h-3" /> Foto Real
                </button>
                <button
                  onClick={() => setGenMode("custom")}
                  className={\`flex-1 flex items-center justify-center gap-1 py-1.5 rounded text-[10px] font-bold transition-all disabled:opacity-30 \${genMode === "custom" ? "bg-white/10 text-white shadow-sm" : "text-white/50 hover:text-white"}\`}
                >
                  <Upload className="w-3 h-3" /> Sua Imagem
                </button>
                <button
                  onClick={() => setGenMode("ai")}
                  className={\`flex-1 flex items-center justify-center gap-1 py-1.5 rounded text-[10px] font-bold transition-all \${genMode === "ai" ? "bg-white/10 text-white shadow-sm" : "text-white/50 hover:text-white"}\`}
                >
                  <Wand2 className="w-3 h-3" /> IA Pura
                </button>
              </div>

              {/* Seletor de Versão */}
              <div className="mt-3.5">
                <h3 className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1.5">
                  0b · Versão do Layout
                </h3>
                <div className="flex bg-black/40 p-0.5 rounded-lg border border-white/5 w-full gap-0.5">
                  <button
                    onClick={() => setForcedVariant(null)}
                    className={\`flex-1 py-1.5 rounded text-[10px] font-bold transition-all \${forcedVariant === null ? "bg-white/10 text-white shadow-sm" : "text-white/50 hover:text-white"}\`}
                  >
                    Auto
                  </button>
                  {[0, 1, 2, 3, 4].map((v) => (
                    <button
                      key={v}
                      onClick={() => setForcedVariant(v)}
                      className={\`flex-1 py-1.5 rounded text-[10px] font-bold transition-all \${forcedVariant === v ? "bg-white/10 text-white shadow-sm" : "text-white/50 hover:text-white"}\`}
                    >
                      V{v}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Categoria */}
            <div className="pt-2">
              <h3 className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1.5">1 · Tipo de Anúncio</h3>
              <div className="grid grid-cols-3 gap-1.5">
                {CATEGORIAS.map((c) => {
                  const isExperiencia = c.id === "experiencia_destino";
                  const selected = categoria === c.id;
                  return (
                    <button
                      key={c.id}
                      disabled={isExperiencia}
                      onClick={() => {
                        if (!isExperiencia) setCategoria(c.id);
                      }}
                      className={\`p-2.5 rounded-lg border text-left transition-all flex flex-col justify-between min-h-[75px] \${
                        isExperiencia
                          ? "border-white/5 bg-black/10 opacity-35 cursor-not-allowed pointer-events-none"
                          : selected
                          ? "shadow-md scale-[1.01]"
                          : "border-white/5 bg-black/20 hover:bg-white/[0.04]"
                      }\`}
                      style={selected && !isExperiencia ? { borderColor: c.accent, background: \`\${c.accent}20\` } : undefined}
                    >
                      <div className="flex items-center gap-1 mb-0.5">
                        <span className="text-base leading-none">{c.emoji}</span>
                        <span
                          className="text-[8px] font-extrabold px-1 rounded border tracking-wider"
                          style={{ background: \`\${c.accent}15\`, borderColor: \`\${c.accent}40\`, color: c.accent }}
                        >
                          {c.badge}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-white leading-tight">{c.name}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Formato */}
            <div className="pt-2">
              <h3 className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1.5">2 · Formato do Anúncio</h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setFormat("square")}
                  className={\`p-3 rounded-lg border transition-all text-left \${
                    format === "square" ? "" : "border-white/[0.08] bg-white/[0.02]"
                  }\`}
                  style={format === "square" ? { borderColor: primaryColor, background: \`\${primaryColor}12\` } : undefined}
                >
                  <Square className="w-4 h-4 mb-1 text-white/80" />
                  <div className="text-xs font-bold text-white">Quadrado 1:1</div>
                </button>
                <button
                  onClick={() => setFormat("story")}
                  className={\`p-3 rounded-lg border transition-all text-left \${
                    format === "story" ? "" : "border-white/[0.08] bg-white/[0.02]"
                  }\`}
                  style={format === "story" ? { borderColor: primaryColor, background: \`\${primaryColor}12\` } : undefined}
                >
                  <Smartphone className="w-4 h-4 mb-1 text-white/80" />
                  <div className="text-xs font-bold text-white">Stories 9:16</div>
                </button>
              </div>
            </div>
          </MinimizableCard>

          {/* Cartão 3: Galeria / Escolha de fotos */}
          {genMode === "photo" && (
            <MinimizableCard title="Escolha uma foto real" emoji="📷" defaultOpen={true}>
              <div className="flex flex-wrap gap-1 mb-2">
                {[...new Set([...(state.destinos || []), ...POPULAR_PHOTO_DESTINATIONS])].slice(0, 10).map((d) => (
                  <button
                    key={d}
                    onClick={() => { setDestination(d); searchPhotos(d); }}
                    className={\`px-2 py-0.5 rounded-full text-[10px] border transition-colors \${
                      photoQuery === d ? "text-black" : "bg-white/[0.05] border-white/10 text-white/70 hover:border-white/30"
                    }\`}
                    style={photoQuery === d ? { background: secondaryColor, borderColor: secondaryColor } : undefined}
                  >
                    {d}
                  </button>
                ))}
              </div>

              <div className="flex gap-1.5">
                <input
                  value={photoQuery}
                  onChange={(e) => setPhotoQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && searchPhotos()}
                  onFocus={(e) => e.target.select()}
                  placeholder={destination ? \`Buscar "\${destination}"...\` : "Cancún, Paris..."}
                  className="flex-1 bg-white/[0.06] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/30 outline-none focus:border-white/30"
                />
                <button
                  onClick={() => searchPhotos()}
                  disabled={searchingPhotos}
                  className="px-3 rounded-lg font-bold text-black flex items-center gap-1 text-xs disabled:opacity-40"
                  style={{ background: secondaryColor }}
                >
                  {searchingPhotos ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                  Buscar
                </button>
              </div>

              {photos.length > 0 ? (() => {
                const visible = photos.slice(0, visiblePhotoCount);
                const hasMore = visiblePhotoCount < photos.length;
                return (
                  <div className="space-y-2 pt-2">
                    <div className="grid grid-cols-3 gap-1.5">
                      {visible.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setSelectedPhotoUrl(p.url)}
                          className={\`relative aspect-square rounded-lg overflow-hidden border transition-all \${
                            selectedPhotoUrl === p.url ? "scale-95" : "border-white/10 hover:border-white/30"
                          }\`}
                          style={selectedPhotoUrl === p.url ? { borderColor: secondaryColor, borderWidth: 2 } : undefined}
                        >
                          <img src={p.thumb} alt={p.alt} className="w-full h-full object-cover" />
                          {selectedPhotoUrl === p.url && (
                            <div className="absolute inset-0 flex items-center justify-center" style={{ background: \`\${primaryColor}cc\` }}>
                              <Check className="w-5 h-5 text-white" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                    {hasMore && (
                      <button
                        onClick={() => setVisiblePhotoCount((n) => n + 3)}
                        className="w-full py-1.5 rounded-lg border border-white/10 text-white/60 text-xs font-semibold hover:bg-white/[0.06] transition-all flex items-center justify-center gap-1.5"
                      >
                        <Plus className="w-3 h-3" />
                        Mais fotos ({photos.length - visiblePhotoCount})
                      </button>
                    )}
                  </div>
                );
              })() : (
                <div className="py-4 text-center text-[10px] text-white/30">
                  {searchingPhotos ? "Buscando inspirações..." : "Busque e escolha uma foto acima."}
                </div>
              )}
            </MinimizableCard>
          )}

          {/* Cartão 3: Sua Imagem (Modo Custom) */}
          {genMode === "custom" && (
            <MinimizableCard title="Escolha sua foto" emoji="📷" defaultOpen={true}>
              <div className="flex gap-2">
                <button
                  onClick={() => setCustomSource("upload")}
                  className={\`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all \${
                    customSource === "upload" ? "text-black" : "bg-white/[0.04] text-white/60"
                  }\`}
                  style={customSource === "upload" ? { background: secondaryColor } : undefined}
                >
                  <Upload className="w-3.5 h-3.5" /> Upload
                </button>
                <button
                  onClick={() => setCustomSource("link")}
                  className={\`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all \${
                    customSource === "link" ? "text-black" : "bg-white/[0.04] text-white/60"
                  }\`}
                  style={customSource === "link" ? { background: secondaryColor } : undefined}
                >
                  <Link2 className="w-3.5 h-3.5" /> Link
                </button>
              </div>

              {customSource === "upload" && (
                <div className="pt-2">
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border border-dashed border-white/20 rounded-lg p-4 text-center hover:border-white/30 transition-colors"
                  >
                    {customImageData ? (
                      <>
                        <img src={customImageData} alt="preview" className="w-16 h-16 mx-auto rounded-md object-cover mb-1.5" />
                        <p className="text-[10px] text-emerald-400 font-semibold">✓ Trocando imagem</p>
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5 text-white/30 mx-auto mb-1" />
                        <p className="text-[10px] text-white/40">Subir foto local</p>
                      </>
                    )}
                  </button>
                </div>
              )}

              {customSource === "link" && (
                <div className="pt-2 flex gap-1.5">
                  <input
                    value={customImageUrl}
                    onChange={(e) => setCustomImageUrl(e.target.value)}
                    placeholder="Cole o link da foto aqui..."
                    className="flex-1 bg-white/[0.06] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-white/20 outline-none"
                  />
                  <button
                    onClick={() => {
                      if (customImageUrl) {
                        setCustomImageData(customImageUrl);
                        toast.success("Foto conectada via link!");
                      }
                    }}
                    className="px-3 rounded-lg font-bold text-black text-xs"
                    style={{ background: secondaryColor }}
                  >
                    OK
                  </button>
                </div>
              )}
            </MinimizableCard>
          )}

          {/* Cartão 4: Dados do Anúncio */}
          <MinimizableCard title="Dados do Anúncio" emoji="📝" defaultOpen={true}>
            <div className="space-y-3.5">
              {/* Destino */}
              <div>
                <label className={labelCls}>Destino</label>
                <input
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Ex: Rio de Janeiro, Natal..."
                  className={inputCls}
                />
              </div>

              {/* Preço e Sufixo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className={labelCls}>Preço do Ad</label>
                  <input
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Ex: 1499, 890..."
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Sufixo (ex: por pessoa)</label>
                  <input
                    value={paymentSuffix}
                    onChange={(e) => setPaymentSuffix(e.target.value)}
                    placeholder="Ex: em duplo standard"
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Centavos e Prazo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className={labelCls}>Centavos do Preço</label>
                  <input
                    value={priceCents}
                    onChange={(e) => setPriceCents(e.target.value)}
                    placeholder="Ex: 90, 00..."
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Prazo / Período</label>
                  <input
                    value={travelPeriod}
                    onChange={(e) => setTravelPeriod(e.target.value)}
                    placeholder="Ex: Setembro/2026, Feriados..."
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Parcelas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className={labelCls}>Forma de Pagamento</label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value as any)}
                    className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-white/40 appearance-none cursor-pointer"
                  >
                    <option value="solid" className="bg-zinc-900">À Vista Sólido</option>
                    <option value="installments_card" className="bg-zinc-900">Parcelado Entrada+Cartão</option>
                    <option value="installments_pure" className="bg-zinc-900">Parcelado Direto (10x, 12x...)</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Texto de Forma de Pagamento</label>
                  <input
                    value={paymentLabel}
                    onChange={(e) => setPaymentLabel(e.target.value)}
                    placeholder="Ex: Entrada de R$ 190 + 10x"
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Destaques / Benefícios */}
              <div>
                <label className={labelCls}>Destaques / Benefícios (1 por linha)</label>
                <textarea
                  value={highlights}
                  onChange={(e) => setHighlights(e.target.value)}
                  placeholder="Ex:\\nAéreo ida e volta\\nHospedagem inclusa\\nCafé da manhã"
                  rows={3}
                  className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-white/40 text-xs"
                />
              </div>

              {/* Nome do Pacote / Subtítulo */}
              <div>
                <label className={labelCls}>Nome do Pacote (Título secundário opcional)</label>
                <input
                  value={promoName}
                  onChange={(e) => setPromoName(e.target.value)}
                  placeholder="Ex: RESORT ALL INCLUSIVE, SUPER OFERTA"
                  className={inputCls}
                />
              </div>

              {/* Banner PIX */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1.5">
                <div className="flex items-center justify-between p-3.5 bg-white/[0.02] border border-white/5 rounded-xl">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white">Mostrar Banner PIX</span>
                    <span className="text-[10px] text-white/40">Desconto exclusivo Pix</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={showPixBanner}
                    onChange={(e) => setShowPixBanner(e.target.checked)}
                    className="w-4 h-4 rounded border-white/10 bg-zinc-950 accent-amber-500"
                  />
                </div>
                {showPixBanner && (
                  <div>
                    <label className={labelCls}>Texto do Banner PIX</label>
                    <input
                      value={pixBannerText}
                      onChange={(e) => setPixBannerText(e.target.value)}
                      placeholder="Ganhe +5% de desc no PIX!"
                      className={inputCls}
                    />
                  </div>
                )}
              </div>

              {/* Valor Total */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1.5">
                <div className="flex items-center justify-between p-3.5 bg-white/[0.02] border border-white/5 rounded-xl">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white">Mostrar Valor Total</span>
                    <span className="text-[10px] text-white/40">Valor total no rodapé</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={showTotal}
                    onChange={(e) => setShowTotal(e.target.checked)}
                    className="w-4 h-4 rounded border-white/10 bg-zinc-950 accent-amber-500"
                  />
                </div>
                {showTotal && (
                  <div>
                    <label className={labelCls}>Valor Total</label>
                    <input
                      value={totalOverride}
                      onChange={(e) => setTotalOverride(e.target.value)}
                      placeholder="Ex: R$ 4.990 à vista"
                      className={inputCls}
                    />
                  </div>
                )}
              </div>

              {/* Estilo Visual Avançado */}
              <div className="pt-2 border-t border-white/10">
                <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3">Estilo Visual Avançado</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className={labelCls}>Tipo de Letra (Font)</label>
                    <select
                      value={fontFamily}
                      onChange={(e) => setFontFamily(e.target.value)}
                      className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-white/40 appearance-none cursor-pointer"
                    >
                      <option value="Outfit" className="bg-zinc-900">Outfit (Moderna/Negrito)</option>
                      <option value="Montserrat" className="bg-zinc-900">Montserrat (Forte/Marcante)</option>
                      <option value="Playfair Display" className="bg-zinc-900">Playfair (Luxo/Elegante)</option>
                      <option value="Inter" className="bg-zinc-900">Inter (Limpa/Premium)</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Cor do Texto</label>
                    <select
                      value={textColorOverride}
                      onChange={(e) => setTextColorOverride(e.target.value as any)}
                      className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-white/40 appearance-none cursor-pointer"
                    >
                      <option value="auto" className="bg-zinc-900">Dinâmico (Automático)</option>
                      <option value="white" className="bg-zinc-900">Branco Sólido</option>
                      <option value="black" className="bg-zinc-900">Escuro / Preto</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-3.5">
                  <div>
                    <label className={labelCls}>Escala do Título</label>
                    <select
                      value={titleScale}
                      onChange={(e) => setTitleScale(Number(e.target.value))}
                      className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-white/40 appearance-none cursor-pointer"
                    >
                      <option value={1} className="bg-zinc-900">Normal (100%)</option>
                      <option value={0.9} className="bg-zinc-900">Compacto (90%)</option>
                      <option value={0.8} className="bg-zinc-900">Super Compacto (80%)</option>
                      <option value={1.1} className="bg-zinc-900">Grande (110%)</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Escala da Desc.</label>
                    <select
                      value={descScale}
                      onChange={(e) => setDescScale(Number(e.target.value))}
                      className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-white/40 appearance-none cursor-pointer"
                    >
                      <option value={1} className="bg-zinc-900">Normal (100%)</option>
                      <option value={0.9} className="bg-zinc-900">Compacta (90%)</option>
                      <option value={0.8} className="bg-zinc-900">Super Compacta (80%)</option>
                      <option value={1.1} className="bg-zinc-900">Grande (110%)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </MinimizableCard>

          {/* Botão Principal de Geração */}
          <div className="pt-2">
            {generationError && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold mb-3">
                ⚠️ Erro: {generationError}
              </div>
            )}

            <button
              onClick={() => generate(0)}
              disabled={loading || searchingPhotos}
              className="w-full py-4.5 rounded-2xl font-black text-black text-sm uppercase tracking-wider transition-all shadow-xl hover:shadow-2xl hover:scale-[1.01] flex items-center justify-center gap-2 disabled:opacity-40 disabled:hover:scale-100"
              style={{
                background: \`linear-gradient(135deg, \${primaryColor}, \${secondaryColor})\`,
                boxShadow: \`0 10px 30px \${primaryColor}30\`
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Criando seu anúncio...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Gerar Anúncios
                </>
              )}
            </button>

            {generatedImages.length > 0 && (
              <button
                onClick={generateNext}
                disabled={loading}
                className="w-full mt-3 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-xs uppercase tracking-wider hover:bg-white/10 transition-all flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                Gerar Mais Variações
              </button>
            )}
          </div>
        </div>

        {/* Painel Direito (Pré-visualização e Resultados - 7 colunas em lg) */}
        <div className="lg:col-span-7 space-y-6 lg:sticky lg:top-24">
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5 md:p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
              <div>
                <h3 className="text-sm font-bold text-white">Resultados do Design</h3>
                <p className="text-[10px] text-white/40 leading-snug mt-0.5">Versão gerada com sucesso pela IA da Canva Viagem</p>
              </div>
              <div className="flex items-center gap-2">
                {generatedImages.length > 1 && (
                  <span className="text-[10px] font-bold px-2 py-1 rounded bg-white/5 border border-white/10 text-white/60">
                    {generatedImages.indexOf(generatedImage) + 1} de {generatedImages.length}
                  </span>
                )}
              </div>
            </div>

            {generatedImage ? (
              <div className="space-y-5">
                {/* Imagem do anúncio */}
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-black/40 border border-white/10 max-w-lg mx-auto shadow-2xl">
                  <img src={generatedImage} alt="Anúncio gerado" className="w-full h-full object-contain" />
                </div>

                {/* Controles do resultado */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={downloadPNG}
                    className="flex-1 py-3 px-4 rounded-xl text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 hover:brightness-110 transition-all shadow-md"
                    style={{ background: secondaryColor }}
                  >
                    <Download className="w-4 h-4" />
                    Baixar em um clique
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-24 text-center">
                <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                  <ImageIcon className="w-8 h-8 text-white/30" />
                </div>
                <h4 className="text-sm font-bold text-white">Nenhum anúncio gerado</h4>
                <p className="text-xs text-white/40 max-w-xs mx-auto mt-1 leading-relaxed">
                  Insira o destino, escolha a sua foto predileta ou imagem real, e clique no botão de geração para ver a mágica acontecer!
                </p>
              </div>
            )}

            {/* Copies e Legendas sugeridas */}
            {generatedImages.length > 0 && adCaptions.length > 0 && (
              <div className="border-t border-white/[0.06] pt-5 space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Cópias e Captions Sugeridos</h4>
                  <p className="text-[10px] text-white/40 leading-snug mt-0.5">Legendas ideais para usar na legenda do seu post/anúncio</p>
                </div>

                <div className="space-y-3">
                  {adCaptions.map((cap, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-black/40 border border-white/5 relative overflow-hidden group">
                      <p className="text-xs text-white/80 leading-relaxed whitespace-pre-wrap pr-12">{cap}</p>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(cap);
                          toast.success("Copy copiado para a área de transferência!");
                        }}
                        className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 text-white/60 hover:text-white transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Copiar Legenda"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
`;

const updatedContent = [...linesBefore, newReturnBlock].join('\n');
fs.writeFileSync(filePath, updatedContent, 'utf8');
console.log("File updated successfully.");
